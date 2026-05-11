import Link from "next/link"

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-5xl font-bold text-zinc-200">404</p>
      <h1 className="mb-2 text-xl font-semibold text-zinc-900">Product not found</h1>
      <p className="mb-6 text-sm text-zinc-500">
        This product may have been removed or the URL is incorrect.
      </p>
      <div className="flex gap-3">
        <Link
          href="/products"
          className="inline-flex h-8 items-center rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Browse Products
        </Link>
        <Link
          href="/"
          className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
