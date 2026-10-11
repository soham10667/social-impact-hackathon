from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import httpx
from app.core.config import settings

router = APIRouter()

class CodeExecutionRequest(BaseModel):
    language: str
    code: str
    stdin: Optional[str] = ""

class CodeSubmitRequest(BaseModel):
    user_id: Optional[str] = "demo-user"
    problem_slug: str = "two-sum"
    language: str = "python"
    code: str

# Standard language mapping for OneCompiler
LANGUAGE_MAP: Dict[str, Dict[str, str]] = {
    "python": {"language": "python", "filename": "main.py"},
    "python3": {"language": "python", "filename": "main.py"},
    "py": {"language": "python", "filename": "main.py"},
    "javascript": {"language": "javascript", "filename": "index.js"},
    "js": {"language": "javascript", "filename": "index.js"},
    "nodejs": {"language": "javascript", "filename": "index.js"},
    "java": {"language": "java", "filename": "Main.java"},
    "cpp": {"language": "cpp", "filename": "main.cpp"},
    "c++": {"language": "cpp", "filename": "main.cpp"},
    "c": {"language": "c", "filename": "main.c"},
}

async def call_onecompiler(language: str, code: str, stdin: str = "") -> Dict[str, Any]:
    """
    Robust caller supporting OneCompiler API:
    1. Tries https://api.onecompiler.com/v1/run with X-API-Key and query token fallback
    2. Tries https://onecompiler.com/api/v1/run if sub-domain varies by account type
    3. Handles timeouts, limits, and server issues gracefully.
    """
    lang_key = language.lower().strip()
    lang_info = LANGUAGE_MAP.get(lang_key, {"language": lang_key, "filename": "main.txt"})

    onecompiler_body = {
        "language": lang_info["language"],
        "stdin": stdin or "",
        "files": [
            {
                "name": lang_info["filename"],
                "content": code
            }
        ]
    }

    api_key = (settings.ONECOMPILER_API_KEY or "").strip()
    if not api_key or api_key == "your_onecompiler_api_key":
        return {
            "status": "config_required",
            "stdout": None,
            "stderr": "ONECOMPILER_API_KEY is missing or invalid in backend .env. Please verify your OneCompiler API key.",
            "executionTime": 0,
            "compilationTime": 0
        }

    # Endpoint candidates
    endpoints = [
        # 1. Primary endpoint with X-API-Key header
        {"url": "https://api.onecompiler.com/v1/run", "headers": {"Content-Type": "application/json", "X-API-Key": api_key}, "params": None},
        # 2. Primary endpoint with access_token query parameter
        {"url": "https://api.onecompiler.com/v1/run", "headers": {"Content-Type": "application/json"}, "params": {"access_token": api_key}},
        # 3. Main domain endpoint with access_token
        {"url": "https://onecompiler.com/api/v1/run", "headers": {"Content-Type": "application/json"}, "params": {"access_token": api_key}},
    ]

    last_error = ""

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        for ep in endpoints:
            try:
                response = await client.post(
                    ep["url"],
                    json=onecompiler_body,
                    headers=ep["headers"],
                    params=ep["params"]
                )

                if response.status_code == 200:
                    data = response.json()
                    return {
                        "status": data.get("status", "success"),
                        "stdout": data.get("stdout"),
                        "stderr": data.get("stderr") or data.get("exception"),
                        "exception": data.get("exception"),
                        "executionTime": data.get("executionTime", 0),
                        "compilationTime": data.get("compilationTime", 0),
                        "limitRemaining": data.get("limitRemaining")
                    }

                if response.status_code == 429:
                    return {
                        "status": "failed",
                        "stdout": None,
                        "stderr": "OneCompiler Rate Limit: Free API quota or rate limit exceeded. Please try again in a few moments.",
                        "executionTime": 0
                    }

                # If 401/403, save error and try next endpoint candidate
                last_error = response.text or f"HTTP {response.status_code}"

            except httpx.TimeoutException:
                last_error = "Execution Timeout: Exceeded 20-second execution threshold."
            except Exception as e:
                last_error = str(e)

    # If all remote endpoints failed or network error
    return {
        "status": "failed",
        "stdout": None,
        "stderr": f"OneCompiler execution failed: {last_error}",
        "executionTime": 0
    }

@router.post("/execute")
async def execute_code(payload: CodeExecutionRequest):
    """
    Executes source code securely via OneCompiler API without exposing API key to frontend.
    Supports Python, JavaScript, Java, and C++.
    """
    return await call_onecompiler(payload.language, payload.code, payload.stdin or "")

# Two Sum problem evaluation harness generator
def generate_test_harness(language: str, user_code: str) -> str:
    lang = language.lower().strip()
    if lang in ["python", "python3", "py"]:
        return f"""{user_code}

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
                print(f"TEST_{{idx+1}}: PASSED")
                passed += 1
            else:
                print(f"TEST_{{idx+1}}: FAILED (Expected {{expected}}, got {{res}})")
        except Exception as e:
            print(f"TEST_{{idx+1}}: ERROR ({{e}})")
    print(f"SUMMARY: {{passed}}/{{len(test_cases)}}")

__run_tests()
"""
    elif lang in ["javascript", "js", "nodejs"]:
        return f"""{user_code}

// --- AUTOMATED TEST HARNESS ---
function __runTests() {{
    const testCases = [
        {{ nums: [2, 7, 11, 15], target: 9, expected: [0, 1] }},
        {{ nums: [3, 2, 4], target: 6, expected: [1, 2] }},
        {{ nums: [3, 3], target: 6, expected: [0, 1] }},
        {{ nums: [1, 5, 8, 10, 14], target: 18, expected: [2, 3] }}
    ];
    let passed = 0;
    testCases.forEach((tc, idx) => {{
        try {{
            const fn = typeof twoSum === 'function' ? twoSum : two_sum;
            const res = fn(tc.nums, tc.target);
            if (JSON.stringify(res.sort()) === JSON.stringify(tc.expected.sort())) {{
                console.log(`TEST_${{idx+1}}: PASSED`);
                passed++;
            }} else {{
                console.log(`TEST_${{idx+1}}: FAILED (Expected ${{JSON.stringify(tc.expected)}}, got ${{JSON.stringify(res)}})`);
            }}
        }} catch(e) {{
            console.log(`TEST_${{idx+1}}: ERROR (${{e.message}})`);
        }}
    }});
    console.log(`SUMMARY: ${{passed}}/${{testCases.length}}`);
}}

__runTests();
"""
    elif lang in ["java"]:
        if "public static int[] twoSum" in user_code and "public static void main" not in user_code:
            return f"""import java.util.*;

public class Main {{
{user_code}

    public static void main(String[] args) {{
        int[][] testNums = {{ {{2,7,11,15}}, {{3,2,4}}, {{3,3}}, {{1,5,8,10,14}} }};
        int[] targets = {{ 9, 6, 6, 18 }};
        int[][] expected = {{ {{0,1}}, {{1,2}}, {{0,1}}, {{2,3}} }};
        int passed = 0;

        for (int i = 0; i < testNums.length; i++) {{
            try {{
                int[] res = twoSum(testNums[i], targets[i]);
                Arrays.sort(res);
                Arrays.sort(expected[i]);
                if (Arrays.equals(res, expected[i])) {{
                    System.out.println("TEST_" + (i+1) + ": PASSED");
                    passed++;
                }} else {{
                    System.out.println("TEST_" + (i+1) + ": FAILED");
                }}
            }} catch(Exception e) {{
                System.out.println("TEST_" + (i+1) + ": ERROR (" + e.getMessage() + ")");
            }}
        }}
        System.out.println("SUMMARY: " + passed + "/" + testNums.length);
    }}
}}
"""
        return user_code
    elif lang in ["cpp", "c++"]:
        if "vector<int> twoSum" in user_code and "int main(" not in user_code:
            return f"""#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>
using namespace std;

{user_code}

int main() {{
    vector<vector<int>> testNums = {{ {{2,7,11,15}}, {{3,2,4}}, {{3,3}}, {{1,5,8,10,14}} }};
    vector<int> targets = {{ 9, 6, 6, 18 }};
    vector<vector<int>> expected = {{ {{0,1}}, {{1,2}}, {{0,1}}, {{2,3}} }};
    int passed = 0;

    for (size_t i = 0; i < testNums.size(); i++) {{
        try {{
            vector<int> res = twoSum(testNums[i], targets[i]);
            sort(res.begin(), res.end());
            sort(expected[i].begin(), expected[i].end());
            if (res == expected[i]) {{
                cout << "TEST_" << (i+1) << ": PASSED" << endl;
                passed++;
            }} else {{
                cout << "TEST_" << (i+1) << ": FAILED" << endl;
            }}
        }} catch(...) {{
            cout << "TEST_" << (i+1) << ": ERROR" << endl;
        }}
    }}
    cout << "SUMMARY: " << passed << "/" << testNums.size() << endl;
    return 0;
}}
"""
        return user_code

    return user_code

@router.post("/submit")
async def submit_challenge(payload: CodeSubmitRequest):
    """
    Evaluates coding challenge against real test cases using OneCompiler,
    protects hidden test cases on backend, and returns evaluation score.
    """
    harness_code = generate_test_harness(payload.language, payload.code)
    result = await call_onecompiler(payload.language, harness_code)

    stdout = result.get("stdout") or ""
    stderr = result.get("stderr") or ""

    passed_tests = 0
    total_tests = 4
    test_results: List[Dict[str, Any]] = []

    if stdout and "SUMMARY:" in stdout:
        for line in stdout.splitlines():
            line = line.strip()
            if line.startswith("TEST_"):
                parts = line.split(":")
                t_name = parts[0].strip()
                t_passed = "PASSED" in parts[1]
                test_results.append({
                    "name": f"Test Case {t_name.replace('TEST_', '')}",
                    "passed": t_passed,
                    "output": parts[1].strip()
                })
            elif line.startswith("SUMMARY:"):
                summary_part = line.replace("SUMMARY:", "").strip()
                try:
                    p, t = summary_part.split("/")
                    passed_tests = int(p)
                    total_tests = int(t)
                except Exception:
                    pass

    status = "passed" if (passed_tests == total_tests and total_tests > 0) else "failed"
    if stderr and not stdout:
        status = "compilation_error"

    score = round((passed_tests / total_tests) * 100.0, 1) if total_tests > 0 else 0.0

    ai_feedback = "All automated test cases passed successfully! Optimal solution verified." if status == "passed" else (
        f"Syntax or runtime error: {stderr[:200]}" if status == "compilation_error" else
        f"Passed {passed_tests}/{total_tests} test cases. Review edge cases and time complexity."
    )

    return {
        "status": status,
        "passed_tests": passed_tests,
        "total_tests": total_tests,
        "score": score,
        "test_results": test_results,
        "execution_time_ms": result.get("executionTime", 0),
        "stdout": stdout,
        "stderr": stderr,
        "ai_feedback": ai_feedback
    }
