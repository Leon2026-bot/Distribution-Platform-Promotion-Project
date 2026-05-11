import type { Database } from "@/types/supabase"

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"]

interface SchemaArticleProps {
  article: BlogPost
}

export function SchemaArticle({ article }: SchemaArticleProps) {
  const coverImage = article.cover_image
    ? article.cover_image.startsWith("http")
      ? article.cover_image
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog/${article.cover_image}`
    : undefined

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || undefined,
    image: coverImage,
    datePublished: article.published_at || undefined,
    dateModified: article.updated_at || undefined,
    author: {
      "@type": "Organization",
      name: "Finds Engine",
    },
    publisher: {
      "@type": "Organization",
      name: "Finds Engine",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${article.slug}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
