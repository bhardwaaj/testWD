import { createWalletClient, createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";

const COLLECTOR = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

const users = [
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
  "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
];

async function main() {
  const account = privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  );

  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  const artifact = JSON.parse(
    fs.readFileSync(
      "artifacts/contracts/Collector.sol/Collector.json",
      "utf8"
    )
  );

  for (const user of users) {
    const hash = await walletClient.writeContract({
      address: COLLECTOR,
      abi: artifact.abi,
      functionName: "bindWallet",
      args: [user],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    console.log("✅ Bound:", user);
  }
}

main();