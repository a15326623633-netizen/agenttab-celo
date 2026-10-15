// Local x402 facilitator for dev/testnet with MockUSAT, built from the official @x402 packages
// (same `exact` EVM scheme / EIP-3009 path the hosted Celo facilitator runs). On mainnet use
// https://api.x402.celo.org instead (needs X402_API_KEY for /settle).
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { x402Facilitator } from "@x402/core/facilitator";
import { ExactEvmScheme } from "@x402/evm/exact/facilitator";
import { toFacilitatorEvmSigner } from "@x402/evm";
import { chain, CAIP2, RPC } from "./common.js";

const account = privateKeyToAccount(process.env.FACILITATOR_PK as `0x${string}`);
const client = createWalletClient({ account, chain, transport: http(RPC) }).extend(publicActions);
const signer = toFacilitatorEvmSigner({ ...(client as any), address: account.address });
const fac = new x402Facilitator().register(CAIP2, new ExactEvmScheme(signer));

const safe = (o: unknown) => JSON.parse(JSON.stringify(o, (_, v) => (typeof v === "bigint" ? v.toString() : v)));
const app = new Hono();
app.get("/supported", (c) => c.json(safe(fac.getSupported())));
app.post("/verify", async (c) => { const b = await c.req.json(); return c.json(safe(await fac.verify(b.paymentPayload, b.paymentRequirements))); });
app.post("/settle", async (c) => { const b = await c.req.json(); return c.json(safe(await fac.settle(b.paymentPayload, b.paymentRequirements))); });
serve({ fetch: app.fetch, port: Number(process.env.FACILITATOR_PORT ?? 4020) }, () => console.log("local x402 facilitator :4020 signer", account.address));
