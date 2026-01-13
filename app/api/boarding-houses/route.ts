import { NextRequest, NextResponse } from "next/server";
import {
  getAllBoardingHouses,
  getBoardingHousesByOwner,
  createBoardingHouse,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    let boardingHouses;
    if (ownerId) {
      boardingHouses = await getBoardingHousesByOwner(ownerId);
    } else {
      boardingHouses = await getAllBoardingHouses();
    }

    return NextResponse.json(boardingHouses);
  } catch (error) {
    console.error("Error fetching boarding houses:", error);
    return NextResponse.json(
      { error: "Failed to fetch boarding houses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const boardingHouseData = await request.json();

    // Generate ID if not provided
    if (!boardingHouseData.id) {
      boardingHouseData.id = `bh-${Date.now()}`;
    }

    const result = await createBoardingHouse(boardingHouseData);
    
    return NextResponse.json(
      { success: true, id: boardingHouseData.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating boarding house:", error);
    return NextResponse.json(
      { error: "Failed to create boarding house" },
      { status: 500 }
    );
  }
}