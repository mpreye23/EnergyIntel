import { IStorage } from "./types";
import { User, Device, Recommendation, InsertUser, InsertDevice, InsertRecommendation } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, devices, recommendations } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  readonly sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ energyPoints: points })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async getDevices(userId: number): Promise<Device[]> {
    return await db
      .select()
      .from(devices)
      .where(eq(devices.userId, userId));
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const [device] = await db
      .insert(devices)
      .values(insertDevice)
      .returning();
    return device;
  }

  async updateDeviceStatus(id: number, status: boolean): Promise<Device> {
    const [device] = await db
      .update(devices)
      .set({ status })
      .where(eq(devices.id, id))
      .returning();
    if (!device) throw new Error("Device not found");
    return device;
  }

  async getRecommendations(userId: number): Promise<Recommendation[]> {
    return await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.userId, userId))
      .orderBy(recommendations.createdAt);
  }

  async createRecommendation(insertRec: InsertRecommendation): Promise<Recommendation> {
    const [recommendation] = await db
      .insert(recommendations)
      .values(insertRec)
      .returning();
    return recommendation;
  }

  async getLeaderboard(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(users.energyPoints)
      .limit(10);
  }
}

export const storage = new DatabaseStorage();