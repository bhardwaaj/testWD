"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "ghost";
};

export function LoadingButton({
  children,
  loading,
  disabled,
  onClick,
  variant = "primary",
}: Props) {
  const baseClass =
    variant === "primary" ? "btn-primary" : "btn-ghost border border-border";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClass + " gap-2"}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
      )}
      <span>{children}</span>
    </button>
  );
}

