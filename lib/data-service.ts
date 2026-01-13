import type { BoardingHouse, Room, Occupant, Notification } from "./types";

// BoardingHouse API functions
export async function getBoardingHousesByOwner(ownerId: string): Promise<BoardingHouse[]> {
  try {
    const response = await fetch(`/api/boarding-houses?ownerId=${ownerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch boarding houses');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching boarding houses by owner:', error);
    return [];
  }
}

export async function getAllBoardingHouses(): Promise<BoardingHouse[]> {
  try {
    const response = await fetch('/api/boarding-houses');
    if (!response.ok) {
      throw new Error('Failed to fetch boarding houses');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching all boarding houses:', error);
    return [];
  }
}

export async function getBoardingHouseById(id: string): Promise<BoardingHouse | null> {
  try {
    const response = await fetch(`/api/boarding-houses/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch boarding house');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching boarding house:', error);
    return null;
  }
}

export async function createBoardingHouse(data: Omit<BoardingHouse, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const response = await fetch('/api/boarding-houses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create boarding house');
    }
    
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating boarding house:', error);
    return null;
  }
}

export async function updateBoardingHouse(id: string, data: Partial<BoardingHouse>): Promise<boolean> {
  try {
    const response = await fetch(`/api/boarding-houses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error updating boarding house:', error);
    return false;
  }
}

// Room API functions
export async function getRoomsByBoardingHouse(boardingHouseId: string): Promise<Room[]> {
  try {
    const response = await fetch(`/api/rooms?boardingHouseId=${boardingHouseId}&includeOccupants=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch rooms');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
}

export async function createRoom(data: Omit<Room, 'id' | 'occupants'>): Promise<string | null> {
  try {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create room');
    }
    
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating room:', error);
    return null;
  }
}

export async function deleteRoom(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/rooms?id=${id}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting room:', error);
    return false;
  }
}

// Occupant API functions
export async function getOccupantsByRoom(roomId: string): Promise<Occupant[]> {
  try {
    const response = await fetch(`/api/occupants?roomId=${roomId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch occupants');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching occupants:', error);
    return [];
  }
}

export async function createOccupant(data: Omit<Occupant, 'id'>): Promise<string | null> {
  try {
    const response = await fetch('/api/occupants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create occupant');
    }
    
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating occupant:', error);
    return null;
  }
}

export async function updateOccupant(id: string, data: Partial<Occupant>): Promise<boolean> {
  try {
    const response = await fetch(`/api/occupants?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error updating occupant:', error);
    return false;
  }
}

export async function deleteOccupant(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/occupants?id=${id}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting occupant:', error);
    return false;
  }
}

// Utility functions
export function getTotalOccupancy(rooms: Room[]): { total: number; occupied: number; available: number } {
  if (!Array.isArray(rooms)) {
    return { total: 0, occupied: 0, available: 0 };
  }
  const total = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const occupied = rooms.reduce((sum, room) => sum + (room.occupants?.length || 0), 0);
  return { total, occupied, available: total - occupied };
}

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

// Notification API functions
export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
  try {
    const response = await fetch(`/api/notifications?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const response = await fetch(`/api/notifications?userId=${userId}&countOnly=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch notification count');
    }
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return 0;
  }
}

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: "approval" | "rejection" | "warning" | "info";
  relatedId?: string;
}): Promise<string | null> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create notification');
    }
    
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/notifications/${id}`, {
      method: 'PUT',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/notifications?userId=${userId}&markAllRead=true`, {
      method: 'PUT',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}