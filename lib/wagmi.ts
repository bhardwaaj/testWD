import { http, createConfig } from "wagmi";
import { mainnet } from "viem/chains";
import { injected } from "wagmi/connectors";

const mainnetRpcUrl =
  process.env.NEXT_PUBLIC_MAINNET_RPC_URL ||
  "https://eth-mainnet.g.alchemy.com/v2/your-mainnet-key";

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(mainnetRpcUrl),
  },
  ssr: false,
});

