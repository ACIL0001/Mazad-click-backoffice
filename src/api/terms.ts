// terms.api.ts
import { requests } from "./utils";
import { Terms, CreateTermsDto, UpdateTermsDto, DeleteTermsResponse } from "../types/terms";

export const TermsAPI = {
  /**
   * Get all terms and conditions (Admin only)
   */
  getAll: (): Promise<Terms[]> => requests.get('terms'),

  /**
   * Get specific terms by ID (Admin only)
   */
  getById: (id: string): Promise<Terms> => requests.get(`terms/${id}`),

  /**
   * Create new terms and conditions (Admin only)
   */
  create: (data: CreateTermsDto): Promise<Terms> => requests.post('terms', data),

  /**
   * Update terms and conditions (Admin only)
   */
  update: (id: string, data: UpdateTermsDto): Promise<Terms> => 
    requests.patch(`terms/${id}`, data),

  /**
   * Delete terms and conditions (Admin only)
   */
  delete: (id: string): Promise<DeleteTermsResponse> => requests.delete(`terms/${id}`),
}