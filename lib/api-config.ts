// Server-side (Next.js API routes only)
export function getServerApiUrl(): string {
  return process.env.BACKEND_URL ?? "http://localhost:8000"
}

// Client-side (browser components)
export function getClientApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? ""
}

// True in local dev when no NEXT_PUBLIC_API_URL is set → use relative /api/* (Next.js proxy)
export function shouldUseProxy(): boolean {
  return !process.env.NEXT_PUBLIC_API_URL
}
