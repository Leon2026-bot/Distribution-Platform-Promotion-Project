import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { BlogCard } from "@/components/blog/BlogCard"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"

export const metadata: Metadata = {
  title: "Blog – Taobao Agent Tips, Guides & Finds | Finds Engine",
  description:
    "Expert guides on using Taobao agents, buying from China safely, comparing platforms, and finding the best products. Updated weekly by the Finds Engine team.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Finds Engine Blog – Taobao Agent Tips & Guides",
    description: "Expert guides on using Taobao agents and buying from China safely.",
    url: `${SITE_URL}/blog`,
  },
}

interface BlogPageProps {
  searchParams: Promise<{ tag?: string; page?: string }>
}

const PER_PAGE = 12

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const tag = params.tag || ""
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1)
  const offset = (page - 1) * PER_PAGE

  const supabase = await createClient()

  // Parallel queries
  const [
    { data: posts, count: totalCount },
    { data: allPosts },
  ] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .range(offset, offset + PER_PAGE - 1),

    supabase
      .from("blog_posts")
      .select("tags")
      .eq("status", "published"),
  ])

  // Collect all unique tags
  const allTags = new Set<string>()
  ;(allPosts ?? []).forEach((p) => p.tags?.forEach((t) => allTags.add(t)))
  const sortedTags = Array.from(allTags).sort()

  const postsList = posts ?? []
  const featuredPost = postsList[0] ?? null
  const restPosts = postsList.slice(1)
  const totalPages = Math.ceil((totalCount ?? 0) / PER_PAGE)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* SEO */}
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
        ]}
      />

      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Finds Engine Blog
        </h1>
        <p className="mt-2 max-w-2xl text-base text-zinc-500">
          Expert guides on using Taobao agents, buying from China safely, platform comparisons,
          and the best product finds — updated weekly.
        </p>
      </div>

      {/* Tag filter */}
      {sortedTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              !tag
                ? "bg-zinc-900 text-white border-zinc-900"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
            }`}
          >
            All
          </Link>
          {sortedTags.map((t) => (
            <Link
              key={t}
              href={`/blog?tag=${t}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                tag === t
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {t.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      )}

      {/* Featured post + grid */}
      {postsList.length > 0 ? (
        <div className="space-y-8">
          {/* Featured + first row */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPost && <BlogCard post={featuredPost} featured />}
            {restPosts.slice(0, 2).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {/* Remaining posts */}
          {restPosts.length > 2 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {restPosts.slice(2).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <Link
                  href={`/blog?page=${page - 1}${tag ? `&tag=${tag}` : ""}`}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                >
                  ← Previous
                </Link>
              )}
              <span className="px-4 text-sm text-zinc-400">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/blog?page=${page + 1}${tag ? `&tag=${tag}` : ""}`}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-200 py-20 text-center">
          <p className="text-zinc-400">No articles yet. Check back soon!</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm text-zinc-600 underline underline-offset-2"
          >
            Browse products →
          </Link>
        </div>
      )}

      {/* Newsletter CTA */}
      <section className="mt-16 rounded-2xl bg-zinc-900 px-6 py-10 text-center text-white sm:px-12">
        <h2 className="text-2xl font-bold">Never miss a new guide</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
          Get the latest Taobao agent tips, product finds, and platform updates delivered to your inbox.
        </p>
        <form
          action="/api/subscribe"
          method="POST"
          className="mx-auto mt-6 flex max-w-sm items-center gap-2"
        >
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            required
            className="h-10 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          <button
            type="submit"
            className="flex h-10 items-center gap-1.5 rounded-lg bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
          >
            Subscribe
            <ArrowRight className="size-3.5" />
          </button>
        </form>
      </section>
    </div>
  )
}
