import Attachment from './Attachment';
import Device from './Device';
import Preference from './Preference';
import Rating from './Rating';
import Role, { RoleCode } from './Role';

// Tokens interface
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Backend response structure from auth.service.ts SignIn method
// Returns: { session: { accessToken, refreshToken }, user: {...} }
export interface LoginResponseData {
  session: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    type: string;
    accountType: string;
    phone: string;
    isPhoneVerified: boolean;
    photoURL?: string;
    [key: string]: any;
  };
}

// Internal auth state structure (what we store in authStore)
export interface AuthState {
  tokens: Tokens;
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    name: string;
    email: string;
    isMale: boolean;
    picture?: Attachment;
    tel: number;
    device?: Device;
    password?: string;
    role?: RoleCode;
    type?: string;
    accountType?: string;
    phone?: string;
    isPhoneVerified?: boolean;
    photoURL?: string;
    verified?: boolean;
    enabled?: boolean;
    rating?: Rating;
    details?: any;
    preference?: Preference;
    firstSignIn?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

// Legacy Auth interface (for backward compatibility)
export default interface Auth<T = undefined> {
  accessToken: string;
  refreshToken: string;
  tokens: Tokens;
  user: {
    _id?: string;
    firstname: string;
    lastname: string;
    name: string;
    email: string;
    isMale: boolean;
    picture?: Attachment;
    tel: number;
    device?: Device;
    password?: string;
    role?: RoleCode;
    type?: string;
    accountType?: string;
    phone?: string;
    isPhoneVerified?: boolean;
    photoURL?: string;
    verified?: boolean;
    enabled?: boolean;
    rating?: Rating;
    details?: T;
    preference?: Preference;
    firstSignIn?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
}