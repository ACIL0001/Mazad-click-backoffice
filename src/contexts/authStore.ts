import User from '@/types/User';
import { create } from 'zustand';
import { RoleCode } from '@/types/Role';
import { getStorageKey } from '@/config';

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
        accessToken?: string;
        refreshToken?: string;
        access_token?: string;
        refresh_token?: string;
        [key: string]: any;
    };
}

interface IAuthStore {
    isReady: boolean;
    isLogged: boolean;
    auth: typeof initialState;
    user?: User;
    tokens?: { accessToken: string; refreshToken: string };
    refreshUserData: () => Promise<void>;

    set: (data: LoginResponseData) => void;
    clear: () => void;
    initializeAuth: () => Promise<void>;
}

// Test localStorage immediately when this file loads
console.log('AUTH STORE: Testing localStorage availability...');
try {
    if (typeof window !== 'undefined' && typeof Storage !== 'undefined') {
        localStorage.setItem('test-key', 'test-value');
        const testResult = localStorage.getItem('test-key');
        localStorage.removeItem('test-key');
        console.log('AUTH STORE: localStorage test result:', testResult === 'test-value' ? 'PASSED' : 'FAILED');
    } else {
        console.log('AUTH STORE: localStorage not available (SSR or no Storage support)');
    }
} catch (error) {
    console.error('AUTH STORE: localStorage test FAILED:', error);
}

export const authStore = create<IAuthStore>((zustandSet, zustandGet) => ({
    isReady: false,
    isLogged: false,
    auth: initialState,
    user: undefined,
    tokens: undefined,

    refreshUserData: async () => {
        try {
            const currentState = zustandGet();
            if (currentState.auth.user) {
                console.log('AUTH STORE: Refreshing user data...');
            }
        } catch (error) {
            console.error('AUTH STORE: Failed to refresh user data:', error);
        }
    },

    set: (data: LoginResponseData) => {
        console.log('🚨 AUTH STORE SET CALLED!');
        console.log('🚨 Data received:', data);
        console.log('🚨 Window location:', window.location.href);
        console.log('🚨 Current port:', window.location.port);
        
        const storageKey = getStorageKey();
        console.log('🚨 Storage key:', storageKey);
        
        // Extract tokens
        let accessToken, refreshToken;
        
        if (data.session?.accessToken && data.session?.refreshToken) {
            accessToken = data.session.accessToken;
            refreshToken = data.session.refreshToken;
            console.log('🚨 Using camelCase tokens');
        } else if (data.session?.access_token && data.session?.refresh_token) {
            accessToken = data.session.access_token;
            refreshToken = data.session.refresh_token;
            console.log('🚨 Using snake_case tokens');
        } else {
            console.error('🚨 NO TOKENS FOUND!', data.session);
            return;
        }

        console.log('🚨 Tokens extracted:', {
            accessToken: accessToken?.substring(0, 20) + '...',
            refreshToken: refreshToken?.substring(0, 20) + '...'
        });

        const tokens = { accessToken, refreshToken };
        
        // Create user object
        const user: User = {
            _id: data.user._id,
            displayName: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
            role: data.user.type as RoleCode | undefined,
            email: data.user.email,
            photoURL: data.user.photoURL || '/static/mock-images/avatars/avatar_placeholder.jpg',
            firstname: data.user.firstName || '',
            lastname: data.user.lastName || '',
            name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
            isMale: true,
            tel: 0,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            type: data.user.type,
            accountType: data.user.accountType,
            phone: data.user.phone || '',
            isPhoneVerified: data.user.isPhoneVerified || false,
        };

        console.log('🚨 User object created:', user);

        const authState = { tokens, user };
        
        // Update Zustand state
        console.log('🚨 Updating Zustand state...');
        zustandSet({
            auth: authState,
            user: user,
            tokens: tokens,
            isLogged: true,
            isReady: true,
        });
        console.log('🚨 Zustand state updated!');

        // Store in localStorage
        console.log('🚨 Attempting localStorage storage...');
        try {
            const dataToStore = JSON.stringify(authState);
            console.log('🚨 Data string length:', dataToStore.length);
            console.log('🚨 Data preview:', dataToStore.substring(0, 100) + '...');
            
            localStorage.setItem(storageKey, dataToStore);
            console.log('🚨 localStorage.setItem completed');
            
            // Immediate verification
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                console.log('🚨 ✅ VERIFICATION PASSED - Data found in localStorage!');
                console.log('🚨 Stored data length:', stored.length);
                
                // Parse test
                try {
                    const parsed = JSON.parse(stored);
                    console.log('🚨 ✅ PARSE TEST PASSED');
                    console.log('🚨 Parsed has tokens:', !!parsed.tokens);
                    console.log('🚨 Parsed has user:', !!parsed.user);
                } catch (parseError) {
                    console.error('🚨 ❌ PARSE TEST FAILED:', parseError);
                }
            } else {
                console.error('🚨 ❌ VERIFICATION FAILED - No data found in localStorage!');
            }
        } catch (error) {
            console.error('🚨 ❌ LOCALSTORAGE ERROR:', error);
        }
        
        console.log('🚨 AUTH STORE SET COMPLETED');
    },

    clear: () => {
        console.log('🚨 AUTH STORE CLEAR CALLED');
        const storageKey = getStorageKey();
        
        zustandSet({ 
            auth: initialState, 
            user: undefined,
            tokens: undefined,
            isLogged: false, 
            isReady: true,
            refreshUserData: zustandGet().refreshUserData
        });
        
        try {
            localStorage.removeItem(storageKey);
            console.log('🚨 localStorage cleared for key:', storageKey);
        } catch (error) {
            console.error('🚨 localStorage clear error:', error);
        }
    },

    initializeAuth: async () => {
        console.log('🚨 AUTH INIT CALLED');
        const storageKey = getStorageKey();
        console.log('🚨 Init using storage key:', storageKey);
        
        return new Promise<void>((resolve) => {
            zustandSet((state) => {
                if (typeof window === 'undefined') {
                    console.log('🚨 SSR - skipping localStorage');
                    resolve();
                    return { ...state, isReady: true };
                }

                try {
                    const authString = localStorage.getItem(storageKey);
                    console.log('🚨 Retrieved from localStorage:', authString ? 'FOUND' : 'NOT FOUND');
                    
                    if (!authString) {
                        console.log('🚨 No stored auth data');
                        resolve();
                        return { ...state, isReady: true };
                    }

                    const parsedAuth = JSON.parse(authString);
                    console.log('🚨 Parsed stored auth:', {
                        hasTokens: !!parsedAuth.tokens,
                        hasUser: !!parsedAuth.user
                    });

                    if (parsedAuth?.tokens?.accessToken && parsedAuth?.user?._id) {
                        console.log('🚨 ✅ Valid stored auth found - restoring session');
                        resolve();
                        return {
                            ...state,
                            auth: parsedAuth,
                            user: parsedAuth.user,
                            tokens: parsedAuth.tokens,
                            isLogged: true,
                            isReady: true,
                        };
                    } else {
                        console.warn('🚨 ❌ Invalid stored auth structure');
                        localStorage.removeItem(storageKey);
                        resolve();
                        return { ...state, isReady: true };
                    }
                } catch (error) {
                    console.error('🚨 ❌ Auth init error:', error);
                    localStorage.removeItem(storageKey);
                    resolve();
                    return { ...state, isReady: true };
                }
            });
        });
    },
}));