interface ParsedSource {
  source_type: "taobao" | "tmall" | "1688" | "weidian" | "unknown"
  source_item_id: string
}

/**
 * Parse a source URL and extract source_type and source_item_id.
 * Supports Taobao, Tmall, 1688, and Weidian URLs.
 */
export function parseSourceUrl(url: string): ParsedSource | null {
  if (!url) return null

  // Taobao: ?id=123456
  const taobaoMatch = url.match(/[?&]id=(\d+)/)
  if (url.includes("taobao.com") && taobaoMatch) {
    return { source_type: "taobao", source_item_id: taobaoMatch[1] }
  }

  // Tmall: ?id=123456
  const tmallMatch = url.match(/[?&]id=(\d+)/)
  if (url.includes("tmall.com") && tmallMatch) {
    return { source_type: "tmall", source_item_id: tmallMatch[1] }
  }

  // 1688: /offer/123456.html
  const alibabaMatch = url.match(/\/offer\/(\d+)/)
  if (url.includes("1688.com") && alibabaMatch) {
    return { source_type: "1688", source_item_id: alibabaMatch[1] }
  }

  // Weidian: /item/123456.html
  const weidianMatch = url.match(/\/item\/(\d+)/)
  if (url.includes("weidian.com") && weidianMatch) {
    return { source_type: "weidian", source_item_id: weidianMatch[1] }
  }

  // Fallback: try generic id pattern for any Chinese marketplace
  const genericMatch = url.match(/[?&]id=(\d+)/)
  if (genericMatch) {
    return { source_type: "unknown", source_item_id: genericMatch[1] }
  }

  return null
}
