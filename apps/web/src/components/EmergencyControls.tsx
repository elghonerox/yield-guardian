"use client";

import { useState } from "react";
import { AlertTriangle, Power, Shield } from "lucide-react";

interface EmergencyControlsProps {
    totalValue: string;
    isAgentRunning: boolean;
    onEmergencyWithdraw: () => Promise<void>;
    onStopAgent: () => Promise<void>;
}

export function EmergencyControls({
    totalValue,
    isAgentRunning,
    onEmergencyWithdraw,
    onStopAgent,
}: EmergencyControlsProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEmergencyWithdraw = async () => {
        setLoading(true);
        try {
            await onEmergencyWithdraw();
            setShowConfirm(false);
        } catch (err) {
            console.error("Emergency withdraw failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border-red-500/50">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-xl font-bold text-red-400">Emergency Controls</h3>
            </div>

            <div className="space-y-4">
                {/* Emergency Withdraw */}
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="mb-3">
                        <div className="font-semibold text-white mb-1">Emergency Withdraw</div>
                        <div className="text-sm text-gray-400">
                            Immediately withdraw all funds to your wallet. Agent will be stopped.
                        </div>
                    </div>

                    {!showConfirm ? (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="w-full bg-red-500/20 text-red-400 border border-red-500/50 py-3 rounded-xl font-bold hover:bg-red-500/30 transition-all"
                        >
                            Emergency Withdraw
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-sm text-yellow-400 font-semibold mb-2">
                                ⚠️ Confirm: Withdraw ${totalValue}?
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEmergencyWithdraw}
                                    disabled={loading}
                                    className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:brightness-110 disabled:opacity-50 transition-all"
                                >
                                    {loading ? "Withdrawing..." : "Confirm Withdraw"}
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    disabled={loading}
                                    className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20 disabled:opacity-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stop Agent */}
                <div className="p-4 bg-white/5 rounded-xl">
                    <div className="mb-3">
                        <div className="font-semibold text-white mb-1 flex items-center gap-2">
                            <Power className="w-4 h-4" />
                            Stop Autonomous Trading
                        </div>
                        <div className="text-sm text-gray-400">
                            Stop the agent without withdrawing funds. You can restart later.
                        </div>
                    </div>

                    <button
                        onClick={onStopAgent}
                        disabled={!isAgentRunning}
                        className="w-full bg-gray-500/20 text-gray-300 border border-gray-500/50 py-3 rounded-xl font-bold hover:bg-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isAgentRunning ? "Stop Agent" : "Agent Not Running"}
                    </button>
                </div>

                {/* Safety Information */}
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                    <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-primary mt-0.5" />
                        <div className="text-sm text-gray-300">
                            <div className="font-semibold text-primary mb-1">Your funds are safe</div>
                            <ul className="space-y-1 text-xs">
                                <li>• Non-custodial: You control your keys</li>
                                <li>• Emergency withdraw bypasses agent logic</li>
                                <li>• Funds are never locked</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
