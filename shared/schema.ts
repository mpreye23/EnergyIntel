import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  energyPoints: integer("energy_points").notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Add rooms table
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  floor: integer("floor").notNull().default(1),
});

const roomTypes = ["living", "bedroom", "kitchen", "bathroom", "office", "other"] as const;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export const insertRoomSchema = createInsertSchema(rooms)
  .pick({
    userId: true,
    name: true,
    type: true,
    floor: true,
  })
  .extend({
    type: z.enum(roomTypes),
  });

const deviceTypes = ["light", "thermostat", "tv", "computer"] as const;

// Update devices table to include roomId
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  roomId: integer("room_id"),  // Optional - device can be unassigned
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: boolean("status").notNull().default(false),
  currentUsage: integer("current_usage").notNull().default(0),
  schedule: jsonb("schedule").notNull().default({}),
});

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export const insertDeviceSchema = createInsertSchema(devices)
  .pick({
    userId: true,
    roomId: true,
    name: true,
    type: true,
  })
  .extend({
    type: z.enum(deviceTypes),
    roomId: z.number().nullable(),
  });

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export const insertRecommendationSchema = createInsertSchema(recommendations).pick({
  userId: true,
  content: true,
});