import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "../../db";
import { favoriteMovies } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import axios from "axios";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Schema cho genres
const genreSchema = z.array(z.object({ id: z.number(), name: z.string() }));

export const moviesRouter = createTRPCRouter({
  // Lấy danh sách phim từ TMDB
  searchMovies: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: input.query,
          page: 1,
          sort_by: "release_date.desc",
        },
      });
      return response.data.results;
    }),

  // Thêm phim yêu thích
  addFavorite: protectedProcedure
    .input(
      z.object({
        movieId: z.number(),
        title: z.string(),
        posterPath: z.string().nullable(),
        genres: z
          .array(
            z.object({
              id: z.number(),
              name: z.string(),
            }),
          )
          .optional(),
        vote_average: z.number().optional(),
        release_date: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [favorite] = await db
        .insert(favoriteMovies)
        .values({
          userId,
          movieId: input.movieId,
          title: input.title,
          posterPath: input.posterPath,
          genre: input.genres,
          vote_average: input.vote_average,
          release_date: input.release_date,
        })
        .returning();
      return favorite;
    }),

  // Lấy phim theo thể loại với phân trang
  getMoviesByGenre: publicProcedure
    .input(
      z.object({
        genreId: z.number(),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ input }) => {
      const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          with_genres: input.genreId,
          sort_by: "popularity.desc",
          page: input.page,
        },
      });
      return {
        movies: response.data.results,
        totalPages: response.data.total_pages,
      };
    }),

  // Lấy danh sách phim yêu thích của user
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return await db
      .select()
      .from(favoriteMovies)
      .where(eq(favoriteMovies.userId, userId));
  }),

  // Xóa phim yêu thích
  removeFavorite: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await db
        .delete(favoriteMovies)
        .where(
          and(
            eq(favoriteMovies.id, input.id),
            eq(favoriteMovies.userId, userId),
          ),
        );
      return { success: true };
    }),

  // Gợi ý phim dựa theo danh sách yêu thích
  getMovieSuggestions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const favoriteGenres = await db
      .select()
      .from(favoriteMovies)
      .where(eq(favoriteMovies.userId, userId));
    // Lấy genresId nhiều nhất từ danh sách yêu thích
    const genreCount: Record<number, number> = {};
    favoriteGenres.forEach((fav) => {
      if (fav.genre) {
        fav.genre.forEach((g) => {
          genreCount[g.id] = (genreCount[g.id] || 0) + 1;
        });
      }
    });
    // Sắp xếp và lấy ra 3 thể loại phổ biến nhất
    const sortedGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([genreId]) => parseInt(genreId));
    if (sortedGenres.length === 0) {
      return [];
    }
    // Lọc phim có hai trong các thể loại phổ biến nhất
    const genreQuery = sortedGenres.map((id) => id).join(",");
    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_genres: genreQuery,
        sort_by: "popularity.desc",
        page: 1,
      },
    });
    return response.data.results.map((movie: any) => ({
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
    }));
  }),

  // Lấy danh sách phim yêu thích với chi tiết từ TMDB
  getFavoritesWithDetails: protectedProcedure
    .input(
      z.object({
        genreId: z.number().optional(), // Lọc theo thể loại
        sortBy: z.enum(["vote_average", "added_at", "release_date"]).optional(), // Sắp xếp theo điểm
        sortOrder: z.enum(["asc", "desc"]).optional(), // Thứ tự sắp xếp
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const apiKey = TMDB_API_KEY;
      const baseUrl = "https://api.themoviedb.org/3";

      if (!apiKey) {
        throw new Error("TMDB API key not found");
      }

      // Lấy danh sách movieId từ user_favorites
      const favorites = await db
        .select()
        .from(favoriteMovies)
        .where(eq(favoriteMovies.userId, userId));

      if (favorites.length === 0) {
        return { movies: [], genres: [] };
      }

      // Define GenreResponse type for TMDB genre API response
      type GenreResponse = {
        genres: Array<{
          id: number;
          name: string;
        }>;
      };
      // Lọc theo genreId nếu có
      let filteredMovies = favorites.map((fav) => ({
        id: fav.movieId,
        title: fav.title,
        poster_path: fav.posterPath || "",
        genre: fav.genre,
        vote_average: fav.vote_average || 0,
        release_date: fav.release_date || "",
      }));

      if (input.genreId) {
        filteredMovies = filteredMovies.filter((movie) =>
          movie.genre?.some((g) => g.id === input.genreId),
        );
      }
      // if (input.genreId) {
      //   filteredMovies = movies.filter((movie) =>
      //     movie.genre_ids.includes(input.genreId!),
      //   );
      // }

      // Sắp xếp theo yêu cầu
      if (input.sortBy) {
        filteredMovies.sort((a, b) => {
          let fieldA: number | string = "";
          let fieldB: number | string = "";
          if (input.sortBy === "vote_average") {
            fieldA = a.vote_average || 0;
            fieldB = b.vote_average || 0;
          } else if (input.sortBy === "added_at") {
            const favA = favorites.find((f) => f.movieId === a.id);
            const favB = favorites.find((f) => f.movieId === b.id);
            fieldA = favA?.addedAt ? new Date(favA.addedAt).getTime() : 0;
            fieldB = favB?.addedAt ? new Date(favB.addedAt).getTime() : 0;
          } else if (input.sortBy === "release_date") {
            fieldA = a.release_date || "";
            fieldB = b.release_date || "";
          }
          if (fieldA < fieldB) return input.sortOrder === "asc" ? -1 : 1;
          if (fieldA > fieldB) return input.sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }
      // Lấy danh sách thể loại từ TMDB để hiển thị bộ lọc
      const genreResponse = await axios.get<GenreResponse>(
        `${baseUrl}/genre/movie/list`,
        { params: { api_key: apiKey, language: "vi-VN" } },
      );

      return { movies: filteredMovies, genres: genreResponse.data.genres };
    }),

  // Tìm kiếm phim theo thể loại
  searchMoviesByTag: publicProcedure
    .input(z.object({ genreId: z.number() }))
    .query(async ({ input }) => {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${input.genreId}`,
      );
      return response.data.results;
    }),

  // Lấy thể loại
  getGenres: publicProcedure.query(async () => {
    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    return response.data.genres;
  }),

  // Lấy phim liên quan
  getRelatedMovies: publicProcedure
    .input(z.object({ movieId: z.number() }))
    .query(async ({ input }) => {
      const response = await axios.get(
        `${TMDB_BASE_URL}/movie/${input.movieId}/recommendations`,
        {
          params: {
            api_key: TMDB_API_KEY,
          },
        },
      );
      return response.data.results;
    }),
});
