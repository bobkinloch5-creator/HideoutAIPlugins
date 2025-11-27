import {
  users,
  projects,
  commands,
  codeHistory,
  codeTemplates,
  pluginSettings,
  pluginAnalytics,
  assetPreviews,
  type User,
  type InsertUser,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Command,
  type InsertCommand,
  type CodeHistory,
  type CodeTemplate,
  type PluginSettings,
  type PluginAnalytic,
  type AssetPreview,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { id?: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Project operations
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject & { userId: string }): Promise<Project>;
  updateProject(id: string, data: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;

  // Command operations
  getCommands(projectId: string): Promise<Command[]>;
  getCommand(id: string): Promise<Command | undefined>;
  createCommand(command: InsertCommand): Promise<Command>;

  // Code History operations
  getCodeHistory(projectId: string): Promise<CodeHistory[]>;
  getCodeHistoryVersion(projectId: string, version: number): Promise<CodeHistory | undefined>;
  saveCodeVersion(data: CodeHistory & { projectId: string; userId: string; code: string }): Promise<CodeHistory>;
  starCodeVersion(id: string, isStarred: boolean): Promise<CodeHistory | undefined>;

  // Code Template operations
  getCodeTemplates(userId: string): Promise<CodeTemplate[]>;
  createCodeTemplate(data: { userId: string; name: string; code: string; category?: string; description?: string }): Promise<CodeTemplate>;
  deleteCodeTemplate(id: string): Promise<void>;

  // Plugin Settings operations
  getPluginSettings(userId: string): Promise<PluginSettings | undefined>;
  upsertPluginSettings(data: PluginSettings & { userId: string }): Promise<PluginSettings>;

  // Plugin Analytics operations
  trackAnalytics(data: { userId: string; featureName: string; action: string; gameType?: string; metadata?: any }): Promise<PluginAnalytic>;
  getAnalytics(userId: string, days: number): Promise<PluginAnalytic[]>;

  // Asset Preview operations
  getAssetPreview(assetId: string): Promise<AssetPreview | undefined>;
  cacheAssetPreview(data: Omit<AssetPreview, 'id' | 'createdAt'>): Promise<AssetPreview>;

  // Stats
  getUserStats(userId: string): Promise<{
    totalProjects: number;
    activeProjects: number;
    totalCommands: number;
    totalAssets: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser & { id?: string }): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.status, 'active')))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(projectData: InsertProject & { userId: string }): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values({
        ...projectData,
        status: 'active',
        commandCount: 0,
        assetCount: 0,
      })
      .returning();
    return project;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.update(projects).set({ status: 'deleted' }).where(eq(projects.id, id));
  }

  // Command operations
  async getCommands(projectId: string): Promise<Command[]> {
    return await db
      .select()
      .from(commands)
      .where(eq(commands.projectId, projectId))
      .orderBy(desc(commands.createdAt));
  }

  async getCommand(id: string): Promise<Command | undefined> {
    const [command] = await db.select().from(commands).where(eq(commands.id, id));
    return command;
  }

  async createCommand(commandData: InsertCommand): Promise<Command> {
    const [command] = await db
      .insert(commands)
      .values(commandData)
      .returning();

    // Update project command count
    await db
      .update(projects)
      .set({
        commandCount: sql`${projects.commandCount} + 1`,
        lastGeneratedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, commandData.projectId));

    return command;
  }

  // Code History operations
  async getCodeHistory(projectId: string): Promise<CodeHistory[]> {
    return await db
      .select()
      .from(codeHistory)
      .where(eq(codeHistory.projectId, projectId))
      .orderBy(desc(codeHistory.version));
  }

  async getCodeHistoryVersion(projectId: string, version: number): Promise<CodeHistory | undefined> {
    const [record] = await db
      .select()
      .from(codeHistory)
      .where(and(eq(codeHistory.projectId, projectId), eq(codeHistory.version, version)));
    return record;
  }

  async saveCodeVersion(data: CodeHistory & { projectId: string; userId: string; code: string }): Promise<CodeHistory> {
    const historyCount = await db
      .select()
      .from(codeHistory)
      .where(eq(codeHistory.projectId, data.projectId));

    const [record] = await db
      .insert(codeHistory)
      .values({
        projectId: data.projectId,
        userId: data.userId,
        code: data.code,
        version: historyCount.length + 1,
        codeHash: Buffer.from(data.code).toString('base64').substring(0, 64),
      })
      .returning();
    return record;
  }

  async starCodeVersion(id: string, isStarred: boolean): Promise<CodeHistory | undefined> {
    const [record] = await db
      .update(codeHistory)
      .set({ isStarred })
      .where(eq(codeHistory.id, id))
      .returning();
    return record;
  }

  // Code Template operations
  async getCodeTemplates(userId: string): Promise<CodeTemplate[]> {
    return await db
      .select()
      .from(codeTemplates)
      .where(eq(codeTemplates.userId, userId))
      .orderBy(desc(codeTemplates.createdAt));
  }

  async createCodeTemplate(data: { userId: string; name: string; code: string; category?: string; description?: string }): Promise<CodeTemplate> {
    const [template] = await db
      .insert(codeTemplates)
      .values({
        userId: data.userId,
        name: data.name,
        code: data.code,
        category: data.category,
        description: data.description,
        usage: 0,
      })
      .returning();
    return template;
  }

  async deleteCodeTemplate(id: string): Promise<void> {
    await db.delete(codeTemplates).where(eq(codeTemplates.id, id));
  }

  // Plugin Settings operations
  async getPluginSettings(userId: string): Promise<PluginSettings | undefined> {
    const [settings] = await db
      .select()
      .from(pluginSettings)
      .where(eq(pluginSettings.userId, userId));
    return settings;
  }

  async upsertPluginSettings(data: PluginSettings & { userId: string }): Promise<PluginSettings> {
    const [settings] = await db
      .insert(pluginSettings)
      .values({
        userId: data.userId,
        autoInsertCode: data.autoInsertCode ?? false,
        defaultGameWidth: data.defaultGameWidth ?? 100,
        defaultGameHeight: data.defaultGameHeight ?? 100,
        defaultAssetScale: data.defaultAssetScale ?? "1.0",
        enableValidation: data.enableValidation ?? true,
        enableRealTimeSync: data.enableRealTimeSync ?? true,
        theme: data.theme ?? "dark",
      })
      .onConflictDoUpdate({
        target: pluginSettings.userId,
        set: {
          autoInsertCode: data.autoInsertCode,
          defaultGameWidth: data.defaultGameWidth,
          defaultGameHeight: data.defaultGameHeight,
          defaultAssetScale: data.defaultAssetScale,
          enableValidation: data.enableValidation,
          enableRealTimeSync: data.enableRealTimeSync,
          theme: data.theme,
        },
      })
      .returning();
    return settings;
  }

  // Plugin Analytics operations
  async trackAnalytics(data: { userId: string; featureName: string; action: string; gameType?: string; metadata?: any }): Promise<PluginAnalytic> {
    const [analytic] = await db
      .insert(pluginAnalytics)
      .values({
        userId: data.userId,
        featureName: data.featureName,
        action: data.action,
        gameType: data.gameType,
        metadata: data.metadata,
      })
      .returning();
    return analytic;
  }

  async getAnalytics(userId: string, days: number = 30): Promise<PluginAnalytic[]> {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await db
      .select()
      .from(pluginAnalytics)
      .where(and(eq(pluginAnalytics.userId, userId)))
      .orderBy(desc(pluginAnalytics.createdAt));
  }

  // Asset Preview operations
  async getAssetPreview(assetId: string): Promise<AssetPreview | undefined> {
    const [preview] = await db
      .select()
      .from(assetPreviews)
      .where(eq(assetPreviews.assetId, assetId));
    return preview;
  }

  async cacheAssetPreview(data: Omit<AssetPreview, 'id' | 'createdAt'>): Promise<AssetPreview> {
    const [preview] = await db
      .insert(assetPreviews)
      .values(data as any)
      .onConflictDoUpdate({
        target: assetPreviews.assetId,
        set: data as any,
      })
      .returning();
    return preview;
  }

  // Stats
  async getUserStats(userId: string): Promise<{
    totalProjects: number;
    activeProjects: number;
    totalCommands: number;
    totalAssets: number;
  }> {
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId));

    const activeProjects = userProjects.filter(p => p.status === 'active');
    const totalCommands = activeProjects.reduce((sum, p) => sum + (p.commandCount || 0), 0);
    const totalAssets = activeProjects.reduce((sum, p) => sum + (p.assetCount || 0), 0);

    return {
      totalProjects: userProjects.length,
      activeProjects: activeProjects.length,
      totalCommands,
      totalAssets,
    };
  }
}

export const storage = new DatabaseStorage();
