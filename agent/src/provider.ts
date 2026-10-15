// Seller: FX-quote API sold on two rails —
//   GET /x402/quote : x402 `exact` in USA₮ via an x402 facilitator (Celo hosted on mainnet, local for dev)
//   GET /tab/quote  : AgentTab channel vouchers, batch-settled onchain every SETTLE_EVERY calls
// Also serves the demo page (/), an event log (/events) and a local-only demo trigger (POST /demo/run).
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { readFileSync } from "node:fs";
import { createPublicClient, createWalletClient, http, verifyTypedData, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { chain, CAIP2, RPC, TAB, USAT, USAT_EXTRA, FACILITATOR_URL, EXPLORER, tabAbi, types, domain } from "./common.js";
import { runBuyer } from "./buyer.js";

const PRICE = BigInt(process.env.PRICE ?? "10000"); // 0.01 USA₮
const SETTLE_EVERY = Number(process.env.SETTLE_EVERY ?? 5);
const acct = privateKeyToAccount(process.env.PROVIDER_PK as `0x${string}`);
const pub = createPublicClient({ chain, transport: http(RPC) });
const wal = createWalletClient({ account: acct, chain, transport: http(RPC) });
const events: Record<string, unknown>[] = [];
const log = (e: Record<string, unknown>) => { const x = { t: Date.now(), ...e }; events.push(x); console.log(JSON.stringify(x)); };
const quote = () => ({ pair: "USD/BRL", rate: +(5.4 + Math.random() / 10).toFixed(4), ts: Date.now() });

const facilitator = new HTTPFacilitatorClient({
  url: FACILITATOR_URL,
  createAuthHeaders: async () => { const h = process.env.X402_API_KEY ? { "X-API-Key": process.env.X402_API_KEY } : {}; return { verify: h, settle: h, supported: h }; },
} as any);
const server = new x402ResourceServer(facilitator).register("eip155:*", new ExactEvmScheme());
const routes = {
  "GET /x402/quote": {
    accepts: [{ scheme: "exact", network: CAIP2, payTo: getAddress(process.env.PAY_TO ?? acct.address), price: { amount: PRICE.toString(), asset: USAT, extra: USAT_EXTRA } }],
    description: "USD/BRL FX quote, 0.01 USA₮ per call",
  },
} as any;

const app = new Hono();
app.get("/", (c) => c.html(readFileSync(new URL("../web/index.html", import.meta.url), "utf8")));
app.get("/events", (c) => c.json({ explorer: EXPLORER, events }));
app.get("/config", (c) => c.json({ chainId: chain.id, tab: TAB, usat: USAT, facilitator: FACILITATOR_URL, provider: acct.address, price: PRICE.toString() }));
app.post("/demo/run", async (c) => {
  if (!process.env.AGENT_PK) return c.json({ error: "AGENT_PK not set" }, 400);
  events.length = 0;
  runBuyer({ base: `http://127.0.0.1:${PORT}`, pk: process.env.AGENT_PK as `0x${string}`, calls: Number(process.env.CALLS ?? 10), mintMock: !!process.env.MINT_MOCK,
    log: (e) => log({ side: "agent", ...e }) }).catch((err) => log({ side: "agent", error: String(err) }));
  return c.json({ started: true });
});
app.use(async (c, next) => { await next(); if (c.req.path.startsWith("/x402") && c.res.status === 402 && c.req.header("payment-signature") ) { const h = c.res.headers.get("payment-required"); try { log({ side: "provider", step: "x402 rejected", error: JSON.parse(Buffer.from(h!, "base64").toString()).error }); } catch {} } });
app.use(paymentMiddleware(routes, server));
app.get("/x402/quote", (c) => { log({ side: "provider", step: "x402 served", rail: "x402" }); return c.json({ quote: quote() }); });

const latest = new Map<string, { cum: bigint; n: number }>();
app.get("/tab/quote", async (c) => {
  const v = c.req.header("x-payment");
  if (!v) return c.json({ scheme: "agenttab", contract: TAB, chainId: chain.id, token: USAT, payTo: acct.address, price: PRICE.toString() }, 402);
  const { tabId, cumulative, sig } = JSON.parse(v);
  // public RPCs behind load balancers can lag a block right after `open`; retry briefly
  let row = await pub.readContract({ address: TAB, abi: tabAbi, functionName: "tabs", args: [BigInt(tabId)] });
  for (let i = 0; i < 10 && row[3] === 0n; i++) { await new Promise((r) => setTimeout(r, 1000)); row = await pub.readContract({ address: TAB, abi: tabAbi, functionName: "tabs", args: [BigInt(tabId)] }); }
  const [payer, provider, , deposit] = row;
  const prev = latest.get(tabId)?.cum ?? 0n; const cum = BigInt(cumulative);
  const ok = getAddress(provider) === acct.address && cum - prev >= PRICE && cum <= deposit &&
    (await verifyTypedData({ address: payer, domain: domain(), types, primaryType: "Voucher", message: { tabId: BigInt(tabId), cumulative: cum }, signature: sig }));
  if (!ok) return c.json({ error: "invalid voucher" }, 402);
  const n = (latest.get(tabId)?.n ?? 0) + 1; latest.set(tabId, { cum, n });
  let settleTx: string | undefined;
  if (n % SETTLE_EVERY === 0) {
    settleTx = await wal.writeContract({ address: TAB, abi: tabAbi, functionName: "settle", args: [BigInt(tabId), cum, sig] });
    await pub.waitForTransactionReceipt({ hash: settleTx as `0x${string}` });
    log({ side: "provider", step: `batch settle ${n} calls`, tx: settleTx, cumulative: cum.toString() });
  }
  return c.json({ quote: quote(), settleTx });
});

const PORT = Number(process.env.PORT ?? 8402);
serve({ fetch: app.fetch, port: PORT }, () => console.log(`provider :${PORT} as ${acct.address}, facilitator ${FACILITATOR_URL}`));
