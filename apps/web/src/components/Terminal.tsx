
"use client";

import { useEffect, useRef } from "react";

export function Terminal({ logs }: { logs: string[] }) {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="bg-black/80 font-mono text-sm p-4 rounded-lg border border-white/10 h-64 overflow-y-auto shadow-inner">
            <div className="flex flex-col space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className="text-green-400">
                        <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                        {log}
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
}
