import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { type POI, type POICategory } from "@/lib/poi-provider";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const STORE_TYPE_TO_CATEGORY: Record<string, POICategory> = {
  grocery:   "grocery",
  pharmacy:  "pharmacy",
  fuel:      "fuel",
  gas:       "fuel",
  hardware:  "hardware",
  wholesale: "wholesale",
};

export async function GET() {
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, store_type, latitude, longitude, branch")
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pois: POI[] = (data ?? []).flatMap((store) => {
    const category = STORE_TYPE_TO_CATEGORY[store.store_type];
    if (!category) return [];
    return [{
      id: String(store.id),
      name: store.branch ? `${store.name} (${store.branch})` : store.name,
      lat: Number(store.latitude),
      lng: Number(store.longitude),
      category,
    }];
  });

  return NextResponse.json(pois);
}
