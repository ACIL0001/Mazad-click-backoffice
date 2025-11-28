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

// Note: Use useNavConfig() hook instead of default export for translations
// This default export is kept for backward compatibility but should not be used
export default [];