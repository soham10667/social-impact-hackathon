"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, Server, Activity, ShieldAlert, CheckCircle } from "lucide-react";

export default function CrisisSimulatorPage() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);

  const defaultScenarios = [
    {
      id: "crisis-001",
      title: "Production E-Commerce API Returning HTTP 500",
      severity: "P0 Critical",
      category: "Backend System Failure",
      description: "During peak sale hours, checkout API endpoints are failing with 500 Internal Server Errors. Customer latency spiked by 300%.",
      metrics: {
        error_rate: "28.4%",
        latency_p99: "4800ms",
        db_connections: "98/100 (Saturated)",
        cpu_utilization: "94%"
      },
      logs: "[CRITICAL] psycopg2.OperationalError: FATAL: remaining connection slots reserved for superuser",
      available_actions: [
        { key: "inspect_db", label: "Inspect Active DB Connection Pools" },
        { key: "restart_app", label: "Restart API Server Instances" },
        { key: "scale_db_pool", label: "Increase Connection Limits & Cache Key Queries" },
        { key: "rollback", label: "Rollback Recent Release" }
      ]
    }
  ];

  useEffect(() => {
    axios.get("http://localhost:8000/api/crisis/scenarios")
      .then((res) => {
        setScenarios(res.data);
        if (res.data.length > 0) setActiveScenario(res.data[0]);
      })
      .catch(() => {
        setScenarios(defaultScenarios);
        setActiveScenario(defaultScenarios[0]);
      });
  }, []);

  const handleTakeAction = (key: string) => {
    axios.post("http://localhost:8000/api/crisis/action", {
      session_id: "crisis-session-1",
      action_key: key,
      explanation: "Triage DB Connection Saturation"
    })
    .then((res) => setEvaluation(res.data))
    .catch(() => {
      if (key === "scale_db_pool") {
        setEvaluation({
          status: "resolved",
          new_state: "System Stabilized",
          metrics: { error_rate: "0.01%", latency_p99: "120ms", db_connections: "32/200" },
          ai_evaluation: "Excellent incident triage! You accurately identified database connection exhaustion as the root cause rather than wasting time restarting application nodes."
        });
      } else {
        setEvaluation({
          status: "degraded",
          new_state: "Incident Escalating",
          metrics: { error_rate: "34.2%", latency_p99: "5900ms", db_connections: "100/100 (Exhausted)" },
          ai_evaluation: "Action failed to mitigate root cause. The DB pool remains saturated. Focus on DB connection lifecycle and query pool limits."
        });
      }
    });
  };

  if (!activeScenario) return <div className="text-mutedText">Loading Crisis Simulator...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" /> Core Innovation 5: AI Technical Crisis Simulator
        </h1>
        <p className="text-mutedText text-sm mt-1">Act as an SRE/Tech Lead resolving production outage state-machine incidents.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Scenario Details & Actions */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-cardBg p-6 rounded-2xl border border-amber-500/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {activeScenario.severity}
              </span>
              <span className="text-xs text-mutedText">{activeScenario.category}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{activeScenario.title}</h2>
            <p className="text-sm text-mutedText leading-relaxed">{activeScenario.description}</p>

            <div className="mt-4 p-3 bg-black/60 rounded-xl border border-gray-800 font-mono text-xs text-red-300">
              {activeScenario.logs}
            </div>
          </div>

          <div className="bg-cardBg p-6 rounded-2xl border border-gray-800">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Select Triage & Recovery Action</h3>
            <div className="grid grid-cols-2 gap-3">
              {activeScenario.available_actions.map((act: any) => (
                <button
                  key={act.key}
                  onClick={() => handleTakeAction(act.key)}
                  className="p-3.5 rounded-xl border border-gray-800 bg-secondaryBg hover:border-amber-500 hover:bg-amber-500/10 text-left text-xs font-medium text-white transition"
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry Metrics & Evaluation */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-cardBg p-6 rounded-2xl border border-gray-800">
            <h3 className="text-sm font-semibold text-mutedText uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Simulated Telemetry Metrics
            </h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between p-2.5 rounded-lg bg-secondaryBg">
                <span className="text-mutedText">HTTP Error Rate:</span>
                <span className="text-red-400 font-bold">{evaluation?.metrics?.error_rate || activeScenario.metrics.error_rate}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-secondaryBg">
                <span className="text-mutedText">P99 Latency:</span>
                <span className="text-amber-400 font-bold">{evaluation?.metrics?.latency_p99 || activeScenario.metrics.latency_p99}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-secondaryBg">
                <span className="text-mutedText">DB Connections:</span>
                <span className="text-white font-bold">{evaluation?.metrics?.db_connections || activeScenario.metrics.db_connections}</span>
              </div>
            </div>
          </div>

          {evaluation && (
            <div className={`p-5 rounded-2xl border ${evaluation.status === 'resolved' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <h4 className="font-bold text-white text-base mb-1">State: {evaluation.new_state}</h4>
              <p className="text-xs text-mutedText leading-relaxed">{evaluation.ai_evaluation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
