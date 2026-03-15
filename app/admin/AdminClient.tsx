"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const JAMAICAN_PARISHES = [
  "Kingston", "St. Andrew", "St. Thomas", "Portland", "St. Mary",
  "St. Ann", "Trelawny", "St. James", "Hanover", "Westmoreland",
  "St. Elizabeth", "Manchester", "Clarendon", "St. Catherine",
];

interface SyntheticStatus {
  enabled: boolean;
  stores: number;
  prices: number;
}

interface PendingStore {
  id: number;
  name: string;
  store_type: string;
  parish: string;
  submitted_by: string | null;
  created_at?: string;
}

interface Props {
  initialStores: PendingStore[];
  initialActiveUsers: number | null;
  initialSyntheticStatus: SyntheticStatus | null;
}

export default function AdminClient({ initialStores, initialActiveUsers, initialSyntheticStatus }: Props) {
  const router = useRouter();
  const [stores, setStores] = useState<PendingStore[]>(initialStores);
  const [activeUsers] = useState<number | null>(initialActiveUsers);

  const [syntheticStatus, setSyntheticStatus] = useState<SyntheticStatus | null>(initialSyntheticStatus);
  const [syntheticParish, setSyntheticParish] = useState("Kingston");
  const [syntheticSeeding, setSyntheticSeeding] = useState(false);
  const [syntheticSeedingAll, setSyntheticSeedingAll] = useState(false);
  const [syntheticError, setSyntheticError] = useState<string | null>(null);

  async function handleSeedParish() {
    setSyntheticSeeding(true);
    setSyntheticError(null);
    try {
      const res = await fetch("/api/admin/synthetic-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parish: syntheticParish }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSyntheticError(data.error ?? "Seeding failed");
      } else {
        setSyntheticStatus({ enabled: true, stores: data.seededStores, prices: data.seededPrices });
      }
    } catch {
      setSyntheticError("Request failed");
    } finally {
      setSyntheticSeeding(false);
    }
  }

  async function handleSeedAll() {
    setSyntheticSeedingAll(true);
    setSyntheticError(null);
    try {
      const res = await fetch("/api/admin/synthetic-seed/all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSyntheticError(data.error ?? "Seeding failed");
      } else {
        setSyntheticStatus({ enabled: true, stores: data.seededStores, prices: data.seededPrices });
      }
    } catch {
      setSyntheticError("Request failed");
    } finally {
      setSyntheticSeedingAll(false);
    }
  }

  async function handleWipeSynthetic() {
    try {
      await fetch("/api/admin/synthetic-seed", { method: "DELETE" });
      setSyntheticStatus({ enabled: false, stores: 0, prices: 0 });
      setSyntheticError(null);
    } catch {
      setSyntheticError("Wipe failed");
    }
  }

  const approve = async (id: number) => {
    await supabase.from("stores").update({ status: "active" }).eq("id", id);
    setStores((prev) => prev.filter((s) => s.id !== id));
    router.refresh();
  };

  const reject = async (id: number) => {
    await supabase.from("stores").update({ status: "rejected" }).eq("id", id);
    setStores((prev) => prev.filter((s) => s.id !== id));
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-primary p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <span className="text-green-600 text-lg">●</span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Active Users</p>
            <p className="text-2xl font-bold text-gray-900 leading-none mt-0.5">
              {activeUsers === null ? "—" : activeUsers}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">live WebSocket connections</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <span className="text-amber-500 text-lg">⏳</span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Pending Stores</p>
            <p className="text-2xl font-bold text-gray-900 leading-none mt-0.5">{stores.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">awaiting review</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Pending Store Submissions</h2>

      {stores.length === 0 && (
        <p className="text-white/60">No pending submissions.</p>
      )}

      {stores.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 font-medium text-gray-600">Parish</th>
                <th className="px-4 py-3 font-medium text-gray-600">Submitted by</th>
                <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium">{store.name}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{store.store_type}</td>
                  <td className="px-4 py-3 text-gray-600">{store.parish}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                    {store.submitted_by?.slice(0, 8) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {store.created_at ? new Date(store.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => approve(store.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(store.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Synthetic Price Data ── */}
      <h2 className="text-lg font-semibold text-white mt-10 mb-4">Synthetic Price Data</h2>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5 max-w-lg">
        {syntheticStatus && syntheticStatus.enabled && (
          <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
            <span className="font-semibold">Active:</span>
            <span>{syntheticStatus.stores} stores · {syntheticStatus.prices.toLocaleString()} prices</span>
          </div>
        )}
        {syntheticStatus && !syntheticStatus.enabled && (
          <p className="mb-4 text-sm text-gray-400">No synthetic data loaded.</p>
        )}

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-medium text-gray-700 shrink-0">Parish</label>
          <select
            value={syntheticParish}
            onChange={(e) => setSyntheticParish(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-black bg-white focus:outline-none focus:border-primary/50"
          >
            {JAMAICAN_PARISHES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSeedParish}
            disabled={syntheticSeeding || syntheticSeedingAll}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {syntheticSeeding ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Seeding…
              </>
            ) : (
              "Seed Parish"
            )}
          </button>
          <button
            onClick={handleSeedAll}
            disabled={syntheticSeeding || syntheticSeedingAll}
            className="flex items-center gap-2 px-4 py-2 bg-primary/80 text-white rounded-lg text-sm font-medium hover:bg-primary transition-colors disabled:opacity-50"
          >
            {syntheticSeedingAll ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Seeding island…
              </>
            ) : (
              "Seed Entire Island"
            )}
          </button>
          {syntheticStatus && syntheticStatus.enabled && (
            <button
              onClick={handleWipeSynthetic}
              disabled={syntheticSeeding || syntheticSeedingAll}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              Wipe Synthetic Data
            </button>
          )}
        </div>

        {syntheticError && (
          <p className="mt-3 text-sm text-red-600">{syntheticError}</p>
        )}
        <p className="mt-3 text-xs text-gray-400">
          <strong>Seed Parish</strong> — AI prices for the selected parish only.{" "}
          <strong>Seed Entire Island</strong> — seeds all 14 parishes sequentially (slow, ~10 min).
          Both clear existing synthetic data first. Real user data is never touched.
        </p>
      </div>
    </div>
  );
}
