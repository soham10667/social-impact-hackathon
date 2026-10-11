"use client";

import { useEffect, useRef } from "react";

interface JarvisOrbProps {
  isAiSpeaking: boolean;
  isCandidateSpeaking: boolean;
  isAiThinking: boolean;
  isInterviewActive: boolean;
  audioVolume?: number; // 0.0 to 1.0 real microphone/speech amplitude
}

export default function JarvisOrb({
  isAiSpeaking,
  isCandidateSpeaking,
  isAiThinking,
  isInterviewActive,
  audioVolume = 0,
}: JarvisOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Determine palette and energy scale based on active speaker state
      let primaryColor = "rgba(6, 182, 212, "; // Cyan
      let glowColor = "#06b6d4";
      let baseRadius = 78;
      let waveAmplitude = 12;
      let ringSpeed = 1;

      if (isAiSpeaking) {
        // Bright Cyan & Electric Blue pulsing with AI speech
        primaryColor = "rgba(14, 165, 233, ";
        glowColor = "#0ea5e9";
        baseRadius = 86 + Math.sin(time * 6) * 5;
        waveAmplitude = 24 + Math.sin(time * 8) * 8;
        ringSpeed = 2.4;
      } else if (isCandidateSpeaking) {
        // Radiant Violet / Purple pulsing with candidate's mic volume
        primaryColor = "rgba(168, 85, 247, ";
        glowColor = "#a855f7";
        const dynamicVolScale = audioVolume * 35;
        baseRadius = 84 + dynamicVolScale;
        waveAmplitude = 18 + dynamicVolScale * 1.5;
        ringSpeed = 2.0;
      } else if (isAiThinking) {
        // Amber / Gold processing ripple
        primaryColor = "rgba(245, 158, 11, ";
        glowColor = "#f59e0b";
        baseRadius = 80;
        waveAmplitude = 8;
        ringSpeed = 0.8;
      } else if (!isInterviewActive) {
        // Subtle ambient breathing idle
        primaryColor = "rgba(59, 130, 246, ";
        glowColor = "#3b82f6";
        baseRadius = 75 + Math.sin(time * 1.5) * 3;
        waveAmplitude = 6;
        ringSpeed = 0.5;
      }

      // 1. Core Radial Glow
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        baseRadius + 50
      );
      coreGradient.addColorStop(0, `${primaryColor}0.85)`);
      coreGradient.addColorStop(0.4, `${primaryColor}0.35)`);
      coreGradient.addColorStop(0.8, `${primaryColor}0.08)`);
      coreGradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.save();
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Holographic Concentric Orbital Rings
      const rings = [
        { r: baseRadius * 1.35, speed: 0.8 * ringSpeed, dash: [8, 14], width: 1.5, opacity: 0.6 },
        { r: baseRadius * 1.6, speed: -0.6 * ringSpeed, dash: [18, 12, 4, 12], width: 1.2, opacity: 0.5 },
        { r: baseRadius * 1.88, speed: 0.4 * ringSpeed, dash: [32, 20, 8, 20], width: 1.0, opacity: 0.4 },
        { r: baseRadius * 2.15, speed: -0.25 * ringSpeed, dash: [60, 30], width: 0.8, opacity: 0.3 },
      ];

      rings.forEach((ring) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * ring.speed);
        ctx.strokeStyle = `${primaryColor}${ring.opacity})`;
        ctx.lineWidth = ring.width;
        ctx.setLineDash(ring.dash);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 3. Circular Audio Waveform Spectrum (Real-time reactive)
      const numSegments = 64;
      ctx.save();
      ctx.translate(centerX, centerY);

      // Layer 1: Outer waveform spikes
      for (let i = 0; i < numSegments; i++) {
        const angle = (i / numSegments) * Math.PI * 2;
        let spikeHeight = Math.sin(angle * 6 + time * 4) * waveAmplitude;
        if (isAiSpeaking) {
          spikeHeight += Math.cos(angle * 12 + time * 8) * (waveAmplitude * 0.6);
        } else if (isCandidateSpeaking) {
          spikeHeight += Math.sin(angle * 8 + time * 6) * (audioVolume * 25 + 8);
        } else if (isAiThinking) {
          spikeHeight = Math.sin(angle * 3 + time * 3) * 6;
        }

        const x1 = Math.cos(angle) * (baseRadius + 6);
        const y1 = Math.sin(angle) * (baseRadius + 6);
        const x2 = Math.cos(angle) * (baseRadius + 14 + Math.max(0, spikeHeight));
        const y2 = Math.sin(angle) * (baseRadius + 14 + Math.max(0, spikeHeight));

        ctx.strokeStyle = `${primaryColor}0.85)`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Layer 2: Glowing Core Sphere boundary
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `${primaryColor}0.95)`;
      ctx.lineWidth = 3;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = isAiSpeaking || isCandidateSpeaking ? 22 : 12;
      ctx.stroke();
      ctx.restore();

      // 4. Center Neural Energy Nodes & Particles
      ctx.save();
      ctx.translate(centerX, centerY);
      const particleCount = 14;
      for (let i = 0; i < particleCount; i++) {
        const pAngle = (i / particleCount) * Math.PI * 2 + time * (i % 2 === 0 ? 0.9 : -0.7);
        const pDist = (baseRadius * 0.5) * (0.4 + 0.6 * Math.sin(time * 2 + i));
        const px = Math.cos(pAngle) * pDist;
        const py = Math.sin(pAngle) * pDist;

        ctx.fillStyle = `${primaryColor}0.85)`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Connect node to center
        ctx.strokeStyle = `${primaryColor}0.25)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      // Center glowing nucleus
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.arc(0, 0, 7 + (isAiSpeaking ? Math.sin(time * 8) * 2 : 0), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAiSpeaking, isCandidateSpeaking, isAiThinking, isInterviewActive, audioVolume]);

  return (
    <div className="relative flex items-center justify-center select-none shrink-0">
      {/* Outer ambient glow backlight - constrained to parent size to avoid overflow */}
      <div
        className={`absolute w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full blur-3xl transition-all duration-700 pointer-events-none -z-10 ${
          isAiSpeaking
            ? "bg-cyan-500/25 scale-110"
            : isCandidateSpeaking
            ? "bg-purple-500/25 scale-110"
            : isAiThinking
            ? "bg-amber-500/20 scale-105"
            : "bg-blue-500/15 scale-95"
        }`}
      />

      <canvas
        ref={canvasRef}
        width={420}
        height={420}
        className="w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] lg:w-[350px] lg:h-[350px] max-h-[42vh] max-w-[90vw] aspect-square drop-shadow-2xl"
      />
    </div>
  );
}
