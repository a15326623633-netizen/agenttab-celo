# Demo video script (~2.5 min)

0:00–0:15 **Hook.** "AI agents can't sign up for API keys. On Celo they just pay per call in USA₮."
0:15–0:40 **Problem/architecture.** Slide: agent → 402 → x402 facilitator (one-off) or AgentTab channel (repeat flow) → Celo.
0:40–1:00 **402 quote.** Terminal: `curl -i /x402/quote` shows 402 and the PAYMENT-REQUIRED offer (USA₮, 0.01).
1:00–1:30 **x402 rail.** Click "Run agent" on the demo page. Three x402 paid calls go through; open one tx on Celoscan and show the USA₮ transfer agent → provider, gas paid by the facilitator.
1:30–2:05 **AgentTab rail.** Channel open tx, then 10 voucher-paid calls that are instant and off-chain, then batch settle txs every 5 calls; open one on Celoscan.
2:05–2:25 **Why it matters.** Repeat flow at low cost, refund on expiry, no custody on the x402 rail, USA₮ claimable with Self.
2:25–2:40 **Close.** Mainnet volume stats, repo link, what's next (wBRL/wARS, Base).
