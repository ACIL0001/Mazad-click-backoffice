/**
 * PDF Service Types
 * Type definitions for PDF generation services
 */

export interface PdfConfig {
  /** Company information for PDF headers */
  company: CompanyInfo;
  /** Default colors for PDF elements */
  colors: PdfColors;
  /** Font configuration */
  fonts: FontConfig;
  /** Page margins */
  margins: Margins;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  registry?: string;
  nif?: string;
  ai?: string;
  logoPath?: string;
}

export interface PdfColors {
  primary: [number, number, number];
  secondary: [number, number, number];
  alternate: [number, number, number];
  text: [number, number, number];
  white: [number, number, number];
}

export interface FontConfig {
  default: string;
  bold: string;
  size: {
    title: number;
    subtitle: number;
    body: number;
    small: number;
  };
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PdfOptions {
  orientation?: 'portrait' | 'landscape';
  unit?: 'pt' | 'mm' | 'cm' | 'in';
  format?: 'a3' | 'a4' | 'a5' | 'letter' | 'legal' | [number, number];
  compress?: boolean;
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
  options?: TableOptions;
}

export interface TableOptions {
  startY?: number;
  styles?: Record<string, unknown>;
  headStyles?: Record<string, unknown>;
  alternateRowStyles?: Record<string, unknown>;
  tableLineColor?: [number, number, number];
  tableLineWidth?: number;
}

export interface QrCodeOptions {
  size?: number;
  position?: { x: number; y: number };
  label?: string;
}

export interface UserInfo {
  name: string;
  network?: { name: string };
  email?: string;
  phone?: string;
}

/**
 * Lazy-loaded PDF module types
 */
export interface JsPdfModule {
  jsPDF: typeof import('jspdf').jsPDF;
}

export interface JsPdfAutoTableModule {
  autoTable: typeof import('jspdf-autotable').autoTable;
}
