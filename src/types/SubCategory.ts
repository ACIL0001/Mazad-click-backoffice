import Attachment from "./Attachment"; // Assuming Attachment type is defined here

// As seen in your backend, the 'thumb' is transformed to include url, _id, and filename.
// This matches your existing Attachment type.
// If Attachment only contains url, _id, filename, then this is perfect.
export default interface ISubCategory {
  _id: string;
  name: string;
  category: string; // The ID of the parent category
  thumb?: Attachment | null; // Optional, can be null if no thumbnail
  attributes: string[]; // From your backend schema
  createdAt: string; // From your backend schema (timestamps: true)
  updatedAt: string; // From your backend schema (timestamps: true)
}

// DTO for creating a subcategory (what you send to the backend)
// 'thumb' here would be the string ID of the uploaded attachment,
// or handled as part of a FormData object if an image is uploaded.
export interface CreateSubCategoryPayload {
  name: string;
  category: string; // The ID of the parent category
  attributes?: string[];
  thumb?: string; // Expects attachment ID if provided directly in JSON, or handled via FormData
}

// DTO for updating a subcategory (what you send to the backend for PATCH)
export interface UpdateSubCategoryPayload {
  name?: string;
  category?: string;
  thumb?: string; // Can update with a new attachment ID
  attributes?: string[];
}