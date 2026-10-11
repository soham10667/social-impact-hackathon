export interface AssessmentCategory {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  questionsCount: number;
  durationMinutes: number;
  startingDifficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
}

export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  {
    id: "cat-001",
    slug: "dsa",
    title: "Data Structures & Algorithms",
    category: "Algorithms",
    description: "Arrays, Hash Maps, Binary Trees, Dynamic Programming, and asymptotic time/space complexity.",
    questionsCount: 10,
    durationMinutes: 20,
    startingDifficulty: "Medium",
    topics: ["Binary Trees", "Dynamic Programming", "Hash Tables", "Sorting"]
  },
  {
    id: "cat-002",
    slug: "dbms",
    title: "Database Management & SQL",
    category: "Databases",
    description: "Relational Algebra, Complex JOINs, Subqueries, B-Tree Indexing, and ACID Transaction Isolation.",
    questionsCount: 10,
    durationMinutes: 15,
    startingDifficulty: "Medium",
    topics: ["B-Tree Indexes", "ACID Semantics", "JOIN Optimization", "Normalization"]
  },
  {
    id: "cat-003",
    slug: "os-networks",
    title: "Operating Systems & Networking",
    category: "Core Computer Science",
    description: "Processes vs. Threads, Virtual Memory Paging, TCP 3-Way Handshake, HTTP/3, and Socket Multiplexing.",
    questionsCount: 10,
    durationMinutes: 15,
    startingDifficulty: "Medium",
    topics: ["Process Scheduling", "Virtual Memory", "TCP/IP Protocol", "Socket I/O"]
  }
];
