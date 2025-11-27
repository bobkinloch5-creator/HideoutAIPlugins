import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: text("password"), // Nullable for OAuth users
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table - stores user game projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectType: varchar("project_type", { length: 50 }).notNull().default("custom"), // obby, racing, tycoon, custom
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, archived, deleted
  commandCount: integer("command_count").notNull().default(0),
  assetCount: integer("asset_count").notNull().default(0),
  lastGeneratedAt: timestamp("last_generated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commands table - stores generated Roblox commands
export const commands = pgTable("commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  generatedCode: text("generated_code").notNull(),
  commandType: varchar("command_type", { length: 100 }), // terrain, asset, system, script
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, applied, failed
  metadata: jsonb("metadata"), // Additional data about the command
  createdAt: timestamp("created_at").defaultNow(),
});

// Asset library - predefined assets for game building
export const assetLibrary = pgTable("asset_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyword: varchar("keyword", { length: 100 }).notNull().unique(),
  assetName: varchar("asset_name", { length: 255 }).notNull(),
  assetId: varchar("asset_id", { length: 100 }), // Roblox asset ID if applicable
  category: varchar("category", { length: 100 }).notNull(), // props, enemies, fx, terrain, etc.
  description: text("description"),
  luaCode: text("lua_code"), // Code snippet for inserting this asset
  createdAt: timestamp("created_at").defaultNow(),
});

// System templates - predefined game system templates
export const systemTemplates = pgTable("system_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  templateType: varchar("template_type", { length: 100 }).notNull(), // obby, racing, tycoon, datastore
  description: text("description"),
  luaCode: text("lua_code").notNull(),
  location: varchar("location", { length: 100 }).notNull(), // ServerScriptService, StarterPlayerScripts, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Code History - Track all code versions and changes
export const codeHistory = pgTable("code_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  codeHash: varchar("code_hash", { length: 64 }), // For detecting duplicates
  version: integer("version").notNull().default(1),
  description: varchar("description"),
  isStarred: boolean("is_starred").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Code Templates - User's saved template snippets
export const codeTemplates = pgTable("code_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  code: text("code").notNull(),
  category: varchar("category", { length: 100 }), // checkpoint, leaderboard, spawn, etc.
  description: text("description"),
  usage: integer("usage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Plugin Settings - User plugin preferences
export const pluginSettings = pgTable("plugin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  autoInsertCode: boolean("auto_insert_code").default(false),
  defaultGameWidth: integer("default_game_width").default(100),
  defaultGameHeight: integer("default_game_height").default(100),
  defaultAssetScale: varchar("default_asset_scale", { length: 50 }).default("1.0"),
  enableValidation: boolean("enable_validation").default(true),
  enableRealTimeSync: boolean("enable_real_time_sync").default(true),
  theme: varchar("theme", { length: 50 }).default("dark"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Plugin Analytics - Track usage and feature adoption
export const pluginAnalytics = pgTable("plugin_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  featureName: varchar("feature_name", { length: 255 }).notNull(), // asset_preview, smart_insertion, etc.
  action: varchar("action", { length: 100 }).notNull(), // click, view, use, etc.
  gameType: varchar("game_type", { length: 50 }), // obby, racing, tycoon, custom
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Asset Previews - Cached asset thumbnails and info
export const assetPreviews = pgTable("asset_previews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assetId: varchar("asset_id", { length: 100 }).notNull().unique(),
  assetName: varchar("asset_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  previewCode: text("preview_code"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  commands: many(commands),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  commands: many(commands),
}));

export const commandsRelations = relations(commands, ({ one }) => ({
  project: one(projects, {
    fields: [commands.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [commands.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  commandCount: true,
  assetCount: true,
  lastGeneratedAt: true,
});

export const insertCommandSchema = createInsertSchema(commands).omit({
  id: true,
  createdAt: true,
});

export const insertAssetSchema = createInsertSchema(assetLibrary).omit({
  id: true,
  createdAt: true,
});

export const insertSystemTemplateSchema = createInsertSchema(systemTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertCommand = z.infer<typeof insertCommandSchema>;
export type Command = typeof commands.$inferSelect;

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assetLibrary.$inferSelect;

export type InsertSystemTemplate = z.infer<typeof insertSystemTemplateSchema>;
export type SystemTemplate = typeof systemTemplates.$inferSelect;

export type CodeHistory = typeof codeHistory.$inferSelect;
export type CodeTemplate = typeof codeTemplates.$inferSelect;
export type PluginSettings = typeof pluginSettings.$inferSelect;
export type PluginAnalytic = typeof pluginAnalytics.$inferSelect;
export type AssetPreview = typeof assetPreviews.$inferSelect;
