import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, model } = body;

    const trimmedText = (text || "").trim();
    if (!trimmedText) {
      return NextResponse.json({ error: "Text is required for TTS synthesis" }, { status: 400 });
    }

    const deepgramKey = (process.env.DEEPGRAM_API_KEY || "").trim();
    if (!deepgramKey || deepgramKey === "your-deepgram-api-key" || deepgramKey === "your_deepgram_api_key") {
      return NextResponse.json({ error: "DEEPGRAM_API_KEY is not configured" }, { status: 500 });
    }

    // Default to natural interviewer voice: aura-asteria-en (or aura-luna-en, aura-orion-en)
    const voiceModel = model || "aura-asteria-en";
    const deepgramTtsUrl = `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(voiceModel)}`;

    const response = await fetch(deepgramTtsUrl, {
      method: "POST",
      headers: {
        "Authorization": `Token ${deepgramKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: trimmedText }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Deepgram TTS failed:", response.status, errText);
      return NextResponse.json({ error: `Deepgram TTS error: ${errText}` }, { status: response.status });
    }

    const audioArrayBuffer = await response.arrayBuffer();
    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mp3",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("TTS endpoint exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to generate TTS audio" }, { status: 500 });
  }
}
