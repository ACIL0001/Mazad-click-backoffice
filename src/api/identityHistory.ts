import { requests } from './utils';
import { IdentityDocument } from './identity';

export interface IdentityHistoryDocument {
  _id: string;
  identity: string | IdentityDocument;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    type: string;
    isVerified: boolean;
    isCertified?: boolean;
    entreprise?: string;
  };
  actionType: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  conversionType: 'CLIENT_TO_PROFESSIONAL' | 'CLIENT_TO_RESELLER' | 'PROFESSIONAL_VERIFICATION';
  admin?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    type: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const IdentityHistoryAPI = {
  getHistory: (): Promise<IdentityHistoryDocument[]> =>
    requests.get('identity-history'),
};
