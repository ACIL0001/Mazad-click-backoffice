//------------------------------------------------------------------------------
// <copyright file="Login.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>                                                                
//------------------------------------------------------------------------------

// @mui
import { styled } from '@mui/material/styles';
import { Card, Container, Typography } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Page from '../components/Page';
// sections
import app from '../config';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { hasAdminPrivileges } from '@/types/Role';
import LoginForm from '../sections/auth/login/LoginForm';

const RootStyle = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        display: 'flex',
    },
}));

const HeaderStyle = styled('header')(({ theme }) => ({
    top: 0,
    zIndex: 9,
    lineHeight: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    padding: theme.spacing(3),
    justifyContent: 'space-between',
    [theme.breakpoints.up('md')]: {
        alignItems: 'flex-start',
        padding: theme.spacing(7, 5, 0, 7),
    },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
    width: '100%',
    maxWidth: 464,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: theme.spacing(2, 0, 2, 2),
}));

const ContentStyle = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: theme.spacing(12, 0),
}));

export default function Login() {
    const navigate = useNavigate();
    const { isLogged, isReady, auth, initializeAuth, clear } = useAuth();
    const smUp = useResponsive('up', 'sm');
    const mdUp = useResponsive('up', 'md');

    // Initialize auth on component mount
    useEffect(() => {
        if (!isReady) {
            console.log('Initializing auth...');
            initializeAuth();
        }
    }, [isReady, initializeAuth]);

    // Check portal access and clear auth if needed
    useEffect(() => {
        console.log('Login page - isReady:', isReady, 'isLogged:', isLogged, 'auth:', auth);
        
        if (isReady && isLogged && auth?.user) {
            const currentPort = window.location.port;
            const isAdminPortal = currentPort === '3002';
            const isSellerPortal = currentPort === '3003';

            const userHasAdminAccess = hasAdminPrivileges(auth.user.type) || hasAdminPrivileges(auth.user.accountType);
            const userHasSellerAccess = auth.user.type === 'SELLER' || auth.user.accountType === 'SELLER';
            
            // Check if user has access to this portal
            const hasPortalAccess = (isAdminPortal && userHasAdminAccess) || (isSellerPortal && userHasSellerAccess);
            
            if (!hasPortalAccess) {
                console.log('User does not have access to this portal, clearing auth');
                clear();
            } else if (auth.session?.accessToken) {
                // User has valid session and access - let LoginForm handle redirect
                console.log('User has valid session and portal access');
            }
        }
    }, [isReady, isLogged, auth, clear]);

    // Show loading while auth is being initialized
    if (!isReady) {
        return (
            <Page title="Login">
                <RootStyle>
                    <Container maxWidth="sm">
                        <ContentStyle>
                            <Typography variant="h6" sx={{ textAlign: 'center' }}>
                                Chargement...
                            </Typography>
                        </ContentStyle>
                    </Container>
                </RootStyle>
            </Page>
        );
    }

    return (
        <Page title="Login">
            <RootStyle>
                {mdUp && (
                    <SectionStyle style={{
                        backgroundImage: `url(/static/illustrations/easyeats_navigate.jpg)`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: "cover",
                        backgroundPosition: 'center'
                    }}>
                    </SectionStyle>
                )}

                <Container maxWidth="sm">
                    <ContentStyle>
                        <Typography variant="h4" gutterBottom>
                            {app.name} - Administration
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', mb: 5 }}>
                            Connectez vous.
                        </Typography>
                        <LoginForm />
                    </ContentStyle>
                </Container>
            </RootStyle>
        </Page>
    );
}