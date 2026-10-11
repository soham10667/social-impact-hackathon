import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const deepgramKey = (process.env.DEEPGRAM_API_KEY || "").trim();

    // Check if user has set a valid key
    const isConfigured = Boolean(
      deepgramKey && 
      deepgramKey !== "your-deepgram-api-key" && 
      deepgramKey !== "your_deepgram_api_key" &&
      deepgramKey.length > 20
    );

    return NextResponse.json({
      configured: isConfigured,
      hasKey: isConfigured,
      sttEndpoint: "/api/interviews/stt",
      ttsVoice: "aura-asteria-en",
      provider: "deepgram",
      message: isConfigured
        ? "Deepgram Speech-to-Text (Nova-2) and Aura Text-to-Speech active."
        : "Deepgram API key placeholder detected. Browser Web Speech fallback active.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { configured: false, error: err?.message || "Failed to inspect token" },
      { status: 500 }
    );
  }
}
