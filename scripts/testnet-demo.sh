#!/usr/bin/env bash
# Celo Sepolia demo using ONLY the throwaway wallet in .throwaway-wallet.json (needs testnet CELO from the faucet).
# One key plays deployer, facilitator, provider and agent (fine for a demo; split keys for production).
set -e; export PATH=$HOME/.foundry/bin:$PATH; cd "$(dirname "$0")/.."
PK=$(python3 -c "import json;print(json.load(open('.throwaway-wallet.json'))['data'][0]['private_key'])")
export RPC_URL=https://forno.celo-sepolia.celo-testnet.org EXPLORER=https://celo-sepolia.blockscout.com/tx/; RPC=$RPC_URL; unset FACILITATOR_URL
OUT=$(forge script script/Deploy.s.sol --rpc-url $RPC --private-key $PK --broadcast --slow)
echo "$OUT" | rg "AgentTab|MockStable|MockUSAT" | tee deployments.celo-sepolia.txt
export AGENT_TAB=$(echo "$OUT"|awk '/AgentTab/{print $2}') USAT=$(echo "$OUT"|awk '/MockUSAT/{print $2}') MINT_MOCK=1 CALLS=${CALLS:-10}
cd agent
FACILITATOR_PK=$PK npx tsx src/facilitator.ts & sleep 3
PROVIDER_PK=$PK AGENT_PK=$PK npx tsx src/provider.ts > ../demo-run.celo-sepolia.log & sleep 3
curl -s -XPOST localhost:8402/demo/run; echo; echo "Watching http://127.0.0.1:8402 ... tx log in demo-run.celo-sepolia.log"
wait
