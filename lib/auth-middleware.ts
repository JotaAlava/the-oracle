import { NextRequest } from "next/server";
import { auth } from "./firebase-admin";

export async function verifyFirebaseToken(
  request: NextRequest,
): Promise<string | null> {
  try {
    const authHeader = request.headers.get("oracle-authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    return decodedToken.uid;
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    return null;
  }
}
