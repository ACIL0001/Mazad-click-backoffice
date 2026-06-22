import { Navigate, useRoutes } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';

// Direct components that should load instantly
import RequirePhoneVerification from './components/RequirePhoneVerification';

// Lazy loaded pages
const Users = lazy(() => import('./pages/Users'));
const Ads = lazy(() => import('./pages/Ads/index'));
const Auctions = lazy(() => import('./pages/Auctions/index'));
const AuctionDetail = lazy(() => import('./pages/Auctions/AuctionDetail'));

const Tenders = lazy(() => import('./pages/Tenders/index'));
const TenderDetail = lazy(() => import('./pages/Tenders/TendersDetail'));

const DirectSales = lazy(() => import('./pages/DirectSales/index'));
const DirectSaleDetail = lazy(() => import('./pages/DirectSales/DirectSaleDetail'));

const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/Page404'));
const Register = lazy(() => import('./pages/Register'));
const DashboardApp = lazy(() => import('./pages/DashboardApp'));
const Account = lazy(() => import('./pages/Account'));

const Configuration = lazy(() => import('./pages/Configuration'));
const Appearance = lazy(() => import('./pages/Appearance'));
const Profile = lazy(() => import('./pages/Profile'));
const Identity = lazy(() => import('./pages/Identities'));
const IdentityVerificationDetailsPage = lazy(() => import('./pages/Identities/IdentityVerificationDetailsPage')); 
const VerificationHistory = lazy(() => import('./pages/VerificationHistory'));
const Categories = lazy(() => import('./pages/Categories'));
const AddCategory = lazy(() => import('./pages/Categories/AddCategory'));
const UpdateCategory = lazy(() => import('./pages/Categories/UpdateCategory'));
const CategoryDetailsPage = lazy(() => import('./pages/Categories/CategoryDetailsPage'));

const Subscription = lazy(() => import('./pages/Subscription'));
const Terms = lazy(() => import('./pages/Terms'));

const ChatLayout = lazy(() => import('./pages/chat/ChatLayout').then(module => ({ default: module.ChatLayout })));
const Notification = lazy(() => import('./pages/Communication/Notification'));
const Sms = lazy(() => import('./pages/Communication/Sms'));
const Email = lazy(() => import('./pages/Communication/Email'));

const Professional = lazy(() => import('./pages/Professionals')); 
const ProfessionalsDetailsPage = lazy(() => import('./pages/Professionals/ProfessionalsDetailsPage'));
const Clients = lazy(() => import('./pages/Clients'));
const ClientsDetailsPage = lazy(() => import('./pages/Clients/ClientsDetailsPage'));

const AdminManagement = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminManagement })));
const AdminProfile = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminProfile })));
const AdminPermissions = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminPermissions })));

const Analytics = lazy(() => import('./pages/Analytics/index'));

const SuspenseLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div className="spinner-border text-primary"></div>
    <span style={{ marginLeft: '10px' }}>Chargement...</span>
  </div>
);

export default function Router() {
    const routes = useRoutes([
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
                { path: 'analytics', element: <RequirePhoneVerification><Analytics /></RequirePhoneVerification> },
                {
                    path: 'users',
                    children: [
                        { path: 'clients', element: <RequirePhoneVerification><Clients /></RequirePhoneVerification> },
                        { path: 'clients/:id', element: <RequirePhoneVerification><ClientsDetailsPage /></RequirePhoneVerification> }, 
                        { path: 'professionals', element: <RequirePhoneVerification><Professional /></RequirePhoneVerification> }, 
                        { path: 'professionals/:id', element: <RequirePhoneVerification><ProfessionalsDetailsPage /></RequirePhoneVerification> },

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
                { path: 'identities/history', element: <RequirePhoneVerification><VerificationHistory /></RequirePhoneVerification> },
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
                { path: 'appearance', element: <RequirePhoneVerification><Appearance /></RequirePhoneVerification> },
                
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

    return (
        <Suspense fallback={<SuspenseLoader />}>
            {routes}
        </Suspense>
    );
}