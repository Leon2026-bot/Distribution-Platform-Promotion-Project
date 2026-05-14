import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { BlogContent, RelatedProducts } from "@/components/blog/BlogContent"
import { BlogCard } from "@/components/blog/BlogCard"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Database } from "@/types/supabase"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"]

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>
}

// ── Static params ─────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const { data } = await supabaseAdmin
    .from("blog_posts")
    .select("slug")
    .eq("status", "published")

  return (data ?? []).map(({ slug }) => ({ slug }))
}

// ── SEO Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: post } = await supabaseAdmin
    .from("blog_posts")
    .select("title, seo_title, seo_description, excerpt, cover_image, published_at, author_id")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!post) return { title: "Article Not Found | Finds Engine" }

  const title = post.seo_title || post.title
  const description = post.seo_description || post.excerpt || ""

  const ogImage = post.cover_image
    ? post.cover_image.startsWith("http")
      ? post.cover_image
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog/${post.cover_image}`
    : undefined

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/blog/${slug}`,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

// ── Page Component ───────────────────────────────────────────────────────
export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params

  const { data: post } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!post) notFound()

  // ── Parallel: related posts + author ─────────────────────────────────
  const [{ data: relatedPosts }, { data: authorData }] = await Promise.all([
    supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .neq("id", post.id)
      .limit(3),

    supabaseAdmin
      .from("promoters")
      .select("display_name, avatar_url")
      .eq("user_id", post.author_id ?? "")
      .maybeSingle(),
  ])

  const coverImg = post.cover_image
    ? post.cover_image.startsWith("http")
      ? post.cover_image
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog/${post.cover_image}`
    : null

  const author = authorData ?? { display_name: "Finds Engine Team", avatar_url: null }
  const related = (relatedPosts ?? []).filter((p) => p.id !== post.id).slice(0, 3)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* SEO */}
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: post.title, url: `${SITE_URL}/blog/${slug}` },
        ]}
      />

      {/* JSON-LD Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.seo_title || post.title,
            description: post.seo_description || post.excerpt || "",
            image: coverImg ?? undefined,
            datePublished: post.published_at ?? undefined,
            dateModified: post.updated_at ?? undefined,
            author: {
              "@type": "Organization",
              name: author.display_name,
            },
            publisher: {
              "@type": "Organization",
              name: "Finds Engine",
              url: SITE_URL,
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${SITE_URL}/blog/${slug}`,
            },
          }),
        }}
      />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      {/* Header */}
      <article className="mt-4">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-medium capitalize text-zinc-600 transition-colors hover:bg-zinc-200"
              >
                {tag.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold leading-snug tracking-tight text-zinc-900 sm:text-4xl">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              {author.avatar_url && (
                <AvatarImage src={author.avatar_url} alt={author.display_name ?? undefined} />
              )}
              <AvatarFallback className="text-xs">
                {author.display_name?.charAt(0) ?? "F"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-zinc-700">{author.display_name}</span>
          </div>

          {/* Date */}
          {post.published_at && (
            <time
              dateTime={post.published_at}
              className="text-sm text-zinc-400"
            >
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          )}

          {/* Read time */}
          {post.content && (
            <span className="text-sm text-zinc-400">
              {Math.ceil(post.content.split(/\s+/).length / 200)} min read
            </span>
          )}
        </div>

        {/* Cover image */}
        {coverImg && (
          <div className="mt-6 aspect-[2/1] overflow-hidden rounded-2xl bg-zinc-50">
            <Image
              src={coverImg}
              alt={post.title}
              width={1200}
              height={600}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        )}

        <Separator className="my-8" />

        {/* Content */}
        {post.content && <BlogContent content={post.content} />}

        <Separator className="my-10" />

        {/* Author box */}
        <div className="flex items-center gap-4 rounded-xl border border-zinc-100 p-6">
          <Avatar className="size-14">
            {author.avatar_url && (
              <AvatarImage src={author.avatar_url} alt={author.display_name ?? undefined} />
            )}
            <AvatarFallback className="text-lg">
              {author.display_name?.charAt(0) ?? "F"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Written by</p>
            <p className="mt-0.5 font-semibold text-zinc-900">{author.display_name}</p>
            <p className="mt-1 text-sm text-zinc-500">
              The Finds Engine editorial team provides expert guides on Taobao agents, product
              sourcing, and international shipping from China.
            </p>
          </div>
        </div>

        {/* Related products (if any) */}
        {post.related_products && post.related_products.length > 0 && (
          <RelatedProducts products={post.related_products as unknown as Array<{id: string; title: string; slug: string; images: string[]; price_usd: number | null; price_cny: number}>} />
        )}

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-zinc-900">Related Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}

        {/* Back to blog */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            ← Back to Blog
          </Link>
        </div>
      </article>
    </div>
  )
}
