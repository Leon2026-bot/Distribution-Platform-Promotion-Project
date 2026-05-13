import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900">404</h1>
      <p className="mt-2 text-lg text-zinc-500">Promoter not found</p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-zinc-600"
      >
        Back to Home
      </Link>
    </div>
  )
}
