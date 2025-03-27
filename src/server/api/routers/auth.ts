import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import bcrypt from "bcryptjs";
import { users } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
    .mutation(async ({ input }) => {
      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email đã được sử dụng. Vui lòng chọn email khác.",
        });
      }

      // Nếu email chưa tồn tại, tiến hành tạo tài khoản
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const [user] = await db
        .insert(users)
        .values({ email: input.email, password: hashedPassword, roleId: 3 }) // Default roleId = 1 (user)
        .returning();

      return { id: user.id, email: user.email };
    }),
});