import { NextRequest, NextResponse } from "next/server";
import {
  getBoardingHouseById,
  updateBoardingHouse,
  deleteBoardingHouse,
} from "@/lib/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const boardingHouse = await getBoardingHouseById(id);

    if (!boardingHouse) {
      return NextResponse.json(
        { error: "Boarding house not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(boardingHouse);
  } catch (error) {
    console.error("Error fetching boarding house:", error);
    return NextResponse.json(
      { error: "Failed to fetch boarding house" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    const result = await updateBoardingHouse(id, updateData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating boarding house:", error);
    return NextResponse.json(
      { error: "Failed to update boarding house" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await deleteBoardingHouse(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting boarding house:", error);
    return NextResponse.json(
      { error: "Failed to delete boarding house" },
      { status: 500 }
    );
  }
}