import { db } from "./index";
import { users, boardingHouses, rooms, occupants, notifications } from "./schema";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { User, BoardingHouse, Room, Occupant, Notification } from "./schema";

// User queries
export async function createUser(userData: {
  id: string;
  email: string;
  name: string;
  password: string;
  role: "admin" | "owner";
}) {
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  const [result] = await db.insert(users).values({
    ...userData,
    password: hashedPassword,
  });
  return result;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

// Boarding House queries
export async function createBoardingHouse(boardingHouseData: {
  id: string;
  ownerId: string;
  name: string;
  barangay: string;
  address: string;
  contactNumber: string;
  permitNumber: string;
  permitIssueDate: string;
  permitExpiryDate: string;
  permitDocument?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
  permitStatus: "valid" | "expired" | "near-expiry" | "pending";
}) {
  // Convert number to string for decimal fields
  const dataToInsert = {
    ...boardingHouseData,
    latitude: boardingHouseData.latitude?.toString() || null,
    longitude: boardingHouseData.longitude?.toString() || null,
  };
  const [result] = await db.insert(boardingHouses).values(dataToInsert);
  return result;
}

export async function getAllBoardingHouses(): Promise<BoardingHouse[]> {
  return await db.select().from(boardingHouses);
}

export async function getBoardingHouseById(id: string): Promise<BoardingHouse | null> {
  const [boardingHouse] = await db
    .select()
    .from(boardingHouses)
    .where(eq(boardingHouses.id, id));
  return boardingHouse || null;
}

export async function getBoardingHousesByOwner(ownerId: string): Promise<BoardingHouse[]> {
  return await db
    .select()
    .from(boardingHouses)
    .where(eq(boardingHouses.ownerId, ownerId));
}

export async function updateBoardingHouse(id: string, updateData: Partial<BoardingHouse>) {
  const [result] = await db
    .update(boardingHouses)
    .set(updateData)
    .where(eq(boardingHouses.id, id));
  return result;
}

export async function deleteBoardingHouse(id: string) {
  const [result] = await db
    .delete(boardingHouses)
    .where(eq(boardingHouses.id, id));
  return result;
}

// Room queries
export async function createRoom(roomData: {
  id: string;
  boardingHouseId: string;
  name: string;
  capacity: number;
}) {
  const [result] = await db.insert(rooms).values(roomData);
  return result;
}

export async function getRoomsByBoardingHouse(boardingHouseId: string): Promise<Room[]> {
  return await db
    .select()
    .from(rooms)
    .where(eq(rooms.boardingHouseId, boardingHouseId));
}

export async function getRoomById(id: string): Promise<Room | null> {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
  return room || null;
}

export async function updateRoom(id: string, updateData: Partial<Room>) {
  const [result] = await db.update(rooms).set(updateData).where(eq(rooms.id, id));
  return result;
}

export async function deleteRoom(id: string) {
  const [result] = await db.delete(rooms).where(eq(rooms.id, id));
  return result;
}

// Occupant queries
export async function createOccupant(occupantData: {
  id: string;
  roomId: string;
  name: string;
  contactNumber: string;
  moveInDate: string;
}) {
  const [result] = await db.insert(occupants).values(occupantData);
  return result;
}

export async function getOccupantsByRoom(roomId: string): Promise<Occupant[]> {
  return await db
    .select()
    .from(occupants)
    .where(eq(occupants.roomId, roomId));
}

export async function getOccupantById(id: string): Promise<Occupant | null> {
  const [occupant] = await db.select().from(occupants).where(eq(occupants.id, id));
  return occupant || null;
}

export async function updateOccupant(id: string, updateData: Partial<Occupant>) {
  const [result] = await db.update(occupants).set(updateData).where(eq(occupants.id, id));
  return result;
}

export async function deleteOccupant(id: string) {
  const [result] = await db.delete(occupants).where(eq(occupants.id, id));
  return result;
}

// Complex queries with joins
export async function getRoomsWithOccupants(boardingHouseId: string) {
  const boardingHouseRooms = await getRoomsByBoardingHouse(boardingHouseId);
  
  const roomsWithOccupants = await Promise.all(
    boardingHouseRooms.map(async (room) => {
      const roomOccupants = await getOccupantsByRoom(room.id);
      return {
        ...room,
        occupants: roomOccupants,
      };
    })
  );

  return roomsWithOccupants;
}

export async function getTotalOccupancy(boardingHouseId: string) {
  const rooms = await getRoomsWithOccupants(boardingHouseId);
  const total = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const occupied = rooms.reduce((sum, room) => sum + room.occupants.length, 0);
  return { total, occupied, available: total - occupied };
}

// Utility functions for permit status
export function getPermitStatusColor(status: string): string {
  switch (status) {
    case "valid":
      return "bg-success text-success-foreground";
    case "expired":
      return "bg-destructive text-destructive-foreground";
    case "near-expiry":
      return "bg-warning text-warning-foreground";
    case "pending":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

// Notification queries
export async function createNotification(notificationData: {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "approval" | "rejection" | "warning" | "info";
  relatedId?: string | null;
}) {
  const [result] = await db.insert(notifications).values(notificationData);
  return result;
}

export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const unread = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return unread.length;
}

export async function markNotificationAsRead(id: string) {
  const [result] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id));
  return result;
}

export async function markAllNotificationsAsRead(userId: string) {
  const [result] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
  return result;
}