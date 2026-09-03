'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showBadge?: boolean;
  asLink?: boolean;
  className?: string;
}

export const LogoMark: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const dimensions = {
    sm: { box: 30, textL: 14, textC: 11, textV: 14 },
    md: { box: 38, textL: 17, textC: 13, textV: 17 },
    lg: { box: 48, textL: 21, textC: 16, textV: 21 },
  }[size];

  const dim = dimensions.box;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden group transition-all duration-300 ${className}`}
      style={{ width: dim, height: dim }}
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* Main Background Gradient */}
          <linearGradient id="lcv-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          {/* Accent Glow */}
          <linearGradient id="lcv-accent-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* Border Highlight */}
          <linearGradient id="lcv-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>

          {/* Letter Highlight */}
          <linearGradient id="lcv-letter-v" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#a5b4fc" />
          </linearGradient>
        </defs>

        {/* Rounded Hexagonal / Squircle Base */}
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          rx="13"
          fill="url(#lcv-bg-grad)"
          className="shadow-lg"
        />

        {/* Glossy Inner Border */}
        <rect
          x="1.5"
          y="1.5"
          width="45"
          height="45"
          rx="12.5"
          stroke="url(#lcv-border-grad)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Modern Geometric Monogram: L c V */}
        {/* Letter 'L' */}
        <path
          d="M 12 14.5 L 12 32.5 C 12 33.3 12.7 34 13.5 34 L 20 34"
          stroke="#ffffff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter 'c' */}
        <path
          d="M 27.5 24.5 C 26.8 23.2 25.4 22.5 23.8 22.5 C 21.6 22.5 19.8 24.3 19.8 27 C 19.8 29.7 21.6 31.5 23.8 31.5 C 25.4 31.5 26.8 30.8 27.5 29.5"
          stroke="#e0e7ff"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Letter 'V' with Ascending Trajectory */}
        <path
          d="M 28 20.5 L 33 33.5 L 39 15.5"
          stroke="url(#lcv-letter-v)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* AI Career Sparkle Accent */}
        <circle cx="39" cy="15.5" r="2" fill="#38bdf8" className="animate-pulse" />
        <path
          d="M 37 8.5 L 38 10.5 L 40 11.5 L 38 12.5 L 37 14.5 L 36 12.5 L 34 11.5 L 36 10.5 Z"
          fill="#facc15"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};

export default function Logo({
  size = 'md',
  showText = true,
  showBadge = false,
  asLink = true,
  className = '',
}: LogoProps) {
  const textSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <LogoMark size={size} />

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight ${textSize} bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent`}
            >
              LcV
            </span>
            <span
              className={`font-extrabold tracking-tight ${textSize} text-gray-900 dark:text-zinc-100`}
            >
              Builder
            </span>
            {showBadge && (
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 ml-0.5">
                AI
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 tracking-wider uppercase mt-0.5">
            Career Assistant
          </span>
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className="group inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
