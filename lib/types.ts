export interface SearchResultPrice {
  store_id: number
  store_name: string
  branch: string | null
  parish: string | null
  neighbourhood?: string | null
  place_id: string | null
  price: number
  confidence_score: number | null
  date_recorded: string | null
  distance_km: number | null
  lat: number | null
  lng: number | null
}

export interface SearchResult {
  product_id: number
  canonical_name: string
  category: string | null
  unit_type: string | null
  cheapest_price: number
  cheapest_store: string
  prices: SearchResultPrice[]
}

/** One product from a specific store, as added to My List */
export interface ListItem {
  product_id: number
  store_id: number
  canonical_name: string
  category: string | null
  unit_type: string | null
  price: number
  store_name: string
  branch: string | null
  lat: number | null
  lng: number | null
}

export interface ReceiptItem {
  name: string
  price: number
  quantity?: number
  unit?: string
  dosage?: string
}

export interface ReceiptData {
  store?: string | null
  address?: string | null
  date?: string | null
  items: ReceiptItem[]
  total?: number
  currency?: string
  imageType?: "receipt" | "shopping_list" | "prescription" | "gas_price" | "unknown"
  prescriber?: string | null
  patient?: string | null
}
