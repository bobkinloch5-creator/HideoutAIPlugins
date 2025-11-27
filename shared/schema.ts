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

// Types
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
