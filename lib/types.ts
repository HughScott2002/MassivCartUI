export interface SearchResultPrice {
  store_id: number
  store_name: string
  branch: string | null
  parish: string | null
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
