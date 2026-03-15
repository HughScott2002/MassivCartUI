"use client";

import { useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import type { ReceiptData, ReceiptItem } from "@/lib/types";

interface ReceiptReviewSheetProps {
  receiptData: ReceiptData;
  userId?: string;
  onClose: () => void;
  onPointsAwarded?: () => void;
}

const IMAGE_TYPE_LABELS: Record<string, string> = {
  receipt: "Receipt",
  prescription: "Prescription",
  gas_price: "Gas Price",
  shopping_list: "Shopping List",
};

export function ReceiptReviewSheet({
  receiptData,
  userId,
  onClose,
  onPointsAwarded,
}: ReceiptReviewSheetProps) {
  const [items, setItems] = useState<ReceiptItem[]>(receiptData.items);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + (item.price * (item.quantity ?? 1)), 0);

  function updateItem(index: number, field: keyof ReceiptItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: field === "price" || field === "quantity" ? parseFloat(value) || 0 : value }
          : item
      )
    );
  }

  async function handleConfirm() {
    if (!userId) {
      setError("You must be logged in to confirm.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/receipt/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptData: { ...receiptData, items, total },
          userId,
          category: receiptData.imageType ?? "receipt",
          storeAddress: receiptData.address,
        }),
      });

      const data = await res.json() as { receiptId?: number; pointsAwarded?: number; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to confirm receipt.");
        return;
      }

      onPointsAwarded?.();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const typeLabel = IMAGE_TYPE_LABELS[receiptData.imageType ?? ""] ?? "Document";

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-2xl flex flex-col rounded-2xl border border-border bg-card shadow-2xl max-h-[60vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {typeLabel}
          </span>
          {receiptData.store && (
            <span className="text-sm font-semibold text-foreground truncate max-w-[160px]">
              {receiptData.store}
            </span>
          )}
          {receiptData.date && (
            <span className="text-xs text-muted-foreground">{receiptData.date}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No items found.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
                  placeholder="Item name"
                />
                <input
                  className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                  type="number"
                  value={item.quantity ?? 1}
                  min={1}
                  onChange={(e) => updateItem(i, "quantity", e.target.value)}
                />
                <input
                  className="w-24 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                  type="number"
                  value={item.price}
                  min={0}
                  step={0.01}
                  onChange={(e) => updateItem(i, "price", e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals + CTA */}
      <div className="px-4 py-3 border-t border-border shrink-0 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold text-foreground">
            J${total.toFixed(2)}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={isSubmitting || items.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span>Confirming...</span>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Confirm &amp; Earn 100 pts
            </>
          )}
        </button>
      </div>
    </div>
  );
}
