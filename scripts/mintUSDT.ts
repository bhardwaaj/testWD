import { createWalletClient, createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";

const USDT = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

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
      "artifacts/contracts/MockUSDT.sol/MockUSDT.json",
      "utf8"
    )
  );

  for (const user of users) {
    const hash = await walletClient.writeContract({
      address: USDT,
      abi: artifact.abi,
      functionName: "mint",
      args: [user, 1_000_000_000], // 1000 USDT (6 decimals)
    });

    await publicClient.waitForTransactionReceipt({ hash });

    console.log("✅ Minted to", user);
  }
}

main();