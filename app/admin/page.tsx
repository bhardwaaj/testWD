"use client";

import { useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, parseUnits, type Address } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  CHAIN_ID,
  COLLECTOR_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
} from "@/lib/constants";
import { mockUsdtAbi } from "../abi/mockUsdt";
import { collectorAbi } from "../abi/collector";
import { BalanceCard } from "../components/BalanceCard";
import { WalletRow } from "../components/WalletRow";
import { LoadingButton } from "../components/LoadingButton";

const USDT_DECIMALS = 6;

export default function AdminPage() {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  // Fetch the list of all bound wallets from the Collector contract.
  const { data: boundWalletsData } = useReadContract({
    address: COLLECTOR_CONTRACT_ADDRESS,
    abi: collectorAbi,
    functionName: "getBoundWallets",
    args: [],
    query: {
      enabled: true,
    },
  });

  const walletAddresses = useMemo(
    () => ((boundWalletsData as Address[]) || []),
    [boundWalletsData],
  );

  // Fetch balances for all bound wallets.
  const {
    data: walletBalanceResults,
    isLoading: isWalletBalancesLoading,
    isFetching: isWalletBalancesFetching,
  } = useReadContracts({
    contracts: walletAddresses.map((wallet) => ({
      address: USDT_CONTRACT_ADDRESS,
      abi: mockUsdtAbi,
      functionName: "balanceOf",
      args: [wallet],
    })),
    query: {
      enabled: walletAddresses.length > 0,
    },
  });

  // Fetch bound status for all wallets (in case some were unbound later).
  const { data: walletBoundStatusResults } = useReadContracts({
    contracts: walletAddresses.map((wallet) => ({
      address: COLLECTOR_CONTRACT_ADDRESS,
      abi: collectorAbi,
      functionName: "boundWallets",
      args: [wallet],
    })),
    query: {
      enabled: walletAddresses.length > 0,
    },
  });

  const {
    writeContract: writeCollectForWallet,
    data: collectTxHash,
    isPending: isCollectPending,
    error: collectError,
  } = useWriteContract();

  const {
    writeContract: writeCollectAll,
    data: collectAllTxHash,
    isPending: isCollectAllPending,
    error: collectAllError,
  } = useWriteContract();

  const {
    writeContract: writeUsdtTransfer,
    data: transferTxHash,
    isPending: isTransferPending,
    error: transferError,
  } = useWriteContract();

  const {
    isLoading: isCollectConfirming,
    isSuccess: isCollectSuccess,
  } = useWaitForTransactionReceipt({
    hash: collectTxHash,
  });

  const {
    isLoading: isCollectAllConfirming,
    isSuccess: isCollectAllSuccess,
  } = useWaitForTransactionReceipt({
    hash: collectAllTxHash,
  });

  const {
    isLoading: isTransferConfirming,
    isSuccess: isTransferSuccess,
  } = useWaitForTransactionReceipt({
    hash: transferTxHash,
  });

  if (collectError) {
    toast.error(collectError.message ?? "Collect transaction failed.");
  }

  if (collectAllError) {
    toast.error(collectAllError.message ?? "Collect all transaction failed.");
  }

  if (transferError) {
    toast.error(transferError.message ?? "Transfer transaction failed.");
  }

  if (isCollectSuccess && collectTxHash) {
    toast.success(
      `Collected from wallet. Tx: ${collectTxHash.slice(
        0,
        10,
      )}…${collectTxHash.slice(-6)}`,
    );
    queryClient.invalidateQueries();
  }

  if (isTransferSuccess && transferTxHash) {
    toast.success(
      `USDT sent. Tx: ${transferTxHash.slice(0, 10)}…${transferTxHash.slice(
        -6,
      )}`,
    );
    queryClient.invalidateQueries();
  }

  if (isCollectAllSuccess && collectAllTxHash) {
    toast.success(
      `Collected from all wallets. Tx: ${collectAllTxHash.slice(
        0,
        10,
      )}…${collectAllTxHash.slice(-6)}`,
    );
    queryClient.invalidateQueries();
  }

  const totalTreasuryBalanceFormatted = useMemo(() => {
    const total = (walletBalanceResults || []).reduce((acc, result) => {
      const value = (result?.result as bigint | undefined) || 0n;
      return acc + value;
    }, 0n);

    return `${formatUnits(total, USDT_DECIMALS)} USDT`;
  }, [walletBalanceResults]);

  const anyWalletLoading =
    isWalletBalancesLoading || isWalletBalancesFetching;

  const isAnyCollectPending =
    isCollectPending ||
    isCollectAllPending ||
    isCollectConfirming ||
    isCollectAllConfirming ||
    isTransferPending ||
    isTransferConfirming;

  const handleCollectWallet = (wallet: Address) => {
    try {
      writeCollectForWallet({
        chainId: CHAIN_ID,
        address: COLLECTOR_CONTRACT_ADDRESS,
        abi: collectorAbi,
        functionName: "collectFromWallet",
        args: [wallet],
      });
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to send collect transaction.");
    }
  };

  const handleCollectAll = () => {
    try {
      writeCollectAll({
        chainId: CHAIN_ID,
        address: COLLECTOR_CONTRACT_ADDRESS,
        abi: collectorAbi,
        functionName: "collectAll",
        args: [],
      });
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to send collect all transaction.");
    }
  };

  const handleTransfer = () => {
    if (!transferTo || !transferAmount) {
      toast.error("Enter recipient and amount.");
      return;
    }

    try {
      const parsedAmount = parseUnits(transferAmount, USDT_DECIMALS);
      writeUsdtTransfer({
        chainId: CHAIN_ID,
        address: USDT_CONTRACT_ADDRESS,
        abi: mockUsdtAbi,
        functionName: "transfer",
        args: [transferTo as Address, parsedAmount],
      });
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to send transfer.");
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="section-title text-2xl md:text-3xl">
            Admin Treasury Dashboard
          </h1>
          <p className="section-subtitle mt-1">
            View bound wallets, balances, and trigger USDT collection.
          </p>
        </div>
        <div className="flex items-start justify-between gap-3 md:flex-col md:items-end">
          <LoadingButton
            variant="ghost"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
          >
            Logout
          </LoadingButton>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <BalanceCard
          label="Total Treasury (Approx.)"
          helper="Sum of USDT across tracked bound wallets"
          value={
            anyWalletLoading ? (
              <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                Loading…
              </span>
            ) : (
              totalTreasuryBalanceFormatted
            )
          }
        />
        <div className="card flex flex-col justify-between gap-3 p-4 md:p-5">
          <div>
            <div className="section-title text-sm md:text-base">
              Bound Wallets
            </div>
            <p className="section-subtitle mt-1 text-xs md:text-sm">
              Total number of wallets that have bound themselves to the
              collector.
            </p>
          </div>
          <div className="mt-2 text-2xl font-semibold md:text-3xl">
            {walletAddresses.length}
          </div>
        </div>
        <div className="card flex flex-col gap-3 p-4 md:p-5">
          <div className="section-title text-sm md:text-base">
            Collection Controls
          </div>
          <p className="section-subtitle text-xs md:text-sm">
            Trigger collection for all bound wallets in a single transaction.
          </p>
          <div className="mt-2">
            <LoadingButton
              loading={isCollectAllPending || isCollectAllConfirming}
              disabled={isAnyCollectPending}
              onClick={handleCollectAll}
            >
              Collect All
            </LoadingButton>
          </div>
        </div>
        <div className="card flex flex-col gap-3 p-4 md:p-5">
          <div className="section-title text-sm md:text-base">
            Send USDT from Admin Wallet
          </div>
          <p className="section-subtitle text-xs md:text-sm">
            Transfer MockUSDT from the connected admin wallet to any address.
          </p>
          <div className="mt-2 space-y-2">
            <input
              className="w-full rounded-xl border border-slate-700 bg-black/40 px-3 py-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Recipient address (0x...)"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-slate-700 bg-black/40 px-3 py-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Amount in USDT (e.g. 10.5)"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
            <LoadingButton
              loading={isTransferPending || isTransferConfirming}
              disabled={isAnyCollectPending}
              onClick={handleTransfer}
            >
              Send USDT
            </LoadingButton>
          </div>
        </div>
      </section>

      <section className="card mt-2 overflow-hidden">
        <div className="border-b border-slate-800/80 px-4 py-3 md:px-6 md:py-4">
          <h2 className="section-title text-base md:text-lg">
            Wallet Overview
          </h2>
          <p className="section-subtitle mt-1 text-xs md:text-sm">
            Per-wallet USDT balances, binding status, and collection actions.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-900/60 text-slate-300">
                <th className="px-3 py-3 font-medium md:px-4">Wallet</th>
                <th className="px-3 py-3 text-right font-medium md:px-4">
                  USDT Balance
                </th>
                <th className="px-3 py-3 font-medium md:px-4">Status</th>
                <th className="px-3 py-3 text-right font-medium md:px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {walletAddresses.map((wallet, index) => {
                const balanceResult = walletBalanceResults?.[index];
                const statusResult = walletBoundStatusResults?.[index];

                const rawBalance =
                  (balanceResult?.result as bigint | undefined) || 0n;

                const formattedBalance = `${formatUnits(
                  rawBalance,
                  USDT_DECIMALS,
                )} USDT`;

                const isBound = Boolean(statusResult?.result);

                return (
                  <WalletRow
                    key={wallet}
                    address={wallet as Address}
                    usdtBalanceFormatted={formattedBalance}
                    isBound={isBound}
                    isCollecting={isAnyCollectPending}
                    onCollect={() => handleCollectWallet(wallet as Address)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

