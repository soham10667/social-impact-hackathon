"use client";

import { useEffect, useRef } from "react";

interface JarvisOrbProps {
  isAiSpeaking: boolean;
  isCandidateSpeaking: boolean;
  isAiThinking: boolean;
  isInterviewActive: boolean;
  audioVolume?: number; // 0.0 to 1.0 real microphone/speech amplitude
  size?: number; // Canvas logical dimension (default 520)
}

export default function JarvisOrb({
  isAiSpeaking,
  isCandidateSpeaking,
  isAiThinking,
  isInterviewActive,
  audioVolume = 0,
  size = 520,
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
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Color palette calibration based on active state
      let coreColor = "#00D9FF";
      let electricBlue = "#1677FF";
      let primaryBlue = "#2563EB";
      let glowRgb = "0, 217, 255";
      let baseRadius = 88;
      let waveAmp = 12;
      let rotSpeed = 1;

      if (isAiSpeaking) {
        coreColor = "#38BDF8";
        electricBlue = "#0284C7";
        glowRgb = "56, 189, 248";
        baseRadius = 96 + Math.sin(time * 6) * 6;
        waveAmp = 26 + Math.sin(time * 8) * 8;
        rotSpeed = 2.4;
      } else if (isCandidateSpeaking) {
        coreColor = "#A855F7";
        electricBlue = "#6366F1";
        glowRgb = "168, 85, 247";
        const volScale = Math.min(1, Math.max(0, audioVolume)) * 40;
        baseRadius = 92 + volScale;
        waveAmp = 20 + volScale * 1.6;
        rotSpeed = 2.0;
      } else if (isAiThinking) {
        coreColor = "#F59E0B";
        electricBlue = "#D97706";
        glowRgb = "245, 158, 11";
        baseRadius = 88;
        waveAmp = 9;
        rotSpeed = 1.2;
      } else {
        // Futuristic idle state: deep electric blue + neon cyan
        coreColor = "#00D9FF";
        electricBlue = "#1677FF";
        glowRgb = "0, 217, 255";
        baseRadius = 84 + Math.sin(time * 1.8) * 3.5;
        waveAmp = 8;
        rotSpeed = 0.75;
      }

      // 1. Outermost Deep Atmospheric Radial Glow
      const ambientGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, baseRadius * 2.5);
      ambientGlow.addColorStop(0, `rgba(${glowRgb}, 0.28)`);
      ambientGlow.addColorStop(0.35, `rgba(${glowRgb}, 0.12)`);
      ambientGlow.addColorStop(0.7, `rgba(22, 119, 255, 0.05)`);
      ambientGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.save();
      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Futuristic Holographic Outer HUD Rings & Electric Arcs
      const hudRings = [
        { r: baseRadius * 2.15, speed: 0.15 * rotSpeed, dash: [4, 18], width: 1.0, opacity: 0.35 },
        { r: baseRadius * 1.9, speed: -0.35 * rotSpeed, dash: [40, 25, 6, 25], width: 1.2, opacity: 0.5 },
        { r: baseRadius * 1.65, speed: 0.6 * rotSpeed, dash: [18, 12], width: 1.4, opacity: 0.65 },
        { r: baseRadius * 1.35, speed: -0.8 * rotSpeed, dash: [80, 40], width: 1.8, opacity: 0.75 },
      ];

      hudRings.forEach((ring) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * ring.speed);
        ctx.strokeStyle = `rgba(${glowRgb}, ${ring.opacity})`;
        ctx.lineWidth = ring.width;
        ctx.setLineDash(ring.dash);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 3. Glowing Outer HUD Corner/Tangent Arcs (Electric Blue)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.4 * rotSpeed);
      for (let a = 0; a < 4; a++) {
        const startAng = (a * Math.PI) / 2 + 0.15;
        const endAng = startAng + 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 1.78, startAng, endAng);
        ctx.strokeStyle = electricBlue;
        ctx.lineWidth = 2.4;
        ctx.shadowColor = coreColor;
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Small tech dots at ends of arcs
        const dotX = Math.cos(endAng) * (baseRadius * 1.78);
        const dotY = Math.sin(endAng) * (baseRadius * 1.78);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = coreColor;
        ctx.fill();
      }
      ctx.restore();

      // 4. Circular Audio Waveform Spectrum (Concentric Reactive Spikes)
      const segments = 72;
      ctx.save();
      ctx.translate(cx, cy);

      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        let spike = Math.sin(theta * 7 + time * 4) * waveAmp;
        if (isAiSpeaking) {
          spike += Math.cos(theta * 14 + time * 9) * (waveAmp * 0.7);
        } else if (isCandidateSpeaking) {
          spike += Math.sin(theta * 9 + time * 7) * (audioVolume * 30 + 10);
        } else if (isAiThinking) {
          spike = Math.sin(theta * 4 + time * 4) * 8;
        }

        const innerR = baseRadius + 4;
        const outerR = baseRadius + 14 + Math.max(0, spike);

        const x1 = Math.cos(theta) * innerR;
        const y1 = Math.sin(theta) * innerR;
        const x2 = Math.cos(theta) * outerR;
        const y2 = Math.sin(theta) * outerR;

        ctx.strokeStyle = `rgba(${glowRgb}, 0.85)`;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Glowing Spherical Core Body (Cyan to Deep Blue Gradient)
      const coreGrad = ctx.createRadialGradient(
        cx - baseRadius * 0.25,
        cy - baseRadius * 0.25,
        baseRadius * 0.1,
        cx,
        cy,
        baseRadius
      );
      coreGrad.addColorStop(0, "#E0F2FE"); // High-intensity center highlight
      coreGrad.addColorStop(0.2, coreColor);
      coreGrad.addColorStop(0.65, electricBlue);
      coreGrad.addColorStop(0.95, primaryBlue);
      coreGrad.addColorStop(1, "#030B1C");

      ctx.save();
      ctx.fillStyle = coreGrad;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = isAiSpeaking || isCandidateSpeaking ? 28 : 18;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright rim stroke
      ctx.strokeStyle = `rgba(${glowRgb}, 0.9)`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // 6. Swirling Energy Waves & Internal Particle Grid
      ctx.save();
      ctx.translate(cx, cy);
      const particles = 18;
      for (let i = 0; i < particles; i++) {
        const pAng = (i / particles) * Math.PI * 2 + time * (i % 2 === 0 ? 0.8 : -0.6);
        const pDist = (baseRadius * 0.6) * (0.35 + 0.65 * Math.sin(time * 1.8 + i));
        const px = Math.cos(pAng) * pDist;
        const py = Math.sin(pAng) * pDist;

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(${glowRgb}, 0.35)`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
      ctx.restore();

      // 7. Minimal Voice Waveform Symbol in Center Core
      ctx.save();
      ctx.translate(cx, cy);
      const barCount = 7;
      const barWidth = 3;
      const barGap = 4;
      const totalBarWidth = barCount * barWidth + (barCount - 1) * barGap;
      const startX = -totalBarWidth / 2;

      for (let b = 0; b < barCount; b++) {
        const bx = startX + b * (barWidth + barGap);
        // Wave heights dynamically responsive to state
        let barHeight = 8;
        if (isAiSpeaking) {
          barHeight = 12 + Math.abs(Math.sin(time * 7 + b * 0.8)) * 22;
        } else if (isCandidateSpeaking) {
          barHeight = 10 + (audioVolume * 30) * Math.abs(Math.sin(time * 6 + b));
        } else if (isAiThinking) {
          barHeight = 8 + Math.abs(Math.sin(time * 3 + b * 0.5)) * 12;
        } else {
          barHeight = 6 + Math.abs(Math.sin(time * 2 + b * 0.6)) * 10;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = coreColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(bx, -barHeight / 2, barWidth, barHeight, 2);
        ctx.fill();
      }
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
      {/* Background radial lighting aura */}
      <div
        className={`absolute w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full blur-3xl transition-all duration-700 pointer-events-none -z-10 ${
          isAiSpeaking
            ? "bg-cyan-500/30 scale-125"
            : isCandidateSpeaking
            ? "bg-purple-500/30 scale-125"
            : isAiThinking
            ? "bg-amber-500/25 scale-110"
            : "bg-blue-600/25 scale-100"
        }`}
      />

      {/* Futuristic concentric floor ring reflection beneath orb */}
      <div className="absolute -bottom-10 sm:-bottom-12 w-64 sm:w-80 h-16 sm:h-20 rounded-[100%] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-md pointer-events-none -z-10" />

      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[400px] md:h-[400px] lg:w-[440px] lg:h-[440px] max-h-[46vh] max-w-[90vw] aspect-square drop-shadow-[0_0_40px_rgba(0,217,255,0.35)]"
      />
    </div>
  );
}
