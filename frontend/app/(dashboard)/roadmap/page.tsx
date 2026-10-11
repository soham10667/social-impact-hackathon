"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { 
  Map, 
  GitFork, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Play, 
  ArrowRight,
  BookOpen
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
    mastered: "bg-green-500/10 border-green-500/50 text-green-400 shadow-green-500/10",
    in_progress: "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-blue-500/10",
    needs_improvement: "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-amber-500/10",
    not_started: "bg-gray-800/40 border-gray-700 text-gray-400"
  };

  return (
    <div className={`p-4 rounded-2xl border-2 shadow-xl backdrop-blur-md min-w-[200px] transition-all hover:scale-105 ${statusStyles[data.status]}`}>
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3" />
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="font-bold text-white text-sm">{data.label}</span>
        <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-black/40 border border-current">
          {data.score}%
        </span>
      </div>
      <div className="text-[11px] font-semibold capitalize tracking-wider flex items-center gap-1.5 mt-2">
        {data.status === 'mastered' && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
        {data.status === 'in_progress' && <Clock className="w-3.5 h-3.5 text-blue-400" />}
        {data.status === 'needs_improvement' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
        <span>{data.status.replace("_", " ")}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = { skillNode: CustomSkillNode };

export default function RoadmapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

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
  const days = [
    { day: 1, title: "Python Runtime & Dictionary Key Errors", type: "Bug Investigation", path: "/coding?tab=bugs", completed: true },
    { day: 2, title: "SQL JOIN Aggregation & Subqueries", type: "Technical Assessment", path: "/assessments", completed: true },
    { day: 3, title: "React State Management & Concurrent Mode", type: "AI Mock Interview", path: "/interview", completed: true },
    { day: 4, title: "Two Sum & Hash Map Algorithmic Optimization", type: "Coding Practice", path: "/coding?tab=practice", completed: false },
    { day: 5, title: "System Design - Rate Limiter Architecture", type: "Architecture Study", path: "/assessments", completed: false },
  ];

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
    { id: "e-py-dsa", source: "python-basics", target: "dsa-basics", animated: true, style: { stroke: "#3B82F6", strokeWidth: 2 } },
    { id: "e-py-sql", source: "python-basics", target: "sql-basics", animated: true, style: { stroke: "#3B82F6", strokeWidth: 2 } },
    { id: "e-dsa-web", source: "dsa-basics", target: "web-frameworks", animated: true, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
    { id: "e-sql-web", source: "sql-basics", target: "web-frameworks", animated: true, style: { stroke: "#8B5CF6", strokeWidth: 2 } },
    { id: "e-web-sys", source: "web-frameworks", target: "sys-design", animated: true, style: { stroke: "#64748B", strokeWidth: 2 } }
  ];

  useEffect(() => {
    axios.get("http://localhost:8000/api/innovations/graph/demo-candidate")
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
    <div className="space-y-6">
      {/* Header Banner & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Map className="w-6 h-6 text-blue-400" /> Learning Roadmap & Skill Graph
          </h1>
          <p className="text-mutedText text-sm mt-1">
            Personalized adaptive schedule combined with visual prerequisite knowledge graphs.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-secondaryBg p-1 rounded-xl border border-gray-800 shrink-0">
          <button
            onClick={() => handleTabChange("roadmap")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "roadmap"
                ? "bg-primaryAccent text-white shadow-md shadow-blue-500/25"
                : "text-mutedText hover:text-white"
            }`}
          >
            <Map className="w-3.5 h-3.5" /> Personalized Roadmap
          </button>
          <button
            onClick={() => handleTabChange("graph")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "graph"
                ? "bg-primaryAccent text-white shadow-md shadow-blue-500/25"
                : "text-mutedText hover:text-white"
            }`}
          >
            <GitFork className="w-3.5 h-3.5" /> Skill Knowledge Graph
          </button>
        </div>
      </div>

      {/* TAB 1: PERSONALIZED ROADMAP */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          <div className="bg-cardBg p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">15-Day Adaptive Target Schedule</h2>
                <p className="text-xs text-mutedText mt-0.5">Calculated dynamically based on assessment scores and mistake frequency.</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                60% Completed
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {days.map((d) => (
                <div 
                  key={d.day} 
                  className={`p-4 rounded-xl border flex items-center justify-between transition hover:border-gray-700 ${
                    d.completed ? "bg-green-500/5 border-green-500/30" : "bg-secondaryBg border-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      d.completed ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-400"
                    }`}>
                      Day {d.day}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{d.title}</h3>
                      <span className="text-xs text-mutedText">{d.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {d.completed ? (
                      <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Finished
                      </span>
                    ) : (
                      <button
                        onClick={() => router.push(d.path)}
                        className="bg-primaryAccent hover:bg-blue-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                      >
                        Start <ArrowRight className="w-3 h-3" />
                      </button>
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
          <div className="flex items-center justify-between text-xs font-semibold px-2">
            <span className="text-mutedText">Prerequisite dependency tree visualized in interactive React Flow:</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400" /> Mastered</span>
              <span className="flex items-center gap-1 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-400" /> In Progress</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400" /> Needs Work</span>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-cardBg rounded-2xl border border-gray-800 h-[560px] relative overflow-hidden shadow-2xl">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background color="#1E293B" gap={20} />
                <Controls className="!bg-[#151D2E] !border-gray-800 !rounded-xl !shadow-xl flex flex-col overflow-hidden text-white border [&>button]:!bg-[#151D2E] [&>button]:!border-gray-800 [&>button]:!text-white [&>button:hover]:!bg-blue-600 [&_svg]:!fill-white" />
              </ReactFlow>
            </div>

            <div className="md:col-span-4 bg-cardBg p-6 rounded-2xl border border-gray-800 flex flex-col justify-between h-[560px] shadow-xl">
              {selectedSkill ? (
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{selectedSkill.category}</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{selectedSkill.label}</h3>
                  </div>

                  <div className="p-4 rounded-xl bg-secondaryBg border border-gray-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-mutedText">Mastery Level:</span>
                      <span className="text-white font-bold capitalize">{selectedSkill.status?.replace("_", " ")}</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full" style={{ width: `${selectedSkill.score}%` }} />
                    </div>
                    <div className="text-right text-xs font-mono text-blue-400 font-bold">{selectedSkill.score}% Verified Score</div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-mutedText uppercase">Topic Overview</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedSkill.description}</p>
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 rounded-xl">
                    <Sparkles className="w-4 h-4 text-blue-400 inline mr-1" />
                    Evidence calculated from completed Bug Arena challenges & assessments.
                  </div>
                </div>
              ) : (
                <div className="text-mutedText text-sm">Select a skill node in the graph to view evidence details.</div>
              )}

              <button 
                onClick={() => router.push("/assessments")}
                className="w-full bg-primaryAccent hover:bg-blue-600 text-white font-semibold text-sm py-3.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Start Topic Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
