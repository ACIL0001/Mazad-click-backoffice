/**
 * PDF Service Configuration
 * Centralized configuration for PDF generation
 */

import type { PdfConfig } from './types';

export const DEFAULT_PDF_CONFIG: PdfConfig = {
  company: {
    name: 'MazadClick',
    address: 'Algeria',
    phone: '',
    email: '',
    logoPath: '/static/logo.png',
  },
  colors: {
    primary: [124, 95, 240],
    secondary: [231, 221, 252],
    alternate: [231, 215, 252],
    text: [0, 0, 0],
    white: [255, 255, 255],
  },
  fonts: {
    default: 'helvetica',
    bold: 'helvetica',
    size: {
      title: 16,
      subtitle: 12,
      body: 10,
      small: 8,
    },
  },
  margins: {
    top: 15,
    right: 15,
    bottom: 15,
    left: 15,
  },
};

/**
 * Get the current PDF configuration
 * Can be extended to load from environment or API
 */
export const getPdfConfig = (): PdfConfig => {
  return {
    ...DEFAULT_PDF_CONFIG,
    // Override with environment variables if available
    company: {
      ...DEFAULT_PDF_CONFIG.company,
      name: import.meta.env.VITE_COMPANY_NAME || DEFAULT_PDF_CONFIG.company.name,
      address: import.meta.env.VITE_COMPANY_ADDRESS || DEFAULT_PDF_CONFIG.company.address,
      phone: import.meta.env.VITE_COMPANY_PHONE || DEFAULT_PDF_CONFIG.company.phone,
      email: import.meta.env.VITE_COMPANY_EMAIL || DEFAULT_PDF_CONFIG.company.email,
    },
  };
};
