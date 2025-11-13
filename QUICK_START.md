# Quick Start Guide - YieldGuardian

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Ethereum wallet with testnet/mainnet access
- OpenAI API key (for AI features)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/yield-guardian.git
cd yield-guardian

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

## Configuration

Edit `.env` file with your configuration:

```env
# Agent Configuration
AGENT_NAME=YieldGuardian
AGENT_DESCRIPTION=Autonomous multi-protocol yield optimizer

# Blockchain Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here

# AI/ML Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Protocol Addresses (update with actual addresses)
FRAX_LENDING_POOL_ADDRESS=0x...
AAVE_LENDING_POOL_ADDRESS=0x...
COMPOUND_COMPTROLLER_ADDRESS=0x...

# Risk Configuration
MAX_RISK_EXPOSURE=0.8
MIN_YIELD_IMPROVEMENT=0.005
```

## Running the Agent

### Development Mode

```bash
npm run dev
```

This will:
- Start the agent in watch mode
- Automatically restart on code changes
- Show detailed logs

### Production Mode

```bash
# Build the project
npm run build

# Start the agent
npm start
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Monitoring

The agent will:
- Monitor yields across configured protocols
- Make autonomous optimization decisions
- Execute rebalancing transactions when beneficial
- Log all activities

Check logs for:
- Yield monitoring results
- Decision-making process
- Transaction executions
- Error messages

## Stopping the Agent

Press `Ctrl+C` to gracefully stop the agent. The agent will:
- Complete current operations
- Save state if needed
- Close connections properly

## Troubleshooting

### Agent won't start
- Check environment variables are set correctly
- Verify RPC URL is accessible
- Ensure private key is valid
- Check OpenAI API key is valid

### No transactions executed
- Verify wallet has sufficient balance for gas
- Check minimum yield improvement threshold
- Verify risk constraints are not too restrictive
- Ensure protocols are configured correctly

### Connection errors
- Verify RPC URL is correct and accessible
- Check network connectivity
- Verify API keys are valid

## Next Steps

- Read the [README.md](README.md) for detailed documentation
- Check [ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details
- Review [DEVELOPMENT.md](docs/DEVELOPMENT.md) for development journey
- See [ATP_LAUNCH_GUIDE.md](ATP_LAUNCH_GUIDE.md) for deployment

## Support

- GitHub Issues: [Create an issue](https://github.com/yourusername/yield-guardian/issues)
- Discord: [IQAI Discord](https://discord.gg/UbQaZkznwr)
- Documentation: See docs/ directory

