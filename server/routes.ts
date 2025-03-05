import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateRecommendations } from "./openai";
import { insertDeviceSchema, insertRoomSchema } from "@shared/schema";
import { insertAchievementSchema, insertPointHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Existing device routes
  app.get("/api/devices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const devices = await storage.getDevices(req.user.id);
    res.json(devices);
  });

  app.post("/api/devices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const deviceData = insertDeviceSchema.parse({ ...req.body, userId: req.user.id });
    const device = await storage.createDevice(deviceData);
    res.status(201).json(device);
  });

  app.post("/api/devices/:id/toggle", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const device = await storage.updateDeviceStatus(parseInt(req.params.id), req.body.status);
    res.json(device);
  });

  // New room routes
  app.get("/api/rooms", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const rooms = await storage.getRooms(req.user.id);
    res.json(rooms);
  });

  app.post("/api/rooms", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const roomData = insertRoomSchema.parse({ ...req.body, userId: req.user.id });
    const room = await storage.createRoom(roomData);
    res.status(201).json(room);
  });

  app.get("/api/rooms/:id/devices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const devices = await storage.getDevicesByRoom(parseInt(req.params.id));
    res.json(devices);
  });

  app.post("/api/devices/:id/room", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const device = await storage.updateDeviceRoom(
      parseInt(req.params.id),
      req.body.roomId ? parseInt(req.body.roomId) : null
    );
    res.json(device);
  });

  // Existing recommendation routes
  app.get("/api/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const devices = await storage.getDevices(req.user.id);
    const recommendations = await generateRecommendations(devices);

    for (const content of recommendations) {
      await storage.createRecommendation({
        userId: req.user.id,
        content,
      });
    }

    const userRecs = await storage.getRecommendations(req.user.id);
    res.json(userRecs);
  });

  // Existing leaderboard route
  app.get("/api/leaderboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  // Gamification routes
  app.get("/api/achievements", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const achievements = await storage.getAchievements(req.user.id);
    res.json(achievements);
  });

  app.get("/api/points/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const history = await storage.getPointHistory(req.user.id);
    res.json(history);
  });

  app.post("/api/achievements", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const achievementData = insertAchievementSchema.parse({
      ...req.body,
      userId: req.user.id,
    });
    const achievement = await storage.createAchievement(achievementData);
    res.status(201).json(achievement);
  });

  app.post("/api/points/add", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const pointData = insertPointHistorySchema.parse({
      ...req.body,
      userId: req.user.id,
    });

    // Add points to history
    const history = await storage.addPointHistory(pointData);

    // Update user's total points
    const user = await storage.getUser(req.user.id);
    if (!user) return res.sendStatus(404);

    const newPoints = user.energyPoints + pointData.points;
    const updatedUser = await storage.updateUserPoints(user.id, newPoints);

    // Check for level up (every 1000 points)
    const newLevel = Math.floor(newPoints / 1000) + 1;
    if (newLevel > user.level) {
      await storage.updateUserLevel(user.id, newLevel);
    }

    res.json({ history, user: updatedUser });
  });

  const httpServer = createServer(app);
  return httpServer;
}