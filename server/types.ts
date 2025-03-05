import { User, Device, Room, Recommendation, InsertUser, InsertDevice, InsertRoom, InsertRecommendation } from "@shared/schema";
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

  // New room management functions
  getRooms(userId: number): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  getDevicesByRoom(roomId: number): Promise<Device[]>;
  updateDeviceRoom(deviceId: number, roomId: number | null): Promise<Device>;
}