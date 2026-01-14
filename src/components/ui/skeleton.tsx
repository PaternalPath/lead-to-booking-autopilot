import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-pulse rounded-md bg-gray-200", className)}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";
