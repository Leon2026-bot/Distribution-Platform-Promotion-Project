/**
 * Convert CNY price to USD using the configured exchange rate.
 */
export function cnyToUsd(cny: number): number {
  const rate = parseFloat(process.env.NEXT_PUBLIC_USD_RATE || "7.2")
  return cny / rate
}

/**
 * Estimate the final platform price including agent service fee.
 * @param priceCny - Original product price in CNY
 * @param feeRate - Platform fee rate as a decimal (e.g., 0.05 for 5%)
 */
export function estimatePlatformPrice(
  priceCny: number,
  feeRate: number = 0.05
): number {
  const priceWithFee = priceCny * (1 + feeRate)
  return cnyToUsd(priceWithFee)
}

/**
 * Format a USD price for display.
 */
export function formatUsd(usd: number): string {
  return `$${usd.toFixed(2)}`
}
