// components/magicui/meteors.tsx
"use client";

import { cn } from "@/lib/utils";
import React, { useMemo } from "react";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export const Meteors = ({ number = 20, className }: MeteorsProps) => {
  const meteors = useMemo(() => {
    return [...new Array(number)].map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 1) + 1,
      top: Math.floor(Math.random() * 100),
      left: Math.floor(Math.random() * 100),
      // Increased duration for slower animation (3-6 seconds)
      duration: Math.floor(Math.random() * 3000) + 3000,
      // More spread out delays (0-15 seconds)
      delay: Math.floor(Math.random() * 15000),
    }));
  }, [number]);

  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none", className)}>
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="absolute h-0.5 w-[3px] bg-white rounded-[50%]"
          style={{
            top: `${meteor.top}%`,
            left: `${meteor.left}%`,
            boxShadow: "0 0 0 1px #ffffff10",
            transform: "rotate(215deg)",
            animation: `meteor ${meteor.duration}ms linear ${meteor.delay}ms infinite`,
          }}
        >
          <span 
            className="absolute top-1/2 -translate-y-1/2 left-0 w-[70px] h-[1px]"
            style={{
              background: "linear-gradient(90deg, #ffffff, transparent)",
              opacity: 0.4,
            }}
          />
        </span>
      ))}

      <style jsx global>{`
        @keyframes meteor {
          0% {
            transform: rotate(215deg) translateX(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: rotate(215deg) translateX(-900px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};