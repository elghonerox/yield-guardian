
"use client";

import { motion } from "framer-motion";

export function RiskDial({ score }: { score: number }) {
    // Score 0-100. low = safe, high = risky.
    // 0-30 green, 31-70 yellow, 71-100 red.

    const color = score < 30 ? "#10B981" : score < 70 ? "#F59E0B" : "#EF4444";

    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-800"
                />
                <motion.circle
                    initial={{ strokeDasharray: "0 1000" }}
                    animate={{ strokeDasharray: `${score * 5.5} 1000` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    cx="96"
                    cy="96"
                    r="88"
                    stroke={color}
                    strokeWidth="12"
                    fill="transparent"
                    strokeLinecap="round"
                    className="text-primary"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-white">{score}</span>
                <span className="text-xs text-gray-400 uppercase tracking-widest">Risk Score</span>
            </div>
        </div>
    );
}
