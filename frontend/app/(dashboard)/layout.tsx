"use client";

import Sidebar from "../../components/Sidebar";
import TopNavbar from "../../components/TopNavbar";
import { useInterviewSession } from "@/context/InterviewSessionContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isInterviewActive } = useInterviewSession();

  return (
    <div
      className={`flex bg-[#080B14] ${
        isInterviewActive ? "h-screen w-screen overflow-hidden fixed inset-0" : "min-h-screen"
      }`}
    >
      {!isInterviewActive && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {!isInterviewActive && <TopNavbar />}
        <main
          className={`flex-1 transition-all duration-200 ${
            isInterviewActive
              ? "p-0 w-full h-full overflow-hidden"
              : "p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

