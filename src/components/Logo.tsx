import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ size = 32, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('flex-shrink-0', className)}
    role="img"
    aria-label="StackCendra"
  >
    <defs>
      <linearGradient id="logo-mark-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="40" height="40" rx="10" fill="url(#logo-mark-bg)" />
    <rect x="8" y="24" width="24" height="4" rx="2" fill="#ffffff" />
    <rect x="11" y="17" width="18" height="4" rx="2" fill="#ffffff" />
    <rect x="14" y="10" width="12" height="4" rx="2" fill="#ffffff" />
    <circle cx="29" cy="8" r="2.6" fill="#22d3ee" />
  </svg>
);

interface LogoProps {
  size?: number;
  className?: string;
  wordmarkClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className, wordmarkClassName }) => (
  <div className={cn('flex items-center gap-3', className)}>
    <LogoMark size={size} />
    <span className={cn('font-bold gradient-text', wordmarkClassName)}>StackCendra</span>
  </div>
);
