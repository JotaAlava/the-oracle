import { NextRequest } from "next/server";
import { auth } from "./firebase-admin";

export async function verifyFirebaseToken(
  request: NextRequest,
): Promise<string | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    console.log(`authHeader received: ${authHeader}`);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    console.log(`token parsed: ${token}`);
    const decodedToken = await auth.verifyIdToken(token);
    console.log(`decodedToken: ${decodedToken}`);

    return decodedToken.uid;
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    return null;
  }
}
