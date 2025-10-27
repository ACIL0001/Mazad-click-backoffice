import Attachment from './Attachment';
import Device from './Device';
import Preference from './Preference';
import Rating from './Rating';
import Role, { RoleCode } from './Role';

export default interface User<T = any> {
  _id?: string;
  firstname: string;
  lastname: string;
  name: string;
  displayName: string;
  photoURL?: string;
  email: string;
  isMale: boolean;
  picture?: Attachment;
  tel: number;
  device?: Device;
  password?: string;
  role?: RoleCode;
  verified?: boolean;
  enabled?: boolean;
  rating?: Rating;
  details?: T;
  preference?: Preference;
  firstSignIn?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Additional properties to match usage in components
  firstName?: string; // Alias for firstname
  lastName?: string;  // Alias for lastname
  phone?: string;     // Phone field
  type?: string;      // User type field
  accountType?: string; // Account type field
  username?: string;  // Username field
  isPhoneVerified?: boolean; // Phone verification status
  secteur?: string;   // Sector field for professionals
  entreprise?: string; // Company name field for professionals
}

// Extended user interface for auction owner
export interface AuctionUser {
  _id: string;
  firstName?: string;
  username?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  name?: string;
}