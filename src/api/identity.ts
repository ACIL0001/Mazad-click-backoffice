import { requests } from './utils';

export interface IdentityVerificationPayload {
  action: 'accept' | 'reject';
}

export interface CreateProfessionalIdentityPayload {
  plan?: string;
  // FormData will contain the files
}

export interface IdentityDocument {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    type: string;
    isVerified: boolean;
  };
  conversionType: 'CLIENT_TO_RESELLER' | 'CLIENT_TO_PROFESSIONAL' | 'PROFESSIONAL_VERIFICATION';
  status: 'DONE' | 'WAITING' | 'REJECTED';
  targetUserType: string;
  sourceUserType: string;
  
  // Optional legacy fields
  commercialRegister?: {
    _id: string;
    filename?: string;
    url?: string;
  };
  nif?: {
    _id: string;
    filename?: string;
    url?: string;
  };
  nis?: {
    _id: string;
    filename?: string;
    url?: string;
  };
  last3YearsBalanceSheet?: {
    _id: string;
    filename?: string;
    url?: string;
  };
  certificates?: {
    _id: string;
    filename?: string;
    url?: string;
  };
  identityCard?: {
    _id: string;
    filename?: string;
    url?: string;
  };
  
  // New required fields
  registreCommerceCarteAuto: {
    _id: string;
    filename?: string;
    url?: string;
  };
  nifRequired: {
    _id: string;
    filename?: string;
    url?: string;
  };
  numeroArticle: {
    _id: string;
    filename?: string;
    url?: string;
  };
  c20: {
    _id: string;
    filename?: string;
    url?: string;
  };
  misesAJourCnas: {
    _id: string;
    filename?: string;
    url?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export class IdentityAPI {
  // Get all identities
  static async getAllIdentities(): Promise<IdentityDocument[]> {
    try {
      const response = await requests.get('/identities');
      return response;
    } catch (error) {
      console.error('Error fetching all identities:', error);
      throw error;
    }
  }

  // Get only pending identities (status = WAITING)
  static async getPendingIdentities(): Promise<IdentityDocument[]> {
    try {
      const response = await requests.get('/identities/pending');
      return response;
    } catch (error) {
      console.error('Error fetching pending identities:', error);
      throw error;
    }
  }

  // Get only accepted identities (status = DONE)
  static async getAcceptedIdentities(): Promise<IdentityDocument[]> {
    try {
      const response = await requests.get('/identities/accepted');
      return response;
    } catch (error) {
      console.error('Error fetching accepted identities:', error);
      throw error;
    }
  }

  // Get pending professional verifications (PROFESSIONAL_VERIFICATION + CLIENT_TO_PROFESSIONAL)
  static async getPendingProfessionals(): Promise<IdentityDocument[]> {
    try {
      const response = await requests.get('/identities/pending/professionals');
      return response;
    } catch (error) {
      console.error('Error fetching pending professionals:', error);
      throw error;
    }
  }

  // Get pending reseller conversions (CLIENT_TO_RESELLER)
  static async getPendingResellers(): Promise<IdentityDocument[]> {
    try {
      const response = await requests.get('/identities/pending/resellers');
      return response;
    } catch (error) {
      console.error('Error fetching pending resellers:', error);
      throw error;
    }
  }

  // Get identity by ID
  static async getIdentityById(id: string): Promise<IdentityDocument> {
    try {
      const response = await requests.get(`/identities/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching identity by ID:', error);
      throw error;
    }
  }

  // Update identity status (accept/reject)
  static async verifyIdentity(identityId: string, payload: IdentityVerificationPayload) {
    try {
      const response = await requests.put(`/identities/${identityId}/verify`, payload);
      return response;
    } catch (error) {
      console.error('Error verifying identity:', error);
      throw error;
    }
  }

  // Delete multiple identities - UPDATED to use query parameters
  static async deleteIdentities(ids: string[]) {
    try {
      const response = await requests.delete(`/identities?ids=${ids.join(',')}`);
      return response;
    } catch (error) {
      console.error('Error deleting identities:', error);
      throw error;
    }
  }

  // Get user's own identity
  static async getMyIdentity(): Promise<IdentityDocument | null> {
    try {
      const response = await requests.get('/identities/me');
      return response;
    } catch (error) {
      console.error('Error fetching my identity:', error);
      throw error;
    }
  }

  // Submit professional identity for existing professionals
  static async submitProfessionalIdentity(formData: FormData) {
    try {
      const response = await requests.post('/identities', formData);
      return response;
    } catch (error) {
      console.error('Error submitting professional identity:', error);
      throw error;
    }
  }

  // Submit reseller identity for clients becoming resellers
  static async submitResellerIdentity(formData: FormData) {
    try {
      const response = await requests.post('/identities/reseller', formData);
      return response;
    } catch (error) {
      console.error('Error submitting reseller identity:', error);
      throw error;
    }
  }

  // Submit professional conversion for clients becoming professionals
  static async submitProfessionalConversion(formData: FormData, plan?: string) {
    try {
      // Add plan to form data if provided
      if (plan) {
        formData.append('plan', plan);
      }
      
      const response = await requests.post('/identities/professional', formData);
      return response;
    } catch (error) {
      console.error('Error submitting professional conversion:', error);
      throw error;
    }
  }

  // Client-side filtering helpers (for backward compatibility)
  static filterPendingProfessionals(identities: any[]) {
    return identities.filter(identity =>
      (identity.conversionType === 'PROFESSIONAL_VERIFICATION' || 
       identity.conversionType === 'CLIENT_TO_PROFESSIONAL' ||
       (identity.user?.type === 'PROFESSIONAL' && !identity.conversionType)) &&
      (identity.status === 'WAITING' || !identity.status)
    );
  }

  static filterPendingResellers(identities: any[]) {
    return identities.filter(identity =>
      (identity.conversionType === 'CLIENT_TO_RESELLER' ||
       (identity.user?.type === 'CLIENT' && !identity.conversionType && 
        identity.identityCard && !identity.commercialRegister)) &&
      (identity.status === 'WAITING' || !identity.status)
    );
  }

  static filterClientToProfessional(identities: any[]) {
    return identities.filter(identity =>
      identity.conversionType === 'CLIENT_TO_PROFESSIONAL' ||
      (identity.user?.type === 'CLIENT' && !identity.conversionType && 
       (identity.commercialRegister || identity.nif || identity.nis))
    );
  }

  static filterAcceptedUsers(identities: any[]) {
    return identities.filter(identity => identity.status === 'DONE');
  }

  static filterRejectedUsers(identities: any[]) {
    return identities.filter(identity => identity.status === 'REJECTED');
  }

  // Helper to determine conversion type from identity data
  static getConversionTypeFromIdentity(identity: any): string {
    if (identity.conversionType) {
      return identity.conversionType;
    }

    // Legacy logic for old records
    if (identity.user?.type === 'PROFESSIONAL') {
      return 'PROFESSIONAL_VERIFICATION';
    } else if (identity.user?.type === 'CLIENT') {
      const hasOnlyIdentityCard = identity.identityCard && 
        !identity.commercialRegister && 
        !identity.nif && 
        !identity.nis;
      
      return hasOnlyIdentityCard ? 'CLIENT_TO_RESELLER' : 'CLIENT_TO_PROFESSIONAL';
    }

    return 'UNKNOWN';
  }

  // Get conversion display info
  static getConversionDisplayInfo(conversionType: string) {
    switch (conversionType) {
      case 'CLIENT_TO_RESELLER':
        return {
          label: 'Client → Revendeur',
          description: 'Conversion d\'un client vers un compte revendeur',
          color: 'info',
          icon: 'eva:arrow-right-outline'
        };
      case 'CLIENT_TO_PROFESSIONAL':
        return {
          label: 'Client → Professionnel',
          description: 'Conversion d\'un client vers un compte professionnel',
          color: 'success',
          icon: 'eva:arrow-up-outline'
        };
      case 'PROFESSIONAL_VERIFICATION':
        return {
          label: 'Vérification Professionnelle',
          description: 'Vérification d\'identité pour un professionnel existant',
          color: 'warning',
          icon: 'eva:checkmark-circle-outline'
        };
      default:
        return {
          label: 'Non défini',
          description: 'Type de conversion non déterminé',
          color: 'default',
          icon: 'eva:question-mark-circle-outline'
        };
    }
  }

  // Legacy methods (keeping for backward compatibility)
  static upload = (form: FormData): Promise<any> => requests.post('/identities', form);
  static update = (status: any): Promise<any> => requests.post('identity/r/update', status);
  static get = (): Promise<any> => requests.get('identity/r/all');
  static remove = (id: string): Promise<any> => requests.delete(`identity/r/remove/${id}`);
  static uploadProfessionalDocuments = (formData: FormData): Promise<any> => requests.post('identity/professional/upload', formData);
}