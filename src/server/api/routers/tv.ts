import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import axios from "axios";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const tvRouter = createTRPCRouter({
  // Lấy TV Series liên quan
  getRelatedTVSeries: publicProcedure
    .input(z.object({ tvSeriesId: z.number() }))
    .query(async ({ input }) => {
      const response = await axios.get(`${TMDB_BASE_URL}/tv/${input.tvSeriesId}/recommendations`, {
        params: {
          api_key: TMDB_API_KEY,
        },
      });
      return response.data.results;
    }),
});