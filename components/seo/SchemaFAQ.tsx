interface FAQ {
  question: string
  answer: string
}

interface SchemaFAQProps {
  faqs: FAQ[]
}

export function SchemaFAQ({ faqs }: SchemaFAQProps) {
  if (!faqs || faqs.length === 0) return null

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
