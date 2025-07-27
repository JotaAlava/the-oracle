import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } },
) {
  // Prevent build-time execution
  if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 },
    );
  }

  try {
    const messageId = parseInt(params.messageId);

    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: "Invalid message ID" },
        { status: 400 },
      );
    }

    // Dynamic import to avoid build-time issues
    const { prisma } = await import("@/lib/prisma");

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        deleted: false,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      messageId,
      messageContent: message.content,
      message: "API route working with Prisma",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
