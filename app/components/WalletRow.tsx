"use client";

import type { Address } from "viem";
import { StatusBadge } from "./StatusBadge";
import { CollectButton } from "./CollectButton";

type Props = {
  address: Address;
  usdtBalanceFormatted: string;
  isBound: boolean;
  onCollect: () => void;
  isCollecting?: boolean;
  isAdmin?: boolean;
};

export function WalletRow({
  address,
  usdtBalanceFormatted,
  isBound,
  onCollect,
  isCollecting,
  isAdmin,
}: Props) {
  return (
    <tr className="border-b border-slate-800/60 last:border-0">
      <td className="px-3 py-3 text-xs font-mono text-slate-300 md:px-4 md:text-sm">
        {address}
      </td>
      <td className="px-3 py-3 text-right text-xs md:px-4 md:text-sm">
        {usdtBalanceFormatted}
      </td>
      <td className="px-3 py-3 md:px-4">
        <StatusBadge status={isBound ? "bound" : "unbound"} />
      </td>
      <td className="px-3 py-3 text-right md:px-4">
        <CollectButton
          onCollect={onCollect}
          disabled={!isAdmin || !isBound || isCollecting}
          loading={isCollecting}
        />
      </td>
    </tr>
  );
}

