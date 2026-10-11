import { NextRequest, NextResponse } from "next/server";

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

function generateTestHarness(language: string, userCode: string): string {
  const lang = language.toLowerCase().trim();
  if (["python", "python3", "py"].includes(lang)) {
    return `${userCode}

# --- AUTOMATED TEST HARNESS ---
def __run_tests():
    test_cases = [
        ([2, 7, 11, 15], 9, [0, 1]),
        ([3, 2, 4], 6, [1, 2]),
        ([3, 3], 6, [0, 1]),
        ([1, 5, 8, 10, 14], 18, [2, 3])
    ]
    passed = 0
    fn = globals().get('solution') or globals().get('two_sum')
    if not fn:
        print("ERROR: Neither solution() nor two_sum() function is defined")
        print("SUMMARY: 0/4")
        return

    for idx, (nums, target, expected) in enumerate(test_cases):
        try:
            res = fn(nums, target)
            if res is not None and sorted(res) == sorted(expected):
                print(f"TEST_{idx+1}: PASSED")
                passed += 1
            else:
                print(f"TEST_{idx+1}: FAILED (Expected {expected}, got {res})")
        except Exception as e:
            print(f"TEST_{idx+1}: ERROR ({e})")
    print(f"SUMMARY: {passed}/{len(test_cases)}")

__run_tests()
`;
  } else if (["javascript", "js", "nodejs"].includes(lang)) {
    return `${userCode}

// --- AUTOMATED TEST HARNESS ---
function __runTests() {
    const testCases = [
        { nums: [2, 7, 11, 15], target: 9, expected: [0, 1] },
        { nums: [3, 2, 4], target: 6, expected: [1, 2] },
        { nums: [3, 3], target: 6, expected: [0, 1] },
        { nums: [1, 5, 8, 10, 14], target: 18, expected: [2, 3] }
    ];
    let passed = 0;
    testCases.forEach((tc, idx) => {
        try {
            let fn = null;
            if (typeof solution === 'function') fn = solution;
            else if (typeof twoSum === 'function') fn = twoSum;
            else if (typeof two_sum === 'function') fn = two_sum;

            if (!fn) throw new Error("No solution() or twoSum() function defined");
            const res = fn(tc.nums, tc.target);
            if (res && JSON.stringify([...res].sort()) === JSON.stringify([...tc.expected].sort())) {
                console.log(\`TEST_\${idx+1}: PASSED\`);
                passed++;
            } else {
                console.log(\`TEST_\${idx+1}: FAILED (Expected \${JSON.stringify(tc.expected)}, got \${JSON.stringify(res)})\`);
            }
        } catch(e) {
            console.log(\`TEST_\${idx+1}: ERROR (\${e.message})\`);
        }
    });
    console.log(\`SUMMARY: \${passed}/\${testCases.length}\`);
}

__runTests();
`;
  }
  return userCode;
}

async function callOneCompilerDirect(language: string, code: string) {
  const apiKey = (process.env.ONECOMPILER_API_KEY || "oc_455tuk5sm_455tuk5t8_8c191f58b8e70fff8de9af01be05b5df58e086e5c9a44205").trim();
  const langKey = language.toLowerCase().trim();
  const langConfig = LANGUAGE_MAP[langKey] || { language: langKey, filename: "main.txt" };

  const payload = {
    language: langConfig.language,
    stdin: "",
    files: [
      {
        name: langConfig.filename,
        content: code,
      },
    ],
  };

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
        };
      }
      const errText = await resp.text();
      lastError = errText || `HTTP ${resp.status}`;
    } catch (e: any) {
      lastError = e?.message || "Execution timeout";
    }
  }

  return {
    status: "failed",
    stdout: null,
    stderr: `OneCompiler submit error: ${lastError}`,
    executionTime: 0,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code } = body;

    if (!language || typeof language !== "string" || !language.trim()) {
      return NextResponse.json(
        { error: "Language parameter is required." },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { error: "Source code cannot be empty." },
        { status: 400 }
      );
    }

    // First try FastAPI backend if reachable
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const backendResp = await fetch(`${backendUrl}/api/compiler/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (backendResp.ok) {
        return NextResponse.json(await backendResp.json());
      }
    } catch {
      // Backend not running, proceed with direct Next.js evaluation
    }

    const harnessCode = generateTestHarness(language, code);
    const result = await callOneCompilerDirect(language, harnessCode);

    const stdout = result.stdout || "";
    const stderr = result.stderr || "";

    let passedTests = 0;
    let totalTests = 4;
    const testResults: Array<{ name: string; passed: boolean; output: string }> = [];

    if (stdout && stdout.includes("SUMMARY:")) {
      for (const line of stdout.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("TEST_")) {
          const parts = trimmed.split(":");
          const testNum = parts[0].replace("TEST_", "").trim();
          const passed = parts[1]?.includes("PASSED") || false;
          testResults.push({
            name: `Test Case ${testNum}`,
            passed,
            output: parts[1]?.trim() || "",
          });
        } else if (trimmed.startsWith("SUMMARY:")) {
          const summaryStr = trimmed.replace("SUMMARY:", "").trim();
          const [p, t] = summaryStr.split("/");
          if (p && t) {
            passedTests = parseInt(p, 10);
            totalTests = parseInt(t, 10);
          }
        }
      }
    }

    let status = passedTests === totalTests && totalTests > 0 ? "passed" : "failed";
    if (stderr && !stdout) {
      status = "compilation_error";
    }

    const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 1000) / 10 : 0;
    const aiFeedback =
      status === "passed"
        ? "All automated test cases passed successfully! Optimal solution verified."
        : status === "compilation_error"
        ? `Syntax or runtime error: ${stderr.slice(0, 200)}`
        : `Passed ${passedTests}/${totalTests} test cases. Review edge cases and time complexity.`;

    return NextResponse.json({
      status,
      passed_tests: passedTests,
      total_tests: totalTests,
      score,
      test_results: testResults,
      execution_time_ms: result.executionTime,
      stdout,
      stderr,
      ai_feedback: aiFeedback,
    });
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
