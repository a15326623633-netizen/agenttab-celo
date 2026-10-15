# AgentTab on Celo MAINNET — real end-to-end run (2026-10-15, UTC+8)

- Network: Celo mainnet (chainId 42220), RPC https://forno.celo.org
- Facilitator: official `https://api.x402.celo.org` (API key, x402 v2, scheme `exact`, EIP-3009)
- Asset: USD₮ `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` (6 decimals, EIP-712 `Tether USD`/`1`)
- **AgentTab contract: [`0x3667A1e0786ea7dbDfB807833e7B8ac65894aCcB`](https://celoscan.io/address/0x3667A1e0786ea7dbDfB807833e7B8ac65894aCcB)** — source verified (Sourcify exact match; [Blockscout](https://celo.blockscout.com/address/0x3667A1e0786ea7dbDfB807833e7B8ac65894aCcB?tab=contract))
- Deployer / buyer agent / channel provider: `0xECd88362804889875A0086D7a15cCD2ff85aC156`
- x402 payee (separate wallet, facilitator rejects payer==payee): `0x09423fBc6f3AD204d203360fA37a77F15fb7A58c`
- Reproduce: `scripts/mainnet-official.sh` (keys read from gitignored files)

| Step | Amount | Tx |
|---|---|---|
| Deploy AgentTab | – | [0xef6a533e…](https://celoscan.io/tx/0xef6a533e93c3b3d4eac7da6bcb5617587d1ab40d1ce0119d184d70fc7b6437e7) |
| x402 paid call 1 (settled by official facilitator, gasless for buyer) | 0.01 USD₮ | [0x0d687d37…](https://celoscan.io/tx/0x0d687d37bd35337f08c7c854ad58599ef3ead9ace1b2f2d3764641f61d8e6b5e) |
| x402 paid call 2 | 0.01 USD₮ | [0x11ef4612…](https://celoscan.io/tx/0x11ef46123164620b749a4c7dd99be5818e31ea610b850df8bfcdd2a2829bb1e0) |
| x402 paid call 3 | 0.01 USD₮ | [0x3a77c9c8…](https://celoscan.io/tx/0x3a77c9c8cb7394e106f66fc0430229ff01ca7fe9bc4f207d699acd9d189d87ed) |
| approve AgentTab | 0.05 USD₮ | [0x0c9e13f1…](https://celoscan.io/tx/0x0c9e13f183d3444d9adb47802575086dec506d90c126e9ca78f90acc31cf7c82) |
| open channel (tab #1, 0.05 USD₮ deposit) | 0.05 USD₮ | [0xd4369699…](https://celoscan.io/tx/0xd43696999695f841144339b964063b00d50e20bb63537869ec4da7a76ce86eca) |
| 5 off-chain EIP-712 vouchers → one batched settle | 0.05 USD₮ | [0x764854a9…](https://celoscan.io/tx/0x764854a9a25b3e92b5a84446eec731524ad53bf9f9d85694e70a9e1be8b684a9) |

Result: 8 paid API calls, 3 x402 settlements via the official facilitator + 1 channel open + 1 batched settle (5 calls in one tx). On-chain tab #1: deposit 50000, claimed 50000.
Net spend: 0.03 USD₮ to the payee (the channel provider is the same demo wallet, so channel funds returned) and ~0.355 CELO gas (mostly deployment).
Balances after: main wallet 10.5174 CELO / 3.007856 USD₮; payee 0.03 USD₮.
