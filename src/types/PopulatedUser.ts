// PopulatedUser type definition for user details with additional populated fields
export interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  accountType?: string;
  phone?: string;
  isPhoneVerified?: boolean;
  avatarUrl?: string;
  photoURL?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  fullName?: string;
  name?: string;
  displayName?: string;
  isHasIdentity?: boolean;
  t?: string;
  id?: string;
  // Add any other properties that might be populated from the API
  [key: string]: any;
}

export default PopulatedUser;
