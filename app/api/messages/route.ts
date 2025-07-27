import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Dynamic imports to avoid build-time issues
    const { prisma } = await import("@/lib/prisma");
    const { verifyFirebaseToken } = await import("@/lib/auth-middleware");

    const userId = await verifyFirebaseToken(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        userId,
        deleted: false,
      },
      orderBy: {
        created: "desc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Dynamic imports to avoid build-time issues
    const { prisma } = await import("@/lib/prisma");
    const { verifyFirebaseToken } = await import("@/lib/auth-middleware");

    const userId = await verifyFirebaseToken(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { source, content } = body;

    if (!source || !content) {
      return NextResponse.json(
        { error: "Source and content are required" },
        { status: 400 },
      );
    }

    const message = await prisma.message.create({
      data: {
        source,
        content,
        userId,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
