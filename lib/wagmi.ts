import { http, createConfig } from "wagmi";
import { sepolia } from "viem/chains";
import { injected } from "wagmi/connectors";
import { CHAIN_ID } from "./constants";

// Use your Sepolia Alchemy endpoint by default; can be overridden via env.
const sepoliaRpcUrl =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/tZ46MwasxjxwktOH69gS_";

// Client-side-only wagmi config for Sepolia (or other chains you may add later).
export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
  },
  ssr: false,
});

