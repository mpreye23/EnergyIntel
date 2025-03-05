import { IStorage } from "./types";
import { User, Device, Room, Recommendation, InsertUser, InsertDevice, InsertRoom, InsertRecommendation, Achievement, InsertAchievement, PointHistory, InsertPointHistory } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, devices, rooms, recommendations, achievements, pointHistory } from "@shared/schema";
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

  async getRooms(userId: number): Promise<Room[]> {
    return await db
      .select()
      .from(rooms)
      .where(eq(rooms.userId, userId));
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, id));
    return room;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [room] = await db
      .insert(rooms)
      .values(insertRoom)
      .returning();
    return room;
  }

  async getDevicesByRoom(roomId: number): Promise<Device[]> {
    return await db
      .select()
      .from(devices)
      .where(eq(devices.roomId, roomId));
  }

  async updateDeviceRoom(deviceId: number, roomId: number | null): Promise<Device> {
    const [device] = await db
      .update(devices)
      .set({ roomId })
      .where(eq(devices.id, deviceId))
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

  async getAchievements(userId: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(achievements.unlockedAt);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }

  async getPointHistory(userId: number): Promise<PointHistory[]> {
    return await db
      .select()
      .from(pointHistory)
      .where(eq(pointHistory.userId, userId))
      .orderBy(pointHistory.timestamp);
  }

  async addPointHistory(insertHistory: InsertPointHistory): Promise<PointHistory> {
    const [history] = await db
      .insert(pointHistory)
      .values(insertHistory)
      .returning();
    return history;
  }

  async updateUserLevel(userId: number, level: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ level })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateAchievementProgress(userId: number, progress: Record<string, any>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ achievementProgress: progress })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }
}

export const storage = new DatabaseStorage();