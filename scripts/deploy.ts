import "dotenv/config";
import { createPublicClient, createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";

async function main() {
  const pk = process.env.MAINNET_PRIVATE_KEY as `0x${string}`;
  const rpcUrl = process.env.MAINNET_RPC_URL;

  if (!pk || !rpcUrl) {
    throw new Error("MAINNET_PRIVATE_KEY or MAINNET_RPC_URL is missing in .env");
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

  console.log("Deploying from:", account.address);

  // ---- Deploy MockUSDT ----
  const mockArtifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/MockUSDT.sol/MockUSDT.json", "utf8")
  );

  const mockHash = await walletClient.deployContract({
    abi: mockArtifact.abi,
    bytecode: mockArtifact.bytecode as `0x${string}`,
    args: [],
  });

  const mockReceipt = await publicClient.waitForTransactionReceipt({ hash: mockHash });
  const mockUsdtAddress = mockReceipt.contractAddress;
  if (!mockUsdtAddress) throw new Error("MockUSDT deployment failed");
  console.log("MockUSDT deployed to:", mockUsdtAddress);

  // Optionally mint some USDT to deployer (1,000,000 USDT with 6 decimals)
  const mintAmount = 1_000_000n * 10n ** 6n;
  const mintTxHash = await walletClient.writeContract({
    abi: mockArtifact.abi,
    address: mockUsdtAddress,
    functionName: "mint",
    args: [account.address, mintAmount],
  });
  await publicClient.waitForTransactionReceipt({ hash: mintTxHash });
  console.log("Minted test USDT to deployer");

  // ---- Deploy Collector ----
  const collectorArtifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/Collector.sol/Collector.json", "utf8")
  );

  const collectorHash = await walletClient.deployContract({
    abi: collectorArtifact.abi,
    bytecode: collectorArtifact.bytecode as `0x${string}`,
    args: [mockUsdtAddress],
  });

  const collectorReceipt = await publicClient.waitForTransactionReceipt({ hash: collectorHash });
  const collectorAddress = collectorReceipt.contractAddress;
  if (!collectorAddress) throw new Error("Collector deployment failed");
  console.log("Collector deployed to:", collectorAddress);

  console.log("\nSet these in your Next.js .env.local:");
  console.log("NEXT_PUBLIC_USDT_ADDRESS=", mockUsdtAddress);
  console.log("NEXT_PUBLIC_COLLECTOR_ADDRESS=", collectorAddress);
  console.log("NEXT_PUBLIC_ADMIN_ADDRESS=", account.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});