"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface LoginSuccessAnimationProps {
  studentName: string;
  onAnimationComplete: () => void;
}

export default function LoginSuccessAnimation({
  studentName,
  onAnimationComplete,
}: LoginSuccessAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onAnimationComplete={() => {
        setTimeout(() => {
          onAnimationComplete();
        }, 2200);
      }}
      className="fixed inset-0 z-50 bg-[#F0FDF4]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center overflow-hidden font-sans select-none"
    >
      {/* Background Subtle Organic Green Gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-200/50 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-emerald-200/40 blur-[140px] rounded-full pointer-events-none" />

      {/* PrepPilot Glowing Logo Reveal */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mb-6"
      >
        <div className="bg-gradient-to-tr from-[#22C55E] to-[#16A34A] p-5 rounded-3xl text-white shadow-xl shadow-green-500/30 relative z-10">
          <Sparkles className="w-12 h-12 text-white animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-[#22C55E] blur-xl opacity-40 rounded-3xl animate-ping" />
      </motion.div>

      {/* Animated Text Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-3 max-w-lg z-10"
      >
        <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
          Welcome Back!
        </h2>

        <h3 className="text-2xl font-bold text-[#16A34A]">
          Hello, {studentName}
        </h3>

        <p className="text-sm text-[#4B5563] leading-relaxed pt-1 font-medium">
          Your Journey to Technical Placement Readiness Continues.
        </p>
      </motion.div>

      {/* Progress Bar Loading Indicator (#DCFCE7 background, #22C55E progress) */}
      <div className="w-[240px] h-2 bg-[#DCFCE7] rounded-full mt-10 overflow-hidden z-10 border border-[#D1FAE5]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 1.8, ease: "easeInOut" }}
          className="h-full bg-[#22C55E] rounded-full shadow-sm"
        />
      </div>

      <span className="text-[12px] font-mono text-[#6B7280] mt-3 z-10 font-medium">
        Syncing placement metrics & preparing dashboard...
      </span>
    </motion.div>
  );
}
