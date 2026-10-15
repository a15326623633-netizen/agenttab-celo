#!/usr/bin/env bash
# Deploy AgentTab to Base Sepolia (chainId 84532). Needs Base Sepolia ETH on the deployer.
# Usage: DEPLOYER_PK=0x... scripts/deploy-base-sepolia.sh   (or use --account <keystore> instead)
set -e; cd "$(dirname "$0")/.."
forge create src/AgentTab.sol:AgentTab --rpc-url base_sepolia --private-key "${DEPLOYER_PK:?set DEPLOYER_PK}" --broadcast
