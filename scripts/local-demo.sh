#!/usr/bin/env bash
# Full local demo on anvil (chainId 11142220 = Celo Sepolia id). Uses anvil's public dev keys only.
set -e; export PATH=$HOME/.foundry/bin:$PATH; cd "$(dirname "$0")/.."
MN="test test test test test test test test test test test junk"   # anvil's public dev mnemonic (no real funds)
K0=$(cast wallet private-key --mnemonic "$MN" --mnemonic-index 0)   # deployer + facilitator
K1=$(cast wallet private-key --mnemonic "$MN" --mnemonic-index 1)   # agent (buyer)
K2=$(cast wallet private-key --mnemonic "$MN" --mnemonic-index 2)   # provider (seller)
anvil --chain-id 11142220 --silent & sleep 2
OUT=$(forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --private-key $K0 --broadcast)
export AGENT_TAB=$(echo "$OUT"|awk '/AgentTab/{print $2}') USAT=$(echo "$OUT"|awk '/MockUSAT/{print $2}')
export RPC_URL=http://127.0.0.1:8545 EXPLORER="local:" MINT_MOCK=1
cd agent
FACILITATOR_PK=$K0 npx tsx src/facilitator.ts & sleep 3
PROVIDER_PK=$K2 AGENT_PK=$K1 npx tsx src/provider.ts & sleep 3
echo "Open http://127.0.0.1:8402 and click Run, or: curl -XPOST localhost:8402/demo/run"
wait
