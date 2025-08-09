import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { db } from '../../db';
import { ratings } from '../../db/schema';
import { and, eq, sql, desc } from 'drizzle-orm';

export const ratingsRouter = createTRPCRouter({
  // Thêm hoặc cập nhật đánh giá
  addOrUpdateRating: protectedProcedure
    .input(
      z.object({
        movieId: z.number().optional(), // Có thể null nếu là TV series
        tvSeriesId: z.number().optional(), // Có thể null nếu là movie
        rating: z.number().min(1).max(10),
        review: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Kiểm tra xem người dùng đã đánh giá chưa
      const existingRating = await db
        .select()
        .from(ratings)
        .where((qb) => {
          if (input.movieId !== undefined) {
            return and(
              eq(ratings.userId, userId),
              eq(ratings.movieId, input.movieId)
            );
          } else if (input.tvSeriesId !== undefined) {
            return and(
              eq(ratings.userId, userId),
              eq(ratings.tvSeriesId, input.tvSeriesId)
            );
          } else {
            // Always false condition if neither is provided  
            return sql`1 = 0`;
          }
        })
        .limit(1);

      if (existingRating.length > 0) {
        // Cập nhật đánh giá hiện có
        if (existingRating[0]) {
          await db
            .update(ratings)
            .set({
              rating: input.rating,
              review: input.review,
              createdAt: new Date(),
            })
            .where(eq(ratings.id, existingRating[0].id));
          return { success: true, message: 'Rating updated successfully' };
        } else {
          return { success: false, message: 'Existing rating not found.' };
        }
      } else {
        // Thêm đánh giá mới
        await db.insert(ratings).values({
          userId,
          movieId: input.movieId,
          tvSeriesId: input.tvSeriesId,
          rating: input.rating,
          review: input.review,
        });
        return { success: true, message: 'Rating added successfully' };
      }
    }),

  // Lấy đánh giá trung bình và số lượng đánh giá
  getAverageRating: protectedProcedure
    .input(
      z.object({
        movieId: z.number().optional(),
        tvSeriesId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const result = await db
        .select({
          averageRating: sql<number>`AVG(${ratings.rating})`,
          ratingCount: sql<number>`COUNT(${ratings.id})`,
        })
        .from(ratings)
        .where((qb) => {
          if (input.movieId !== undefined) {
            return eq(ratings.movieId, input.movieId);
          } else if (input.tvSeriesId !== undefined) {
            return eq(ratings.tvSeriesId, input.tvSeriesId);
          } else {
            // Always false condition if neither is provided
            return sql`1 = 0`;
          }
        })
        
      return {
        averageRating: result[0]?.averageRating || 0,
        ratingCount: result[0]?.ratingCount || 0,
      };
    }),

  // Lấy đánh giá của người dùng hiện tại
  getUserRating: protectedProcedure
    .input(
      z.object({
        movieId: z.number().optional(),
        tvSeriesId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const rating = await db
        .select()
        .from(ratings)
        .where((qb) => {
          if (input.movieId !== undefined) {
            return and(
              eq(ratings.userId, userId),
              eq(ratings.movieId, input.movieId)
            );
          } else if (input.tvSeriesId !== undefined) {
            return and(
              eq(ratings.userId, userId),
              eq(ratings.tvSeriesId, input.tvSeriesId)
            );
          }
          // Always false condition if neither is provided
          return sql`1 = 0`;
        })
        .orderBy(desc(ratings.createdAt))
        .limit(1);
      return rating[0] || null;
    }),
});