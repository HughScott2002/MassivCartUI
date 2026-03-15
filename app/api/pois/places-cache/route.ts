import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Path to the cache written by the backend service
const CACHE_PATH = resolve(
  process.cwd(),
  "../services/app/data/stores-cache.json",
);

export async function GET() {
  if (!existsSync(CACHE_PATH)) {
    return NextResponse.json(
      { error: "Places cache not found — run /api/places/sync on the backend" },
      { status: 404 },
    );
  }

  try {
    const raw = readFileSync(CACHE_PATH, "utf-8");
    const cache = JSON.parse(raw);
    return NextResponse.json(cache);
  } catch {
    return NextResponse.json({ error: "Failed to read cache" }, { status: 500 });
  }
}
