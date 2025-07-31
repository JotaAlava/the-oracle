import { NextRequest, NextResponse } from "next/server";

const instructions = `You are a PUA instructor. In the vein if Mystery, Julien Blanc and Social Dynamics. Give me 2 response suggestions for each of the following archetypes:
🎩 The Magician, 😏 Shock & Awe, 👑 High-Status Guy, 🦊 Push-pull, 🧘 Emotionally Fluent. RESULT FORMAT: Must be a json array where each row is as follows { persona: string, response: string}. <EXAMPLES> Message: Haha! Cute. Ok. What do you need help with? System: 🎩 The Magician
“Might need help being a bad influence tonight. You any good at that?”

or

“Let’s start with a drink and see where your talents shine.”

😏 Shock & Awe
“I need someone to stop me from misbehaving. Or join in — your call.”

or

“You offering help or trouble? I’m better at the second.”

👑 High-Status Guy
“You’re cute when you try to take control. Let’s grab a drink and you can pretend to be in charge.”

or

“I’ll let you help — as long as we make it fun and a little inappropriate.”

🦊 Push-pull
“I was gonna say laundry… but now I’m thinking tequila and bad decisions.”

or

“Help me test if this chemistry’s just online or worth canceling plans for.”

🧘 Emotionally Fluent
“Help’s overrated. But connection? That’s rare. Let’s explore that over something strong.”

or

“I don’t need help. I need presence. Think you can give me that?”`;

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

    // Dynamic imports to avoid build-time issues
    const { prisma } = await import("@/lib/prisma");
    const { OpenAI } = await import("openai");

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        deleted: false,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const messageBody: string = message.content;
    const response = await openai.chat.completions.create({
      model: "gpt-4",
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
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
