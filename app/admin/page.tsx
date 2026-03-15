import { createClient } from "@supabase/supabase-js";
import AdminClient from "./AdminClient";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const SYNC_SECRET = process.env.SYNC_SECRET;

function secretHeaders(): Record<string, string> {
  return SYNC_SECRET ? { "x-sync-secret": SYNC_SECRET } : {};
}

export default async function AdminPage() {
  // Fetch initial data server-side — secrets never leave the server
  const [statsRes, syntheticRes, storesRes] = await Promise.allSettled([
    fetch(`${BACKEND_URL}/api/stats`).then((r) => r.json()).catch(() => null),
    fetch(`${BACKEND_URL}/api/admin/synthetic-status`, { headers: secretHeaders() })
      .then((r) => r.json()).catch(() => null),
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
      .from("stores")
      .select("id, name, store_type, parish, submitted_by, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => data ?? []),
  ]);

  const activeUsers = statsRes.status === "fulfilled" ? (statsRes.value?.activeUsers ?? null) : null;
  const syntheticStatus = syntheticRes.status === "fulfilled" ? syntheticRes.value : null;
  const initialStores = storesRes.status === "fulfilled" ? storesRes.value : [];

  return (
    <AdminClient
      initialStores={initialStores}
      initialActiveUsers={activeUsers}
      initialSyntheticStatus={syntheticStatus}
    />
  );
}
