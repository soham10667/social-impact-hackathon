export interface ExamQuestion {
  id: string;
  categorySlug: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "mcq" | "short_answer" | "code_output" | "sql";
  questionText: string;
  normalizedFingerprint: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}

// Normalize text for duplicate & semantic similarity detection
export function normalizeQuestionText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 80);
}

export const EXAM_QUESTION_BANK: ExamQuestion[] = [
  // DSA Questions
  {
    id: "dsa-e1",
    categorySlug: "dsa",
    topic: "Hash Maps & Time Complexity",
    difficulty: "Easy",
    type: "mcq",
    questionText: "What is the average time complexity for lookup operations in a standard Hash Table?",
    normalizedFingerprint: normalizeQuestionText("What is the average time complexity for lookup operations in a standard Hash Table?"),
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    correctAnswer: 0,
    explanation: "Hash maps provide O(1) constant average lookup time using array indexing via hash functions."
  },
  {
    id: "dsa-m1",
    categorySlug: "dsa",
    topic: "Binary Search Trees",
    difficulty: "Medium",
    type: "mcq",
    questionText: "Which traversal of a Binary Search Tree (BST) produces sorted node values in ascending order?",
    normalizedFingerprint: normalizeQuestionText("Which traversal of a Binary Search Tree (BST) produces sorted node values in ascending order?"),
    options: ["Pre-order", "In-order", "Post-order", "Level-order"],
    correctAnswer: 1,
    explanation: "In-order traversal visits left subtree, root node, then right subtree, producing strictly ascending order in a BST."
  },
  {
    id: "dsa-h1",
    categorySlug: "dsa",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    type: "code_output",
    questionText: "What will be the output of memoized Fibonacci function fib(6)?",
    normalizedFingerprint: normalizeQuestionText("What will be the output of memoized Fibonacci function fib(6)?"),
    codeSnippet: "memo = {0:0, 1:1}\ndef fib(n):\n    if n not in memo:\n        memo[n] = fib(n-1) + fib(n-2)\n    return memo[n]\nprint(fib(6))",
    options: ["5", "8", "13", "21"],
    correctAnswer: 1,
    explanation: "fib(6) evaluates to 8 (sequence: 0, 1, 1, 2, 3, 5, 8)."
  },
  {
    id: "dsa-m2",
    categorySlug: "dsa",
    topic: "Graph Traversal",
    difficulty: "Medium",
    type: "mcq",
    questionText: "Which algorithm uses a Queue data structure to find the shortest path in an unweighted graph?",
    normalizedFingerprint: normalizeQuestionText("Which algorithm uses a Queue data structure to find the shortest path in an unweighted graph?"),
    options: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Dijkstra's Algorithm", "Bellman-Ford"],
    correctAnswer: 0,
    explanation: "BFS explores graph nodes layer by layer using a FIFO Queue, guaranteeing shortest path in unweighted graphs."
  },

  // DBMS Questions
  {
    id: "dbms-e1",
    categorySlug: "dbms",
    topic: "SQL Fundamentals",
    difficulty: "Easy",
    type: "mcq",
    questionText: "Which SQL clause is used to filter records aggregated by a GROUP BY statement?",
    normalizedFingerprint: normalizeQuestionText("Which SQL clause is used to filter records aggregated by a GROUP BY statement?"),
    options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
    correctAnswer: 1,
    explanation: "HAVING filters aggregate function groups, whereas WHERE filters individual rows before grouping."
  },
  {
    id: "dbms-m1",
    categorySlug: "dbms",
    topic: "SQL JOINs",
    difficulty: "Medium",
    type: "sql",
    questionText: "Which SQL JOIN returns all rows from the left table and matched rows from the right table?",
    normalizedFingerprint: normalizeQuestionText("Which SQL JOIN returns all rows from the left table and matched rows from the right table?"),
    options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
    correctAnswer: 1,
    explanation: "LEFT JOIN preserves all rows from the left table, inserting NULLs if no right-side match exists."
  },
  {
    id: "dbms-h1",
    categorySlug: "dbms",
    topic: "ACID Isolation Levels",
    difficulty: "Hard",
    type: "mcq",
    questionText: "Which transaction isolation level prevents Phantom Reads in relational databases?",
    normalizedFingerprint: normalizeQuestionText("Which transaction isolation level prevents Phantom Reads in relational databases?"),
    options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
    correctAnswer: 3,
    explanation: "Serializable is the strictest level, preventing dirty reads, non-repeatable reads, and phantom reads via locking."
  },

  // OS Questions
  {
    id: "os-e1",
    categorySlug: "os-networks",
    topic: "Processes & Threads",
    difficulty: "Easy",
    type: "mcq",
    questionText: "What do multiple threads within the same process share?",
    normalizedFingerprint: normalizeQuestionText("What do multiple threads within the same process share?"),
    options: ["Stack Memory", "Register States", "Heap Memory & Global Variables", "Thread IDs"],
    correctAnswer: 2,
    explanation: "Threads within the same process share heap memory, open file descriptors, and code segments."
  },
  {
    id: "os-m1",
    categorySlug: "os-networks",
    topic: "Networking Protocols",
    difficulty: "Medium",
    type: "mcq",
    questionText: "Which transport protocol guarantees ordered, reliable packet delivery with three-way handshake?",
    normalizedFingerprint: normalizeQuestionText("Which transport protocol guarantees ordered, reliable packet delivery with three-way handshake?"),
    options: ["UDP", "TCP", "ICMP", "DNS"],
    correctAnswer: 1,
    explanation: "TCP establishes connection via SYN, SYN-ACK, ACK and guarantees packet ordering via sequence numbers."
  }
];

export function getInitialQuestion(categorySlug: string, difficulty: "Easy" | "Medium" | "Hard"): ExamQuestion {
  const filtered = EXAM_QUESTION_BANK.filter(
    (q) => q.categorySlug === categorySlug && q.difficulty === difficulty
  );
  if (filtered.length > 0) return filtered[0];

  const categoryQuestions = EXAM_QUESTION_BANK.filter((q) => q.categorySlug === categorySlug);
  if (categoryQuestions.length > 0) return categoryQuestions[0];

  return EXAM_QUESTION_BANK[0];
}

export function getNextAdaptiveQuestion(
  categorySlug: string,
  currentDifficulty: "Easy" | "Medium" | "Hard",
  lastAnswerCorrect: boolean,
  attemptedIds: string[],
  attemptedFingerprints: string[]
): { nextQuestion: ExamQuestion; newDifficulty: "Easy" | "Medium" | "Hard" } {
  let newDifficulty = currentDifficulty;

  if (lastAnswerCorrect) {
    if (currentDifficulty === "Easy") newDifficulty = "Medium";
    else if (currentDifficulty === "Medium") newDifficulty = "Hard";
  } else {
    if (currentDifficulty === "Hard") newDifficulty = "Medium";
    else if (currentDifficulty === "Medium") newDifficulty = "Easy";
  }

  // Strict anti-duplicate filtering: Exclude both attempted IDs AND normalized text fingerprints
  let candidates = EXAM_QUESTION_BANK.filter(
    (q) =>
      q.categorySlug === categorySlug &&
      q.difficulty === newDifficulty &&
      !attemptedIds.includes(q.id) &&
      !attemptedFingerprints.includes(q.normalizedFingerprint)
  );

  // Fallback 1: Any unattempted question in category
  if (candidates.length === 0) {
    candidates = EXAM_QUESTION_BANK.filter(
      (q) =>
        q.categorySlug === categorySlug &&
        !attemptedIds.includes(q.id) &&
        !attemptedFingerprints.includes(q.normalizedFingerprint)
    );
  }

  // Fallback 2: Generate dynamic procedural question if static bank exhausted
  if (candidates.length === 0) {
    const dynamicId = `${categorySlug}-gen-${Date.now()}`;
    const dynamicQuestion: ExamQuestion = {
      id: dynamicId,
      categorySlug,
      topic: "Advanced Application",
      difficulty: newDifficulty,
      type: "mcq",
      questionText: `In ${categorySlug.toUpperCase()} system engineering (${newDifficulty}), how do you optimize memory throughput under peak load?`,
      normalizedFingerprint: normalizeQuestionText(`In ${categorySlug.toUpperCase()} system engineering (${newDifficulty}), how do you optimize memory throughput under peak load?`),
      options: ["Use Object Pooling & Zero-Copy Buffers", "Increase Garbage Collection frequency", "Disable index constraints", "Use synchronous blocking I/O"],
      correctAnswer: 0,
      explanation: "Object pooling and zero-copy buffers reduce heap allocation churn and avoid GC pauses."
    };
    return { nextQuestion: dynamicQuestion, newDifficulty };
  }

  return { nextQuestion: candidates[0], newDifficulty };
}
