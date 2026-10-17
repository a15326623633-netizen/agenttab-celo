import { defineChain, getAddress } from "viem";
import { codeFromRepo, withAttribution } from "@celo/attribution-tags";
import { celo, baseSepolia } from "viem/chains";
export const celoSepolia = defineChain({
  id: 11142220, name: "Celo Sepolia", nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: { default: { http: [process.env.RPC_URL ?? "https://forno.celo-sepolia.celo-testnet.org"] } },
});
const NET = process.env.NETWORK ?? "testnet"; // testnet (Celo Sepolia) | mainnet (Celo) | base-sepolia
export const chain = NET === "mainnet" ? celo : NET === "base-sepolia" ? baseSepolia : celoSepolia;
export const CAIP2 = `eip155:${chain.id}` as `eip155:${number}`;
// USA₮ on Celo mainnet (EIP-3009, domain "Tether America USD"/"1"); locally/testnet we use MockUSAT with the same domain.
export const USAT_MAINNET = "0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771";
export const USAT = getAddress(process.env.USAT ?? USAT_MAINNET);
export const USAT_EXTRA = { name: process.env.ASSET_NAME ?? "Tether America USD", version: process.env.ASSET_VERSION ?? "1" };
export const FACILITATOR_URL = process.env.FACILITATOR_URL ??
  (NET === "mainnet" ? "https://api.x402.celo.org" : NET === "base-sepolia" ? "https://x402.org/facilitator" : "http://127.0.0.1:4020");
export const RPC = process.env.RPC_URL ?? chain.rpcUrls.default.http[0];
export const EXPLORER = process.env.EXPLORER ?? (NET === "mainnet" ? "https://celoscan.io/tx/" : NET === "base-sepolia" ? "https://sepolia.basescan.org/tx/" : "https://celo-sepolia.blockscout.com/tx/");
export const TAB = (process.env.AGENT_TAB ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const types = { Voucher: [{ name: "tabId", type: "uint256" }, { name: "cumulative", type: "uint256" }] } as const;
export const domain = () => ({ name: "AgentTab", version: "1", chainId: chain.id, verifyingContract: TAB });
export const tabAbi = [
  { type: "function", name: "open", stateMutability: "nonpayable", inputs: [{ name: "provider", type: "address" }, { name: "token", type: "address" }, { name: "amount", type: "uint128" }, { name: "expiry", type: "uint64" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "settle", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }, { name: "cumulative", type: "uint128" }, { name: "sig", type: "bytes" }], outputs: [] },
  { type: "function", name: "tabs", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ name: "payer", type: "address" }, { name: "provider", type: "address" }, { name: "token", type: "address" }, { name: "deposit", type: "uint128" }, { name: "claimed", type: "uint128" }, { name: "expiry", type: "uint64" }] },
  { type: "event", name: "Opened", inputs: [{ name: "id", type: "uint256", indexed: true }, { name: "payer", type: "address", indexed: true }, { name: "provider", type: "address", indexed: true }, { name: "token", type: "address", indexed: false }, { name: "amount", type: "uint256", indexed: false }, { name: "expiry", type: "uint64", indexed: false }] },
] as const;
export const erc20Abi = [
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "mint", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [] },
] as const;
// ERC-8021 attribution tag (Agents on Open Rails leaderboard). The hackathon platform derives the code from the
// GitHub repo slug; override with ATTRIBUTION_CODE if Loops House issues a different one. Every wallet client is
// extended with withAttribution(), so every AgentTab tx (approve/open/settle) carries the suffix.
// x402 settlements are sent by Celo's facilitator and cannot carry a tag: they are credited via the PayTo address.
export const REPO_SLUG = process.env.REPO_SLUG ?? "zwang1111/agenttab-celo";
export const ATTRIBUTION_CODE = process.env.ATTRIBUTION_CODE ?? codeFromRepo(REPO_SLUG);
if (!process.env.ATTRIBUTION_CODE_ALLOW_MISMATCH && ATTRIBUTION_CODE !== codeFromRepo(REPO_SLUG))
  console.warn(`[attribution] ${ATTRIBUTION_CODE} != codeFromRepo(${REPO_SLUG}); set ATTRIBUTION_CODE_ALLOW_MISMATCH=1 if Loops issued it`);
export const attribution = () => withAttribution(ATTRIBUTION_CODE);
