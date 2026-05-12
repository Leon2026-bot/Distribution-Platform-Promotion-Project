import type { Metadata } from "next"
// v2: force new function identity
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Best Taobao Agents 2026 – Compared & Reviewed | Finds Engine",
  description:
    "Compare the best Taobao and 1688 agents in 2026. Kakobuy, CNFans, Fishgoo and more — fees, QC, shipping, and payment methods reviewed side by side.",
  alternates: { canonical: `${SITE_URL}/partners` },
}

export default async function AgentsPage() {
  const supabase = await createClient()

  const { data: platforms } = await supabase
    .from("agent_platforms")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  const agents = platforms ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Agents", url: `${SITE_URL}/partners` },
        ]}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Agents" },
        ]}
      />

      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Best Taobao &amp; 1688 Agents in 2026
        </h1>
        <p className="mt-2 text-base text-zinc-500">
          Compare fees, shipping, QC and more across {agents.length > 0 ? agents.length : "top"} agent platforms.
          Find the best platform to buy from China.
        </p>
      </div>

      {/* Comparison Table */}
      {agents.length > 0 ? (
        <div className="mb-12 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="pb-3 pr-4 font-semibold text-zinc-900">Platform</th>
                <th className="hidden pb-3 pr-4 font-semibold text-zinc-900 sm:table-cell">Fee</th>
                <th className="hidden pb-3 pr-4 font-semibold text-zinc-900 md:table-cell">Sources</th>
                <th className="hidden pb-3 pr-4 font-semibold text-zinc-900 lg:table-cell">Highlights</th>
                <th className="pb-3 text-right font-semibold text-zinc-900"></th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => {
                const logoUrl = agent.logo_url
                  ? agent.logo_url.startsWith("http")
                    ? agent.logo_url
                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/partners/${agent.logo_url}`
                  : null

                return (
                  <tr
                    key={agent.id}
                    className="border-b border-zinc-100 transition-colors hover:bg-zinc-50"
                  >
                    {/* Platform name + logo */}
                    <td className="py-4 pr-4">
                      <Link
                        href={`/partners/${agent.slug}`}
                        className="group flex items-center gap-3"
                      >
                        {logoUrl ? (
                          <div className="relative h-8 w-20 shrink-0 rounded-lg border border-zinc-100 bg-white p-1">
                            <Image
                              src={logoUrl}
                              alt={agent.name}
                              fill
                              className="object-contain"
                              sizes="80px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-8 w-20 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-500">
                            {agent.name.slice(0, 4)}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-zinc-900 group-hover:underline">
                            {agent.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-zinc-400 sm:hidden">
                            {agent.fee_description || "View details"}
                          </span>
                        </div>
                      </Link>
                    </td>

                    {/* Fee */}
                    <td className="hidden py-4 pr-4 sm:table-cell">
                      <span className="text-zinc-700">
                        {agent.fee_description || "—"}
                      </span>
                    </td>

                    {/* Supported sources */}
                    <td className="hidden py-4 pr-4 md:table-cell">
                      {agent.supported_sources && agent.supported_sources.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {agent.supported_sources.map((source) => (
                            <span
                              key={source}
                              className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>

                    {/* Highlights / CTA */}
                    <td className="hidden py-4 pr-4 lg:table-cell">
                      <Link
                        href={`/partners/${agent.slug}`}
                        className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
                      >
                        View Review →
                      </Link>
                    </td>

                    {/* Visit button */}
                    <td className="py-4 text-right">
                      <Link
                        href={`/partners/${agent.slug}`}
                        className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                      >
                        Shop Now
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mb-12 rounded-xl border border-dashed border-zinc-200 py-16 text-center">
          <p className="text-zinc-400">Agent platform information coming soon.</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm text-zinc-600 underline underline-offset-2"
          >
            Browse all products →
          </Link>
        </div>
      )}

      {/* SEO Content Section */}
      <section className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-xl font-bold text-zinc-900">
          What is a Taobao Agent?
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-zinc-600">
          <p>
            A Taobao agent (also called a shopping agent or proxy buyer) is a service that helps you
            purchase products from Chinese e-commerce platforms like Taobao, 1688, and Weidian.
            They handle language barriers, payment processing, quality inspection, and international
            shipping — making it easy to buy from China from anywhere in the world.
          </p>
          <p>
            On Finds Engine, we compare the top agent platforms so you can find the best one for
            your needs. Whether you&apos;re looking for the lowest fees, the best quality control, or
            the fastest shipping, we&apos;ve got you covered.
          </p>
        </div>

        <h2 className="mb-4 mt-8 text-xl font-bold text-zinc-900">
          How to Choose the Right Agent
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-zinc-600">
          <p>
            <strong>Service fees:</strong> Most agents charge a percentage of the item price (0–10%).
            Some offer free or lower fees for specific categories or during promotions.
          </p>
          <p>
            <strong>Quality Control (QC):</strong> Good agents take photos of your items before
            shipping to verify condition and accuracy. This is crucial for expensive items like
            sneakers and designer goods.
          </p>
          <p>
            <strong>Shipping options:</strong> Look for agents that offer multiple shipping lines
            (EMS, DHL, UPS, etc.) with different speed/cost tradeoffs.
          </p>
          <p>
            <strong>Payment methods:</strong> The best agents accept credit cards, PayPal, and
            cryptocurrency for maximum flexibility.
          </p>
        </div>

        <h2 className="mb-4 mt-8 text-xl font-bold text-zinc-900">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-zinc-600">
          <div>
            <h3 className="mb-1 font-semibold text-zinc-800">
              Is it safe to buy from Taobao agents?
            </h3>
            <p>
              Yes, if you use a reputable platform. The agents listed on Finds Engine are verified
              platforms with established track records. Always check reviews and start with a small
              order to test the service.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-zinc-800">
              How much does a Taobao agent cost?
            </h3>
            <p>
              Agent fees typically range from 0% to 10% of the item price, plus international
              shipping costs. Some agents charge additional fees for QC photos or special requests.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-zinc-800">
              How long does shipping take?
            </h3>
            <p>
              Standard shipping usually takes 2–4 weeks. Express options via DHL or UPS can arrive
              in 5–10 days. Many agents also offer warehouse consolidation to save on shipping costs.
            </p>
          </div>
        </div>
      </section>

      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is it safe to buy from Taobao agents?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, if you use a reputable platform. The agents listed on Finds Engine are verified platforms with established track records. Always check reviews and start with a small order to test the service.",
                },
              },
              {
                "@type": "Question",
                name: "How much does a Taobao agent cost?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Agent fees typically range from 0% to 10% of the item price, plus international shipping costs. Some agents charge additional fees for QC photos or special requests.",
                },
              },
              {
                "@type": "Question",
                name: "How long does shipping take?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Standard shipping usually takes 2–4 weeks. Express options via DHL or UPS can arrive in 5–10 days. Many agents also offer warehouse consolidation to save on shipping costs.",
                },
              },
            ],
          }),
        }}
      />
    </div>
  )
}
