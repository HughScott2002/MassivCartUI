"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface BudgetPopupProps {
  open: boolean;
  onClose: () => void;
  budget?: number;
  onBudgetChange?: (value: number) => void;
  currentSpend?: number;
}

export function BudgetPopup({
  open,
  onClose,
  budget: controlledBudget,
  onBudgetChange,
  currentSpend = 0,
}: BudgetPopupProps) {
  const [localBudget, setLocalBudget] = useState(controlledBudget ?? 150);
  const budget = controlledBudget ?? localBudget;
  const setBudget = (v: number) => {
    setLocalBudget(v);
    onBudgetChange?.(v);
  };

  useEffect(() => {
    if (open && controlledBudget !== undefined) setLocalBudget(controlledBudget);
  }, [open, controlledBudget]);

  const budgetPercent = budget > 0 ? (currentSpend / budget) * 100 : 0;
  const isOver = budgetPercent > 100;
  const remaining = budget - currentSpend;

  const weeklyHistory = [
    { week: "W1", spent: 142 },
    { week: "W2", spent: 128 },
    { week: "W3", spent: 156 },
    { week: "W4", spent: 127 },
  ];
  const avgSpend = weeklyHistory.reduce((a, b) => a + b.spent, 0) / weeklyHistory.length;
  const maxSpend = Math.max(...weeklyHistory.map((w) => w.spent));

  if (!open) return null;

  const content = (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
        onClick={onClose}
        role="presentation"
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(480px,95vw)] max-h-[min(85vh,560px)] flex flex-col bg-black rounded-2xl shadow-2xl z-[9999] border border-white/20"
      >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-white" />
                <h2 className="text-base font-semibold text-white">Liquidity Threshold</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/80" />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto flex-1 min-h-0">
              {/* Budget Input */}
              <div>
                <label className="text-[0.7rem] font-medium text-white/70 uppercase tracking-wider">
                  Weekly Budget
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-2xl font-semibold text-white">J$</span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value) || 0)}
                    className="text-2xl font-semibold bg-transparent text-white outline-none w-24 border-b-2 border-white/30 focus:border-white transition-colors placeholder:text-white/50"
                  />
                </div>
              </div>

              {/* Budget Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.75rem] text-white/70">Current basket</span>
                  <span className="text-[0.85rem] font-semibold text-white">
                    J${currentSpend.toFixed(2)}
                  </span>
                </div>
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isOver ? "bg-white/90" : "bg-white"
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[0.7rem] text-white/70">
                    {budgetPercent.toFixed(0)}% used
                  </span>
                  <span className="text-[0.75rem] font-medium text-white">
                    {remaining >= 0
                      ? `J$${remaining.toFixed(2)} remaining`
                      : `J$${Math.abs(remaining).toFixed(2)} over`}
                  </span>
                </div>
              </div>

              {/* Warning */}
              {budgetPercent > 85 && budget > 0 && (
                <div className="p-3 rounded-lg border bg-white/10 border-white/30">
                  <p className="text-[0.75rem] font-medium flex items-center gap-1.5 text-white">
                    {isOver ? (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    )}
                    {isOver
                      ? "Over budget — consider switching stores for lower prices"
                      : `Approaching limit — J$${remaining.toFixed(2)} buffer left`}
                  </p>
                </div>
              )}

              {/* Weekly History */}
              <div>
                <p className="text-[0.7rem] font-medium text-white/70 uppercase tracking-wider mb-3">
                  4-Week Trend
                </p>
                <div className="flex items-end gap-2 h-16">
                  {weeklyHistory.map((week) => {
                    const heightPct = maxSpend > 0 ? (week.spent / maxSpend) * 100 : 0;
                    const overAvg = week.spent > avgSpend;
                    return (
                      <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[0.6rem] text-white/70">
                          J${week.spent}
                        </span>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-sm min-h-[4px] transition-all duration-500 ease-out ${
                            overAvg ? "bg-white/50" : "bg-white/80"
                          }`}
                        />
                        <span className="text-[0.6rem] text-white/70">{week.week}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <TrendingDown className="w-3 h-3 text-white/80" />
                  <span className="text-[0.7rem] text-white/70">
                    Avg:{" "}
                    <span className="font-medium text-white">
                      J${avgSpend.toFixed(0)}/wk
                    </span>
                  </span>
                </div>
              </div>
            </div>
      </div>
    </>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
