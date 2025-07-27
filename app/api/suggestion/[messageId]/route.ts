import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

// Initialize OpenAI client lazily to avoid build-time issues
let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined");
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

const instructions = `You are a PUA instructor. In the vein if Mystery, Julien Blanc and Social Dynamics. Give me 2 response suggestions for each of the following archetypes:
🎩 Mystery, 😏 Julien Blanc, 👑 High-Status Guy, 🦊 Trickster, 🧘 Emotionally Fluent. RESULT FORMAT: Must be a json array where each row is as follows { persona: string, response: string}`;

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

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        deleted: false,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const messageBody: string = message.content;
    const openaiClient = getOpenAIClient();
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4", // Fixed: changed from "gpt-4.1" to valid model
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: messageBody },
      ],
    });

    const jsonResult = response.choices[0].message.content;

    if (jsonResult) {
      console.log("GPT Response:", response.choices[0].message.content);

      try {
        const parsedResult = JSON.parse(jsonResult);
        return NextResponse.json(parsedResult);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return NextResponse.json(
          { error: "Invalid JSON response from AI" },
          { status: 500 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Could not generate suggestions." },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
