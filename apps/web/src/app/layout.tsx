import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "Yield Guardian | Enterprise DeFi Yield Optimization",
    description: "Autonomous AI agent for multi-protocol DeFi yield optimization. Built with ADK-TS, tested with enterprise-grade standards.",
    keywords: ["DeFi", "Yield Optimization", "AI Agent", "ADK-TS", "Ethereum"],
    openGraph: {
        title: "Yield Guardian",
        description: "The only DeFi agent with enterprise-grade testing",
        type: "website",
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${outfit.variable} font-sans bg-space text-white antialiased`}>
                <nav className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <span className="font-bold text-lg">Yield Guardian</span>
                        </Link>
                        <div className="flex gap-6 items-center">
                            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                            <Link href="/docs" className="hover:text-primary transition-colors">Docs</Link>
                            <Link href="https://github.com/yourusername/yield-guardian" className="hover:text-primary transition-colors" target="_blank">GitHub</Link>
                            <Link href="/dashboard" className="bg-primary text-black px-5 py-2 rounded-full font-semibold hover:brightness-110 transition-all">
                                Launch App
                            </Link>
                        </div>
                    </div>
                </nav>
                {children}
            </body>
        </html>
    );
}
