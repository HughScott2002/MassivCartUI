import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key so we can bypass RLS insert check in server context
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name: string;
    store_type: string;
    parish: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    user_id: string;
  };

  if (!body.name || !body.store_type || !body.parish || !body.user_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("stores").insert({
    name: body.name,
    store_type: body.store_type,
    parish: body.parish,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    status: "pending",
    submitted_by: body.user_id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
