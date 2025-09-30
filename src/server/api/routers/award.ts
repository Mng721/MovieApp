import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "../../db";
import { comments, commentReplies, users, awards } from "../../db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const awardsRouter = createTRPCRouter({
  // Lấy danh sách giải thưởng của một đạo diễn
  getAwardsByDirector: publicProcedure
    .input(z.object({ directorId: z.number() }))
    .query(async ({ input }) => {
      const listAwards = await db
        .select()
        .from(awards)
        .where(
          and(
            eq(awards.recipientId, input.directorId),
            eq(awards.recipientType, "Director"),
          ),
        )
        .orderBy(sql`year ASC`); // Sắp xếp theo năm giảm dần
      return listAwards;
    }),

  // Lấy danh sách giai thưởng của một diễn viên
  getAwardsByActor: publicProcedure
    .input(z.object({ actorId: z.number() }))
    .query(async ({ input }) => {
      const listAwards = await db
        .select()
        .from(awards)
        .where(
          and(
            eq(awards.recipientId, input.actorId),
            eq(awards.recipientType, "Actor"),
          ),
        )
        .orderBy(sql`year ASC`);
      return listAwards;
    }),
});
