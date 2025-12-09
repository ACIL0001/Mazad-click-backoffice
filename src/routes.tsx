import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Users from './pages/Users';

import Auctions from './pages/Auctions/index';
import AuctionDetail from './pages/Auctions/AuctionDetail';

// Tenders imports
import Tenders from './pages/Tenders/index';
import TenderDetail from './pages/Tenders/TendersDetail';

// DirectSales imports
import DirectSales from './pages/DirectSales/index';
import DirectSaleDetail from './pages/DirectSales/DirectSaleDetail';

import Login from './pages/Login';
import NotFound from './pages/Page404';
import Register from './pages/Register';
import DashboardApp from './pages/DashboardApp';
import Account from './pages/Account';

import Configuration from './pages/Configuration';
import Profile from './pages/Profile';
import Identity from './pages/Identities';
import IdentityVerificationDetailsPage from './pages/Identities/IdentityVerificationDetailsPage'; 
import Categories from './pages/Categories';
import AddCategory from './pages/Categories/AddCategory';
import UpdateCategory from './pages/Categories/UpdateCategory';
import CategoryDetailsPage from './pages/Categories/CategoryDetailsPage';

// Ads imports
import Ads from './pages/Ads';

// Subscription imports
import Subscription from './pages/Subscription';

// Terms imports
import Terms from './pages/Terms';

import { ChatLayout } from './pages/chat/ChatLayout';
import Notification from './pages/Communication/Notification';
import Sms from './pages/Communication/Sms';
import Email from './pages/Communication/Email';

import Professional from './pages/Professionals'; 
import ProfessionalsDetailsPage from './pages/Professionals/ProfessionalsDetailsPage';
import Resellers from './pages/Reseller'; 
import ResellersDetailsPage from './pages/Reseller/ResellersDetailsPage';
import Clients from './pages/Clients';
import ClientsDetailsPage from './pages/Clients/ClientsDetailsPage';
import RequirePhoneVerification from './components/RequirePhoneVerification';

// Admin pages
import { AdminManagement, AdminProfile, AdminPermissions } from './pages/Admin';

export default function Router() {
    return useRoutes([
        {
            path: '/',
            element: <LogoOnlyLayout />,
            children: [
                { path: '/', element: <Navigate to="/dashboard/app" replace /> },
                { path: 'login', element: <Login /> },
                { path: 'register', element: <Register /> },
                { path: '404', element: <NotFound /> },
                { path: '*', element: <Navigate to="/404" replace /> },
            ],
        },
        { path: '*', element: <Navigate to="/404" replace /> },
        {
            path: '/dashboard',
            element: <DashboardLayout />,
            children: [
                { path: 'app', element: <RequirePhoneVerification><DashboardApp /></RequirePhoneVerification> },
                {
                    path: 'users',
                    children: [
                        { path: 'clients', element: <RequirePhoneVerification><Clients /></RequirePhoneVerification> },
                        { path: 'clients/:id', element: <RequirePhoneVerification><ClientsDetailsPage /></RequirePhoneVerification> }, 
                        { path: 'professionals', element: <RequirePhoneVerification><Professional /></RequirePhoneVerification> }, 
                        { path: 'professionals/:id', element: <RequirePhoneVerification><ProfessionalsDetailsPage /></RequirePhoneVerification> },
                        { path: 'resellers', element: <RequirePhoneVerification><Resellers /></RequirePhoneVerification> }, 
                        { path: 'resellers/:id', element: <RequirePhoneVerification><ResellersDetailsPage /></RequirePhoneVerification> }, 
                    ]
                },
                {
                    path: 'admin',
                    children: [
                        { path: 'management', element: <RequirePhoneVerification><AdminManagement /></RequirePhoneVerification> },
                        { path: 'profile', element: <RequirePhoneVerification><AdminProfile /></RequirePhoneVerification> },
                        { path: 'permissions', element: <RequirePhoneVerification><AdminPermissions /></RequirePhoneVerification> },
                    ]
                },
                { path: 'auctions', element: <RequirePhoneVerification><Auctions /></RequirePhoneVerification> },
                { path: 'auctions/:id', element: <RequirePhoneVerification><AuctionDetail /></RequirePhoneVerification> },
                
                // Tenders routes
                { path: 'tenders', element: <RequirePhoneVerification><Tenders /></RequirePhoneVerification> },
                { path: 'tenders/:id', element: <RequirePhoneVerification><TenderDetail /></RequirePhoneVerification> },
                
                // DirectSales routes
                { path: 'direct-sales', element: <RequirePhoneVerification><DirectSales /></RequirePhoneVerification> },
                { path: 'direct-sales/:id', element: <RequirePhoneVerification><DirectSaleDetail /></RequirePhoneVerification> },
                
                { path: 'identities', element: <RequirePhoneVerification><Identity /></RequirePhoneVerification> },
                { path: 'identities/:id', element: <RequirePhoneVerification><IdentityVerificationDetailsPage /></RequirePhoneVerification> },
                { path: 'categories/new', element: <RequirePhoneVerification><AddCategory /></RequirePhoneVerification> }, 
                { path: 'categories/edit/:id', element: <RequirePhoneVerification><UpdateCategory /></RequirePhoneVerification> }, 
                { path: 'categories/:id', element: <RequirePhoneVerification><CategoryDetailsPage /></RequirePhoneVerification> }, 
                { path: 'categories', element: <RequirePhoneVerification><Categories /></RequirePhoneVerification> }, 
                
                { path: 'ads', element: <RequirePhoneVerification><Ads /></RequirePhoneVerification> },
                
                { path: 'subscription', element: <RequirePhoneVerification><Subscription /></RequirePhoneVerification> },

                // Terms & Conditions route
                { path: 'terms', element: <RequirePhoneVerification><Terms /></RequirePhoneVerification> },

                { path: 'chat', element: <RequirePhoneVerification><ChatLayout/></RequirePhoneVerification> },
                { path: 'configuration', element: <RequirePhoneVerification><Configuration /></RequirePhoneVerification> },
                
                { path: 'profile', element: <RequirePhoneVerification><Profile /></RequirePhoneVerification> },
                { path: 'account', element: <RequirePhoneVerification><Account /></RequirePhoneVerification> },
                {
                    path: 'communication',
                    children: [
                        { path: 'notification', element: <RequirePhoneVerification><Notification /></RequirePhoneVerification> },
                        { path: 'sms', element: <RequirePhoneVerification><Sms /></RequirePhoneVerification> },
                        { path: 'email', element: <RequirePhoneVerification><Email /></RequirePhoneVerification> }
                    ]
                },
            ],
        },
    ]);
}