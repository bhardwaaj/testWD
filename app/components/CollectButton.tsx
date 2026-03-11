"use client";

import { LoadingButton } from "./LoadingButton";

type Props = {
  onCollect: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function CollectButton({ onCollect, disabled, loading }: Props) {
  return (
    <LoadingButton
      onClick={onCollect}
      disabled={disabled}
      loading={loading}
      variant="primary"
    >
      Collect
    </LoadingButton>
  );
}

