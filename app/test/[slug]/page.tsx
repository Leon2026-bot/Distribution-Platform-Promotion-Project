import type { Metadata } from "next"

export function generateStaticParams() {
  return [{ slug: "test" }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return { title: `Test ${slug}` }
}

export default async function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <div>Test: {slug}</div>
}
