"use client";

import { useState } from "react";
import { ProtocolComparison } from "@/components/ProtocolComparison";
import { PortfolioTracker } from "@/components/PortfolioTracker";
import { RiskDial } from "@/components/RiskDial";
import { Terminal } from "@/components/Terminal";
import { ShieldCheck, Wallet, Play, Square } from "lucide-react";
import { api } from "@/lib/api";
import { AgentStatus } from "@yield-guardian/shared";

export default function Dashboard() {
    const [status, setStatus] = useState<AgentStatus | null>(null);
    const [logs, setLogs] = useState<string[]>(["System initialized."]);
    const [riskScore, setRiskScore] = useState(24);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState("USDC");

    const handleStart = async () => {
        try {
            setLogs(prev => [...prev, "Initiating autonomous sequence..."]);
            await api.startAgent();
            setLogs(prev => [...prev, "Agent process started."]);
        } catch (err) {
            setLogs(prev => [...prev, "Error starting agent."]);
        }
    };

    const handleStop = async () => {
        await api.stopAgent();
        setLogs(prev => [...prev, "Agent stopped."]);
    };

    return (
        <div className="min-h-screen p-8 lg:p-12 max-w-[1800px] mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-10 h-10 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tighter">Yield Guardian Dashboard</h1>
                        <p className="text-sm text-gray-500">Autonomous Portfolio Management</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsConnected(!isConnected)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${isConnected
                            ? "bg-primary/20 text-primary border border-primary/50"
                            : "bg-white text-black hover:bg-gray-200"
                        }`}
                >
                    <Wallet className="w-4 h-4" />
                    {isConnected ? "0x71C...9A21" : "Connect Wallet"}
                </button>
            </header>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column: Portfolio & Controls */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Agent Controls */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-lg font-semibold text-gray-300">Agent Status</h2>
                            <span className={`text-sm px-3 py-1 rounded-full ${status?.isRunning ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                                }`}>
                                {status?.isRunning ? "ACTIVE" : "IDLE"}
                            </span>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={handleStart}
                                disabled={!isConnected || status?.isRunning}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-black py-3 rounded-xl font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Play className="w-4 h-4" /> Start
                            </button>
                            <button
                                onClick={handleStop}
                                disabled={!isConnected || !status?.isRunning}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 text-red-400 border border-red-500/50 py-3 rounded-xl font-bold hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Square className="w-4 h-4" /> Stop
                            </button>
                        </div>

                        <div className="flex items-center justify-center">
                            <RiskDial score={riskScore} />
                        </div>
                    </div>

                    {/* Portfolio Tracker */}
                    <PortfolioTracker />
                </div>

                {/* Middle & Right Columns: Protocol Comparison & Terminal */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Asset Selector */}
                    <div className="flex gap-3">
                        {["USDC", "USDT", "DAI", "WETH"].map((asset) => (
                            <button
                                key={asset}
                                onClick={() => setSelectedAsset(asset)}
                                className={`px-6 py-2 rounded-full font-semibold transition-all ${selectedAsset === asset
                                        ? "bg-primary text-black"
                                        : "glass-panel hover:border-primary/50"
                                    }`}
                            >
                                {asset}
                            </button>
                        ))}
                    </div>

                    {/* Protocol Comparison */}
                    <ProtocolComparison asset={selectedAsset} />

                    {/* Terminal */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold mb-4">Agent Activity Log</h3>
                        <Terminal logs={logs} />
                    </div>
                </div>
            </div>
        </div>
    );
}
