import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "secondary";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          {
            "bg-blue-100 text-blue-800": variant === "default",
            "bg-green-100 text-green-800": variant === "success",
            "bg-orange-100 text-orange-800": variant === "warning",
            "bg-red-100 text-red-800": variant === "danger",
            "bg-purple-100 text-purple-800": variant === "info",
            "bg-gray-100 text-gray-800": variant === "secondary",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
