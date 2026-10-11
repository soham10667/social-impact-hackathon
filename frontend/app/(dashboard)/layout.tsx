"use client";

import Sidebar from "../../components/Sidebar";
import { useInterviewSession } from "@/context/InterviewSessionContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isInterviewActive } = useInterviewSession();

  return (
    <div
      className={`flex bg-background ${
        isInterviewActive ? "h-screen w-screen overflow-hidden fixed inset-0" : "min-h-screen"
      }`}
    >
      {!isInterviewActive && <Sidebar />}
      <main
        className={`flex-1 transition-all duration-200 ${
          isInterviewActive
            ? "p-0 w-full h-full overflow-hidden"
            : "p-8 overflow-y-auto"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
