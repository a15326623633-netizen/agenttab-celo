#!/usr/bin/env python3
"""Render a silent captioned demo video from slides, real run logs and screenshots of the replay page.
Same method as legal-cre: PIL slides -> ffmpeg concat. Usage: scripts/render-video.py [out.mp4]"""
import os, subprocess, sys, textwrap, json
from PIL import Image, ImageDraw, ImageFont
OUT = sys.argv[1] if len(sys.argv) > 1 else "docs/demo.mp4"
W, H = 1920, 1080; D = "video-build"; os.makedirs(D, exist_ok=True)
F = "/usr/share/fonts/truetype/dejavu/"
big, mid, small, mono = (ImageFont.truetype(F + n, s) for n, s in [("DejaVuSans-Bold.ttf", 68), ("DejaVuSans.ttf", 38), ("DejaVuSans.ttf", 33), ("DejaVuSansMono.ttf", 25)])
YEL = (252, 255, 82)
ev = json.load(open("docs/mainnet-run.json"))
def fmt(e):
    s = f"{e['side']:<8} {e.get('step','')}" + (f" [{e['status']}]" if e.get("status") else "")
    if e.get("voucher"): s += f"  voucher Σ={int(e['voucher'])/1e6:.2f}"
    if e.get("tx"): s += f"  tx {e['tx'][:18]}…"
    return s[:118]
runlog = [fmt(e) for e in ev]
forge = [l.rstrip() for l in open("runs/forge-test-20261017.txt") if "PASS" in l or "passed" in l]
attr = [l.rstrip()[:118] for l in open("runs/attribution-local-check.txt")]
def caption(d, text):
    d.rectangle([0, H - 150, W, H], fill=(0, 0, 0))
    for i, c in enumerate(textwrap.wrap(text, 95)[:3]): d.text((80, H - 135 + i * 42), c, font=small, fill=YEL)
def slide(name, title, lines=(), cap="", code=False, bg=(11, 15, 12)):
    im = Image.new("RGB", (W, H), bg); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 10], fill=YEL); d.text((80, 50), title, font=big, fill=YEL if not code else "white"); y = 170
    for l in lines:
        col = (150, 255, 170) if ("PASS" in l or "success" in l or "celo_" in l) else (158, 203, 255) if l.startswith("agent") else (184, 245, 176) if l.startswith("provider") else (225, 230, 240)
        d.text((90, y), l, font=mono if code else mid, fill=col if code else (225, 230, 240)); y += 34 if code else 60
    caption(d, cap); p = f"{D}/{name}.png"; im.save(p); return p
def shot(name, src, cap):
    im = Image.open(src).convert("RGB").resize((W, H)); d = ImageDraw.Draw(im); caption(d, cap); p = f"{D}/{name}.png"; im.save(p); return p
S = [
 (slide("01", "AgentTab × x402 on Celo", ["AI agents pay per call for an FX-quote API, in stablecoins", "", "Celo · Agents on Open Rails · Open Corridors: USA₮ with x402", "", "Rail 1: x402 'exact' via Celo's hosted facilitator (one-off calls)", "Rail 2: AgentTab channel, EIP-712 vouchers, batched settle (repeat flow)", "", "Live on Celo mainnet · AgentTab 0x3667…aCcB (verified)"],
   "AI agents can't sign up for API keys or subscriptions, but they can pay. On Celo they pay per call in dollar stablecoins."), 16),
 (slide("02", "The problem", ["• Agents buy data and compute per request", "• API keys and subscriptions are built for humans, not machines", "• Pure per-call onchain payment is fine once, wasteful at high frequency", "• Repeat flow between the same agent and provider needs a cheaper path", "• Dollar settlement should be regulated, gasless for the payer, fast"],
   "Per-call payment works for occasional use, but repeat traffic between the same two parties needs a cheaper path."), 20),
 (slide("03", "Architecture", ["agent ──GET /x402/quote──▶ provider ──402 (price, rails)──▶ agent", "  ├─ x402: sign EIP-3009 ─▶ provider ─▶ api.x402.celo.org /verify + /settle", "  │        ─▶ stablecoin transfer onchain, gas paid by the facilitator", "  └─ AgentTab: open(deposit) once ─▶ N × signed vouchers (off-chain)", "           ─▶ provider settle() every N calls ─▶ one onchain tx", "", "Every AgentTab tx carries an ERC-8021 attribution tag", "ERC-8004 identity file: docs/agent.json"],
   "The provider answers 402 with both rails. One-off calls go through Celo's facilitator; repeat flow uses an escrow channel settled in batches."), 26),
 (slide("04", "Contracts: forge test", forge, "AgentTab.sol: batched settle, bad-signature and stale-voucher rejection, refund after expiry, top-up, and EIP-3009 replay protection. All 5 tests pass.", code=True, bg=(12, 12, 16)), 18),
 (slide("05", "Real Celo mainnet run (2026-10-15)", runlog, "Recorded mainnet run: a 402 challenge, three x402 settlements through the official facilitator, a channel open, five vouchers, and one batched settle.", code=True, bg=(12, 12, 16)), 30),
 (shot("06", "video-build/page-top.png", "Live replay page on GitHub Pages: every step links to the real transaction on Celoscan. x402 calls are gasless for the buying agent."), 18),
 (shot("07", "video-build/page-bottom.png", "AgentTab rail: five off-chain vouchers (cumulative 0.01 → 0.05), then the provider settles all five in one onchain transaction."), 20),
 (slide("08", "Attribution tags (ERC-8021)", attr, "Every wallet client is extended with withAttribution(code). Local check: approve, open and settle txs all decode to our code; x402 settlements are credited via the PayTo address.", code=True, bg=(12, 12, 16)), 18),
 (slide("09", "Why USA₮, and honest status", ["• USA₮: US-regulated dollar, EIP-3009 gasless payer, claimable with Self", "• Repeat flow → AgentTab channel: cheap, refundable, non-custodial", "• Recorded mainnet proof settled in USD₮; USA₮ run is wired", "  (scripts/mainnet-usat.sh) and pending", "• Next: USA₮ run, ERC-8004 registration, wBRL/wARS routes, Textile FX", "", "github.com/zwang1111/agenttab-celo  ·  zwang1111.github.io/agenttab-celo"],
   "Status: mainnet proof uses USD₮ today; the USA₮ run, ERC-8004 registration and independent users are the next steps."), 22),
]
with open(f"{D}/list.txt", "w") as f:
    for p, s in S: f.write(f"file '{os.path.basename(p)}'\nduration {s}\n")
    f.write(f"file '{os.path.basename(S[-1][0])}'\n")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"{D}/list.txt", "-vf", "fps=25,format=yuv420p", "-c:v", "libx264", "-crf", "28", "-movflags", "+faststart", OUT], check=True)
print("wrote", OUT)
