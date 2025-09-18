import { requests } from "./utils";

export const AuctionsAPI = {
  getAuctions: (): Promise<any> => requests.get('bid'), 
  create: (data: any): Promise<any> => requests.post('bid', data), 
  getAuctionById: (id: string): Promise<any> => requests.get(`bid/${id}`), 
  update: (id: string, data: any): Promise<any> => requests.put(`bid/${id}`, data), 

  remove: (id: string): Promise<any> => requests.delete(`bid/${id}`),

  getMyBids: (): Promise<any> => requests.get('bid/my-bids'),

  checkBidsToUser: (data: any): Promise<any> => requests.post('bid/check', data),

  accept: (id: string, winnerId: string): Promise<any> => requests.put(`bid/accept/${id}`, { winner: winnerId })
}