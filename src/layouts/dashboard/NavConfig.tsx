import React from 'react';
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name: string) => <Iconify icon={name} width={22} height={22} />;

const navConfig = [
  {
    title: 'Tableau De Bord',
    path: '/dashboard/app',
    icon: getIcon('typcn:chart-pie'),
  },
  {
    title: 'Utilisateurs',
    path: '/dashboard/users',
    icon: getIcon('mdi:user-online'),
    children: [
      {
        title: 'Clients', 
        path: '/dashboard/users/clients', 
        icon: getIcon('mdi:account'),
      },
      {
        title: 'Professionals', 
        path: '/dashboard/users/professionals', 
        icon: getIcon('mdi:account-group'), 
      },
      {
        title: 'Resellers', 
        path: '/dashboard/users/resellers', 
        icon: getIcon('mdi:store'), 
      },
      {
        title: 'Sellers', 
        path: '/dashboard/users/sellers',
        icon: getIcon('mdi:food'),
      },
    ],
  },
  {
    title: 'Administration',
    path: '/dashboard/admin',
    icon: getIcon('mdi:shield-account'),
    requiresAdmin: true,
    children: [
      {
        title: 'Gestion des Admins',
        path: '/dashboard/admin/management',
        icon: getIcon('mdi:account-cog'),
        adminOnly: true,
      },
      {
        title: 'Profil Admin',
        path: '/dashboard/admin/profile',
        icon: getIcon('mdi:account-circle'),
        requiresAdmin: true,
      },
      {
        title: 'Permissions',
        path: '/dashboard/admin/permissions',
        icon: getIcon('mdi:key'),
        requiresAdmin: true,
      },
    ],
  },
  {
    title: 'Enchères',
    path: '/dashboard/auctions',
    icon: getIcon('mdi:gavel'),
  },
  {
    title: 'Categories',
    path: '/dashboard/categories',
    icon: getIcon('material-symbols:category'),
  },
  {
    title: 'Sous Categories',
    path: '/dashboard/sous-categories',
    icon: getIcon('material-symbols:format_list_bulleted'),
  },
  {
    title: 'Sous-Sous Categories',
    path: '/dashboard/sous-sous-categories',
    icon: getIcon('material-symbols:layers'),
  },
  {
    title: 'Abonnements',
    path: '/dashboard/subscription',
    icon: getIcon('mdi:credit-card-multiple'),
  },
  {
    title: 'Conditions Générales',
    path: '/dashboard/terms',
    icon: getIcon('mdi:file-document-outline'),
  },
  {
    title: 'Centre de Communication',
    path: '/dashboard/chat',
    icon: getIcon('material-symbols:chat-bubble'),
  },
  {
    title: 'Identités',
    path: '/dashboard/identities',
    icon: getIcon('ph:user-focus-bold'),
  },
  {
    title: 'Configuration',
    path: '/dashboard/configuration',
    icon: getIcon('eva:settings-fill'),
  },
  {
    title: 'Communication',
    path: '/dashboard/communication',
    icon: getIcon('mdi:message'),
    children: [
      {
        title: 'Notification',
        path: '/dashboard/communication/notification',
        icon: getIcon('mdi:bell'),
      },
      {
        title: 'Sms',
        path: '/dashboard/communication/sms',
        icon: getIcon('mdi:message'),
        description: 'Comming Soon',
        disabled: true,
      },
      {
        title: 'Email',
        path: '/dashboard/communication/email',
        icon: getIcon('mdi:email'),
      },
    ],
  },
  {
    title: 'Réclamations',
    path: '/dashboard/reports',
    icon: getIcon('clarity:alert-solid'),
    disabled: true,
  },
  {
    title: 'Avis',
    path: '/dashboard/reviews',
    icon: getIcon('material-symbols:reviews-rounded'),
    disabled: true,
  },
];

export default navConfig;