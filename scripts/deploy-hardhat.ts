import "dotenv/config";
import { createPublicClient, createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";

// Official USDT contract on Ethereum mainnet.
const REAL_USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7" as const;

async function main() {
  const pk = process.env.MAINNET_PRIVATE_KEY as `0x${string}`;
  const rpcUrl = process.env.MAINNET_RPC_URL;

  if (!pk || !rpcUrl) {
    throw new Error(
      "MAINNET_PRIVATE_KEY or MAINNET_RPC_URL is missing in .env",
    );
  }

  const account = privateKeyToAccount(pk);

  const walletClient = createWalletClient({
    account,
    chain: mainnet,
    transport: http(rpcUrl),
  });

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl),
  });

  console.log("Deploying Collector from:", account.address);
  console.log("Using real USDT at:", REAL_USDT_ADDRESS);

  // ---- Deploy Collector ----
  const collectorArtifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/Collector.sol/Collector.json", "utf8"),
  );

  const collectorHash = await walletClient.deployContract({
    abi: collectorArtifact.abi,
    bytecode: collectorArtifact.bytecode as `0x${string}`,
    args: [REAL_USDT_ADDRESS],
  });

  const collectorReceipt = await publicClient.waitForTransactionReceipt({
    hash: collectorHash,
  });
  const collectorAddress = collectorReceipt.contractAddress;
  if (!collectorAddress) throw new Error("Collector deployment failed");

  console.log("Collector deployed to:", collectorAddress);

  console.log("\nSet these in your .env:");
  console.log("NEXT_PUBLIC_USDT_ADDRESS=", REAL_USDT_ADDRESS);
  console.log("NEXT_PUBLIC_COLLECTOR_ADDRESS=", collectorAddress);
  console.log("NEXT_PUBLIC_ADMIN_ADDRESS=", account.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});