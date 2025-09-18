import { requests } from "./utils";

export const OffersAPI = {
  getOffers: (data: any): Promise<any> => requests.post(`/offers/all`, data), // Matches POST /offers/all
  createOffer: (bidId: string, data: any): Promise<any> => requests.post(`/offers/${bidId}`, data), // Matches POST /offers/:bidId
  getOffersByBidId: (bidId: string): Promise<any> => requests.get(`/offers/${bidId}`), // Matches GET /offers/:id

  // New: Matches GET /offers/seller/:id
  getOffersBySellerId: (sellerId: string): Promise<any> => requests.get(`/offers/seller/${sellerId}`),

  // New: Matches DELETE /offers/:id
  deleteOffer: (id: string): Promise<any> => requests.delete(`/offers/${id}`),
}