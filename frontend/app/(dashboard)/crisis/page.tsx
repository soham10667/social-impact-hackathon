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

  if (!activeScenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 space-y-3">
        <Activity className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-sm">Initializing Crisis Simulator War Room...</p>
      </div>
    );
  }

  const isResolved = evaluation?.status === 'resolved';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/40 via-[#14121E] to-amber-950/30 border border-amber-500/20 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Simulated War Room • Core Innovation 5</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="w-8 h-8 text-amber-400" /> AI Technical Crisis Simulator
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Step into the shoes of an SRE or Lead Architect triaging high-stakes production outages. Analyze telemetry, diagnose connection pool saturation, and execute mitigation runbooks.
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-2xl bg-[#0B0F1B]/90 border border-amber-500/30 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Severity: P0 Outage</p>
              <p className="text-[11px] text-slate-400">Checkout SLA: 99.9% at risk</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Details & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#121829] p-6 rounded-2xl border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {activeScenario.severity}
              </span>
              <span className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                {activeScenario.category}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">{activeScenario.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">{activeScenario.description}</p>
            </div>

            {/* Server Error Log Terminal */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live System Outage Logs</span>
              <div className="p-4 bg-[#090C15] rounded-xl border border-red-500/20 font-mono text-xs text-red-300 overflow-x-auto shadow-inner">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] pb-2 mb-2 border-b border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 inline-block" />
                  <span className="ml-2">production-api-cluster-04:/var/log/app.err</span>
                </div>
                <code>{activeScenario.logs}</code>
              </div>
            </div>
          </div>

          {/* Action selection */}
          <div className="bg-[#121829] p-6 rounded-2xl border border-[#1E273E] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" /> Runbook Triage Actions
              </h3>
              <span className="text-[11px] text-slate-500">Select mitigation strategy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeScenario.available_actions.map((act: any) => (
                <button
                  key={act.key}
                  onClick={() => handleTakeAction(act.key)}
                  className="p-4 rounded-xl border border-slate-800 bg-[#0E1424] hover:border-amber-500 hover:bg-amber-500/10 text-left text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="text-amber-400 text-[10px] uppercase font-bold mb-1">Execute Action</div>
                  <div>{act.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry Metrics & Evaluation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121829] p-6 rounded-2xl border border-[#1E273E] space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Real-Time Telemetry Dashboard
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1220] border border-slate-800">
                <span className="text-slate-400">HTTP 5xx Error Rate:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  isResolved ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                }`}>
                  {evaluation?.metrics?.error_rate || activeScenario.metrics.error_rate}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1220] border border-slate-800">
                <span className="text-slate-400">P99 Latency (SLA 200ms):</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  isResolved ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                }`}>
                  {evaluation?.metrics?.latency_p99 || activeScenario.metrics.latency_p99}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1220] border border-slate-800">
                <span className="text-slate-400">PostgreSQL Connection Pool:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  isResolved ? 'text-emerald-400 bg-emerald-500/10' : 'text-purple-400 bg-purple-500/10'
                }`}>
                  {evaluation?.metrics?.db_connections || activeScenario.metrics.db_connections}
                </span>
              </div>
            </div>
          </div>

          {evaluation && (
            <div className={`p-6 rounded-2xl border transition-all animate-fadeIn ${
              isResolved 
                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
                : 'bg-red-950/20 border-red-500/40 shadow-lg shadow-red-500/10'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {isResolved ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                <h4 className="font-bold text-white text-base">
                  State: {evaluation.new_state}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
                {evaluation.ai_evaluation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

