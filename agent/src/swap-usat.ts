// One-off: swap 1 USD₮ -> USA₮ on Uniswap v3 (Celo, 0.01% pool), tagged with the attribution code.
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chain, RPC, EXPLORER, attribution } from "./common.js";
const R="0x5615CDAb10dc425a742d643d949a7F474C01abc4", USDT="0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", USAT="0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771";
const acct=privateKeyToAccount(process.env.AGENT_PK as `0x${string}`);
const pub=createPublicClient({chain,transport:http(RPC)});
const wal=createWalletClient({account:acct,chain,transport:http(RPC)}).extend(attribution());
if(!(await pub.getCode({address:R}))) throw new Error("no router code");
const erc=parseAbi(["function approve(address,uint256) returns (bool)","function allowance(address,address) view returns (uint256)"]);
const ra=parseAbi(["function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns (uint256)"]);
const amt=1_000_000n;
if((await pub.readContract({address:USDT,abi:erc,functionName:"allowance",args:[acct.address,R]}))<amt){
 const h=await wal.writeContract({address:USDT,abi:erc,functionName:"approve",args:[R,amt]});await pub.waitForTransactionReceipt({hash:h});console.log("approve",EXPLORER+h);}
const h=await wal.writeContract({address:R,abi:ra,functionName:"exactInputSingle",args:[{tokenIn:USDT,tokenOut:USAT,fee:100,recipient:acct.address,amountIn:amt,amountOutMinimum:990_000n,sqrtPriceLimitX96:0n}]});
const rc=await pub.waitForTransactionReceipt({hash:h});console.log("swap",rc.status,EXPLORER+h);
