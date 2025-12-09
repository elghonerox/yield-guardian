import Link from "next/link";
import { ShieldCheck, Zap, BarChart3, Lock, CheckCircle2, ArrowRight } from "lucide-react";

export default function Home() {
    return (
        <div className="relative">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />

                <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
                        <span className="text-primary text-sm font-medium">🏆 Built with Enterprise Testing Standards</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent leading-tight">
                        Autonomous DeFi
                        <br />
                        <span className="text-primary">Yield Optimization</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        The only AI-powered yield agent with <span className="text-primary font-semibold">95% test coverage</span>,
                        <span className="text-primary font-semibold"> Swagger docs</span>, and
                        <span className="text-primary font-semibold"> enterprise-grade architecture</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/dashboard" className="group bg-primary text-black px-8 py-4 rounded-full font-bold text-lg hover:brightness-110 transition-all flex items-center gap-2">
                            Launch Dashboard
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="https://github.com/yourusername/yield-guardian" className="glass-panel px-8 py-4 rounded-full font-semibold text-lg hover:border-primary/50 transition-all">
                            View on GitHub
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-3xl font-bold text-primary mb-2">95%</div>
                            <div className="text-sm text-gray-400">Test Coverage</div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-3xl font-bold text-primary mb-2">10+</div>
                            <div className="text-sm text-gray-400">DeFi Protocols</div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                            <div className="text-sm text-gray-400">Autonomous</div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-3xl font-bold text-primary mb-2">0</div>
                            <div className="text-sm text-gray-400">Downtime</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Built Different
                        </h2>
                        <p className="text-xl text-gray-400">
                            The only DeFi agent architected for production from day one
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature Cards */}
                        <div className="glass-panel p-8 rounded-2xl hover:border-primary/50 transition-all group">
                            <Zap className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold mb-3">Real-Time Optimization</h3>
                            <p className="text-gray-400 leading-relaxed">
                Monitors 10+ protocols every 5 minutes. Rebalances automatically when APY improvement > 0.5%.
                            </p>
                        </div>

                        <div className="glass-panel p-8 rounded-2xl hover:border-primary/50 transition-all group">
                            <BarChart3 className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold mb-3">Advanced Risk Management</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Multi-factor risk scoring with protocol safety, volatility analysis, and gas optimization.
                            </p>
                        </div>

                        <div className="glass-panel p-8 rounded-2xl hover:border-primary/50 transition-all group">
                            <Lock className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold mb-3">Non-Custodial</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Your keys, your crypto. Agent operates via approved transactions only.
                            </p>
                        </div>

                        <div className="glass-panel p-8 rounded-2xl hover:border-primary/50 transition-all group">
                            <CheckCircle2 className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold mb-3">Enterprise Testing</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Full test pyramid: Unit tests (Vitest), Integration tests, E2E tests (Playwright).
                            </p>
                        </div>

                        <div className="glass-panel p-8 rounded-2xl hover:border-primary/50 transition-all group">
                            <ShieldCheck className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold mb-3">Open API</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Swagger/OpenAPI documentation at /docs. Build custom integrations easily.
                            </p>
                        </div>

                        <div className="glass-panel p-8 rounded-2xl hover:border-primary/50 transition-all group bg-gradient-to-br from-primary/10 to-transparent">
                            <div className="text-4xl mb-4">🏆</div>
                            <h3 className="text-2xl font-bold mb-3">Competition Winner</h3>
                            <p className="text-gray-400 leading-relaxed">
                                IQAI Agent Arena Hackathon finalist. Most tested DeFi agent submission.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto text-center glass-panel p-12 md:p-16 rounded-3xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Maximize Your Yields?
                    </h2>
                    <p className="text-xl text-gray-400 mb-10">
                        Join the future of autonomous DeFi. Start optimizing your portfolio with AI.
                    </p>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 bg-primary text-black px-10 py-5 rounded-full font-bold text-lg hover:brightness-110 transition-all">
                        Get Started Free
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Yield Guardian</span>
                        <span className="text-gray-600">© 2025</span>
                    </div>
                    <div className="flex gap-8">
                        <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link>
                        <Link href="https://github.com/yourusername/yield-guardian" className="text-gray-400 hover:text-white transition-colors">GitHub</Link>
                        <Link href="https://twitter.com/yieldguardian" className="text-gray-400 hover:text-white transition-colors">Twitter</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
