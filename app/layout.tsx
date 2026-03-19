import type { Metadata, Viewport } from "next"
import { Geist_Mono, Figtree } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { QueryProvider } from "@/components/query-provider"
import { cn } from "@/lib/utils"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#00d26a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "MASSIV Cart AI",
    template: "%s | MASSIV Cart AI",
  },
  description:
    "Realtime price intelligence for almost anything. Find the cheapest prices near you, upload receipts to earn Scout Points, and let AI do the shopping math.",
  keywords: [
    "price tracker",
    "Jamaica",
    "cheapest prices",
    "AI shopping",
    "receipt scanner",
    "price intelligence",
  ],
  authors: [{ name: "MASSIV Cart AI" }],
  openGraph: {
    title: "MASSIV Cart AI",
    description: "Find the cheapest grocery prices near you in Jamaica.",
    siteName: "MASSIV Cart AI",
    locale: "en_JM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MASSIV Cart AI",
    description: "Find the cheapest grocery prices near you in Jamaica.",
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  verification: {
    other: {
      "claude-verify": "claude-site-verify-massivcart-2026",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        figtree.variable
      )}
    >
      <body>
        <ThemeProvider defaultTheme="dark">
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
