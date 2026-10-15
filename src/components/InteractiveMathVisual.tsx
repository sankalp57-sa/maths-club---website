// ============================================================
// MathClub Nexus — Interactive Mathematical Visualization
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cinematicEase } from '../motion/motionTokens';

export default function InteractiveMathVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse inspection state
  const [isHovered, setIsHovered] = useState(false);
  const [inspectX, setInspectX] = useState<number>(180); // viewBox range: 30 to 330

  // Continuous traveling particle phase
  const [time, setTime] = useState(0);

  // Animation frame for continuous travel when not inspecting
  useEffect(() => {
    if (shouldReduceMotion) return;

    let animId: number;
    const loop = (t: number) => {
      setTime(t * 0.0015);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [shouldReduceMotion]);

  // Handle pointer tracking
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    // Map relX (0 to 1) to SVG viewBox X (40 to 320)
    const clampedX = Math.max(40, Math.min(320, relX * 360));
    setInspectX(clampedX);
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
  };

  // Mathematical function definition: f(x)
  // Maps viewBox x (0 to 360) -> normalized x in [-PI, PI] -> viewBox y
  const calculateY = (svgX: number, t = 0) => {
    const normX = ((svgX - 180) / 140) * Math.PI; // -PI to +PI
    // Primary harmonic + secondary octave
    const sin1 = Math.sin(normX * 1.2 + (isHovered ? 0 : t * 0.8));
    const sin2 = 0.35 * Math.sin(normX * 2.8 - (isHovered ? 0 : t * 1.2));
    const normalizedY = sin1 + sin2; // approx -1.35 to +1.35
    // Map to SVG coordinate: center is y=110, amplitude is 55px
    return 110 - normalizedY * 48;
  };

  // Derivative: f'(x) for tangent line slope
  const calculateSlope = (svgX: number) => {
    const delta = 1.0;
    const y1 = calculateY(svgX - delta, isHovered ? 0 : time);
    const y2 = calculateY(svgX + delta, isHovered ? 0 : time);
    return (y2 - y1) / (2 * delta);
  };

  // Current active coordinates
  const activeX = isHovered
    ? inspectX
    : 180 + Math.sin(time * 0.9) * 110;

  const activeY = calculateY(activeX, time);
  const activeSlope = calculateSlope(activeX);

  // Tangent segment coordinates
  const tangentLength = 40;
  const tanAngle = Math.atan(activeSlope);
  const tanX1 = activeX - Math.cos(tanAngle) * tangentLength;
  const tanY1 = activeY - Math.sin(tanAngle) * tangentLength;
  const tanX2 = activeX + Math.cos(tanAngle) * tangentLength;
  const tanY2 = activeY + Math.sin(tanAngle) * tangentLength;

  // Generate SVG path for the wave
  const generateCurvePath = () => {
    const points: string[] = [];
    const step = 4;
    for (let x = 30; x <= 330; x += step) {
      const y = calculateY(x, isHovered ? 0 : time);
      points.push(`${x === 30 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  // Value display
  const normValX = (((activeX - 180) / 140) * Math.PI).toFixed(2);
  const normValY = (((110 - activeY) / 48)).toFixed(2);
  const normSlope = (-activeSlope * 2.5).toFixed(2);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="w-full max-w-[440px] aspect-square rounded-3xl bg-[#08101E]/90 border border-slate-800/90 p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl cursor-crosshair select-none group transition-colors duration-300 hover:border-cyan-500/40"
    >
      {/* Ambient background grid dots */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(rgba(0,217,245,0.5) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top HUD: Real-time Differential Telemetry */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 font-semibold uppercase tracking-wider">
            {isHovered ? 'Tangent Inspector' : 'Harmonic Flow'}
          </span>
        </div>
        <span className="text-slate-400 text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
          f(x) ∈ C^∞
        </span>
      </div>

      {/* Central SVG Graphic Area */}
      <div className="relative z-10 my-auto py-2">
        <svg
          viewBox="0 0 360 220"
          className="w-full h-auto overflow-visible pointer-events-none"
        >
          <defs>
            <linearGradient id="cyanCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D9F5" stopOpacity="0.4" />
              <stop offset="35%" stopColor="#00D9F5" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.5" />
            </linearGradient>
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Coordinate Axes */}
          <line x1="30" y1="110" x2="330" y2="110" stroke="#1E293B" strokeWidth="1.5" />
          <line x1="180" y1="20" x2="180" y2="200" stroke="#1E293B" strokeWidth="1.5" />

          {/* Coordinate Graduation Ticks */}
          {[-120, -60, 60, 120].map((offset) => (
            <line
              key={offset}
              x1={180 + offset}
              y1="106"
              x2={180 + offset}
              y2="114"
              stroke="#334155"
              strokeWidth="1"
            />
          ))}

          {/* Concentric Guide Rings */}
          <circle cx="180" cy="110" r="90" fill="none" stroke="rgba(0,217,245,0.06)" strokeDasharray="3 3" />
          <circle cx="180" cy="110" r="45" fill="none" stroke="rgba(59,130,246,0.09)" />

          {/* Main Harmonic Wave Path */}
          <motion.path
            d={generateCurvePath()}
            fill="none"
            stroke="url(#cyanCurveGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#cyanGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: cinematicEase }}
          />

          {/* Dynamic Tangent Line */}
          <line
            x1={tanX1}
            y1={tanY1}
            x2={tanX2}
            y2={tanY2}
            stroke="#00D9F5"
            strokeWidth="1.75"
            strokeDasharray={isHovered ? 'none' : '4 2'}
            className="transition-all duration-75"
          />

          {/* Vertical Drop Projection Line */}
          <line
            x1={activeX}
            y1={activeY}
            x2={activeX}
            y2="110"
            stroke="rgba(0,217,245,0.3)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Orbiting / Inspecting Point */}
          <circle
            cx={activeX}
            cy={activeY}
            r="5"
            fill="#00D9F5"
            className="filter drop-shadow-[0_0_8px_rgba(0,217,245,0.8)]"
          />

          {/* Secondary Orbiting Ghost Particle */}
          <circle
            cx={180 + Math.cos(time * 1.1) * 75}
            cy={110 + Math.sin(time * 1.1) * 35}
            r="2"
            fill="#3B82F6"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Bottom Telemetry Readout & Math Formulations */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            x: <strong className="text-white font-semibold">{normValX}</strong>
          </span>
          <span>
            f(x): <strong className="text-cyan-400 font-semibold">{normValY}</strong>
          </span>
          <span className="hidden sm:inline">
            f': <strong className="text-slate-300 font-semibold">{normSlope}</strong>
          </span>
        </div>

        <span className="text-[10px] text-slate-500 font-serif italic">
          {"e^(iπ) + 1 = 0"}
        </span>
      </div>
    </div>
  );
}
