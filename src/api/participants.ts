import { requests } from "./utils";

export const ParticipantsAPI = {
  getAllParticipants: (): Promise<any> => requests.get('participant'), // Matches GET /participant
  getParticipantsByBidId: (bidId: string): Promise<any> => requests.get(`participant/bid/${bidId}`), // Matches GET /participant/bid/:id
  createParticipant: (bidId: string, data: any): Promise<any> => requests.post(`participant/bid/${bidId}`, data), // Matches POST /participant/bid/:id
  removeParticipant: (id: string): Promise<any> => requests.delete(`participant/${id}`), // Matches DELETE /participant/:id
}