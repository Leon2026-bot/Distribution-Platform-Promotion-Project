import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"

// SEO Metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params
  const { data: agent } = await supabaseAdmin
    .from("agent_platforms")
    .select("name, fee_description, supported_sources")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!agent) return { title: "Agent Platform Not Found | Finds Engine" }

  const title = `${agent.name} Review 2026 – Fees, Shipping & More | Finds Engine`
  const description = `Read our detailed review of ${agent.name}. Compare fees, shipping options, supported sources, and more. Find out if ${agent.name} is the right agent for you.`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/partners/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/partners/${slug}`,
    },
  }
}

// Page Component
export default async function AgentPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  const { data: agent } = await supabaseAdmin
    .from("agent_platforms")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!agent) notFound()

  let jumpUrl = agent.jump_url_template || agent.website_url || "#"

  const logoUrl = agent.logo_url
    ? agent.logo_url.startsWith("http")
      ? agent.logo_url
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/partners/${agent.logo_url}`
    : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Agents", url: `${SITE_URL}/partners` },
          { name: agent.name, url: `${SITE_URL}/partners/${slug}` },
        ]}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Agents", href: "/partners" },
          { label: agent.name },
        ]}
      />

      <div className="mb-8 mt-4 flex items-start gap-5">
        {logoUrl ? (
          <div className="relative h-20 w-40 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-white p-2 shadow-sm">
            <Image
              src={logoUrl}
              alt={`${agent.name} logo`}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex h-20 w-40 shrink-0 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 text-2xl font-bold text-zinc-400">
            {agent.name.slice(0, 4)}
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {agent.name} Review 2026
          </h1>
          <p className="mt-1.5 text-base text-zinc-500">
            Compare fees, shipping, and more on {agent.name}.
          </p>
        </div>

        <a
          href={jumpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Shop on {agent.name} →
        </a>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {agent.fee_description && (
            <div className="mb-6 rounded-xl border border-zinc-100 p-6">
              <h2 className="mb-3 text-lg font-bold text-zinc-900">Service Fees</h2>
              <p className="text-sm leading-relaxed text-zinc-600">
                {agent.fee_description}
              </p>
            </div>
          )}

          {agent.supported_sources && agent.supported_sources.length > 0 && (
            <div className="mb-6 rounded-xl border border-zinc-100 p-6">
              <h2 className="mb-3 text-lg font-bold text-zinc-900">Supported Sources</h2>
              <div className="flex flex-wrap gap-2">
                {agent.supported_sources.map((source: string) => (
                  <span
                    key={source}
                    className="inline-block rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {agent.site_promo_code && (
            <div className="mb-6 rounded-xl border border-zinc-100 bg-zinc-50 p-6">
              <h2 className="mb-3 text-lg font-bold text-zinc-900">Promo Code</h2>
              <code className="rounded-md bg-white px-3 py-2 text-sm font-bold text-zinc-900 shadow-sm">
                {agent.site_promo_code}
              </code>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-100 p-6">
            <h3 className="mb-4 text-base font-bold text-zinc-900">Quick Info</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Website</dt>
                <dd className="mt-1">
                  {agent.website_url ? (
                    <a
                      href={agent.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-zinc-700 hover:underline"
                    >
                      {agent.website_url.replace(/https?:\/\//, "")}
                    </a>
                  ) : (
                    <span className="text-sm text-zinc-400">N/A</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Sources</dt>
                <dd className="mt-1 text-sm text-zinc-700">
                  {agent.supported_sources?.length || 0} platforms
                </dd>
              </div>
            </dl>

            <a
              href={jumpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full rounded-lg bg-zinc-900 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Visit {agent.name} →
            </a>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-zinc-900">
          Why Choose {agent.name}?
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-zinc-600">
          <p>
            {agent.name} is a trusted agent platform that helps you buy from Chinese e-commerce
            platforms like Taobao, 1688, and Weidian.
          </p>
          <p>
            With competitive fees and reliable service, {agent.name} is a popular choice for
            international buyers looking to purchase from China.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-zinc-900">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-zinc-600">
          <div>
            <h3 className="mb-1 font-semibold text-zinc-800">
              Is {agent.name} safe to use?
            </h3>
            <p>
              Yes, {agent.name} is a verified platform with an established track record.
              They handle payment processing, quality inspection, and international shipping
              to make buying from China safe and easy.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-zinc-800">
              How much does {agent.name} charge?
            </h3>
            <p>
              {agent.fee_description ||
                `${agent.name} offers competitive service fees. Contact them directly for the most up-to-date fee structure.`}
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-zinc-800">
              What platforms does {agent.name} support?
            </h3>
            <p>
              {agent.supported_sources && agent.supported_sources.length > 0
                ? `${agent.name} supports ${agent.supported_sources.join(", ")}.`
                : `${agent.name} supports major Chinese e-commerce platforms.`}
            </p>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `Is ${agent.name} safe to use?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${agent.name} is a verified platform with an established track record. They handle payment processing, quality inspection, and international shipping to make buying from China safe and easy.`,
                },
              },
              {
                "@type": "Question",
                name: `How much does ${agent.name} charge?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: agent.fee_description ||
                    `${agent.name} offers competitive service fees. Contact them directly for the most up-to-date fee structure.`,
                },
              },
              {
                "@type": "Question",
                name: `What platforms does ${agent.name} support?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: agent.supported_sources && agent.supported_sources.length > 0
                    ? `${agent.name} supports ${agent.supported_sources.join(", ")}.`
                    : `${agent.name} supports major Chinese e-commerce platforms.`,
                },
              },
            ],
          }),
        }}
      />
    </div>
  )
}
