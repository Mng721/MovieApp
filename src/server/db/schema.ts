import { max, relations, sql } from "drizzle-orm";
import {
  decimal,
  index,
  integer,
  jsonb,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `movie-app_${name}`);
export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  password: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  roleId: d
    .integer()
    .notNull()
    .default(3)
    .references(() => roles.id), // Mặc định là role user
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  favoriteMovies: many(favoriteMovies),
  comments: many(comments),
  commentReplies: many(commentReplies),
}));

export const watchHistory = createTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  movieId: integer("movie_id").notNull(),
  watchedAt: timestamp("watched_at").defaultNow(),
  metadata: jsonb("metadata"), // Lưu thêm thông tin như thời gian xem, trạng thái
});

// Bảng roles
export const roles = createTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
});

// Bảng permissions
export const permissions = createTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
});

// Bảng trung gian role_permissions
export const rolePermissions = createTable("role_permissions", {
  roleId: integer("role_id")
    .notNull()
    .references(() => roles.id),
  permissionId: integer("permission_id")
    .notNull()
    .references(() => permissions.id),
});

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// Thêm bảng favorite_movies
export const favoriteMovies = createTable("favorite_movies", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  movieId: integer("movie_id").notNull(), // ID phim từ TMDB
  title: varchar("title", { length: 255 }).notNull(), // Tiêu đề phim
  posterPath: varchar("poster_path"), // Đường dẫn ảnh poster từ TMDB
  addedAt: timestamp("added_at").defaultNow(),
  genre: jsonb("genres").notNull().$type<{ id: number; name: string }[]>(),
  vote_average: decimal("vote_average"), // Điểm đánh giá
  release_date: varchar("release_date", { length: 50 }), // Ngày phát hành
});

// Thêm bảng comment
export const comments = createTable("comments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id"),
  tvSeriesId: integer("tv_series_id"), // Thêm cột tvSeriesId
  content: varchar("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Thêm bảng trả lời comment
export const commentReplies = createTable("comment_replies", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  commentId: integer("comment_id")
    .notNull()
    .references(() => comments.id, { onDelete: "cascade" }),
  content: varchar("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ratings = createTable("ratings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id"), // Có thể null nếu là TV series
  tvSeriesId: integer("tv_series_id"), // Có thể null nếu là movie
  rating: integer("rating").notNull(), // Điểm từ 1 đến 10
  review: text("review"), // Nhận xét tùy chọn
  createdAt: timestamp("created_at").defaultNow(),
});

// Định nghĩa quan hệ
export const rolesRelations = relations(roles, ({ many, one }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export const favoriteMoviesRelations = relations(favoriteMovies, ({ one }) => ({
  user: one(users, {
    fields: [favoriteMovies.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ many, one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  replies: many(commentReplies),
}));
export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
}));
export const commentRepliesRelations = relations(commentReplies, ({ one }) => ({
  user: one(users, {
    fields: [commentReplies.userId],
    references: [users.id],
  }),
  comment: one(comments, {
    fields: [commentReplies.commentId],
    references: [comments.id],
  }),
}));
