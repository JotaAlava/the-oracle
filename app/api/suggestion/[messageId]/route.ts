import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } },
) {
  try {
    const messageId = parseInt(params.messageId);

    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: "Invalid message ID" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      messageId,
      message: "API route working",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
