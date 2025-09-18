import Attachment from './Attachment';
import Device from './Device';
import Preference from './Preference';
import Rating from './Rating';
import Role, { RoleCode } from './Role';

// ADDED: Tokens interface
export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

// ADDED: LoginResponseData interface
export interface LoginResponseData {
    accessToken: string;
    refreshToken: string;
    tokens: Tokens; // FIXED: Added missing tokens property
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

export default interface Auth<T = undefined> {
    accessToken: string;
    refreshToken: string;
    tokens: Tokens; // ADDED: Added tokens property
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
        verified?: boolean;
        enabled?: boolean;
        rating?: Rating;
        details?: T;
        preference?: Preference;
        firstSignIn?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }
}