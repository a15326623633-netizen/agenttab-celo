#!/usr/bin/env bash
# Celo Sepolia via the OFFICIAL hosted x402 facilitator (USDC only on testnet). Key read from .x402-key, never printed.
set -e; cd "$(dirname "$0")/../agent"
export NETWORK=testnet RPC_URL=https://forno.celo-sepolia.celo-testnet.org EXPLORER=https://celo-sepolia.blockscout.com/tx/
export FACILITATOR_URL=https://api.x402.sepolia.celo.org X402_API_KEY="$(cat ../.x402-key)"
export USAT=0x01C5C0122039549AD1493B8220cABEdD739BC44E ASSET_NAME=USDC ASSET_VERSION=2   # Celo Sepolia USDC
export PAY_TO=$(python3 -c "import json;print(json.load(open('../.throwaway-wallet-2.json'))['data'][0]['address'])")  # x402 payee must differ from payer
export AGENT_TAB=${SEPOLIA_AGENT_TAB:-0xEB7e800db1a5029160AA1f93a06db1EB118e0F74} CALLS=${CALLS:-3}
PK=$(python3 -c "import json;print(json.load(open('../.throwaway-wallet.json'))['data'][0]['private_key'])")
PROVIDER_PK=$PK AGENT_PK=$PK npx tsx src/provider.ts > ../demo-run.official-sepolia.log 2>&1 & sleep 4
curl -s -XPOST localhost:8402/demo/run; echo; wait
