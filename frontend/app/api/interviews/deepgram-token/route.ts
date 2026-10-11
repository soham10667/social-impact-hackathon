import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const deepgramKey = (process.env.DEEPGRAM_API_KEY || "").trim();

    // Check if user has set a valid key
    const isConfigured = Boolean(
      deepgramKey && 
      deepgramKey !== "your-deepgram-api-key" && 
      deepgramKey !== "your_deepgram_api_key"
    );

    return NextResponse.json({
      configured: isConfigured,
      key: isConfigured ? deepgramKey : null,
      message: isConfigured
        ? "Deepgram voice API is configured and operational."
        : "Deepgram API key not provided or set to default placeholder. Web Speech API fallback is active.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { configured: false, error: err?.message || "Failed to inspect token" },
      { status: 500 }
    );
  }
}
