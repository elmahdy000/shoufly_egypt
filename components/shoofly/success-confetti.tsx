"use client";

import { useEffect, useState } from "react";

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
            backgroundColor: ['#FF6B00', '#000000', '#E5E7EB', '#3B82F6'][Math.floor(Math.random() * 4)],
            top: '-10%',
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `confetti-fall ${2 + Math.random() * 3}s linear forwards`,
            animationDelay: `${Math.random() * 2}s`
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
