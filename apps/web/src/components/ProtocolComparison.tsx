"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Protocol {
    protocol: string;
    asset: string;
    apy: number;
    tvl: string;
    riskScore: number;
    lastUpdated: Date;
}

interface ProtocolComparisonProps {
    asset: string;
}

export function ProtocolComparison({ asset }: ProtocolComparisonProps) {
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/v1/yields/${asset}`)
            .then(res => res.json())
            .then(data => {
                setProtocols(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [asset]);

    if (loading) {
        return (
            <div className="glass-panel p-6 rounded-2xl">
                <div className="animate-pulse">Loading protocols...</div>
            </div>
        );
    }

    const bestApy = protocols[0]?.apy || 0;

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Protocol Comparison - {asset}</h3>
            </div>

            <div className="space-y-4">
                {protocols.map((protocol, idx) => {
                    const isBest = idx === 0;
                    const apyDiff = protocol.apy - bestApy;

                    return (
                        <div
                            key={protocol.protocol}
                            className={`p-4 rounded-xl border transition-all ${isBest
                                    ? "bg-primary/10 border-primary/50"
                                    : "border-white/10 hover:border-white/20"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-lg">{protocol.protocol}</h4>
                                        {isBest && (
                                            <span className="px-2 py-0.5 bg-primary text-black text-xs font-bold rounded-full">
                                                BEST
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                        TVL: ${(parseInt(protocol.tvl) / 1e9).toFixed(2)}B
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-primary">
                                        {protocol.apy.toFixed(2)}%
                                    </div>
                                    <div className="text-xs text-gray-400">APY</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">Risk Score:</span>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${protocol.riskScore < 20
                                                ? "bg-green-500/20 text-green-400"
                                                : protocol.riskScore < 40
                                                    ? "bg-yellow-500/20 text-yellow-400"
                                                    : "bg-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {protocol.riskScore}/100
                                    </span>
                                </div>

                                {!isBest && apyDiff < 0 && (
                                    <div className="flex items-center gap-1 text-sm text-red-400">
                                        <TrendingDown className="w-4 h-4" />
                                        {Math.abs(apyDiff).toFixed(2)}% lower
                                    </div>
                                )}
                            </div>

                            {/* APY Bar */}
                            <div className="mt-3 bg-white/5 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-primary h-full transition-all duration-500"
                                    style={{ width: `${(protocol.apy / bestApy) * 100}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-xl">
                <div className="text-sm text-gray-400 mb-2">Average APY across protocols:</div>
                <div className="text-2xl font-bold text-white">
                    {(protocols.reduce((sum, p) => sum + p.apy, 0) / protocols.length).toFixed(2)}%
                </div>
            </div>
        </div>
    );
}
