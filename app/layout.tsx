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

const SITE_URL = "https://www.massivcart.com"
const SITE_NAME = "Massiv Cart AI"
const SITE_TITLE = "Massiv Cart AI — Cheapest grocery prices in Jamaica"
const SITE_DESCRIPTION =
  "Find the cheapest place to buy your groceries anywhere in Jamaica. Search in plain English or snap a receipt — AI finds the cheapest stores near you."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Massiv Cart AI",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "grocery prices Jamaica",
    "cheapest groceries Jamaica",
    "price comparison Jamaica",
    "AI shopping assistant",
    "receipt scanner",
    "supermarket prices Jamaica",
  ],
  authors: [{ name: "Hugh Scott", url: "https://hughscott.dev" }],
  creator: "Hugh Scott",
  publisher: "Hugh Scott",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_JM",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: "@hughscottjr",
    site: "@hughscottjr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#hugh`,
      name: "Hugh Scott",
      url: "https://hughscott.dev",
      jobTitle: "Software Engineer",
      sameAs: [
        "https://github.com/HughScott2002",
        "https://www.linkedin.com/in/hugh-scott-3912421a5",
        "https://x.com/hughscottjr",
      ],
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#mark`,
      name: "Mark Hinds",
      url: "https://github.com/pro-m16",
      sameAs: [
        "https://github.com/pro-m16",
        "https://www.linkedin.com/in/mark-hinds-013367204",
      ],
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#barrington`,
      name: "Barrington Patterson",
      url: "https://barrington-portfolio.vercel.app",
      sameAs: [
        "https://github.com/barry-g1076",
        "https://www.linkedin.com/in/barrington-patterson-7b86aa22a",
        "https://barrington-portfolio.vercel.app",
      ],
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "ShoppingApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "JMD" },
      author: { "@id": `${SITE_URL}/#hugh` },
      creator: { "@id": `${SITE_URL}/#hugh` },
      contributor: [
        { "@id": `${SITE_URL}/#hugh` },
        { "@id": `${SITE_URL}/#mark` },
        { "@id": `${SITE_URL}/#barrington` },
      ],
      areaServed: { "@type": "Country", name: "Jamaica" },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
