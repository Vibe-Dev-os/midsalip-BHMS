import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  int,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "owner"]).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Boarding Houses table
export const boardingHouses = mysqlTable("boarding_houses", {
  id: varchar("id", { length: 255 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  barangay: varchar("barangay", { length: 255 }).notNull(),
  address: text("address").notNull(),
  contactNumber: varchar("contact_number", { length: 20 }).notNull(),
  permitNumber: varchar("permit_number", { length: 255 }).notNull().unique(),
  permitIssueDate: varchar("permit_issue_date", { length: 10 }).notNull(),
  permitExpiryDate: varchar("permit_expiry_date", { length: 10 }).notNull(),
  permitDocument: varchar("permit_document", { length: 500 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  priceMin: decimal("price_min", { precision: 10, scale: 2 }),
  priceMax: decimal("price_max", { precision: 10, scale: 2 }),
  genderAccommodation: varchar("gender_accommodation", { length: 50 }),
  isActive: boolean("is_active").default(true),
  permitStatus: mysqlEnum("permit_status", ["valid", "expired", "near-expiry", "pending"]).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Rooms table
export const rooms = mysqlTable("rooms", {
  id: varchar("id", { length: 255 }).primaryKey(),
  boardingHouseId: varchar("boarding_house_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  capacity: int("capacity").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Occupants table
export const occupants = mysqlTable("occupants", {
  id: varchar("id", { length: 255 }).primaryKey(),
  roomId: varchar("room_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  contactNumber: varchar("contact_number", { length: 20 }).notNull(),
  moveInDate: varchar("move_in_date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["approval", "rejection", "warning", "info"]).notNull(),
  isRead: boolean("is_read").default(false),
  relatedId: varchar("related_id", { length: 255 }), // e.g., boarding house id
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Define relationships - these are for type inference, not database constraints
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type BoardingHouse = typeof boardingHouses.$inferSelect;
export type NewBoardingHouse = typeof boardingHouses.$inferInsert;

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

export type Occupant = typeof occupants.$inferSelect;
export type NewOccupant = typeof occupants.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;