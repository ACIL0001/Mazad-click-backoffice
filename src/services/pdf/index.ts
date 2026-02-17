/**
 * PDF Services - Public API
 * Export all PDF-related services and utilities
 */

// Types
export type {
  PdfConfig,
  CompanyInfo,
  PdfColors,
  FontConfig,
  Margins,
  PdfOptions,
  TableData,
  TableOptions,
  QrCodeOptions,
  UserInfo,
} from './types';

// Configuration
export { DEFAULT_PDF_CONFIG, getPdfConfig } from './config';

// Base Service
export { PdfService, createPdfService, loadJsPdf, loadAutoTable } from './PdfService';

// QR Code Generator
export {
  QrCodeGenerator,
  createQrCodeGenerator,
  generateUserQrPdf,
  generateQrCodeDataUrl,
} from './QrCodeGenerator';
