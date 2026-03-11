import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CollectorModule", (m) => {
  const collector = m.contract("Collector");

  return { collector };
});