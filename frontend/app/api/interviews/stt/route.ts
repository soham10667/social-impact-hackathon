import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const deepgramKey = (process.env.DEEPGRAM_API_KEY || "").trim();
    if (!deepgramKey || deepgramKey === "your-deepgram-api-key" || deepgramKey.length < 10) {
      return NextResponse.json({ error: "DEEPGRAM_API_KEY is not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;
    const language = (formData.get("language") as string) || "en";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Deepgram listen REST endpoint
    const langParam = language.toLowerCase().includes("hi") ? "hi" : "en-US";
    const deepgramUrl = `https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&language=${langParam}`;

    const dgRes = await fetch(deepgramUrl, {
      method: "POST",
      headers: {
        "Authorization": `Token ${deepgramKey}`,
        "Content-Type": audioFile.type || "audio/webm",
      },
      body: buffer,
    });

    if (!dgRes.ok) {
      const errText = await dgRes.text();
      console.error("Deepgram REST listen failed:", dgRes.status, errText);
      return NextResponse.json({ error: `Deepgram STT failed: ${errText}` }, { status: dgRes.status });
    }

    const data = await dgRes.json();
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    const confidence = data.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

    return NextResponse.json({
      transcript: transcript.trim(),
      confidence,
      words: data.results?.channels?.[0]?.alternatives?.[0]?.words || [],
    });
  } catch (err: any) {
    console.error("STT endpoint error:", err);
    return NextResponse.json({ error: err?.message || "Internal STT error" }, { status: 500 });
  }
}
