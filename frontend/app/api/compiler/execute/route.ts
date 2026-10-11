import { NextRequest, NextResponse } from "next/server";

// Standard OneCompiler Language Mapping
const LANGUAGE_MAP: Record<string, { language: string; filename: string }> = {
  python: { language: "python", filename: "main.py" },
  python3: { language: "python", filename: "main.py" },
  py: { language: "python", filename: "main.py" },
  javascript: { language: "javascript", filename: "index.js" },
  js: { language: "javascript", filename: "index.js" },
  nodejs: { language: "javascript", filename: "index.js" },
  java: { language: "java", filename: "Main.java" },
  cpp: { language: "cpp", filename: "main.cpp" },
  "c++": { language: "cpp", filename: "main.cpp" },
  c: { language: "c", filename: "main.c" },
};

async function callOneCompilerDirect(language: string, code: string, stdin: string = "") {
  const apiKey = (process.env.ONECOMPILER_API_KEY || "").trim();

  const langKey = language.toLowerCase().trim();
  const langConfig = LANGUAGE_MAP[langKey] || { language: langKey, filename: "main.txt" };

  const payload = {
    language: langConfig.language,
    stdin: stdin || "",
    files: [
      {
        name: langConfig.filename,
        content: code,
      },
    ],
  };

  // We test the endpoints in order:
  // 1. https://api.onecompiler.com/v1/run with X-API-Key header
  // 2. https://api.onecompiler.com/v1/run?access_token=...
  // 3. https://onecompiler.com/api/v1/run?access_token=...
  const candidates = [
    {
      url: "https://api.onecompiler.com/v1/run",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
    },
    {
      url: `https://api.onecompiler.com/v1/run?access_token=${apiKey}`,
      headers: {
        "Content-Type": "application/json",
      },
    },
    {
      url: `https://onecompiler.com/api/v1/run?access_token=${apiKey}`,
      headers: {
        "Content-Type": "application/json",
      },
    },
  ];

  let lastError = "";

  for (const candidate of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const resp = await fetch(candidate.url, {
        method: "POST",
        headers: candidate.headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        return {
          status: data.status || "success",
          stdout: data.stdout || null,
          stderr: data.stderr || data.exception || null,
          executionTime: data.executionTime || 0,
          compilationTime: data.compilationTime || 0,
        };
      }

      if (resp.status === 429) {
        return {
          status: "failed",
          stdout: null,
          stderr: "OneCompiler Rate Limit reached. Please wait a moment and try again.",
          executionTime: 0,
        };
      }

      const errText = await resp.text();
      lastError = errText || `HTTP ${resp.status}`;
    } catch (e: any) {
      lastError = e?.message || "Connection timeout";
    }
  }

  return {
    status: "failed",
    stdout: null,
    stderr: `OneCompiler execution error: ${lastError}`,
    executionTime: 0,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, stdin } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { status: "failed", stderr: "No code provided to execute." },
        { status: 400 }
      );
    }

    // First, try proxying to the Python FastAPI backend if it is running
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://social-impact-hackathon.vercel.app";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const backendResp = await fetch(`${backendUrl}/api/compiler/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin: stdin || "" }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (backendResp.ok) {
        const backendData = await backendResp.json();
        return NextResponse.json(backendData);
      }
    } catch {
      // Backend not running or unreachable, seamlessly fall back to direct OneCompiler call from Next.js server route
    }

    // Fallback: Direct OneCompiler call safely on server side
    const result = await callOneCompilerDirect(language || "python", code, stdin || "");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "failed",
        stdout: null,
        stderr: err?.message || "Internal server error occurred.",
      },
      { status: 500 }
    );
  }
}
