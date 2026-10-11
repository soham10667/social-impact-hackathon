"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, Server, Activity, ShieldAlert, CheckCircle } from "lucide-react";
import { BACKEND_URL } from "@/lib/api";

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
    const apiUrl = BACKEND_URL;
    axios.get(`${apiUrl}/api/crisis/scenarios`)
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
    const apiUrl = BACKEND_URL;
    axios.post(`${apiUrl}/api/crisis/action`, {
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#6B7280] space-y-3">
        <Activity className="w-8 h-8 text-[#22C55E] animate-spin" />
        <p className="text-sm font-medium">Initializing Crisis Simulator War Room...</p>
      </div>
    );
  }

  const isResolved = evaluation?.status === 'resolved';

  return (
    <div className="space-y-8 animate-fadeIn text-[#1F2937]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFBEB] via-white to-[#F0FDF4] border border-[#D1FAE5] p-8 shadow-soft-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Simulated War Room • Core Innovation 5</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="w-8 h-8 text-[#D97706]" /> AI Technical Crisis Simulator
            </h1>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Step into the shoes of an SRE or Lead Architect triaging high-stakes production outages. Analyze telemetry, diagnose connection pool saturation, and execute mitigation runbooks.
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-2xl bg-white border border-[#D1FAE5] shadow-soft-card flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Severity: P0 Outage</p>
              <p className="text-[11px] text-[#6B7280]">Checkout SLA: 99.9% at risk</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Details & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#D1FAE5] shadow-soft-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {activeScenario.severity}
              </span>
              <span className="text-xs font-semibold text-[#6B7280] bg-[#F0FDF4] px-2.5 py-1 rounded-lg border border-[#D1FAE5]">
                {activeScenario.category}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1F2937]">{activeScenario.title}</h2>
              <p className="text-xs text-[#6B7280] leading-relaxed mt-2">{activeScenario.description}</p>
            </div>

            {/* Server Error Log Terminal */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Live System Outage Logs</span>
              <div className="p-4 bg-[#FAFDFA] rounded-xl border border-red-200 font-mono text-xs text-red-600 overflow-x-auto shadow-inner">
                <div className="flex items-center gap-1.5 text-[#9CA3AF] text-[10px] pb-2 mb-2 border-b border-[#D1FAE5]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                  <span className="ml-2">production-api-cluster-04:/var/log/app.err</span>
                </div>
                <code>{activeScenario.logs}</code>
              </div>
            </div>
          </div>

          {/* Action selection */}
          <div className="bg-white p-6 rounded-2xl border border-[#D1FAE5] shadow-soft-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-[#16A34A]" /> Runbook Triage Actions
              </h3>
              <span className="text-[11px] text-[#9CA3AF]">Select mitigation strategy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeScenario.available_actions.map((act: any) => (
                <button
                  key={act.key}
                  onClick={() => handleTakeAction(act.key)}
                  className="p-4 rounded-xl border border-[#D1FAE5] bg-white hover:border-[#86EFAC] hover:bg-[#F0FDF4] text-left text-xs font-semibold text-[#1F2937] transition-all shadow-xs hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="text-[#16A34A] text-[10px] uppercase font-bold mb-1">Execute Action</div>
                  <div>{act.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry Metrics & Evaluation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#D1FAE5] shadow-soft-card space-y-4">
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#22C55E]" /> Real-Time Telemetry Dashboard
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAFDFA] border border-[#D1FAE5]">
                <span className="text-[#6B7280]">HTTP 5xx Error Rate:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded ${
                  isResolved ? 'text-[#16A34A] bg-[#DCFCE7]' : 'text-red-600 bg-red-50'
                }`}>
                  {evaluation?.metrics?.error_rate || activeScenario.metrics.error_rate}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAFDFA] border border-[#D1FAE5]">
                <span className="text-[#6B7280]">P99 Latency (SLA 200ms):</span>
                <span className={`font-bold px-2.5 py-0.5 rounded ${
                  isResolved ? 'text-[#16A34A] bg-[#DCFCE7]' : 'text-[#D97706] bg-[#FFFBEB]'
                }`}>
                  {evaluation?.metrics?.latency_p99 || activeScenario.metrics.latency_p99}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAFDFA] border border-[#D1FAE5]">
                <span className="text-[#6B7280]">PostgreSQL Connection Pool:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded ${
                  isResolved ? 'text-[#16A34A] bg-[#DCFCE7]' : 'text-[#1F2937] bg-gray-100'
                }`}>
                  {evaluation?.metrics?.db_connections || activeScenario.metrics.db_connections}
                </span>
              </div>
            </div>
          </div>

          {evaluation && (
            <div className={`p-6 rounded-2xl border transition-all animate-fadeIn shadow-soft-card ${
              isResolved 
                ? 'bg-[#F0FDF4] border-[#86EFAC]' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {isResolved ? (
                  <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <h4 className="font-bold text-[#1F2937] text-base">
                  State: {evaluation.new_state}
                </h4>
              </div>
              <p className="text-xs text-[#4B5563] leading-relaxed font-sans mt-2">
                {evaluation.ai_evaluation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
