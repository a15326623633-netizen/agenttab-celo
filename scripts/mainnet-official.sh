#!/usr/bin/env bash
# Celo MAINNET via the OFFICIAL x402 facilitator (USD₮). Keys read from gitignored files, never printed.
set -e; cd "$(dirname "$0")/../agent"
export NETWORK=mainnet RPC_URL=https://forno.celo.org EXPLORER=https://celoscan.io/tx/
export FACILITATOR_URL=https://api.x402.celo.org X402_API_KEY="${X402_API_KEY:-$(cat ../.x402-key)}"
export USAT=0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e ASSET_NAME="Tether USD" ASSET_VERSION=1   # Celo mainnet USD₮
export PAY_TO=$(python3 -c "import json;print(json.load(open('../.mainnet-payee-wallet.json'))['data'][0]['address'] if 'data' in json.load(open('../.mainnet-payee-wallet.json')) else '')")
export AGENT_TAB=${MAINNET_AGENT_TAB:-0x3667A1e0786ea7dbDfB807833e7B8ac65894aCcB} CALLS=${CALLS:-5} PRICE=${PRICE:-10000}
PK=$(python3 -c "import json;print(json.load(open('../.mainnet-wallet.json'))['data'][0]['private_key'])")
PROVIDER_PK=$PK AGENT_PK=$PK npx tsx src/provider.ts > ../demo-run.mainnet.log 2>&1 & sleep 5
[ -z "$NO_AUTORUN" ] && curl -s -XPOST localhost:8402/demo/run; echo; wait
