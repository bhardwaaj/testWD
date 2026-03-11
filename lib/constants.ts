import type { Address } from "viem";

// Active chain id for the dApp. Defaults to Sepolia (11155111) if not provided.
export const CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID || 11155111,
);

// Deployed addresses (defaults). You can override via `.env.local`.
export const ADMIN_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_ADMIN_ADDRESS as Address) ||
  "0x24c9E722B7Bc956525358687E8a271682F23E2fE";

export const COLLECTOR_CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_COLLECTOR_ADDRESS as Address) ||
  "0x869d1e596105e762d769787e297683c8663bd079";

export const USDT_CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_USDT_ADDRESS as Address) ||
  "0x32938180e65f36507143c33fc583431eff9ef61f";

// Temporary wallet list for admin dashboard (should be fetched from contract later).
export const TEMP_BOUND_WALLETS: Address[] = [];

