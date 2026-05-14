import Link from "next/link"
import Image from "next/image"
import type { Database } from "@/types/supabase"

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"]

interface BlogCardProps {
  post: BlogPost
}

const TAG_COLORS: Record<string, string> = {
  guide: "bg-amber-50 text-amber-700 border-amber-200",
  review: "bg-blue-50 text-blue-700 border-blue-200",
  finds: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "how-to": "bg-purple-50 text-purple-700 border-purple-200",
  comparison: "bg-rose-50 text-rose-700 border-rose-200",
  news: "bg-sky-50 text-sky-700 border-sky-200",
}

export function BlogCard({ post }: BlogCardProps) {
  const coverImg = post.cover_image
    ? post.cover_image.startsWith("http")
      ? post.cover_image
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog/${post.cover_image}`
    : null

  const primaryTag = post.tags?.[0] ?? "guide"
  const tagColor = TAG_COLORS[primaryTag.toLowerCase()] ?? "bg-zinc-50 text-zinc-600 border-zinc-200"

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-4 overflow-hidden rounded-xl border border-zinc-100 bg-white p-3 transition-all hover:border-zinc-200 hover:shadow-sm sm:gap-5 sm:p-4"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-50 sm:w-36">
        {coverImg ? (
          <Image
            src={coverImg}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="144px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-2xl opacity-20">📝</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-col justify-center">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${tagColor}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-zinc-600 sm:text-base">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-500 sm:line-clamp-1 sm:text-sm">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-1.5 flex items-center gap-3">
          {post.published_at && (
            <time
              dateTime={post.published_at}
              className="text-[11px] text-zinc-400"
            >
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          )}
          {post.view_count != null && post.view_count > 0 && (
            <span className="text-[11px] text-zinc-400">{post.view_count.toLocaleString()} views</span>
          )}
        </div>
      </div>
    </Link>
  )
}
