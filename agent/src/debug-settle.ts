// Debug: sign one x402 exact payment and call the official facilitator /verify + /settle directly, printing the reason.
import { x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { privateKeyToAccount } from "viem/accounts";
const acct = privateKeyToAccount(process.env.AGENT_PK as `0x${string}`);
const payTo = process.env.PAY_TO ?? acct.address;
const req = { scheme: "exact", network: "eip155:11142220", asset: "0x01C5C0122039549AD1493B8220cABEdD739BC44E", amount: "10000", payTo,
  maxTimeoutSeconds: 300, extra: { name: "USDC", version: "2" } } as any;
const xc = new x402Client(); xc.register("eip155:*", new ExactEvmScheme(acct, { rpcUrl: "https://forno.celo-sepolia.celo-testnet.org" }) as any);
const payload = await (xc as any).createPaymentPayload({ x402Version: 2, resource: { url: "http://x/q", description: "d", mimeType: "application/json" }, accepts: [req] });
const h = { "X-API-Key": process.env.X402_API_KEY! };
const f = new HTTPFacilitatorClient({ url: "https://api.x402.sepolia.celo.org", createAuthHeaders: async () => ({ verify: h, settle: h, supported: h }) } as any);
console.log("payTo", payTo === acct.address ? "self" : "other");
console.log("verify", JSON.stringify(await f.verify(payload, req).catch((e: any) => String(e))));
console.log("settle", JSON.stringify(await f.settle(payload, req).catch((e: any) => String(e))));
