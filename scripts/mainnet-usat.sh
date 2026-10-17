#!/usr/bin/env bash
# Celo MAINNET run settling in USA₮ (Tether America USD, 0xD2ab…F771) via the official x402 facilitator.
# Needs: ~0.1 USA₮ in the buyer wallet (Google Cloud Web3 faucet + Self, or a ~$1 swap), gitignored wallet files,
# .x402-key, and ATTRIBUTION_CODE from your Loops House entry. Costs real money: run only with approval.
set -e; cd "$(dirname "$0")/../agent"
export NETWORK=mainnet RPC_URL=https://forno.celo.org EXPLORER=https://celoscan.io/tx/
export FACILITATOR_URL=https://api.x402.celo.org X402_API_KEY="${X402_API_KEY:-$(cat ../.x402-key)}"
export USAT=0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771 ASSET_NAME="Tether America USD" ASSET_VERSION=1
export PAY_TO=$(python3 -c "import json;print(json.load(open('../.mainnet-payee-wallet.json'))['data'][0]['address'])")
export AGENT_TAB=${MAINNET_AGENT_TAB:-0x3667A1e0786ea7dbDfB807833e7B8ac65894aCcB} CALLS=${CALLS:-5} PRICE=${PRICE:-10000}
PK=$(python3 -c "import json;print(json.load(open('../.mainnet-wallet.json'))['data'][0]['private_key'])")
PROVIDER_PK=$PK AGENT_PK=$PK npx tsx src/provider.ts > ../demo-run.mainnet-usat.log 2>&1 & sleep 5
[ -z "$NO_AUTORUN" ] && curl -s -XPOST localhost:8402/demo/run; echo; wait
