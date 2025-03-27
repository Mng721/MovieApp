import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "../../db";
import { favoriteMovies } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const moviesRouter = createTRPCRouter({
  // Lấy danh sách phim từ TMDB
  searchMovies: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: input.query,
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
      })
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
        })
        .returning();
      return favorite;
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
        .where(and(eq(favoriteMovies.id, input.id),eq(favoriteMovies.userId, userId)))
      return { success: true };
    }),
});