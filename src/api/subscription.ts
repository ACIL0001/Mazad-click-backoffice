import { requests } from './utils';

export interface SubscriptionPlan {
  _id?: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in months (stored as number, not Date)
  isActive: boolean;
  role: string; // PROFESSIONAL or RESELLER
  benefits?: string[]; // Array of plan benefits
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlanDto {
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive?: boolean;
  role: string;
  benefits?: string[];
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {
  _id: string;
}

export const SubscriptionAPI = { // 'export' has been added here
  // Get all subscription plans
  getPlans: (): Promise<SubscriptionPlan[]> => 
    requests.get('subscription/plans'),
  
  // Get plans by role
  getPlansByRole: (role: string): Promise<{ success: boolean; plans: SubscriptionPlan[] }> => 
    requests.get(`subscription/plans/${role}`),
  
  // Create a new subscription plan
  createPlan: (plan: CreatePlanDto): Promise<SubscriptionPlan> => 
    requests.post('subscription/admin/plans', plan),
  
  // Update an existing subscription plan
  updatePlan: (planId: string, plan: Partial<CreatePlanDto>): Promise<SubscriptionPlan> => 
    requests.patch(`subscription/admin/plans/${planId}`, plan),
  
  // Delete a subscription plan
  deletePlan: (planId: string): Promise<void> => 
    requests.delete(`subscription/admin/plans/${planId}`),
  
  // Initialize default plans
  initializePlans: (): Promise<any> => 
    requests.post('subscription/admin/init-plans', {}),
  
  // Get subscription statistics
  getStats: (): Promise<any> => 
    requests.get('subscription/admin/stats'),
  
  // Get all subscriptions
  getAllSubscriptions: (): Promise<any> => 
    requests.get('subscription'),
  
  // ADDED: Get my subscription (the missing method)
  getMySubscription: (): Promise<any> =>
    requests.get('subscription/my-subscription'),
  
  // Get all payments
  getAllPayments: (page?: number, limit?: number): Promise<any> => 
    requests.get(`subscription/admin/payments?page=${page || 1}&limit=${limit || 10}`),
  
  // Cleanup expired subscriptions and payments
  cleanupExpired: (): Promise<any> => 
    requests.post('subscription/admin/cleanup-expired', {}),
};