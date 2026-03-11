import { createWalletClient, createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";

const USDT = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
const COLLECTOR = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

const userKeys = [
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
];

async function main() {
  const artifact = JSON.parse(
    fs.readFileSync(
      "artifacts/contracts/MockUSDT.sol/MockUSDT.json",
      "utf8"
    )
  );

  for (const key of userKeys) {
    const account = privateKeyToAccount(key);

    const walletClient = createWalletClient({
      account,
      chain: hardhat,
      transport: http(),
    });

    const publicClient = createPublicClient({
      chain: hardhat,
      transport: http(),
    });

    const hash = await walletClient.writeContract({
      address: USDT,
      abi: artifact.abi,
      functionName: "approve",
      args: [COLLECTOR, 1_000_000_000_000],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    console.log("✅ Approved from", account.address);
  }
}

main();