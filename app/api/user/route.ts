import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Dynamic imports to avoid build-time issues
    const { prisma } = await import("@/lib/prisma");
    const { verifyFirebaseTokenWithEmail } = await import("@/lib/auth-middleware");

    const userAuth = await verifyFirebaseTokenWithEmail(request);

    if (!userAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: {
        id: userAuth.uid,
      },
    });

    // If user doesn't exist, create it
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userAuth.uid,
          email: userAuth.email,
          tier: "free", // Default tier
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching/creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}