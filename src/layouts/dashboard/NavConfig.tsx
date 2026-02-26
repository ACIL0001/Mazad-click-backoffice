import React from 'react';
import Iconify from '../../components/Iconify';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

const getIcon = (name: string) => <Iconify icon={name} width={22} height={22} />;

export const useNavConfig = () => {
  const { t } = useTranslation();

  return [
    {
      title: t('navigation.dashboard'),
      path: '/dashboard/app',
      icon: getIcon('typcn:chart-pie'),
    },
    {
      title: t('navigation.users'),
      path: '/dashboard/users',
      icon: getIcon('mdi:user-online'),
      children: [
        {
          title: t('navigation.clients'), 
          path: '/dashboard/users/clients', 
          icon: getIcon('mdi:account'),
        },
        {
          title: t('navigation.professionals'), 
          path: '/dashboard/users/professionals', 
          icon: getIcon('mdi:account-group'), 
        },
        {
          title: t('navigation.resellers'), 
          path: '/dashboard/users/resellers', 
          icon: getIcon('mdi:store'), 
        },
        {
          title: t('navigation.sellers'), 
          path: '/dashboard/users/sellers',
          icon: getIcon('mdi:food'),
        },
      ],
    },
    {
      title: t('navigation.administration'),
      path: '/dashboard/admin',
      icon: getIcon('mdi:shield-account'),
      requiresAdmin: true,
      children: [
        {
          title: t('navigation.adminManagement'), 
          path: '/dashboard/admin/management',
          icon: getIcon('mdi:account-cog'),
          adminOnly: true,
        },
        {
          title: t('navigation.adminProfile'), 
          path: '/dashboard/admin/profile',
          icon: getIcon('mdi:account-circle'),
          requiresAdmin: true,
        },
        {
          title: t('navigation.permissions'), 
          path: '/dashboard/admin/permissions',
          icon: getIcon('mdi:key'),
          requiresAdmin: true,
        },
      ],
    },
    {
      title: t('navigation.auctions'),
      path: '/dashboard/auctions',
      icon: getIcon('mdi:gavel'),
    },
    {
      title: t('navigation.directSales'),
      path: '/dashboard/direct-sales',
      icon: getIcon('mdi:store'),
    },
    {
      title: t('navigation.categories'),
      path: '/dashboard/categories',
      icon: getIcon('material-symbols:category'),
    },
    {
      title: t('navigation.subCategories'),
      path: '/dashboard/sous-categories',
      icon: getIcon('material-symbols:format_list_bulleted'),
    },
    {
      title: t('navigation.subSubCategories'),
      path: '/dashboard/sous-sous-categories',
      icon: getIcon('material-symbols:layers'),
    },
    {
      title: t('navigation.ads'),
      path: '/dashboard/ads',
      icon: getIcon('mdi:image-multiple-outline'),
    },
    {
      title: t('navigation.subscriptions'),
      path: '/dashboard/subscription',
      icon: getIcon('mdi:credit-card-multiple'),
    },
    {
      title: t('navigation.terms'),
      path: '/dashboard/terms',
      icon: getIcon('mdi:file-document-outline'),
    },
    {
      title: t('navigation.communicationCenter'),
      path: '/dashboard/chat',
      icon: getIcon('material-symbols:chat-bubble'),
    },
    {
      title: t('navigation.identities'),
      path: '/dashboard/identities',
      icon: getIcon('ph:user-focus-bold'),
      children: [
        {
          title: t('navigation.list') || 'Liste',
          path: '/dashboard/identities',
          icon: getIcon('mdi:format-list-bulleted'),
        },
        {
          title: t('navigation.history') || 'Historique',
          path: '/dashboard/identities/history',
          icon: getIcon('mdi:history'),
        }
      ],
    },
    {
      title: t('navigation.configuration'),
      path: '/dashboard/configuration',
      icon: getIcon('eva:settings-fill'),
    },
    {
      title: t('navigation.communication'),
      path: '/dashboard/communication',
      icon: getIcon('mdi:message'),
      children: [
        {
          title: t('navigation.notification'),
          path: '/dashboard/communication/notification',
          icon: getIcon('mdi:bell'),
        },
        {
          title: t('navigation.sms'),
          path: '/dashboard/communication/sms',
          icon: getIcon('mdi:message'),
          description: t('navigation.comingSoon'),
          disabled: true,
        },
        {
          title: t('navigation.email'),
          path: '/dashboard/communication/email',
          icon: getIcon('mdi:email'),
        },
      ],
    },
    {
      title: t('navigation.reports'),
      path: '/dashboard/reports',
      icon: getIcon('clarity:alert-solid'),
      disabled: true,
    },
    {
      title: t('navigation.reviews'),
      path: '/dashboard/reviews',
      icon: getIcon('material-symbols:reviews-rounded'),
      disabled: true,
    },
  ];
};

// Default export for backward compatibility (will use French as fallback)
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
    title: 'Ventes Directes',
    path: '/dashboard/direct-sales',
    icon: getIcon('mdi:store'),
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
    title: 'Publicités',
    path: '/dashboard/ads',
    icon: getIcon('mdi:image-multiple-outline'),
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
    children: [
      {
        title: 'Liste',
        path: '/dashboard/identities',
        icon: getIcon('mdi:format-list-bulleted'),
      },
      {
        title: 'Historique',
        path: '/dashboard/identities/history',
        icon: getIcon('mdi:history'),
      }
    ],
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