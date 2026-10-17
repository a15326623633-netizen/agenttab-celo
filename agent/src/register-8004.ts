// Register this agent's ERC-8004 identity on Celo (required for every Agents on Open Rails track).
// NOT run automatically: it sends one mainnet tx (gas only, < 0.01 CELO). Usage:
//   AGENT_PK=0x... NETWORK=mainnet npx tsx src/register-8004.ts            # dry run: prints calldata + gas estimate
//   AGENT_PK=0x... NETWORK=mainnet CONFIRM=1 npx tsx src/register-8004.ts  # sends the tx (tagged with the attribution code)
import { createPublicClient, createWalletClient, http, parseAbi, encodeFunctionData, parseEventLogs } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chain, RPC, EXPLORER, attribution, ATTRIBUTION_CODE } from "./common.js";

const REGISTRY = (chain.id === 42220 ? "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" : "0x8004A818BFB912233c491871b3d84c89A494BD9e") as `0x${string}`;
const AGENT_URI = process.env.AGENT_URI ?? "https://zwang1111.github.io/agenttab-celo/agent.json";
const abi = parseAbi([
  "function register(string agentURI) returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);
const acct = privateKeyToAccount(process.env.AGENT_PK as `0x${string}`);
const pub = createPublicClient({ chain, transport: http(RPC) });
const wal = createWalletClient({ account: acct, chain, transport: http(RPC) }).extend(attribution());
const data = encodeFunctionData({ abi, functionName: "register", args: [AGENT_URI] });
const gas = await pub.estimateGas({ account: acct.address, to: REGISTRY, data });
console.log({ chainId: chain.id, registry: REGISTRY, owner: acct.address, agentURI: AGENT_URI, attribution: ATTRIBUTION_CODE, gas: gas.toString() });
if (!process.env.CONFIRM) { console.log("dry run only; set CONFIRM=1 to send"); process.exit(0); }
const hash = await wal.writeContract({ address: REGISTRY, abi, functionName: "register", args: [AGENT_URI] });
const rc = await pub.waitForTransactionReceipt({ hash });
const ev = parseEventLogs({ abi, logs: rc.logs, eventName: "Transfer" }).find((l) => l.address.toLowerCase() === REGISTRY.toLowerCase());
console.log({ status: rc.status, tx: EXPLORER + hash, agentId: ev?.args.tokenId?.toString(), scan: "https://8004scan.io" });
