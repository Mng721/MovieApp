import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export const usersRouter = createTRPCRouter({
  // Lấy thông tin người dùng
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user[0];
  }),

  // Cập nhật thông tin người dùng
  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Tên không được để trống"),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const updatedUser = await db
        .update(users)
        .set({
          name: input.name,
          image: input.image,
        })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser[0];
    }),
});