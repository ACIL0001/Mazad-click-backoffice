import Review from '../types/Review';
import { requests } from './utils';

export const ReviewAPI = {
  // Endpoints from ReviewController
  likeUser: (userId: string, comment?: string): Promise<any> => requests.post(`review/like/${userId}`, { comment }),
  dislikeUser: (userId: string, comment?: string): Promise<any> => requests.post(`review/dislike/${userId}`, { comment }),
  adjustUserRateByAdmin: (userId: string, delta: number): Promise<any> => requests.post(`review/rate/${userId}`, { delta }),

  get: (id: string): Promise<any> => requests.get(`review/${id}`), // No direct match in controller, keep if handled elsewhere
  find: (): Promise<any> => requests.get(`review/r/find`), // No direct match in controller, keep if handled elsewhere
  submit: (review: Review): Promise<any> => requests.post('review/submit', review), // No direct match in controller, keep if handled elsewhere
  remove: (id: string): Promise<any> => requests.delete(`review/delete/${id}`), // No direct match in controller, keep if handled elsewhere
};