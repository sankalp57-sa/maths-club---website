// ============================================================
// MathClub Nexus — Premium Cyber Mathematical Emblem Logo
// ============================================================

import React from 'react';

interface MathClubLogoProps {
  className?: string;
  size?: number | string;
  animate?: boolean;
}

export default function MathClubLogo({
  className = 'w-11 h-11',
  size,
  animate = true,
}: MathClubLogoProps) {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  return (
    <div
      style={sizeStyle}
      className={`relative flex items-center justify-center flex-shrink-0 select-none group/logo ${className}`}
    >
      {/* Outer ambient pulsing aura */}
      {animate && (
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md group-hover/logo:bg-cyan-400/35 transition-all duration-300 pointer-events-none" />
      )}

      {/* High-fidelity Vector Emblem */}
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(0,217,245,0.45)] transition-transform duration-300 group-hover/logo:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="mclBgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00D9F5" stopOpacity="0.4" />
            <stop offset="65%" stopColor="#2563EB" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#050B16" stopOpacity="0.9" />
          </radialGradient>

          <linearGradient id="mclCyberCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="45%" stopColor="#00D9F5" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <linearGradient id="mclNeonIndigo" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#00D9F5" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>

          <linearGradient id="mclRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D9F5" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
          </linearGradient>

          <filter id="mclGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Glow Disk */}
        <circle cx="80" cy="80" r="74" fill="url(#mclBgGlow)" />

        {/* Cyber Outer Rings */}
        <circle
          cx="80"
          cy="80"
          r="72"
          stroke="url(#mclRingGrad)"
          strokeWidth="2"
          strokeDasharray="9 6 18 6"
          opacity="0.85"
        />
        <circle
          cx="80"
          cy="80"
          r="66"
          stroke="#00D9F5"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />

        {/* Cardinal Math Axis Points */}
        <circle cx="80" cy="8" r="2.2" fill="#00D9F5" />
        <circle cx="152" cy="80" r="2.2" fill="#00D9F5" />
        <circle cx="80" cy="152" r="2.2" fill="#3B82F6" />
        <circle cx="8" cy="80" r="2.2" fill="#6366F1" />

        {/* Golden Spiral Arc */}
        <path
          d="M 80 80 A 12 12 0 0 1 92 80 A 24 24 0 0 1 80 104 A 44 44 0 0 1 36 80 A 70 70 0 0 1 80 10"
          fill="none"
          stroke="url(#mclRingGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
          strokeDasharray="3 3"
        />

        {/* Background Sacred Geometric Matrix */}
        <polygon
          points="80,24 130,116 30,116"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="0.8"
          strokeOpacity="0.25"
          strokeDasharray="4 4"
        />
        <polygon
          points="80,136 130,44 30,44"
          fill="none"
          stroke="#818CF8"
          strokeWidth="0.6"
          strokeOpacity="0.2"
          strokeDasharray="4 4"
        />

        {/* High-Definition Cyber Sigma (∑) */}
        <g filter="url(#mclGlow)">
          {/* 3D Depth Shadow */}
          <path
            d="M 112 44 L 54 44 L 84 80 L 54 116 L 112 116 L 112 104 L 78 104 L 98 80 L 78 56 L 112 56 Z"
            fill="#050B16"
            fillOpacity="0.8"
            stroke="#00D9F5"
            strokeOpacity="0.3"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Front Cyan Sigma */}
          <path
            d="M 112 44 L 54 44 L 84 80 L 54 116 L 112 116 L 112 104 L 78 104 L 98 80 L 78 56 L 112 56 Z"
            fill="url(#mclCyberCyan)"
          />

          {/* Top Edge Highlight */}
          <polygon
            points="54,44 112,44 104,50 64,50"
            fill="#FFFFFF"
            fillOpacity="0.8"
          />

          {/* Center Vertex Accent */}
          <polygon
            points="84,80 98,80 78,56 68,60"
            fill="url(#mclNeonIndigo)"
            fillOpacity="0.9"
          />

          {/* Bottom Accent */}
          <polygon
            points="54,116 112,116 104,110 64,110"
            fill="#3B82F6"
            fillOpacity="0.8"
          />
        </g>

        {/* Specular Vertex Flare Highlights */}
        <circle cx="112" cy="44" r="2.5" fill="#FFFFFF" />
        <circle cx="112" cy="116" r="2.5" fill="#00D9F5" />
        <circle cx="84" cy="80" r="3" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
