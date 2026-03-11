"use client";

type Status = "bound" | "unbound";

export function StatusBadge(props: { status: Status }) {
  if (props.status === "bound") {
    return <span className="badge-success">Bound</span>;
  }

  return <span className="badge-danger">Not Bound</span>;
}

