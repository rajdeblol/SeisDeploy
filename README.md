# Seismic Testnet Contract Deployer

Production-ready single-page contract deployer built with Next.js 14 App Router, TypeScript, Tailwind CSS, ethers.js v5, shadcn-style UI components, and next-themes.

## Network

- Chain ID: `5124` (`0x1404`)
- RPC: `https://gcp-1.seismictest.net/rpc`
- Explorer: `https://seismic-testnet.socialscan.io`
- Faucet: `https://community-faucet.seismictest.net/`

## Features

- MetaMask connect + auto network switch/add for Seismic Testnet
- Wallet address, copy, balance refresh, faucet hint for low balance
- Live network health card (block polling every 10s)
- Deploy from bytecode with optional ABI
- Constructor args form auto-generated from ABI constructor inputs
- Raw JSON args fallback when ABI is absent
- Deployment gas estimate (`eth_estimateGas`)
- Transaction log with timestamp/type/message
- Result card with contract address, tx hash, explorer links, copy actions
- Dark/light mode toggle (dark default)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run locally:

```bash
npm run dev
```

3. Open `http://localhost:3000`

4. In MetaMask, connect/switch to Seismic Testnet when prompted.

## Build and Run Production

```bash
npm run build
npm run start
```

## Getting Compiled Bytecode with `sforge`

Use Seismic's forge tooling (`sforge`) to compile your contract and extract deploy bytecode.

Example flow:

```bash
# compile
sforge build

# inspect artifact JSON (path depends on your project)
cat out/MyContract.sol/MyContract.json
```

Find the `bytecode.object` field in the artifact JSON and paste it into the app's **Bytecode** tab.

If you also paste the artifact `abi` array into the **ABI** tab, constructor fields are auto-generated.

## Notes

- This app is fully client-side (no API routes, no backend).
- Uses ethers.js v5 only (no wagmi/viem).
- Verification button is currently a placeholder for future explorer integration.
