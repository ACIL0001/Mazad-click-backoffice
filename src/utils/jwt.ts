
export const isValidToken = (accessToken: string) => {
    if (!accessToken) {
        return false;
    }
    try {
        const decoded = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        // Add 60 second buffer to treat nearly-expired tokens as expired
        return decoded.exp > (currentTime + 60);
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
};

//  read token without library
export function jwtDecode(token: string) {
    try {
        if (!token || token.split('.').length < 2) return {};

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        return {};
    }
}
