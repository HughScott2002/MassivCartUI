"use client";

import type { POI } from "@/lib/poi-provider";
import type { SearchResultItem } from "@/components/command-bar";

export interface CartItem {
  product_id: number;
  name: string;
  unit_type: string;
  price: number;
  store_name: string;
  quantity: number;
}

interface ShopDetailsSheetProps {
  store: POI | null;
  onDismiss: () => void;
  tab: "store" | "list";
  onTabChange: (tab: "store" | "list") => void;
  searchResults: SearchResultItem[];
  savingsMode: number;
  cartItems: CartItem[];
  onAddToCart: (item: SearchResultItem) => void;
  onUpdateQuantity: (product_id: number, quantity: number) => void;
  onRemoveFromCart: (product_id: number) => void;
  onFlyToStore: (lng: number, lat: number) => void;
  onStoreSelect: (store: POI | null) => void;
  onSearchItems: (names: string[]) => void;
  unpricedItems: { id: number; name: string }[];
  onUnpricedChange: (items: { id: number; name: string }[]) => void;
}

export function ShopDetailsSheet({
  store,
  onDismiss,
  tab,
  onTabChange,
  searchResults,
  cartItems,
  onUpdateQuantity,
  onRemoveFromCart,
}: ShopDetailsSheetProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-lg">
      {(store || searchResults.length > 0) && (
        <div className="flex items-center justify-between border-b p-2">
          <span className="font-medium">{store?.name ?? "Results"}</span>
          <button type="button" onClick={onDismiss} className="rounded px-2 py-1 hover:bg-gray-100">
            Close
          </button>
        </div>
      )}
      <div className="flex gap-2 border-b p-2">
        <button
          type="button"
          onClick={() => onTabChange("store")}
          className={`rounded px-3 py-1 ${tab === "store" ? "bg-gray-200" : ""}`}
        >
          Store
        </button>
        <button
          type="button"
          onClick={() => onTabChange("list")}
          className={`rounded px-3 py-1 ${tab === "list" ? "bg-gray-200" : ""}`}
        >
          List
        </button>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {tab === "list" && (
          <ul className="space-y-2">
            {cartItems.map((item) => (
              <li key={item.product_id} className="flex items-center justify-between rounded border p-2">
                <span>{item.name} × {item.quantity}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                    className="rounded bg-gray-200 px-2"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                    className="rounded bg-gray-200 px-2"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFromCart(item.product_id)}
                    className="rounded bg-red-100 px-2"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
