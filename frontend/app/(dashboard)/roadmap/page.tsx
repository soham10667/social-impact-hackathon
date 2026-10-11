"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { BACKEND_URL } from "@/lib/api";
import { 
  Map, 
  GitFork, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Play, 
  ArrowRight
} from "lucide-react";
import { 
  ReactFlow, 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges, 
  Node, 
  Edge,
  Handle,
  Position
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom Skill Graph Node Component
const CustomSkillNode = ({ data }: { data: any }) => {
  const statusStyles: any = {
    mastered: "bg-[#F0FDF4] border-[#86EFAC] text-[#166534] shadow-xs",
    in_progress: "bg-white border-[#86EFAC] text-[#15803D] shadow-xs",
    needs_improvement: "bg-[#FFFBEB] border-[#FDE68A] text-[#B45309] shadow-xs",
    not_started: "bg-white border-[#E5E7EB] text-[#6B7280]"
  };

  return (
    <div className={`p-4 rounded-2xl border-2 shadow-soft-card min-w-[200px] transition-all hover:scale-105 ${statusStyles[data.status]}`}>
      <Handle type="target" position={Position.Top} className="!bg-[#22C55E] !w-3 !h-3" />
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="font-bold text-[#1F2937] text-sm">{data.label}</span>
        <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-white border border-[#D1FAE5] text-[#16A34A]">
          {data.score}%
        </span>
      </div>
      <div className="text-[11px] font-semibold capitalize tracking-wider flex items-center gap-1.5 mt-2">
        {data.status === 'mastered' && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
        {data.status === 'in_progress' && <Clock className="w-3.5 h-3.5 text-[#22C55E]" />}
        {data.status === 'needs_improvement' && <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />}
        <span>{data.status.replace("_", " ")}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[#22C55E] !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = { skillNode: CustomSkillNode };

export default function RoadmapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { recordActivity } = useAuth();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"roadmap" | "graph">(
    tabParam === "graph" ? "graph" : "roadmap"
  );

  useEffect(() => {
    if (tabParam === "graph") {
      setActiveTab("graph");
    } else if (tabParam === "roadmap") {
      setActiveTab("roadmap");
    }
  }, [tabParam]);

  const handleTabChange = (tab: "roadmap" | "graph") => {
    setActiveTab(tab);
    router.replace(`/roadmap?tab=${tab}`);
  };

  // --- ROADMAP SCHEDULE DATA ---
  const [scheduleTasks, setScheduleTasks] = useState([
    { day: 1, title: "Python Runtime & Dictionary Key Errors", type: "Bug Investigation", path: "/coding?tab=bugs", completed: true },
    { day: 2, title: "SQL JOIN Aggregation & Subqueries", type: "Technical Assessment", path: "/assessments", completed: true },
    { day: 3, title: "React State Management & Concurrent Mode", type: "AI Mock Interview", path: "/interview", completed: true },
    { day: 4, title: "Two Sum & Hash Map Algorithmic Optimization", type: "Coding Practice", path: "/coding?tab=practice", completed: false },
    { day: 5, title: "System Design - Rate Limiter Architecture", type: "Architecture Study", path: "/assessments", completed: false },
  ]);

  const handleCompleteTask = async (dayNumber: number) => {
    setScheduleTasks((prev) =>
      prev.map((t) => (t.day === dayNumber ? { ...t, completed: true } : t))
    );
    try {
      await recordActivity("learning_roadmap");
    } catch {}
  };

  // --- SKILL GRAPH STATE ---
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);

  const initialNodes: Node[] = [
    { id: "python-basics", type: "skillNode", position: { x: 250, y: 0 }, data: { label: "Python Basics", status: "mastered", score: 92, category: "Language Fundamentals", description: "Variables, OOP, Generators, & Exception Handling." } },
    { id: "dsa-basics", type: "skillNode", position: { x: 100, y: 150 }, data: { label: "Data Structures", status: "in_progress", score: 75, category: "Algorithms", description: "Hash Maps, Trees, Graphs, & Time Complexity Analysis." } },
    { id: "sql-basics", type: "skillNode", position: { x: 400, y: 150 }, data: { label: "SQL & DBMS", status: "needs_improvement", score: 45, category: "Databases", description: "INNER/LEFT JOINs, Subqueries, & Indexing." } },
    { id: "web-frameworks", type: "skillNode", position: { x: 250, y: 300 }, data: { label: "FastAPI / Next.js", status: "in_progress", score: 80, category: "Full-Stack Web", description: "REST APIs, Middleware, Async, & State Management." } },
    { id: "sys-design", type: "skillNode", position: { x: 250, y: 450 }, data: { label: "System Design", status: "not_started", score: 0, category: "Architecture", description: "Load Balancing, DB Sharding, & Caching Strategies." } }
  ];

  const initialEdges: Edge[] = [
    { id: "e-py-dsa", source: "python-basics", target: "dsa-basics", animated: true, style: { stroke: "#22C55E", strokeWidth: 2 } },
    { id: "e-py-sql", source: "python-basics", target: "sql-basics", animated: true, style: { stroke: "#22C55E", strokeWidth: 2 } },
    { id: "e-dsa-web", source: "dsa-basics", target: "web-frameworks", animated: true, style: { stroke: "#16A34A", strokeWidth: 2 } },
    { id: "e-sql-web", source: "sql-basics", target: "web-frameworks", animated: true, style: { stroke: "#16A34A", strokeWidth: 2 } },
    { id: "e-web-sys", source: "web-frameworks", target: "sys-design", animated: true, style: { stroke: "#86EFAC", strokeWidth: 2 } }
  ];

  useEffect(() => {
    const apiUrl = BACKEND_URL;
    axios.get(`${apiUrl}/api/innovations/graph/demo-candidate`)
      .then((res) => {
        if (res.data.nodes?.length > 0) {
          setNodes(initialNodes);
          setEdges(initialEdges);
          setSelectedSkill(initialNodes[0].data);
        }
      })
      .catch(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        setSelectedSkill(initialNodes[0].data);
      });
  }, []);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = (_: any, node: Node) => {
    setSelectedSkill(node.data);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-[#1F2937]">
      {/* Header Banner & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D1FAE5]">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight flex items-center gap-2.5">
            <Map className="w-8 h-8 text-[#16A34A]" /> Learning Roadmap & Skill Graph
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Personalized adaptive schedule combined with visual prerequisite knowledge trees.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#F0FDF4] p-1.5 rounded-2xl border border-[#D1FAE5] shrink-0">
          <button
            onClick={() => handleTabChange("roadmap")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "roadmap"
                ? "bg-[#22C55E] text-white shadow-md shadow-green-500/25"
                : "text-[#4B5563] hover:text-[#1F2937]"
            }`}
          >
            <Map className="w-4 h-4" /> Personalized Roadmap
          </button>
          <button
            onClick={() => handleTabChange("graph")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "graph"
                ? "bg-[#22C55E] text-white shadow-md shadow-green-500/25"
                : "text-[#4B5563] hover:text-[#1F2937]"
            }`}
          >
            <GitFork className="w-4 h-4" /> Skill Knowledge Graph
          </button>
        </div>
      </div>

      {/* TAB 1: PERSONALIZED ROADMAP */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          <div className="bg-white p-7 rounded-3xl border border-[#D1FAE5] space-y-5 shadow-soft-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#22C55E]" /> 15-Day Adaptive Target Schedule
                </h2>
                <p className="text-xs text-[#6B7280] mt-1">Calculated dynamically based on assessment scores, weakness areas, and mistake frequency.</p>
              </div>
              <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] shrink-0">
                60% Completed
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {scheduleTasks.map((d) => (
                <div 
                  key={d.day} 
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
                    d.completed 
                      ? "bg-[#F0FDF4] border-[#86EFAC]" 
                      : "bg-white border-[#D1FAE5] hover:border-[#86EFAC]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      d.completed ? "bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]" : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}>
                      D{d.day}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#1F2937] text-sm truncate">{d.title}</h3>
                      <span className="text-[11px] text-[#6B7280] font-medium">{d.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {d.completed ? (
                      <span className="flex items-center gap-1.5 text-xs text-[#166534] font-bold bg-[#DCFCE7] px-3 py-1 rounded-lg border border-[#86EFAC]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Finished
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCompleteTask(d.day)}
                          title="Mark task completed and build streak"
                          className="bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#166534] border border-[#86EFAC] text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>Mark Done</span>
                        </button>
                        <button
                          onClick={() => router.push(d.path)}
                          className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm shadow-green-500/20"
                        >
                          <span>Start</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILL KNOWLEDGE GRAPH */}
      {activeTab === "graph" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold px-2 gap-2">
            <span className="text-[#6B7280]">Prerequisite competency tree visualized in interactive React Flow:</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#166534]"><span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" /> Mastered</span>
              <span className="flex items-center gap-1.5 text-[#15803D]"><span className="w-2 h-2 rounded-full bg-[#4ADE80]" /> In Progress</span>
              <span className="flex items-center gap-1.5 text-[#D97706]"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Needs Work</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#D1FAE5] h-[580px] relative overflow-hidden shadow-soft-card">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background color="#D1FAE5" gap={24} />
                <Controls className="!bg-white !border-[#D1FAE5] !rounded-xl !shadow-md flex flex-col overflow-hidden text-[#1F2937] border [&>button]:!bg-white [&>button]:!border-[#D1FAE5] [&>button]:!text-[#1F2937] [&>button:hover]:!bg-[#DCFCE7] [&_svg]:!fill-[#166534]" />
              </ReactFlow>
            </div>

            <div className="lg:col-span-4 bg-white p-7 rounded-3xl border border-[#D1FAE5] flex flex-col justify-between h-[580px] shadow-soft-card">
              {selectedSkill ? (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">{selectedSkill.category}</span>
                    <h3 className="text-2xl font-extrabold text-[#1F2937] mt-1">{selectedSkill.label}</h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAFDFA] border border-[#D1FAE5] space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Mastery Level:</span>
                      <span className="text-[#1F2937] font-bold capitalize">{selectedSkill.status?.replace("_", " ")}</span>
                    </div>
                    {/* Progress Bar with #DCFCE7 background and #22C55E progress */}
                    <div className="w-full bg-[#DCFCE7] h-2.5 rounded-full overflow-hidden border border-[#D1FAE5]">
                      <div className="bg-[#22C55E] h-full rounded-full transition-all duration-500" style={{ width: `${selectedSkill.score}%` }} />
                    </div>
                    <div className="text-right text-xs font-mono text-[#16A34A] font-bold">{selectedSkill.score}% Verified Score</div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Competency Scope</h4>
                    <p className="text-xs text-[#4B5563] leading-relaxed">{selectedSkill.description}</p>
                  </div>

                  <div className="p-3.5 bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] rounded-xl leading-relaxed">
                    <Sparkles className="w-4 h-4 text-[#16A34A] inline mr-1.5" />
                    Evidence verified from live OneCompiler sandbox tests & AI mock interviews.
                  </div>
                </div>
              ) : (
                <div className="text-[#6B7280] text-sm flex items-center justify-center h-full">
                  Click any skill node in the graph to view competency evidence.
                </div>
              )}

              <button 
                onClick={() => router.push("/assessments")}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-xs py-3.5 rounded-xl transition shadow-button-primary flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Assessment for this Skill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
