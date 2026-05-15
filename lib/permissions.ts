/**
 * Promoter module permissions
 *
 * Default: all modules enabled
 */
export const MODULE_KEYS = [
  "dashboard",
  "products",
  "my_products",
  "custom",
  "links",
  "settings",
  "decorate",
] as const

export type ModuleKey = (typeof MODULE_KEYS)[number]

export interface PromoterPermissions {
  dashboard?: boolean
  products?: boolean
  my_products?: boolean
  custom?: boolean
  links?: boolean
  settings?: boolean
  decorate?: boolean
}

export const DEFAULT_PERMISSIONS: Required<PromoterPermissions> = {
  dashboard: true,
  products: true,
  my_products: true,
  custom: true,
  links: true,
  settings: true,
  decorate: true,
}

/**
 * Check if a module is enabled for a promoter.
 * Returns true if permissions is null/undefined (backward compat).
 */
export function isModuleEnabled(
  permissions: PromoterPermissions | null | undefined,
  module: ModuleKey
): boolean {
  if (!permissions) return true
  return permissions[module] ?? true
}

/**
 * Get enabled nav items based on permissions.
 */
export function filterNavItems<T extends { label: string }>(
  items: Array<T & { module?: ModuleKey }>,
  permissions: PromoterPermissions | null | undefined
): T[] {
  return items.filter((item) => {
    if (!item.module) return true
    return isModuleEnabled(permissions, item.module)
  })
}
