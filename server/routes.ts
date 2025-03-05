import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateRecommendations } from "./openai";
import { insertDeviceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Device routes
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

  // Recommendations routes
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

  // Leaderboard route
  app.get("/api/leaderboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  const httpServer = createServer(app);
  return httpServer;
}
