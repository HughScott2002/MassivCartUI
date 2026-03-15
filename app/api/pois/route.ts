import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { type POI, type POICategory } from "@/lib/poi-provider";

const GOOGLE_TYPE_TO_CATEGORY: Record<string, POICategory> = {
  supermarket:            "grocery",
  grocery_or_supermarket: "grocery",
  convenience_store:      "grocery",
  pharmacy:               "pharmacy",
  gas_station:            "fuel",
  hardware_store:         "hardware",
};

const WHOLESALE_NAME_PATTERN = /wholesale|pricesmart|costco|superplus/i;

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "stores-cache.json");
  const raw = await readFile(filePath, "utf-8");
  const cache = JSON.parse(raw) as {
    places: { place_id: string; name: string; vicinity: string; types: string[]; geometry: { location: { lat: number; lng: number } }; rating?: number }[];
  };

  const pois: POI[] = cache.places.flatMap((place): POI[] => {
    const category: POICategory | null = WHOLESALE_NAME_PATTERN.test(place.name)
      ? "wholesale"
      : place.types.reduce<POICategory | null>(
          (found, t) => found ?? (GOOGLE_TYPE_TO_CATEGORY[t] ?? null),
          null,
        );

    if (!category) return [];
    return [{
      id: place.place_id,
      name: place.name,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      category,
      address: place.vicinity,
      rating: place.rating,
    }];
  });

  return NextResponse.json(pois);
}
