import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { InterviewSessionProvider } from "@/context/InterviewSessionContext";

export const metadata: Metadata = {
  title: "PrepPilot AI — Technical Interview & Placement Platform",
  description: "AI-Powered Agentic Technical Interview & Placement Preparation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#FAFDFA] text-[#1F2937] min-h-screen antialiased selection:bg-green-100 selection:text-green-800">
        <AuthProvider>
          <InterviewSessionProvider>
            {children}
          </InterviewSessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
