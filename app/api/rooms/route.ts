import { NextRequest, NextResponse } from "next/server";
import {
  getRoomsByBoardingHouse,
  getRoomsWithOccupants,
  createRoom,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardingHouseId = searchParams.get("boardingHouseId");
    const includeOccupants = searchParams.get("includeOccupants") === "true";

    if (!boardingHouseId) {
      return NextResponse.json(
        { error: "Boarding house ID is required" },
        { status: 400 }
      );
    }

    let rooms;
    if (includeOccupants) {
      rooms = await getRoomsWithOccupants(boardingHouseId);
    } else {
      rooms = await getRoomsByBoardingHouse(boardingHouseId);
    }

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const roomData = await request.json();
    
    console.log("Creating room with data:", roomData);

    // Validate required fields
    if (!roomData.boardingHouseId) {
      console.error("Missing boardingHouseId in room data:", roomData);
      return NextResponse.json(
        { error: "Boarding house ID is required" },
        { status: 400 }
      );
    }

    // Generate ID if not provided
    if (!roomData.id) {
      roomData.id = `room-${Date.now()}`;
    }

    const result = await createRoom({
      id: roomData.id,
      boardingHouseId: roomData.boardingHouseId,
      name: roomData.name,
      capacity: roomData.capacity,
    });
    
    console.log("Room created successfully:", roomData.id);
    
    return NextResponse.json(
      { success: true, id: roomData.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const { deleteRoom } = await import("@/lib/db/queries");
    await deleteRoom(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}