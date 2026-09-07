"use client";

import { useState, type FormEventHandler, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

/** Product adapter for existing conditionally mounted editors (no Radix Trigger). */
export function FormDialog({ title, description, className, onClose, onSubmit, children }: {
  title: ReactNode;
  description: string;
  className?: string;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const [returnFocus] = useState(() =>
    typeof document !== "undefined" && document.activeElement instanceof HTMLElement
      ? document.activeElement : null
  );
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        closeLabel={t("common.close")}
        className={cn("block max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-lg p-5 data-[state=open]:animate-none sm:p-6", className)}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (returnFocus?.isConnected) returnFocus.focus();
        }}
      >
        <form onSubmit={onSubmit}>
          <DialogHeader className="space-y-1 pr-8">
            <DialogTitle className="text-base tracking-normal">{title}</DialogTitle>
            <DialogDescription className="text-xs leading-5">{description}</DialogDescription>
          </DialogHeader>
          {children}
        </form>
      </DialogContent>
    </Dialog>
  );
}
