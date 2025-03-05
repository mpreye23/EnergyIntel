import { User, Device, Room, Recommendation, Achievement, PointHistory, InsertUser, InsertDevice, InsertRoom, InsertRecommendation, InsertAchievement, InsertPointHistory, Preset, InsertPreset } from "@shared/schema";
import type { Store } from "express-session";

export interface IStorage {
  sessionStore: Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User>;
  getDevices(userId: number): Promise<Device[]>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDeviceStatus(id: number, status: boolean): Promise<Device>;
  getRecommendations(userId: number): Promise<Recommendation[]>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getLeaderboard(): Promise<User[]>;

  // Room management functions
  getRooms(userId: number): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  getDevicesByRoom(roomId: number): Promise<Device[]>;
  updateDeviceRoom(deviceId: number, roomId: number | null): Promise<Device>;

  // New gamification functions
  getAchievements(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getPointHistory(userId: number): Promise<PointHistory[]>;
  addPointHistory(history: InsertPointHistory): Promise<PointHistory>;
  updateUserLevel(userId: number, level: number): Promise<User>;
  updateAchievementProgress(userId: number, progress: Record<string, any>): Promise<User>;

  // Preset management
  getPresets(userId: number): Promise<Preset[]>;
  getPreset(id: number): Promise<Preset | undefined>;
  createPreset(preset: InsertPreset): Promise<Preset>;
  updatePreset(id: number, preset: Partial<InsertPreset>): Promise<Preset>;
  applyPreset(userId: number, presetId: number): Promise<Device[]>;
}