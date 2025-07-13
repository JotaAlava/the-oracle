import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const notion = new Client({ auth: process.env.NOTION_SECRET });
    const response = await notion.pages.create({
      parent: {
        database_id: `${process.env.NOTION_DB}`,
      },
      properties: {
        // Assuming "Email" is a title property in Notion
        Email: {
          title: [
            {
              type: "text",
              text: {
                content: body?.email,
              },
            },
          ],
        },
        // Assuming "Name" is a plain text or email field (adjust type accordingly)
        Name: {
          rich_text: [
            {
              type: "text",
              text: {
                content: body?.name,
              },
            },
          ],
        },
      },
    });

    if (!response) {
      throw new Error("Failed to add email to Notion");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
