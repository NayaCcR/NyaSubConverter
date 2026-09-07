"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Input as NyaInput } from "@nayaccr/ui";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<typeof NyaInput>>(
  ({ className, ...props }, ref) => (
    <NyaInput ref={ref} className={cn("h-10 py-0 shadow-none placeholder:text-muted-foreground/70", className)} {...props} />
  )
);
Input.displayName = "Input";
