import { NextRequest, NextResponse } from "next/server";
import {
  createNotification,
  getNotificationsByUser,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const countOnly = searchParams.get("countOnly") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (countOnly) {
      const count = await getUnreadNotificationCount(userId);
      return NextResponse.json({ count });
    }

    const notifications = await getNotificationsByUser(userId);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json();

    // Generate ID if not provided
    if (!notificationData.id) {
      notificationData.id = `notif-${Date.now()}`;
    }

    await createNotification(notificationData);

    return NextResponse.json(
      { success: true, id: notificationData.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const markAllRead = searchParams.get("markAllRead") === "true";

    if (markAllRead && userId) {
      await markAllNotificationsAsRead(userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
