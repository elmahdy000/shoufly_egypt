"use client";

import { useEffect, useState } from "react";

const CONFETTI_COLORS = ['#FF6B00', '#000000', '#E5E7EB', '#3B82F6'] as const;

function seededUnit(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function SuccessConfetti() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setActive(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: CONFETTI_COLORS[Math.floor(seededUnit(i, 1) * CONFETTI_COLORS.length)],
            top: '-10%',
            left: `${seededUnit(i, 2) * 100}%`,
            transform: `rotate(${seededUnit(i, 3) * 360}deg)`,
            animation: `confetti-fall ${2 + seededUnit(i, 4) * 3}s linear forwards`,
            animationDelay: `${seededUnit(i, 5) * 2}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
