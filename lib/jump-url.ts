interface JumpUrlParams {
  platform: {
    jump_url_template: string
    site_promo_code: string | null
    id: string
  }
  product: {
    source_item_id: string | null
  }
  promoter: {
    id: string
    channels: Record<string, { member_id: string }>
  } | null
}

/**
 * Build the final jump URL for a product on a platform.
 * Uses promoter's member_id if configured, otherwise falls back to site_promo_code.
 */
export function buildJumpUrl({ platform, product, promoter }: JumpUrlParams): string {
  const template = platform.jump_url_template
  if (!template) return "#"

  const memberId = promoter
    ? promoter.channels[platform.id]?.member_id
    : platform.site_promo_code

  return template
    .replace("{item_id}", product.source_item_id || "")
    .replace("{member_id}", memberId || "")
}
