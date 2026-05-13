import Link from "next/link"
import Image from "next/image"
import type { Database } from "@/types/supabase"

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"]

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
}

const TAG_COLORS: Record<string, string> = {
  guide: "bg-amber-50 text-amber-700 border-amber-200",
  review: "bg-blue-50 text-blue-700 border-blue-200",
  finds: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "how-to": "bg-purple-50 text-purple-700 border-purple-200",
  comparison: "bg-rose-50 text-rose-700 border-rose-200",
  news: "bg-sky-50 text-sky-700 border-sky-200",
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
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
      className={`group flex flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white transition-all hover:border-zinc-200 hover:shadow-sm ${
        featured ? "col-span-2 row-span-2" : ""
      }`}
    >
      {/* Cover image */}
      <div
        className={`relative overflow-hidden bg-zinc-50 ${
          featured ? "aspect-[2/1]" : "aspect-video"
        }`}
      >
        {coverImg ? (
          <Image
            src={coverImg}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={featured ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 640px) 50vw, 100vw"}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl opacity-20">📝</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col ${featured ? "p-6" : "p-4"}`}>
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
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
        <h3
          className={`font-semibold text-zinc-900 transition-colors group-hover:text-zinc-600 ${
            featured ? "line-clamp-3 text-xl leading-snug" : "line-clamp-2 text-sm leading-snug"
          }`}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            className={`mt-1.5 line-clamp-2 text-zinc-500 ${
              featured ? "text-sm" : "text-xs"
            }`}
          >
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-auto flex items-center justify-between pt-3">
          {post.published_at && (
            <time
              dateTime={post.published_at}
              className="text-xs text-zinc-400"
            >
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          )}
          {post.view_count != null && post.view_count > 0 && (
            <span className="text-xs text-zinc-400">{post.view_count.toLocaleString()} views</span>
          )}
        </div>
      </div>
    </Link>
  )
}
