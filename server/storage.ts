import {
  users,
  projects,
  commands,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Command,
  type InsertCommand,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
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
