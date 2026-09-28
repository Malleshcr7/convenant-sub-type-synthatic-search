import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  children,
}: {
  className?: string;
  tone?: "default" | "accent" | "critical" | "quiet";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tone === "default" && "border-border text-muted-foreground",
        tone === "accent" && "border-primary/30 bg-primary/8 text-primary",
        tone === "critical" && "border-danger/30 bg-danger/8 text-danger",
        tone === "quiet" && "border-transparent bg-muted text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
