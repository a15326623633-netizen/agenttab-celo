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

**USA₮ mainnet run with attribution tag `celo_58c4cb758f93` (2026-10-17, USA₮ `0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771`).** Tagged = ERC-8021 suffix verified in calldata; x402 settlements are facilitator-submitted (credited by PayTo).
- ERC-8004 registration (Agent ID **9965**, tagged): https://celoscan.io/tx/0x86a6c24d49571510bcac9846d01429539b20e03764abb32724fff9c18ca5037a
- Funding: 1 USD₮ → 1.000131 USA₮ on Uniswap v3 (0.01% pool), approve https://celoscan.io/tx/0x83c72cdbd69adff7599fba9b5623851a7e8d63d698751017ea3735fe5cc8f3ca · swap https://celoscan.io/tx/0x9aac2e6f01fbbdd12904ca4dd8910717c2465441b4636d56e13b7c479279abd0 (both tagged)
- x402 settlements in USA₮ (0.01 each): https://celoscan.io/tx/0xefe8e046aed059675e0ead3290ef2bc2f997121379483dbdbe49c7fce07d4663 · https://celoscan.io/tx/0x79e2197d131cbd92e2681901334942ecec0fedb2c3908ff84130d349a77b8638 · https://celoscan.io/tx/0x9474d01c7e6ef33aba2f487cd951baecee0c1ce24d1ea357720c6b0c432e793f
- AgentTab approve (tagged): https://celoscan.io/tx/0x5a3d09b21604226ee40284ee8bcf616096e52c5e69477f09bba12b53f13ed725
- Channel open (tagged): https://celoscan.io/tx/0x9d412efc484cfcb099c27c4629bfffd5dc4c789c518aeaf7e759a3d4e4582f5e
- Batched settle of 5 vouchers (tagged): https://celoscan.io/tx/0xc6b91763fd7bd7e58e8c6f6edef8ebcd47a2901015a07279167d7619f68d1de7
- Log: [demo-run.mainnet-usat.log](demo-run.mainnet-usat.log)

**Earlier mainnet proof (Celo, chainId 42220, official facilitator `api.x402.celo.org`, USD₮ `0x48065fbB…3D5e`). This was a pre-tag demo run between our own wallets; the tagged USA₮ run is above.**
- AgentTab (source verified): https://celoscan.io/address/0x3667A1e0786ea7dbDfB807833e7B8ac65894aCcB
- Deploy: https://celoscan.io/tx/0xef6a533e93c3b3d4eac7da6bcb5617587d1ab40d1ce0119d184d70fc7b6437e7
- x402 settlements (0.01 each, gasless for buyer):
  - https://celoscan.io/tx/0x0d687d37bd35337f08c7c854ad58599ef3ead9ace1b2f2d3764641f61d8e6b5e
  - https://celoscan.io/tx/0x11ef46123164620b749a4c7dd99be5818e31ea610b850df8bfcdd2a2829bb1e0
  - https://celoscan.io/tx/0x3a77c9c8cb7394e106f66fc0430229ff01ca7fe9bc4f207d699acd9d189d87ed
- Approve: https://celoscan.io/tx/0x0c9e13f183d3444d9adb47802575086dec506d90c126e9ca78f90acc31cf7c82
- Channel open (tab #1, 0.05 deposit): https://celoscan.io/tx/0xd43696999695f841144339b964063b00d50e20bb63537869ec4da7a76ce86eca
- One batched settle of 5 EIP-712 vouchers: https://celoscan.io/tx/0x764854a9a25b3e92b5a84446eec731524ad53bf9f9d85694e70a9e1be8b684a9
- Result: 8 paid calls, 5 txs that move value. Details are in [MAINNET_RUN.md](MAINNET_RUN.md).

## Demo walkthrough (about 2 min)
1. `forge test`: 5 tests pass (batched settle, bad-signature and stale-voucher reject, refund after expiry, top-up, EIP-3009 replay protection).
2. `scripts/local-demo.sh`, then open http://127.0.0.1:8402. This starts anvil, the local x402 facilitator and the provider.
3. Plain `GET /x402/quote` returns **402** with the price and both rails (`exact` x402 and AgentTab).
4. Click **Run agent**. The buyer pays 3 calls over x402: it signs EIP-3009, the facilitator verifies and settles, and each call returns a USD/BRL quote plus a tx link.
5. The buyer then opens an AgentTab channel (one deposit) and makes 5 calls on `GET /tab/quote`, each with a signed cumulative voucher and no tx per call.
6. The provider batch-settles the 5 vouchers in **one** onchain tx. The page's event log shows every step.
7. Show the same flow on mainnet: open the Celoscan links above, then run `scripts/mainnet-official.sh` (needs funded gitignored wallets and an x402 API key).

**Repo:** https://github.com/zwang1111/agenttab-celo · **Demo video:** https://github.com/zwang1111/agenttab-celo/blob/main/docs/demo.mp4 (upload to YouTube or Loom if the form wants a streaming link) · **Live demo:** https://htmlpreview.github.io/?https://github.com/zwang1111/agenttab-celo/blob/main/docs/index.html (or https://zwang1111.github.io/agenttab-celo/ once Pages is enabled) (static replay of the mainnet run; the interactive version is `scripts/local-demo.sh`) · **Team:** `<name / X / GitHub, to be filled in by the entrant>`

**Attribution / identity**
- ERC-8021 tag: `celo_58c4cb758f93` (= `codeFromRepo("zwang1111/agenttab-celo")`; replace it with the code Loops House issues) is appended to every AgentTab tx via `withAttribution`.
- x402 PayTo wallet (for crediting x402 settlements): `0x09423fBc6f3AD204d203360fA37a77F15fb7A58c`. AgentTab provider/agent wallet: `0xECd88362804889875A0086D7a15cCD2ff85aC156`.
- ERC-8004 Agent ID: **9965** (registry `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`, tx https://celoscan.io/tx/0x86a6c24d49571510bcac9846d01429539b20e03764abb32724fff9c18ca5037a); registration file: https://raw.githubusercontent.com/zwang1111/agenttab-celo/main/docs/agent.json
- Gas: the buyer pays no gas on x402 (the facilitator pays). AgentTab txs are self-paid.

**Next:** wBRL/wARS routes via Permit2 (Track 1), Textile FX pricing for the quote feed, and a Base deployment (config already included).
