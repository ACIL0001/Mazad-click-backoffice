import { requests } from './utils';

export interface UserDocument {
  _id: string;
  originalname: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

export interface UserDocuments {
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
  status: string;
  commercialRegister?: UserDocument;
  nif?: UserDocument;
  nis?: UserDocument;
  last3YearsBalanceSheet?: UserDocument;
  certificates?: UserDocument;
  identityCard?: UserDocument;
  registreCommerceCarteAuto?: UserDocument;
  nifRequired?: UserDocument;
  numeroArticle?: UserDocument;
  c20?: UserDocument;
  misesAJourCnas?: UserDocument;
  carteFellah?: UserDocument;
  paymentProof?: UserDocument;
  createdAt: string;
  updatedAt: string;
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
    secteur?: string;
    entreprise?: string;
    postOccupé?: string;
  };
  status: string;
  conversionType?: string;
  targetUserType?: string;
  commercialRegister?: UserDocument;
  nif?: UserDocument;
  nis?: UserDocument;
  last3YearsBalanceSheet?: UserDocument;
  certificates?: UserDocument;
  identityCard?: UserDocument;
  registreCommerceCarteAuto?: UserDocument;
  nifRequired?: UserDocument;
  numeroArticle?: UserDocument;
  c20?: UserDocument;
  misesAJourCnas?: UserDocument;
  carteFellah?: UserDocument;
  paymentProof?: UserDocument;
  createdAt: string;
  updatedAt: string;
}

export const IdentityAPI = {
  getUserDocuments: (userId: string): Promise<UserDocuments> => 
    requests.get(`identities/user/${userId}`),
  
  // Get all identities
  getAllIdentities: (): Promise<IdentityDocument[]> => 
    requests.get('identities'),
  
  // Get pending identities
  getPendingIdentities: (): Promise<IdentityDocument[]> => 
    requests.get('identities/pending'),
  
  // Get pending professionals
  getPendingProfessionals: (): Promise<IdentityDocument[]> => 
    requests.get('identities/pending/professionals'),
  
  // Get pending resellers
  getPendingResellers: (): Promise<IdentityDocument[]> => 
    requests.get('identities/pending/resellers'),
  
  // Get accepted identities
  getAcceptedIdentities: (): Promise<IdentityDocument[]> => 
    requests.get('identities/accepted'),
  
  // Get rejected identities
  getRejectedIdentities: (): Promise<IdentityDocument[]> => 
    requests.get('identities/rejected'),
  
  // Verify identity
  verifyIdentity: (identityId: string, action: 'accept' | 'reject'): Promise<any> => 
    requests.put(`identities/${identityId}/verify`, { action }),

  // Certify identity (marks user as certified and verified, rate -> 5)
  certifyIdentity: (identityId: string): Promise<any> =>
    requests.put(`identities/${identityId}/certify`, {}),
  
  // Delete identity
  deleteIdentity: (identityId: string): Promise<any> => 
    requests.delete(`identities/${identityId}`),

  // Delete multiple identities
  deleteIdentities: async (identityIds: string[]): Promise<any> => {
    const results = await Promise.allSettled(
      identityIds.map(id => requests.delete(`identities/${id}`))
    );
    
    // Check which requests failed (not counting 404 as failures since item might already be deleted)
    const failed = results.filter((r, index) => {
      if (r.status === 'rejected') {
        // Check if it's a 400/404 error (item not found or already deleted)
        const error = r.reason;
        const status = error?.response?.status;
        // If status is 400 or 404, treat as success (item already deleted)
        if (status === 400 || status === 404) {
          return false; // Don't count as failed
        }
        return true; // Count as failed
      }
      return false;
    });
    
    if (failed.length > 0) {
      throw new Error(`${failed.length} identité(s) n'ont pas pu être supprimée(s)`);
    }
    
    // Count successful deletions (including already-deleted items)
    const successful = results.filter(r => 
      r.status === 'fulfilled' || 
      (r.status === 'rejected' && (r.reason?.response?.status === 400 || r.reason?.response?.status === 404))
    ).length;
    
    return { success: true, deleted: successful };
  },

  // Delete document  
  deleteDocument: (identityId: string, field: string): Promise<any> => 
    requests.delete(`identities/${identityId}/documents/${field}`),

  // Update document
  updateDocumentByIdentity: (identityId: string, field: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', field);
    return requests.put(`identities/${identityId}/update-document`, formData);
  },

  // Get identity by ID
  getIdentityById: (identityId: string): Promise<IdentityDocument> => 
    requests.get(`identities/${identityId}`),
  
  // Helper function to determine conversion type from identity
  getConversionTypeFromIdentity: (identity: IdentityDocument): string => {
    if (identity.conversionType) {
      return identity.conversionType;
    }

    // Legacy logic for records without conversionType
    if (identity.commercialRegister || identity.nif || identity.nis) {
      return 'PROFESSIONAL_VERIFICATION';
    } else if (identity.identityCard) {
      return 'CLIENT_TO_RESELLER';
    }

    return 'UNKNOWN';
  },

  // Helper function to get display information for conversion type
  getConversionDisplayInfo: (conversionType: string): { label: string; description: string; color: string; icon: string } => {
    switch (conversionType) {
      case 'PROFESSIONAL_VERIFICATION':
        return {
          label: 'Vérification Professionnelle',
          description: 'Demande de vérification professionnelle',
          color: 'warning',
          icon: 'eva:shield-checkmark-outline'
        };
      case 'CLIENT_TO_PROFESSIONAL':
        return {
          label: 'Client → Professionnel',
          description: 'Demande de conversion en professionnel',
          color: 'success',
          icon: 'eva:star-outline'
        };
      case 'CLIENT_TO_RESELLER':
        return {
          label: 'Client → Revendeur',
          description: 'Demande de conversion en revendeur',
          color: 'info',
          icon: 'eva:shopping-bag-outline'
        };
      default:
        return {
          label: 'Inconnu',
          description: 'Type de conversion inconnu',
          color: 'default',
          icon: 'eva:person-outline'
        };
    }
  }
};