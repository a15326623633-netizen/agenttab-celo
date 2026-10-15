# AgentTab × x402: pay-per-call stablecoin rails for AI agents on Celo

> Built for the Celo **Agents on Open Rails** hackathon (Track 2 · USA₮ with x402). The code is chain-agnostic and also runs on Base.

AI agents can't sign up for subscriptions or manage API keys, but they can pay. This repo is a pay-per-call **FX-quote API (USD/BRL)** that agents pay for in stablecoins on **two rails**:

| Rail | Endpoint | How it pays | Best for |
|---|---|---|---|
| **x402 `exact`** | `GET /x402/quote` | The agent signs an EIP-3009 `transferWithAuthorization`. Celo's hosted x402 facilitator verifies it and settles it onchain, paying the gas, so the buyer needs no gas. Uses the official `@x402/hono`, `@x402/fetch` and `@x402/evm` v2 packages. | One-off calls, new counterparties |
| **AgentTab channel** | `GET /tab/quote` | The agent escrows stablecoins once in `AgentTab.sol` and signs an EIP-712 voucher (cumulative amount) per call. The provider batch-settles every N calls, and the unspent balance refunds after expiry. | High-frequency repeat flow between the same agent and provider |

```
agent ──GET──▶ provider ──402 (price, rails)──▶ agent
  ├─ x402:     sign EIP-3009 ─▶ provider ─▶ Celo x402 facilitator /verify + /settle ─▶ USA₮ transfer onchain
  └─ AgentTab: open(deposit) once ─▶ N × signed vouchers ─▶ provider settle() every N calls ─▶ onchain
```

## Repository layout
| Path | What |
|---|---|
| `src/AgentTab.sol` | Escrow channel with EIP-712 vouchers, no dependencies |
| `src/MockUSAT.sol` | **Test-only** USA₮ stand-in (EIP-3009, domain `Tether America USD`/`1`) |
| `src/MockStable.sol` | Test-only mintable token |
| `test/` | Foundry tests |
| `script/Deploy.s.sol` | Deploys AgentTab and the mocks |
| `agent/src/provider.ts` | Seller (Hono): x402 middleware, AgentTab route, demo page, `/events` |
| `agent/src/buyer.ts` | Paying agent for both rails |
| `agent/src/facilitator.ts` | Optional local x402 facilitator (official `@x402/core` + `@x402/evm`) for offline dev |
| `agent/web/index.html` | Demo page: 402 → paid calls → channel → settlements, with explorer links |
| `scripts/` | Demo and deploy scripts, plus env examples for Celo mainnet and Base Sepolia |

## Quick start
```bash
git clone --recursive <repo> && cd celo-agent
forge test                         # 5 tests
cd agent && npm i && cd ..
scripts/local-demo.sh              # anvil + local facilitator; open http://127.0.0.1:8402 and click "Run agent"
```

## Celo Sepolia with the official facilitator
`scripts/testnet-official.sh` uses `https://api.x402.sepolia.celo.org`. Put your facilitator API key in `.x402-key` (gitignored). The script expects wallets in `.throwaway-wallet.json` (payer) and `.throwaway-wallet-2.json` (payee), also gitignored. The testnet facilitator supports **USDC only** (`0x01C5C0122039549AD1493B8220cABEdD739BC44E`); get it from https://faucet.circle.com.

> The x402 payee must differ from the payer: the facilitator refuses self-transfers.

### Recorded run (2026-10-15)
- AgentTab: [`0xEB7e800db1a5029160AA1f93a06db1EB118e0F74`](https://celo-sepolia.blockscout.com/address/0xEB7e800db1a5029160AA1f93a06db1EB118e0F74)
- x402 settlements (official facilitator, 0.01 USDC each): [1](https://celo-sepolia.blockscout.com/tx/0xcbb74916241f319861aae55ab00a08c043166ea146e3620274023c7a692fb63d) · [2](https://celo-sepolia.blockscout.com/tx/0x91de7707b2f50255d5eb3b08c5d2e3bbb76bb36fa58b477c39664132514c15b7) · [3](https://celo-sepolia.blockscout.com/tx/0x2112049ce29c2393904a24d1e8aeee891363a18b8c54e69094c95c8ece03bba6)
- AgentTab: [approve](https://celo-sepolia.blockscout.com/tx/0xe7743ecf34fae762bd765e9cd2431953529ae8c031e11ccc21993a2f2cf150f1) · [open](https://celo-sepolia.blockscout.com/tx/0xe7d8383c83474bc0c1c81d595520aa440beee5ca240b2e3b6baa13f86c857f19) · [settle 1–5](https://celo-sepolia.blockscout.com/tx/0xea37e03cd0e25af4c1ff1c0e8245637f5ebe52c8ce3f680b71fc0b49097b0ee0) · [settle 6–10](https://celo-sepolia.blockscout.com/tx/0x1af0868800e8690a78d4d8d3ef656061c697bbff9dd0d53c43abfed9c4391374)

## Celo mainnet (USA₮)
Copy `scripts/mainnet.env.example`. It sets the facilitator to `https://api.x402.celo.org` and the asset to USA₮ `0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771` (6 decimals, EIP-712 `Tether America USD`/`1`). Deploy **AgentTab only** and never set `MINT_MOCK`.

## Base Sepolia (reuse)
`scripts/deploy-base-sepolia.sh` and `scripts/base-sepolia.env.example` cover this: `NETWORK=base-sepolia`, Base Sepolia USDC, and the public x402.org facilitator.

## Why USA₮
It is a regulated USD and EIP-3009 native (gasless for the payer), and on Celo it is claimable with Self proof-of-human. Repeat agent↔provider flow is what the hackathon scores and what AgentTab makes cheap.

## Security notes
- No secrets are in the repo. Keys come from gitignored files or env vars, and the local demo uses anvil's public dev mnemonic.
- `AgentTab` is unaudited hackathon code.

---

## 中文简介
**AgentTab × x402**：给 AI 代理用的按次付费稳定币收款方案，部署在 Celo 上。
- **x402 按次付费**：代理对每次调用签一个 EIP-3009 授权，由 Celo 官方 x402 结算服务提交上链，代理不需要 gas。
- **AgentTab 通道**：代理先存一次押金，之后每次调用签一张链下凭证，服务方批量在链上结算。适合同一个代理和服务方之间的高频重复交易。

已在 Celo Sepolia 上用官方结算服务跑通，交易链接见上文。主网换成 USA₮，Base 只需改配置即可复用。
