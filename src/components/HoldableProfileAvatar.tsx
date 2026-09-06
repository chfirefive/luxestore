"use client";

import { useHoldToPortal } from '@/hooks/useHoldToPortal';
import { useRouter } from 'next/navigation';

interface HoldableProfileAvatarProps {
  initial: string;
  size?: number; // default 36
  displayName?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function HoldableProfileAvatar({
  initial,
  size = 36,
  displayName = '',
  className = '',
  style = {},
}: HoldableProfileAvatarProps) {
  const router = useRouter();
  const { isHolding, holdProgress, bind } = useHoldToPortal({
    onNormalClick: () => router.push('/shop/profile'),
  });

  const radius = (size / 2) + 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <div
      {...bind}
      title={displayName ? `Profile: ${displayName}\n💡 Click for Account Profile\n⚡ Hold to open Owner & Buyer Card Portal` : 'Click for Profile • Hold for Owner & Buyer Portal'}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        ...style,
      }}
      className={className}
    >
      {/* SVG Progress Ring (Visible while holding) */}
      <svg
        style={{
          position: 'absolute',
          top: -5,
          left: -5,
          width: size + 10,
          height: size + 10,
          pointerEvents: 'none',
          transform: 'rotate(-90deg)',
          opacity: isHolding ? 1 : 0,
          transition: 'opacity 0.15s ease',
          zIndex: 10,
        }}
      >
        <circle
          cx={(size + 10) / 2}
          cy={(size + 10) / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="3"
        />
        <circle
          cx={(size + 10) / 2}
          cy={(size + 10) / 2}
          r={radius}
          fill="none"
          stroke="url(#portalGradient)"
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="portalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Avatar Circle */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: isHolding
            ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
            : 'linear-gradient(135deg, var(--primary), #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 800,
          fontSize: `${Math.max(13, size * 0.42)}px`,
          fontFamily: 'inherit',
          boxShadow: isHolding
            ? '0 0 20px rgba(236, 72, 153, 0.8)'
            : '0 2px 10px rgba(99,102,241,0.5)',
          border: '2px solid rgba(255,255,255,0.2)',
          flexShrink: 0,
          transform: isHolding ? 'scale(1.12)' : 'scale(1)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease',
        }}
      >
        {initial.toUpperCase()}
      </div>

      {/* Floating Hold Tooltip */}
      {isHolding && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(99,102,241,0.4)',
            color: '#f8fafc',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          ⚡ Opening Owner Portal…
        </div>
      )}
    </div>
  );
}
