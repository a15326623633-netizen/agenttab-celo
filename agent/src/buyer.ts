// Paying agent: (1) x402 `exact` USA₮ per call via @x402/fetch, (2) AgentTab channel with signed vouchers.
import { createPublicClient, createWalletClient, http, parseEventLogs } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { chain, CAIP2, RPC, TAB, USAT, tabAbi, erc20Abi, types, domain } from "./common.js";

export type Log = (e: Record<string, unknown>) => void;
const decodeReceipt = (r: Response) => {
  const h = r.headers.get("payment-response") ?? r.headers.get("x-payment-response");
  try { return h ? JSON.parse(Buffer.from(h, "base64").toString()) : undefined; } catch { return undefined; }
};

export async function runBuyer(o: { base: string; pk: `0x${string}`; calls: number; mintMock: boolean; log: Log }) {
  const acct = privateKeyToAccount(o.pk);
  const pub = createPublicClient({ chain, transport: http(RPC) });
  const wal = createWalletClient({ account: acct, chain, transport: http(RPC) });
  const send = async (step: string, h: Promise<`0x${string}`>) => {
    const hash = await h; const rc = await pub.waitForTransactionReceipt({ hash }); o.log({ step, tx: hash, status: rc.status }); if (rc.status !== "success") throw new Error(`${step} reverted (insufficient token balance?)`); return rc;
  };
  if (o.mintMock) await send("mint mock USAT (test only)", wal.writeContract({ address: USAT, abi: erc20Abi, functionName: "mint", args: [acct.address, 5_000_000n] }));

  // ---- Rail 1: x402 exact (EIP-3009, gasless for buyer) ----
  const xc = new x402Client();
  xc.setSpendControls({ allowedAssets: [{ network: CAIP2, asset: USAT, maxAmountPerPayment: "100000" }], maxAmountPerPayment: "$1" } as any);
  xc.register("eip155:*", new ExactEvmScheme(acct, { rpcUrl: RPC }) as any);
  const payFetch = wrapFetchWithPayment(fetch, xc);
  const c402 = await fetch(`${o.base}/x402/quote`);
  o.log({ step: "x402 402 challenge", status: c402.status, body: c402.headers.get("payment-required") ? "PAYMENT-REQUIRED header" : await c402.text() });
  for (let i = 0; i < Math.min(o.calls, 3); i++) {
    const r = await payFetch(`${o.base}/x402/quote`);
    const rec = decodeReceipt(r);
    const pr = r.headers.get("payment-required");
    const why = pr ? (() => { try { return JSON.parse(Buffer.from(pr, "base64").toString()).error; } catch { return undefined; } })() : undefined;
    o.log({ step: `x402 paid call ${i + 1}`, status: r.status, tx: rec?.transaction, error: r.status === 200 ? undefined : (why ?? (await r.clone().text()).slice(0, 300)), data: await r.json().catch(() => null) });
  }

  // ---- Rail 2: AgentTab channel (one deposit, N off-chain vouchers, batched settle) ----
  const offer = await (await fetch(`${o.base}/tab/quote`)).json();
  o.log({ step: "AgentTab 402 offer", offer });
  const budget = BigInt(offer.price) * BigInt(o.calls);
  await send("approve AgentTab", wal.writeContract({ address: USAT, abi: erc20Abi, functionName: "approve", args: [TAB, budget] }));
  const rc = await send("open channel", wal.writeContract({ address: TAB, abi: tabAbi, functionName: "open", args: [offer.payTo, USAT, budget, BigInt(Math.floor(Date.now() / 1000) + 86400)] }));
  const tabId = (parseEventLogs({ abi: tabAbi, logs: rc.logs, eventName: "Opened" })[0] as any).args.id as bigint;
  let cum = 0n;
  for (let i = 0; i < o.calls; i++) {
    cum += BigInt(offer.price);
    const sig = await acct.signTypedData({ domain: domain(), types, primaryType: "Voucher", message: { tabId, cumulative: cum } });
    const r = await fetch(`${o.base}/tab/quote`, { headers: { "x-payment": JSON.stringify({ tabId: tabId.toString(), cumulative: cum.toString(), sig }) } });
    const j = await r.json().catch(() => null);
    o.log({ step: `tab paid call ${i + 1}`, status: r.status, voucher: cum.toString(), tx: j?.settleTx, data: j?.quote });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runBuyer({ base: process.env.API_BASE ?? "http://127.0.0.1:8402", pk: process.env.AGENT_PK as `0x${string}`,
    calls: Number(process.env.CALLS ?? 10), mintMock: !!process.env.MINT_MOCK, log: (e) => console.log(JSON.stringify(e)) });
}
