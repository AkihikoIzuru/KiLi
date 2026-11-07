import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const NINE_ROUTER_BASE_URL = process.env.NINE_ROUTER_BASE_URL;
const NINE_ROUTER_API_KEY = process.env.NINE_ROUTER_API_KEY;

export async function POST(req: Request) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate configuration
  if (!NINE_ROUTER_BASE_URL || !NINE_ROUTER_API_KEY) {
    console.error("❌ Missing environment variables");
    return new Response(
      JSON.stringify({ error: "Server configuration missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages, model, conversationId } = await req.json();

    console.log("📨 Chat request:", {
      model,
      messageCount: messages?.length,
      conversationId,
      userId: session.user.id
    });

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify conversation ownership if provided
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: session.user.id,
        },
      });

      if (!conversation) {
        return new Response(
          JSON.stringify({ error: "Conversation not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Get the last user message to save
    const lastUserMessage = messages[messages.length - 1];

    // Save user message to database if conversationId provided
    if (conversationId && lastUserMessage?.role === "user") {
      await prisma.message.create({
        data: {
          conversationId,
          role: "user",
          content: lastUserMessage.content,
        },
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    }

    // Direct call to 9Router (OpenAI-compatible)
    const response = await fetch(`${NINE_ROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NINE_ROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || "gpt-3.5-turbo",
        messages: messages,
        stream: true,
      }),
    });

    console.log("🔄 9Router response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 9Router error:", response.status, errorText);
      return new Response(
        JSON.stringify({
          error: `9Router returned ${response.status}`,
          details: errorText
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream response and save to database
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (reader) {
            const { done, value } = await reader.read();
            if (done) {
              // Save assistant message to database
              if (conversationId && fullResponse) {
                await prisma.message.create({
                  data: {
                    conversationId,
                    role: "assistant",
                    content: fullResponse,
                    model: model || "gpt-3.5-turbo",
                  },
                });
                console.log("✅ Saved assistant message to database");
              }
              controller.close();
              break;
            }

            // Accumulate response for database save
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }

            // Forward to client
            controller.enqueue(value);
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("❌ Chat API error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
