import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "../../db";
import { comments, commentReplies, users } from "../../db/schema";
import { eq, inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const commentsRouter = createTRPCRouter({
  // Lấy danh sách bình luận của một phim, bao gồm cả trả lời
  getCommentsByMovie: publicProcedure
    .input(z.object({ movieId: z.number() }))
    .query(async ({ input }) => {
      // Lấy danh sách bình luận
      const movieComments = await db
        .select({
          id: comments.id,
          content: comments.content,
          createdAt: comments.createdAt,
          userId: comments.userId,
          userName: users.name,
          userEmail: users.email,
          userAvatar: users.image,
        })
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.movieId, input.movieId))
        .orderBy(comments.createdAt);
      // Lấy danh sách trả lời cho từng bình luận
      const commentIds = movieComments.map((comment) => comment.id);
      const replies = await db
            .select({
              id: commentReplies.id,
              content: commentReplies.content,
              createdAt: commentReplies.createdAt,
              userId: commentReplies.userId,
              userName: users.name,
              userAvatar: users.image,
              userEmail: users.email,
              commentId: commentReplies.commentId,
            })
            .from(commentReplies)
            .leftJoin(users, eq(commentReplies.userId, users.id))
            .where(inArray(commentReplies.commentId, commentIds))
            .orderBy(commentReplies.createdAt)

      // Gộp trả lời vào bình luận
      const commentsWithReplies = movieComments.map((comment) => ({
        ...comment,
        replies: replies.filter((reply) => reply.commentId === comment.id),
      }));

      return commentsWithReplies;
    }),

  // Lấy danh sách bình luận của một TV Series
  getCommentsByTVSeries: publicProcedure
    .input(z.object({ tvSeriesId: z.number() }))
    .query(async ({ input }) => {
      const tvComments = await db
        .select({
          id: comments.id,
          content: comments.content,
          createdAt: comments.createdAt,
          userId: comments.userId,
          userName: users.name,
          userEmail: users.email,
          userAvatar: users.image,
        })
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.tvSeriesId, input.tvSeriesId))
        .orderBy(comments.createdAt);

      const commentIds = tvComments.map((comment) => comment.id);
      const replies = await db
            .select({
              id: commentReplies.id,
              content: commentReplies.content,
              createdAt: commentReplies.createdAt,
              userId: commentReplies.userId,
              userName: users.name,
              userEmail: users.email,
              userAvatar: users.image,
              commentId: commentReplies.commentId,
            })
            .from(commentReplies)
            .leftJoin(users, eq(commentReplies.userId, users.id))
            .where(inArray(commentReplies.commentId, commentIds))
            .orderBy(commentReplies.createdAt);

      return tvComments.map((comment) => ({
        ...comment,
        replies: replies.filter((reply) => reply.commentId === comment.id),
      }));
    }),

  // Thêm bình luận
  addComment: protectedProcedure
    .input(
      z.object({
        movieId: z.number(),
        content: z.string().min(1, "Nội dung bình luận không được để trống"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [newComment] = await db
        .insert(comments)
        .values({
          userId,
          movieId: input.movieId,
          content: input.content,
        })
        .returning();
      return newComment;
    }),

  // Thêm bình luận cho TV Series
  addCommentToTVSeries: protectedProcedure
  .input(
    z.object({
      tvSeriesId: z.number(),
      content: z.string().min(1, "Nội dung bình luận không được để trống"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const [newComment] = await db
      .insert(comments)
      .values({
        userId,
        tvSeriesId: input.tvSeriesId,
        content: input.content,
      })
      .returning();
    return newComment;
  }),

  // Thêm trả lời cho bình luận
  addReply: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        content: z.string().min(1, "Nội dung trả lời không được để trống"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId =ctx.session.user.id;
      const [newReply] = await db
        .insert(commentReplies)
        .values({
          userId,
          commentId: input.commentId,
          content: input.content,
        })
        .returning();
      return newReply;
    }),

  // Xóa bình luận
  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const isAdmin = ctx.session.user.roleId === 1;

      const comment = await db
        .select()
        .from(comments)
        .where(eq(comments.id, input.commentId))
        .limit(1);

      if (comment.length === 0) {
        throw new Error("Bình luận không tồn tại");
      }

      if (comment[0].userId !== userId && !isAdmin) {
        throw new Error("Bạn không có quyền xóa bình luận này");
      }

      await db.delete(comments).where(eq(comments.id, input.commentId));
      return { success: true };
    }),

  // Xóa trả lời
  deleteReply: protectedProcedure
    .input(z.object({ replyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const isAdmin = ctx.session.user.roleId === 1;

      const reply = await db
        .select()
        .from(commentReplies)
        .where(eq(commentReplies.id, input.replyId))
        .limit(1);

      if (reply.length === 0) {
        throw new Error("Trả lời không tồn tại");
      }

      if (reply[0].userId !== userId && !isAdmin) {
        throw new Error("Bạn không có quyền xóa trả lời này");
      }

      await db.delete(commentReplies).where(eq(commentReplies.id, input.replyId));
      return { success: true };
    }),
});