// Category type constants
export const CATEGORY_TYPE = {
  PRODUCT: "PRODUCT",
  SERVICE: "SERVICE"
} as const;

export type CategoryType = typeof CATEGORY_TYPE[keyof typeof CATEGORY_TYPE];

// Interfaces
export interface ICategory {
  _id: string
  name: string
  type: "product" | "service" | string
  description: string
  attributes?: string[]
  
  // New nested category fields
  parent?: string | null
  children?: ICategory[]
  level?: number
  path?: string[]
  fullPath?: string
  
  // Legacy fields
  productsCount?: number
  servicesCount?: number
  thumb?: {
    url: string
    fileName: string
    original?: string
    _id?: string
  }
  subcategories?: ICategory[] // Keep for backward compatibility
}