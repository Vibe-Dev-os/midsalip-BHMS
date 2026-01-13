import { NextRequest, NextResponse } from "next/server";
import {
  getOccupantsByRoom,
  createOccupant,
  updateOccupant,
  deleteOccupant,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const occupants = await getOccupantsByRoom(roomId);
    return NextResponse.json(occupants);
  } catch (error) {
    console.error("Error fetching occupants:", error);
    return NextResponse.json(
      { error: "Failed to fetch occupants" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const occupantData = await request.json();

    // Generate ID if not provided
    if (!occupantData.id) {
      occupantData.id = `occ-${Date.now()}`;
    }

    const result = await createOccupant(occupantData);
    
    return NextResponse.json(
      { success: true, id: occupantData.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating occupant:", error);
    return NextResponse.json(
      { error: "Failed to create occupant" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Occupant ID is required" },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const result = await updateOccupant(id, updateData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating occupant:", error);
    return NextResponse.json(
      { error: "Failed to update occupant" },
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
        { error: "Occupant ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteOccupant(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting occupant:", error);
    return NextResponse.json(
      { error: "Failed to delete occupant" },
      { status: 500 }
    );
  }
}