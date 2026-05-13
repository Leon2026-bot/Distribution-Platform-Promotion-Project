import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/promoter/", "/r/", "/shop/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
