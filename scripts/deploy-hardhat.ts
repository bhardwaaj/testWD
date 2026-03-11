import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // 1) Deploy MockUSDT
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUsdt = await MockUSDT.deploy();
  await mockUsdt.waitForDeployment();
  const mockUsdtAddress = await mockUsdt.getAddress();
  console.log("MockUSDT deployed to:", mockUsdtAddress);

  // Optional: mint test USDT to the deployer
  const decimals = 6n;
  const mintAmount = 1_000_000n * 10n ** decimals; // 1,000,000 USDT
  const mintTx = await mockUsdt.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log(`Minted ${mintAmount.toString()} (raw) USDT to deployer`);

  // 2) Deploy Collector with MockUSDT address
  const Collector = await ethers.getContractFactory("Collector");
  const collector = await Collector.deploy(mockUsdtAddress);
  await collector.waitForDeployment();
  const collectorAddress = await collector.getAddress();
  console.log("Collector deployed to:", collectorAddress);

  console.log("\nSet these in your Next.js .env.local:");
  console.log("NEXT_PUBLIC_USDT_ADDRESS=", mockUsdtAddress);
  console.log("NEXT_PUBLIC_COLLECTOR_ADDRESS=", collectorAddress);
  console.log("NEXT_PUBLIC_ADMIN_ADDRESS=", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});