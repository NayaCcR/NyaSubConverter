"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Button as NyaButton } from "@nayaccr/ui";
import { cn } from "@/lib/utils";

export type ButtonProps = ComponentPropsWithoutRef<typeof NyaButton>;

// Keep the product's 40px controls while sharing behavior and variants.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "lg", ...props }, ref) => (
    <NyaButton ref={ref} size={size} className={cn(size === "lg" && "px-4", className)} {...props} />
  )
);
Button.displayName = "Button";
