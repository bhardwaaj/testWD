import type { Address } from "viem";

// Active chain id for the dApp. Defaults to Ethereum mainnet (1) if not provided.
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1);

// Deployed addresses (defaults). You can override via `.env.local`.
export const ADMIN_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_ADMIN_ADDRESS as Address) ||
  "0xd229dc419f3FF32822F6Aa687D49F6498b680a32";

export const COLLECTOR_CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_COLLECTOR_ADDRESS as Address) ||
  "0x0000000000000000000000000000000000000000";

// Real USDT on Ethereum mainnet by default.
export const USDT_CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_USDT_ADDRESS as Address) ||
  "0xdAC17F958D2ee523a2206206994597C13D831ec7";

// Temporary wallet list for admin dashboard (should be fetched from contract later).
export const TEMP_BOUND_WALLETS: Address[] = [];

