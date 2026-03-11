"use client";

import { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  helper?: string;
};

export function BalanceCard({ label, value, helper }: Props) {
  return (
    <div className="card flex flex-col gap-3 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="section-title text-sm md:text-base">{label}</div>
          {helper && (
            <p className="section-subtitle mt-1 max-w-xs text-xs md:text-sm">
              {helper}
            </p>
          )}
        </div>
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
        {value}
      </div>
    </div>
  );
}

