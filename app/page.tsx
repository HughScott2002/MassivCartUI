import { Header } from "@/components/header"
import { ShoppingPreferences } from "@/components/shopping-preferences"
import { ShopDetailsSheet } from "@/components/shop-details-sheet"
import { CommandBar } from "@/components/command-bar"

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      
      {/* Map placeholder — replaced with Mapbox in Phase 2 */}
      <div className="absolute inset-0 bg-background">
        <div
          className="absolute inset-0 opacity-10 dark:opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, #00d26a22 0%, transparent 50%),
                              radial-gradient(circle at 70% 30%, #3b82f622 0%, transparent 40%)`,
          }}
        />
      </div>

      {/* Header */}
      <Header />

      {/* Left + Right panels */}
      <div className="pointer-events-none fixed inset-x-4 top-18 bottom-28 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="pointer-events-auto w-full shrink-0 sm:w-72">
          <ShoppingPreferences />
        </div>
        <div className="pointer-events-auto w-full sm:w-80">
          <ShopDetailsSheet />
        </div>
      </div>

      {/* Command bar */}
      <CommandBar />
    </main>
  )
}
