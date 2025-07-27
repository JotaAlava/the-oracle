import { NextRequest } from "next/server";
import { auth } from "./firebase-admin";

export async function verifyFirebaseToken(
  request: NextRequest,
): Promise<string | null> {
  try {
    if (!auth) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Firebase auth is not initialized");
      }
      return null;
    }

    let authHeader = request.headers.get("Authorization");

    if (!authHeader && process.env.NODE_ENV === "production") {
      const vercelHeaders = request.headers.get("x-vercel-sc-headers");
      if (vercelHeaders) {
        try {
          const parsedHeaders = JSON.parse(vercelHeaders);
          console.log(`parsedHeaders received: ${parsedHeaders}`);
          authHeader = parsedHeaders.Authorization;
        } catch (e) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Failed to parse x-vercel-sc-headers:", e);
          }
        }
      }
    }

    console.log(`authHeader received: ${authHeader}`);
    if (process.env.NODE_ENV !== "production") {
      console.log(`authHeader received: ${authHeader}`);
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];

    console.log(`token received: ${token}`);

    if (process.env.NODE_ENV !== "production") {
      console.log(`token parsed: ${token}`);
    }

    const decodedToken = await auth.verifyIdToken(token);
    console.log(`decodedToken received: ${decodedToken}`);

    if (process.env.NODE_ENV !== "production") {
      console.log(`decodedToken: ${JSON.stringify(decodedToken)}`);
    }

    return decodedToken.uid;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Firebase token verification failed:", error);
    }
    return null;
  }
}
