import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Users from './pages/Users';

import Auctions from './pages/Auctions/index';
import AuctionDetail from './pages/Auctions/AuctionDetail';
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
import SubCategories from './pages/SubCategories/SubCategories';
import AddSouCategory from './pages/SubCategories/AddSubCategories';
import SubCategoryDetailsPage from './pages/SubCategories/SubCategoryDetailsPage';
import UpdateSubCategory from './pages/SubCategories/UpdateSubCategory'; 

// SubSubCategories imports
import SubSubCategories from './pages/SubSubCategories/SubSubCategories';
import AddSubSubCategory from './pages/SubSubCategories/AddSubSubCategory';
import SubSubCategoryDetailsPage from './pages/SubSubCategories/SubSubCategoryDetailsPage';
import UpdateSubSubCategory from './pages/SubSubCategories/UpdateSubSubCategory';

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
                { path: 'identities', element: <RequirePhoneVerification><Identity /></RequirePhoneVerification> },
                { path: 'identities/:id', element: <RequirePhoneVerification><IdentityVerificationDetailsPage /></RequirePhoneVerification> },
                { path: 'categories/new', element: <RequirePhoneVerification><AddCategory /></RequirePhoneVerification> }, 
                { path: 'sous-categories/add', element: <RequirePhoneVerification><AddSouCategory /></RequirePhoneVerification> },
                { path: 'categories/edit/:id', element: <RequirePhoneVerification><UpdateCategory /></RequirePhoneVerification> }, 
                { path: 'categories/:id', element: <RequirePhoneVerification><CategoryDetailsPage /></RequirePhoneVerification> }, 
                { path: 'categories', element: <RequirePhoneVerification><Categories /></RequirePhoneVerification> }, 
                { path: 'sous-categories', element: <RequirePhoneVerification><SubCategories /></RequirePhoneVerification> },
                { path: 'sous-categories/:id', element: <RequirePhoneVerification><SubCategoryDetailsPage /></RequirePhoneVerification> }, 
                { path: 'sous-categories/edit/:id', element: <RequirePhoneVerification><UpdateSubCategory /></RequirePhoneVerification> }, 
                
                // SubSubCategories routes
                { path: 'sous-sous-categories', element: <RequirePhoneVerification><SubSubCategories /></RequirePhoneVerification> },
                { path: 'sous-sous-categories/create', element: <RequirePhoneVerification><AddSubSubCategory /></RequirePhoneVerification> },
                { path: 'sous-sous-categories/:id', element: <RequirePhoneVerification><SubSubCategoryDetailsPage /></RequirePhoneVerification> },
                { path: 'sous-sous-categories/edit/:id', element: <RequirePhoneVerification><UpdateSubSubCategory /></RequirePhoneVerification> },

                // Subscription route
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