"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface RiskBreakdownProps {
    totalScore: number;
    breakdown: {
        protocolRisk: number;
        concentration: number;
    };
    positions: Array<{
        protocol: string;
        percentage: number;
    }>;
}

export function RiskBreakdown({ totalScore, breakdown, positions }: RiskBreakdownProps) {
    const riskLevel =
        totalScore < 30 ? "LOW" : totalScore < 50 ? "MEDIUM" : "HIGH";

    const riskColor =
        riskLevel === "LOW"
            ? "text-green-400"
            : riskLevel === "MEDIUM"
                ? "text-yellow-400"
                : "text-red-400";

    const riskBg =
        riskLevel === "LOW"
            ? "bg-green-500/20 border-green-500/50"
            : riskLevel === "MEDIUM"
                ? "bg-yellow-500/20 border-yellow-500/50"
                : "bg-red-500/20 border-red-500/50";

    const RiskIcon =
        riskLevel === "LOW"
            ? CheckCircle
            : riskLevel === "MEDIUM"
                ? AlertTriangle
                : XCircle;

    // Pie chart data
    const pieData = positions.map((p, idx) => ({
        name: p.protocol,
        value: p.percentage,
        color: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"][idx % 4],
    }));

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Risk Analysis</h3>
            </div>

            {/* Overall Risk Score */}
            <div className={`p-6 rounded-xl border mb-6 ${riskBg}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-400 mb-1">Portfolio Risk Score</div>
                        <div className={`text-4xl font-bold ${riskColor}`}>{totalScore}/100</div>
                        <div className="flex items-center gap-2 mt-2">
                            <RiskIcon className={`w-5 h-5 ${riskColor}`} />
                            <span className={`font-semibold ${riskColor}`}>{riskLevel} RISK</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Classification</div>
                        <div className="text-lg font-semibold text-white mt-1">
                            {riskLevel === "LOW" && "Conservative"}
                            {riskLevel === "MEDIUM" && "Balanced"}
                            {riskLevel === "HIGH" && "Aggressive"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Protocol Risk</div>
                    <div className="text-2xl font-bold text-white">{breakdown.protocolRisk}</div>
                    <div className="text-xs text-gray-500 mt-1">Smart contract + audit</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Concentration Risk</div>
                    <div className="text-2xl font-bold text-white">{breakdown.concentration}</div>
                    <div className="text-xs text-gray-500 mt-1">Portfolio diversity</div>
                </div>
            </div>

            {/* Protocol Allocation (Pie Chart) */}
            <div>
                <h4 className="font-semibold mb-4">Protocol Allocation</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1a1a1a",
                                border: "1px solid #333",
                                borderRadius: "8px",
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Risk Recommendations */}
            <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-xl">
                <div className="text-sm font-semibold text-primary mb-2">💡 Recommendations</div>
                <ul className="text-sm text-gray-300 space-y-1">
                    {totalScore > 50 && (
                        <li>• Consider reducing exposure to higher-risk protocols</li>
                    )}
                    {breakdown.concentration > 15 && (
                        <li>• Diversify across more protocols to reduce concentration risk</li>
                    )}
                    {totalScore < 30 && (
                        <li>• Your portfolio is well-balanced with low risk exposure</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
