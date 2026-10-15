# Submission: Agents on Open Rails (Track 2 · USA₮ with x402)

**Project:** AgentTab × x402: pay-per-call stablecoin rails for AI agents

**One-liner:** An FX-quote API that AI agents pay per call on Celo. They use x402 `exact` through Celo's official facilitator for one-off calls, and an AgentTab payment channel for high-frequency repeat flow that is batch-settled onchain.

**Problem:** Agents need to buy data and compute per request. Subscriptions and API keys don't fit machines. Pure per-call payment works for occasional use, but repeat traffic between the same two parties needs a cheaper path.

**Solution**
1. The provider answers `402 Payment Required` with its price and the rails it accepts.
2. **x402 rail:** the agent signs an EIP-3009 authorization, and Celo's facilitator verifies and settles it gaslessly (official `@x402/*` v2 packages).
3. **AgentTab rail:** the agent escrows once and signs an EIP-712 voucher per call. The provider settles every N calls, and unspent funds refund after expiry.
4. A live demo page shows every step with explorer links.

**Why USA₮:** a regulated dollar, gasless for the payer via EIP-3009, and claimable with Self proof-of-human. Our repeat-flow channel matches the track's "recurring payments between the same two parties" criterion.

**Testnet proof (Celo Sepolia, official facilitator `api.x402.sepolia.celo.org`, USDC)**
- AgentTab: https://celo-sepolia.blockscout.com/address/0xEB7e800db1a5029160AA1f93a06db1EB118e0F74
- x402 settlements:
  - https://celo-sepolia.blockscout.com/tx/0xcbb74916241f319861aae55ab00a08c043166ea146e3620274023c7a692fb63d
  - https://celo-sepolia.blockscout.com/tx/0x91de7707b2f50255d5eb3b08c5d2e3bbb76bb36fa58b477c39664132514c15b7
  - https://celo-sepolia.blockscout.com/tx/0x2112049ce29c2393904a24d1e8aeee891363a18b8c54e69094c95c8ece03bba6
- Channel open: https://celo-sepolia.blockscout.com/tx/0xe7d8383c83474bc0c1c81d595520aa440beee5ca240b2e3b6baa13f86c857f19
- Batch settles:
  - https://celo-sepolia.blockscout.com/tx/0xea37e03cd0e25af4c1ff1c0e8245637f5ebe52c8ce3f680b71fc0b49097b0ee0
  - https://celo-sepolia.blockscout.com/tx/0x1af0868800e8690a78d4d8d3ef656061c697bbff9dd0d53c43abfed9c4391374

**Mainnet (USA₮):** AgentTab `<TBD>` · x402 settlement txs `<TBD>` · volume / repeat-flow stats `<TBD>`

**Repo:** `<GitHub URL>` · **Demo video:** `<URL>` · **Live demo:** `<URL>` · **Team:** `<name / X / GitHub>`

**Next:** wBRL/wARS routes via Permit2 (Track 1), Textile FX pricing for the quote feed, and a Base deployment (config already included).
