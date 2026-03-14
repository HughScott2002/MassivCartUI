import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _client;
}

// Convenience export — lazily initialized
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabaseClient() as unknown as Record<string | symbol, any>)[prop];
  },
});

/**
 * Subscribe to any INSERT/UPDATE/DELETE on the prices table via Supabase Realtime.
 * Returns the channel so the caller can unsubscribe on cleanup.
 */
export function subscribeToPriceUpdates(cb: () => void) {
  return getSupabaseClient()
    .channel("prices")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "prices" },
      cb,
    )
    .subscribe();
}
