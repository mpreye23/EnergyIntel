import { IStorage } from "./types";
import { User, Device, Recommendation, InsertUser, InsertDevice, InsertRecommendation } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private devices: Map<number, Device>;
  private recommendations: Map<number, Recommendation>;
  private currentId: { [key: string]: number };
  readonly sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.devices = new Map();
    this.recommendations = new Map();
    this.currentId = { users: 1, devices: 1, recommendations: 1 };
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id, energyPoints: 0 };
    this.users.set(id, user);
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, energyPoints: points };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getDevices(userId: number): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(
      (device) => device.userId === userId,
    );
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.currentId.devices++;
    const device: Device = {
      ...insertDevice,
      id,
      status: false,
      currentUsage: 0,
      schedule: {},
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDeviceStatus(id: number, status: boolean): Promise<Device> {
    const device = this.devices.get(id);
    if (!device) throw new Error("Device not found");
    
    const updatedDevice = { ...device, status };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async getRecommendations(userId: number): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values())
      .filter((rec) => rec.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createRecommendation(insertRec: InsertRecommendation): Promise<Recommendation> {
    const id = this.currentId.recommendations++;
    const recommendation: Recommendation = {
      ...insertRec,
      id,
      createdAt: new Date(),
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async getLeaderboard(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.energyPoints - a.energyPoints)
      .slice(0, 10);
  }
}

export const storage = new MemStorage();
