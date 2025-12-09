"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Calendar, Zap } from "lucide-react";

interface PortfolioStats {
    totalValue: string;
    currentAPY: number;
    projectedMonthly: string;
    projectedYearly: string;
    totalGains: string;
    daysSinceDeposit: number;
}

export function PortfolioTracker() {
    const [stats, setStats] = useState<PortfolioStats>({
        totalValue: "0",
        currentAPY: 0,
        projectedMonthly: "0",
        projectedYearly: "0",
        totalGains: "0",
        daysSinceDeposit: 0,
    });

    useEffect(() => {
        // TODO: Fetch real portfolio data from backend
        // For now, use demo data
        setStats({
            totalValue: "5247.83",
            currentAPY: 4.2,
            projectedMonthly: "18.37",
            projectedYearly: "220.41",
            totalGains: "47.83",
            daysSinceDeposit: 7,
        });
    }, []);

    return (
        <div className="space-y-6">
            {/* Main Portfolio Value */}
            <div className="glass-panel p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent">
                <div className="text-sm text-gray-400 mb-2">Total Portfolio Value</div>
                <div className="text-5xl font-bold text-white mb-4">
                    ${stats.totalValue}
                </div>
                <div className="flex items-center gap-2 text-green-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-lg font-semibold">
                        +${stats.totalGains} ({((parseFloat(stats.totalGains) / (parseFloat(stats.totalValue) - parseFloat(stats.totalGains))) * 100).toFixed(2)}%)
                    </span>
                </div>
                <div className="text-sm text-gray-400 mt-2">
                    {stats.daysSinceDeposit} days active
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-primary" />
                        <span className="text-sm text-gray-400">Current APY</span>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                        {stats.currentAPY.toFixed(2)}%
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm text-gray-400">Monthly Projection</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                        +${stats.projectedMonthly}
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-gray-400">Yearly Projection</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                        +${stats.projectedYearly}
                    </div>
                </div>
            </div>

            {/* Yield Projection Calculator */}
            <div className="glass-panel p-6 rounded-2xl">
                <h4 className="font-semibold mb-4">What if you had deposited earlier?</h4>
                <div className="space-y-3">
                    {[
                        { period: "30 days ago", gain: 86.25 },
                        { period: "90 days ago", gain: 258.75 },
                        { period: "1 year ago", gain: 1035.00 },
                    ].map(({ period, gain }) => (
                        <div key={period} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-300">{period}</span>
                            <span className="text-green-400 font-semibold">
                                +${gain.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-sm text-gray-400">
                    Based on current APY of {stats.currentAPY}% across all protocols
                </div>
            </div>
        </div>
    );
}
