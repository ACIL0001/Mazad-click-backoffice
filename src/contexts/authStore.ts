import User from '@/types/User';
import { create } from 'zustand';
import { RoleCode } from '@/types/Role';

const initialState: { tokens?: { accessToken: string; refreshToken: string }; user?: User } = {
  tokens: undefined,
  user: undefined,
};

interface LoginResponseData {
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        type: string;
        accountType: string;
        photoURL?: string;
        phone?: string;
        isPhoneVerified?: boolean;
        [key: string]: any;
    };
    session: {
        accessToken: string;
        refreshToken: string;
        [key: string]: any;
    };
}

interface IAuthStore {
    isReady: boolean;
    isLogged: boolean;
    auth: typeof initialState;
    user?: User;
    refreshUserData: () => Promise<void>;

    set: (data: LoginResponseData) => void;
    clear: () => void;
    initializeAuth: () => void;
}

export const authStore = create<IAuthStore>((zustandSet, zustandGet) => ({
    isReady: false,
    isLogged: false,
    auth: initialState,
    user: undefined,

    refreshUserData: async () => {
        try {
            const currentState = zustandGet();
            if (currentState.auth.user) {
                console.log('Refreshing user data...');
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    },

    set: (data: LoginResponseData) => {
        console.log('AuthStore.set called with data:', data);
        
        // Backend returns { session, user } structure
        if (!data.session) {
            console.error('Invalid session data received:', data.session);
            console.error('Full data received:', data);
            return;
        }

        // Extract tokens from session (handle both snake_case and camelCase)
        let accessToken, refreshToken;
        
        if (data.session.accessToken && data.session.refreshToken) {
            // CamelCase format
            accessToken = data.session.accessToken;
            refreshToken = data.session.refreshToken;
        } else if (data.session.access_token && data.session.refresh_token) {
            // Snake_case format (convert to camelCase)
            accessToken = data.session.access_token;
            refreshToken = data.session.refresh_token;
        } else {
            console.error('No valid tokens found in session:', data.session);
            return;
        }

        const tokens = { accessToken, refreshToken };

        // Validate required fields
        if (!data.user || !data.user._id) {
            console.error('Missing user data:', data.user);
            return;
        }

        const user: User = {
            _id: data.user._id,
            displayName: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
            role: data.user.type as RoleCode | undefined,
            email: data.user.email,
            photoURL: data.user.photoURL || '/static/mock-images/avatars/avatar_placeholder.jpg',
            
            // Map all required User interface properties
            firstname: data.user.firstName || '',
            lastname: data.user.lastName || '',
            name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
            isMale: true, // Default value
            tel: 0, // Default value
            
            // Additional properties
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            type: data.user.type,
            accountType: data.user.accountType,
            phone: data.user.phone || '',
            isPhoneVerified: data.user.isPhoneVerified || false,
        };

        const authState = { tokens, user };
        const isLogged = true;

        const newState = {
            auth: authState,
            user: user,
            isLogged,
            isReady: true,
        };

        console.log('Setting new auth state:', newState);
        zustandSet(newState);

        // Store in localStorage
        try {
            localStorage.setItem('auth', JSON.stringify(authState));
            console.log('Auth data stored in localStorage successfully');
            
            // Verify storage
            const stored = localStorage.getItem('auth');
            console.log('Verified stored auth:', stored);
        } catch (error) {
            console.error('Failed to store auth data in localStorage:', error);
        }
    },

    clear: () => {
        console.log('Clearing auth state');
        const clearedState = { 
            auth: initialState, 
            user: undefined, 
            isLogged: false, 
            isReady: true,
            refreshUserData: zustandGet().refreshUserData
        };
        zustandSet(clearedState);
        
        try {
            localStorage.removeItem('auth');
            console.log('Auth data removed from localStorage');
        } catch (error) {
            console.error('Failed to remove auth data from localStorage:', error);
        }
    },

    initializeAuth: () => {
        console.log('Initializing auth from localStorage');
        zustandSet((state) => {
            if (typeof window === 'undefined') {
                console.log('Server-side rendering, skipping localStorage');
                return { ...state, isReady: true };
            }

            try {
                const authString = localStorage.getItem('auth');
                console.log('Retrieved auth from localStorage:', authString);
                
                if (!authString) {
                    console.log('No auth data found in localStorage');
                    return { ...state, isReady: true };
                }

                const parsedAuth = JSON.parse(authString);
                console.log('Parsed auth data:', parsedAuth);

                // Validate auth data structure
                if (parsedAuth && parsedAuth.tokens?.accessToken && parsedAuth.user?._id) {
                    console.log('Valid auth data found, restoring session');
                    return {
                        ...state,
                        auth: parsedAuth,
                        user: parsedAuth.user,
                        isLogged: true,
                        isReady: true,
                    };
                } else {
                    console.warn("Invalid auth data structure in localStorage, clearing");
                    localStorage.removeItem('auth');
                    return { ...state, isReady: true };
                }
            } catch (error) {
                console.error("Failed to parse auth data from localStorage:", error);
                localStorage.removeItem('auth');
                return { ...state, isReady: true };
            }
        });
    },
}));