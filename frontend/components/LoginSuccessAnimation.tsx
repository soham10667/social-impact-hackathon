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
      className="fixed inset-0 z-50 bg-[#080B14] flex flex-col items-center justify-center p-6 text-center overflow-hidden font-sans select-none"
    >
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-purple-600/20 blur-[140px] rounded-full pointer-events-none" />

      {/* PrepPilot Glowing Logo Reveal */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mb-6"
      >
        <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-5 rounded-3xl text-white shadow-2xl shadow-blue-500/40 relative z-10">
          <Sparkles className="w-12 h-12 animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 rounded-3xl animate-ping" />
      </motion.div>

      {/* Animated Text Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-3 max-w-lg z-10"
      >
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome Back!
        </h2>

        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Hello, {studentName}
        </h3>

        <p className="text-sm text-[#B6C2D2] leading-relaxed pt-1">
          Your Journey to Technical Placement Readiness Continues.
        </p>
      </motion.div>

      {/* Progress Bar Loading Indicator */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "240px", opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.8, ease: "easeInOut" }}
        className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-10 shadow-lg shadow-blue-500/30 z-10"
      />

      <span className="text-[11px] font-mono text-gray-500 mt-3 z-10">
        Syncing placement metrics & preparing dashboard...
      </span>
    </motion.div>
  );
}
