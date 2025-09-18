// src/types/SubSubCategory.ts
import type Attachment from "./Attachment"

export default interface ISubSubCategory extends Document {
  name: string
  description?: string
  subcategory: string // ID of the parent subcategory
  attributes: string[]
  thumb?: Attachment | null
}