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
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 80);
}

export const EXAM_QUESTION_BANK: ExamQuestion[] = [
  // ==========================================
  // 1. DATA STRUCTURES & ALGORITHMS (DSA)
  // ==========================================
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
    id: "dsa-e2",
    categorySlug: "dsa",
    topic: "Arrays & Pointers",
    difficulty: "Easy",
    type: "mcq",
    questionText: "Which operation on a dynamic array has a worst-case time complexity of O(N)?",
    normalizedFingerprint: normalizeQuestionText("Which operation on a dynamic array has a worst-case time complexity of O(N)?"),
    options: ["Accessing element by index", "Inserting at index 0", "Updating an existing index", "Reading array length"],
    correctAnswer: 1,
    explanation: "Inserting at index 0 requires shifting all subsequent N elements one position to the right."
  },
  {
    id: "dsa-e3",
    categorySlug: "dsa",
    topic: "Stacks & Queues",
    difficulty: "Easy",
    type: "mcq",
    questionText: "Which data structure operates on a First-In-First-Out (FIFO) discipline?",
    normalizedFingerprint: normalizeQuestionText("Which data structure operates on a First-In-First-Out (FIFO) discipline?"),
    options: ["Stack", "Queue", "Max Heap", "Binary Search Tree"],
    correctAnswer: 1,
    explanation: "A Queue operates strictly on a First-In-First-Out (FIFO) ordering."
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
  {
    id: "dsa-m3",
    categorySlug: "dsa",
    topic: "Sorting Algorithms",
    difficulty: "Medium",
    type: "mcq",
    questionText: "What is the worst-case time complexity of QuickSort when bad pivots are continuously selected?",
    normalizedFingerprint: normalizeQuestionText("What is the worst-case time complexity of QuickSort when bad pivots are continuously selected?"),
    options: ["O(N log N)", "O(N)", "O(N^2)", "O(2^N)"],
    correctAnswer: 2,
    explanation: "When partitions are unbalanced (e.g. sorted input with extreme pivot), QuickSort degrades to O(N^2)."
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
    id: "dsa-h2",
    categorySlug: "dsa",
    topic: "Trie & Prefix Trees",
    difficulty: "Hard",
    type: "mcq",
    questionText: "In an optimal Trie implementation storing N words of maximum length L, what is the time complexity to search a prefix of length K?",
    normalizedFingerprint: normalizeQuestionText("In an optimal Trie implementation storing N words of maximum length L, what is the time complexity to search a prefix of length K?"),
    options: ["O(K)", "O(N * K)", "O(L * log N)", "O(N * L)"],
    correctAnswer: 0,
    explanation: "Trie prefix lookup only traverses K pointer transitions corresponding to each character of the prefix, giving O(K) time independent of N."
  },
  {
    id: "dsa-h3",
    categorySlug: "dsa",
    topic: "Disjoint Set Union (DSU)",
    difficulty: "Hard",
    type: "mcq",
    questionText: "With both path compression and union by rank applied to a Disjoint Set Union (DSU) of N elements, what is the amortized time per operation?",
    normalizedFingerprint: normalizeQuestionText("With both path compression and union by rank applied to a Disjoint Set Union DSU of N elements what is the amortized time per operation"),
    options: ["O(log N)", "O(alpha(N)) — Inverse Ackermann", "O(N)", "O(1) strictly deterministic"],
    correctAnswer: 1,
    explanation: "Combining path compression and union by rank yields nearly constant O(alpha(N)) amortized time, where alpha is the inverse Ackermann function."
  },

  // ==========================================
  // 2. DATABASE MANAGEMENT & SQL (DBMS)
  // ==========================================
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
    id: "dbms-e2",
    categorySlug: "dbms",
    topic: "Relational Keys",
    difficulty: "Easy",
    type: "mcq",
    questionText: "What distinguishes a PRIMARY KEY constraint from a UNIQUE constraint in SQL?",
    normalizedFingerprint: normalizeQuestionText("What distinguishes a PRIMARY KEY constraint from a UNIQUE constraint in SQL?"),
    options: ["PRIMARY KEY allows one NULL value", "PRIMARY KEY strictly forbids NULL values", "UNIQUE automatically creates clustered indexes", "There is no difference"],
    correctAnswer: 1,
    explanation: "A PRIMARY KEY uniquely identifies a row and forbids NULL values, whereas UNIQUE columns may typically accept one or more NULLs."
  },
  {
    id: "dbms-e3",
    categorySlug: "dbms",
    topic: "Data Manipulation Language",
    difficulty: "Easy",
    type: "mcq",
    questionText: "Which statement permanently removes all records from a table without logging individual row deletions?",
    normalizedFingerprint: normalizeQuestionText("Which statement permanently removes all records from a table without logging individual row deletions?"),
    options: ["DELETE FROM table;", "DROP TABLE table;", "TRUNCATE TABLE table;", "REMOVE ALL FROM table;"],
    correctAnswer: 2,
    explanation: "TRUNCATE is a DDL operation that deallocates data pages rapidly without logging individual row deletions."
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
    id: "dbms-m2",
    categorySlug: "dbms",
    topic: "B-Tree Indexing",
    difficulty: "Medium",
    type: "mcq",
    questionText: "Why do relational databases prefer B+ Trees over standard Binary Search Trees for disk-backed indexing?",
    normalizedFingerprint: normalizeQuestionText("Why do relational databases prefer B+ Trees over standard Binary Search Trees for disk-backed indexing?"),
    options: ["B+ Trees store data exclusively in memory", "High branching factor reduces disk I/O seeks and leaves form a linked list for range scans", "B+ Trees have lower Big-O complexity than O(log N)", "Binary Search Trees cannot balance themselves"],
    correctAnswer: 1,
    explanation: "B+ trees have large node fanout matching disk block sizes to minimize seeks, and their linked leaves allow fast sequential range scanning."
  },
  {
    id: "dbms-m3",
    categorySlug: "dbms",
    topic: "Database Normalization",
    difficulty: "Medium",
    type: "mcq",
    questionText: "A relation is in Third Normal Form (3NF) if it is in 2NF and has no:",
    normalizedFingerprint: normalizeQuestionText("A relation is in Third Normal Form 3NF if it is in 2NF and has no"),
    options: ["Partial dependencies", "Transitive dependencies", "Multi-valued dependencies", "Composite keys"],
    correctAnswer: 1,
    explanation: "3NF eliminates transitive functional dependencies (non-prime attributes depending on other non-prime attributes)."
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
    explanation: "Serializable is the strictest level, preventing dirty reads, non-repeatable reads, and phantom reads via predicate/range locking."
  },
  {
    id: "dbms-h2",
    categorySlug: "dbms",
    topic: "Write-Ahead Logging (WAL)",
    difficulty: "Hard",
    type: "mcq",
    questionText: "Under Write-Ahead Logging (WAL) and the ARIES recovery algorithm, which principle ensures Durability before transaction commit returns?",
    normalizedFingerprint: normalizeQuestionText("Under Write-Ahead Logging WAL and the ARIES recovery algorithm which principle ensures Durability"),
    options: ["Dirty database table pages must be flushed to disk before committing", "The log records corresponding to the transaction must be flushed to non-volatile storage before the commit returns", "Checkpoints must occur synchronously with every commit", "Lock escalation must freeze the table buffer pool"],
    correctAnswer: 1,
    explanation: "WAL guarantees durability by ensuring log records describing the update are flushed to stable storage before the transaction commit acknowledge."
  },
  {
    id: "dbms-h3",
    categorySlug: "dbms",
    topic: "Concurrency & Deadlocks",
    difficulty: "Hard",
    type: "mcq",
    questionText: "In Multi-Version Concurrency Control (MVCC) engines like PostgreSQL, what happens when a transaction reads while another writes to the same row?",
    normalizedFingerprint: normalizeQuestionText("In Multi-Version Concurrency Control MVCC engines like PostgreSQL what happens when a transaction reads"),
    options: ["Readers block writers", "Writers block readers", "Readers never block writers and writers never block readers by reading row snapshots", "Deadlock detection terminates the reader"],
    correctAnswer: 2,
    explanation: "MVCC isolates readers from writers by providing readers an immutable snapshot of committed row versions using transaction IDs (xmin/xmax)."
  },

  // ==========================================
  // 3. OPERATING SYSTEMS & NETWORKS (OS-NETWORKS)
  // ==========================================
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
    explanation: "Threads within the same process share heap memory, open file descriptors, and code segments, but each thread has its own stack and registers."
  },
  {
    id: "os-e2",
    categorySlug: "os-networks",
    topic: "DNS & Application Layer",
    difficulty: "Easy",
    type: "mcq",
    questionText: "Which protocol translates human-readable domain names (e.g., example.com) into IP addresses?",
    normalizedFingerprint: normalizeQuestionText("Which protocol translates human-readable domain names into IP addresses?"),
    options: ["DHCP", "DNS", "ARP", "ICMP"],
    correctAnswer: 1,
    explanation: "Domain Name System (DNS) resolves hostnames to numeric IP addresses."
  },
  {
    id: "os-e3",
    categorySlug: "os-networks",
    topic: "CPU Scheduling",
    difficulty: "Easy",
    type: "mcq",
    questionText: "Which CPU scheduling algorithm gives each process a small fixed unit of CPU time (time quantum)?",
    normalizedFingerprint: normalizeQuestionText("Which CPU scheduling algorithm gives each process a small fixed unit of CPU time time quantum"),
    options: ["First-Come First-Served (FCFS)", "Round Robin (RR)", "Shortest Job First (SJF)", "Priority Scheduling"],
    correctAnswer: 1,
    explanation: "Round Robin allocates equal time slices (quanta) cyclically among runnable processes."
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
    explanation: "TCP establishes connection via SYN, SYN-ACK, ACK and guarantees packet ordering via sequence numbers and ACKs."
  },
  {
    id: "os-m2",
    categorySlug: "os-networks",
    topic: "Virtual Memory Paging",
    difficulty: "Medium",
    type: "mcq",
    questionText: "What is a 'Page Fault' in an Operating System virtual memory subsystem?",
    normalizedFingerprint: normalizeQuestionText("What is a Page Fault in an Operating System virtual memory subsystem"),
    options: ["A hardware memory stick hardware error", "An interrupt generated when an accessed page is not loaded into physical RAM", "A segmentation fault when writing to read-only code", "A kernel panic caused by buffer overflow"],
    correctAnswer: 1,
    explanation: "A page fault occurs when a program attempts to access a virtual memory address that is valid but not currently mapped to physical RAM."
  },
  {
    id: "os-m3",
    categorySlug: "os-networks",
    topic: "Deadlock Prevention",
    difficulty: "Medium",
    type: "mcq",
    questionText: "Which of the following is NOT one of Coffman's four necessary conditions for deadlock?",
    normalizedFingerprint: normalizeQuestionText("Which of the following is NOT one of Coffman's four necessary conditions for deadlock"),
    options: ["Mutual Exclusion", "Hold and Wait", "Preemption of resources", "Circular Wait"],
    correctAnswer: 2,
    explanation: "The four conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. 'Preemption' actually prevents deadlocks."
  },
  {
    id: "os-h1",
    categorySlug: "os-networks",
    topic: "Socket Multiplexing & I/O",
    difficulty: "Hard",
    type: "mcq",
    questionText: "Why does Linux epoll scale to thousands of concurrent connections much better than select() or poll()?",
    normalizedFingerprint: normalizeQuestionText("Why does Linux epoll scale to thousands of concurrent connections much better than select or poll"),
    options: ["epoll uses multithreaded polling loops inside user space", "epoll registers file descriptors in kernel space via an rbtree and returns only active events via a ready list in O(1)", "epoll bypasses the TCP stack directly into network drivers", "epoll disables socket blocking on hardware interrupt level"],
    correctAnswer: 1,
    explanation: "epoll avoids O(N) scanning of all descriptors by registering fds once in kernel memory (red-black tree) and using callbacks to populate a ready list."
  },
  {
    id: "os-h2",
    categorySlug: "os-networks",
    topic: "HTTP/3 & QUIC Protocol",
    difficulty: "Hard",
    type: "mcq",
    questionText: "How does HTTP/3 with QUIC eliminate Head-of-Line (HoL) blocking experienced by HTTP/2?",
    normalizedFingerprint: normalizeQuestionText("How does HTTP/3 with QUIC eliminate Head-of-Line HoL blocking experienced by HTTP/2"),
    options: ["By creating multiple TCP connections in parallel", "By running over UDP and implementing stream multiplexing where packet loss on one stream does not pause other streams", "By compressing HTTP headers with HPACK instead of QPACK", "By utilizing raw IP packets directly without transport layer"],
    correctAnswer: 1,
    explanation: "HTTP/2 used a single TCP connection, so any dropped packet halted all streams. QUIC runs over UDP with independent per-stream retransmission."
  },
  {
    id: "os-h3",
    categorySlug: "os-networks",
    topic: "Synchronization Primitives",
    difficulty: "Hard",
    type: "mcq",
    questionText: "What distinguishes a Spinlock from a standard Mutex in kernel space programming?",
    normalizedFingerprint: normalizeQuestionText("What distinguishes a Spinlock from a standard Mutex in kernel space programming"),
    options: ["A Spinlock puts the thread to sleep in a wait queue", "A Spinlock polls the lock continuously in a busy loop without context-switching, ideal for short critical sections", "Spinlocks can only be used in user space applications", "Mutexes cannot be shared across multiple threads"],
    correctAnswer: 1,
    explanation: "Spinlocks repeatedly poll an atomic test-and-set condition, avoiding the high overhead of putting a thread to sleep and context switching."
  }
];

// Supported assessment categories
export const VALID_ASSESSMENT_CATEGORIES = ["dsa", "dbms", "os-networks"] as const;
export type AssessmentCategorySlug = typeof VALID_ASSESSMENT_CATEGORIES[number];

/**
 * Safely normalizes categorySlug into a valid category string.
 * Handles string, string[], object, null, or undefined.
 */
export function normalizeCategorySlug(input: unknown): AssessmentCategorySlug {
  if (typeof input === "string") {
    const cleaned = input.trim().toLowerCase();
    if (VALID_ASSESSMENT_CATEGORIES.includes(cleaned as AssessmentCategorySlug)) {
      return cleaned as AssessmentCategorySlug;
    }
  } else if (Array.isArray(input) && input.length > 0 && typeof input[0] === "string") {
    const cleaned = input[0].trim().toLowerCase();
    if (VALID_ASSESSMENT_CATEGORIES.includes(cleaned as AssessmentCategorySlug)) {
      return cleaned as AssessmentCategorySlug;
    }
  } else if (input && typeof input === "object") {
    const maybeSlug = (input as any).slug || (input as any).categorySlug;
    if (typeof maybeSlug === "string") {
      const cleaned = maybeSlug.trim().toLowerCase();
      if (VALID_ASSESSMENT_CATEGORIES.includes(cleaned as AssessmentCategorySlug)) {
        return cleaned as AssessmentCategorySlug;
      }
    }
  }

  // Default fallback if category not matched
  return "dsa";
}

export function getInitialQuestion(
  categorySlug: unknown,
  difficulty: "Easy" | "Medium" | "Hard" = "Medium"
): ExamQuestion {
  const safeSlug = normalizeCategorySlug(categorySlug);
  const filtered = EXAM_QUESTION_BANK.filter(
    (q) => q.categorySlug === safeSlug && q.difficulty === difficulty
  );
  if (filtered.length > 0) return filtered[0];

  const categoryQuestions = EXAM_QUESTION_BANK.filter((q) => q.categorySlug === safeSlug);
  if (categoryQuestions.length > 0) return categoryQuestions[0];

  return EXAM_QUESTION_BANK[0];
}

export interface AdaptiveQuestionParams {
  categorySlug: unknown;
  targetDifficulty?: "Easy" | "Medium" | "Hard";
  currentDifficulty?: "Easy" | "Medium" | "Hard";
  lastAnswerCorrect?: boolean;
  attemptedIds?: string[];
  attemptedFingerprints?: string[];
}

/**
 * Evaluates answer and returns next adaptive difficulty
 * Rules:
 * - Medium is starting level
 * - Correct answer => Easy -> Medium, Medium -> Hard, Hard -> Hard
 * - Incorrect answer => Hard -> Medium, Medium -> Easy, Easy -> Easy
 */
export function calculateNextDifficulty(
  currentDifficulty: "Easy" | "Medium" | "Hard",
  isCorrect: boolean
): "Easy" | "Medium" | "Hard" {
  if (isCorrect) {
    if (currentDifficulty === "Easy") return "Medium";
    if (currentDifficulty === "Medium") return "Hard";
    return "Hard";
  } else {
    if (currentDifficulty === "Hard") return "Medium";
    if (currentDifficulty === "Medium") return "Easy";
    return "Easy";
  }
}

export function getNextAdaptiveQuestion(
  paramsOrSlug: unknown,
  currentDifficulty?: "Easy" | "Medium" | "Hard",
  lastAnswerCorrect?: boolean,
  attemptedIds?: string[],
  attemptedFingerprints?: string[]
): ExamQuestion {
  let safeSlug: AssessmentCategorySlug;
  let targetDiff: "Easy" | "Medium" | "Hard" = "Medium";
  let attIds: string[] = [];
  let attFingerprints: string[] = [];

  // Check if called with an options object
  if (
    paramsOrSlug &&
    typeof paramsOrSlug === "object" &&
    !Array.isArray(paramsOrSlug) &&
    ("categorySlug" in paramsOrSlug || "targetDifficulty" in paramsOrSlug || "attemptedIds" in paramsOrSlug)
  ) {
    const p = paramsOrSlug as AdaptiveQuestionParams;
    safeSlug = normalizeCategorySlug(p.categorySlug);
    targetDiff = p.targetDifficulty || p.currentDifficulty || "Medium";
    attIds = Array.isArray(p.attemptedIds) ? p.attemptedIds : [];
    attFingerprints = Array.isArray(p.attemptedFingerprints) ? p.attemptedFingerprints : [];
  } else {
    // Positional arguments call
    safeSlug = normalizeCategorySlug(paramsOrSlug);
    targetDiff = currentDifficulty || "Medium";
    if (lastAnswerCorrect !== undefined) {
      targetDiff = calculateNextDifficulty(targetDiff, lastAnswerCorrect);
    }
    attIds = Array.isArray(attemptedIds) ? attemptedIds : [];
    attFingerprints = Array.isArray(attemptedFingerprints) ? attemptedFingerprints : [];
  }

  // 1. Strict anti-duplicate filtering at target adaptive difficulty
  let candidates = EXAM_QUESTION_BANK.filter(
    (q) =>
      q.categorySlug === safeSlug &&
      q.difficulty === targetDiff &&
      !attIds.includes(q.id) &&
      !attFingerprints.includes(q.normalizedFingerprint)
  );

  // 2. Fallback: Any unattempted question in the category
  if (candidates.length === 0) {
    candidates = EXAM_QUESTION_BANK.filter(
      (q) =>
        q.categorySlug === safeSlug &&
        !attIds.includes(q.id) &&
        !attFingerprints.includes(q.normalizedFingerprint)
    );
  }

  // 3. Dynamic procedural fallback if static bank fully exhausted
  if (candidates.length === 0) {
    const dynamicId = `${safeSlug}-gen-${Date.now()}`;
    const uppercaseCat = safeSlug.toUpperCase();
    const dynamicQuestionText = `In ${uppercaseCat} engineering at ${targetDiff} depth, what is the optimal architectural technique to scale data throughput without degrading latency?`;
    const dynamicQuestion: ExamQuestion = {
      id: dynamicId,
      categorySlug: safeSlug,
      topic: "System Architecture & Optimization",
      difficulty: targetDiff,
      type: "mcq",
      questionText: dynamicQuestionText,
      normalizedFingerprint: normalizeQuestionText(dynamicQuestionText),
      options: [
        "Implement non-blocking event loops, zero-copy buffers, and connection pooling",
        "Increase garbage collection frequency across worker nodes",
        "Disable index constraints and execute synchronous table scans",
        "Rely on client-side polling with single-threaded blocking sockets"
      ],
      correctAnswer: 0,
      explanation: "Non-blocking event loops with zero-copy buffers and pooled connections maximize I/O concurrency without thread context-switching overhead."
    };
    return dynamicQuestion;
  }

  // Select first available unattempted question
  return candidates[0];
}
