import { NextResponse } from "next/server";

const NINE_ROUTER_BASE_URL = process.env.NINE_ROUTER_BASE_URL;
const NINE_ROUTER_API_KEY = process.env.NINE_ROUTER_API_KEY;

export async function GET() {
  // Validate configuration
  if (!NINE_ROUTER_BASE_URL || !NINE_ROUTER_API_KEY) {
    return NextResponse.json(
      { error: "Server configuration missing. Set NINE_ROUTER_BASE_URL and NINE_ROUTER_API_KEY." },
      { status: 500 }
    );
  }

  try {
    // Proxy request to 9Router
    const response = await fetch(`${NINE_ROUTER_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${NINE_ROUTER_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`9Router returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models from router" },
      { status: 502 }
    );
  }
}
