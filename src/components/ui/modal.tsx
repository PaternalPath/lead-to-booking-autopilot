"use client";

import { forwardRef, type HTMLAttributes, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, children, ...props }, ref) => {
    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      return () => {
        document.body.style.overflow = "unset";
      };
    }, [open]);

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open) {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={ref}
          className={cn(
            "relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl",
            className
          )}
          {...props}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";

export const ModalHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mb-4 flex flex-col space-y-1.5", className)}
        {...props}
      />
    );
  }
);

ModalHeader.displayName = "ModalHeader";

export const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn("text-lg font-semibold text-gray-900", className)}
        {...props}
      />
    );
  }
);

ModalTitle.displayName = "ModalTitle";

export const ModalDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-gray-500", className)}
        {...props}
      />
    );
  }
);

ModalDescription.displayName = "ModalDescription";

export const ModalContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("", className)}
        {...props}
      />
    );
  }
);

ModalContent.displayName = "ModalContent";

export const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
      />
    );
  }
);

ModalFooter.displayName = "ModalFooter";
