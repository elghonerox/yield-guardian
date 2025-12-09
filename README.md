# Yield Guardian

An autonomous AI agent that optimizes DeFi yields across multiple protocols. Built for the IQAI Agent Arena Hackathon using ADK-TS.

## What It Does

Yield Guardian monitors yield opportunities across Aave, Compound, Frax, and Yearn, then automatically rebalances your positions to maximize returns while managing risk. Think of it as a robo-advisor for DeFi that actually understands gas costs and won't move your money unless it makes financial sense.

The agent runs continuously, checking rates every few minutes and making decisions based on:
- APY differences between protocols
- Gas costs for transactions
- Risk exposure across protocols
- Time to break even on gas fees

## Why I Built This

During the hackathon, I kept thinking about how fragmented DeFi yield optimization is. You'd need to:
- Check 4+ protocols manually
- Calculate gas costs in your head
- Hope you timed the rebalance right
- Worry about concentration risk

I wanted something that just... handles it. So I built Yield Guardian using IQAI's ADK-TS framework to create an autonomous agent that makes these decisions for you.

## Tech Stack

**Backend (Agent Server)**
- ADK-TS - IQAI's agent framework for autonomous operations
- Fastify - Fast, low-overhead API server
- TypeScript - Because type safety matters when handling money
- Prisma - Type-safe database ORM
- Vitest - Modern testing framework

**Frontend (Dashboard)**
- Next.js 14 - React framework with App Router
- TypeScript - Consistency across stack
- Tailwind CSS - Fast styling without context switching

## Project Structure

```
yield-guardian/
├── apps/
│   ├── agent-server/          # Autonomous agent backend
│   │   ├── src/
│   │   │   ├── agent/         # ADK-TS agent implementation
│   │   │   ├── protocols/     # Protocol adapters (Aave, Compound, etc.)
│   │   │   ├── risk/          # Risk management system
│   │   │   ├── middleware/    # Security & rate limiting
│   │   │   └── validation/    # Request validation
│   │   └── test/              # 167 tests (99.4% pass rate)
│   └── web/                   # Next.js dashboard
└── packages/
    └── shared/                # Shared types
```

## Quick Start

**Prerequisites**
- Node.js 18+
- PostgreSQL (or use Railway/Supabase free tier)
- Ethereum RPC endpoint (Infura/Alchemy free tier works)

**Backend Setup**

```bash
cd apps/agent-server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values:
# DATABASE_URL="postgresql://..."
# ETHEREUM_RPC_URL="https://..."
# API_KEY="your-secret-key"

# Setup database
npx prisma db push

# Run tests (should see 167 passing)
npm test

# Start server
npm run dev
```

Server runs on `http://localhost:3001`

**Frontend Setup**

```bash
cd apps/web
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL="http://localhost:3001"

# Start dev server
npm run dev
```

Dashboard runs on `http://localhost:3000`

## How It Works

### The Autonomous Loop

The agent runs a continuous monitoring cycle:

1. **Monitor** - Fetch current APYs from all protocols
2. **Analyze** - Calculate risk-adjusted returns
3. **Decide** - Determine if rebalancing is profitable
4. **Execute** - Move funds if it makes sense

The decision logic is pretty straightforward:
- APY gain must be ≥0.5%
- Gas costs must be recovered within 30 days
- Result in lower or equal risk exposure

### ADK-TS Integration

I used IQAI's ADK-TS framework for the agent architecture. The `AgentBuilder` pattern from ADK-TS handles:
- Agent initialization and lifecycle
- Configuration management
- Autonomous operation scheduling

```typescript
// Core agent implementation using ADK-TS
const agentBuilder = new AgentBuilder()
    .withName('Yield Guardian')
    .withDescription('Multi-protocol yield optimizer')
    .withVersion('1.0.0');

const agent = new YieldGuardianAgent(agentBuilder);
await agent.initialize();
await agent.start();
```

The agent extends ADK's base capabilities with domain-specific logic for yield optimization and risk management.

## API Endpoints

**Control Plane**
- `POST /api/v1/control/start` - Start autonomous operation
- `POST /api/v1/control/stop` - Stop the agent
- `GET /api/v1/status` - Agent status and metrics
- `GET /api/v1/risk` - Current risk profile

**Yield Data**
- `GET /api/v1/yields/:asset` - All yields for asset
- `GET /api/v1/yields/:asset/best` - Highest APY
- `GET /api/v1/protocols/compare/:asset` - Protocol comparison
- `POST /api/v1/rebalance/check` - Rebalance recommendation

All state-changing endpoints require API key authentication.

## Testing

I ended up writing 167 tests to make sure this thing actually works. Coverage is around 85%, which I'm pretty happy with for a hackathon project.

```bash
# Run all tests
npm test

# Watch mode during development
npm run test:watch

# Coverage report
npm run test:coverage
```

Tests cover:
- Protocol adapters (mocked external calls)
- Yield aggregation logic
- Risk calculation
- Rebalancing decision engine
- API endpoints (integration tests)

## Security

Given this would handle real money, I spent time on security:

- **Rate Limiting** - Per-endpoint limits (300/min reads, 10/min writes)
- **Input Validation** - Zod schemas for all requests
- **CSRF Protection** - Token-based protection for the dashboard
- **CSP Headers** - Content Security Policy to prevent XSS
- **API Authentication** - Required for all control endpoints
- **Error Handling** - Sanitized error messages in production

The frontend also implements HSTS, X-Frame-Options, and other security headers.

## Current Limitations

This is a hackathon project, so there are some shortcuts:

- **Mock Data** - Protocol adapters return mock yield data (integration guide exists in `/docs`)
- **No Real Transactions** - Blockchain integration is stubbed out
- **Single Asset** - Currently optimized for stablecoins (USDC)
- **No Alert System** - Email/Telegram alerts are planned but not implemented

The architecture is there to add these features. I documented the approach in `docs/PROTOCOL_SDK_INTEGRATION.md`.

## What I Learned

Building this in 4 weeks taught me:
- ADK-TS is actually well-designed for autonomous agents
- Gas cost calculation is trickier than I thought
- You can never have too many tests when dealing with money
- Next.js middleware is perfect for security headers

The risk management piece was the hardest part. Balancing yield maximization with risk limits required a lot of iteration.

## Deployment

**Production Stack**
- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL

Environment variables needed:
- `DATABASE_URL` - PostgreSQL connection string
- `ETHEREUM_RPC_URL` - Ethereum RPC endpoint
- `API_KEY` - Secret key for authentication
- `NEXT_PUBLIC_API_URL` - Backend URL for frontend

## Future Work

If I continue this after the hackathon:

1. Real protocol integrations via SDKs
2. Multi-chain support (Polygon, Arbitrum)
3. More sophisticated risk models
4. Transaction execution with proper gas optimization
5. Alert system for significant changes
6. Historical performance tracking

## Contributing

This was built for a hackathon, but PRs are welcome if you want to improve it.

## License

MIT

## Acknowledgments

- Thanks to IQAI for ADK-TS and hosting the hackathon
- Frax Finance and KRWQ for sponsorship
- The DeFi protocols (Aave, Compound, Frax, Yearn) for building great infrastructure

Built with Intetion and determination during the IQAI Agent Arena Hackathon (Nov 10 - Dec 9, 2025).
