/**
 * PDF Service
 * Base service for PDF generation with lazy loading support
 */

import type { jsPDF } from 'jspdf';
import type { PdfOptions, PdfConfig, TableData, QrCodeOptions } from './types';
import { getPdfConfig } from './config';

// Cache for lazy-loaded modules
let jsPdfModule: typeof import('jspdf') | null = null;
let autoTableModule: typeof import('jspdf-autotable') | null = null;

/**
 * Lazy load jsPDF module for code splitting
 */
export const loadJsPdf = async (): Promise<typeof import('jspdf')> => {
  if (!jsPdfModule) {
    jsPdfModule = await import('jspdf');
  }
  return jsPdfModule;
};

/**
 * Lazy load jspdf-autotable module
 */
export const loadAutoTable = async (): Promise<typeof import('jspdf-autotable')> => {
  if (!autoTableModule) {
    autoTableModule = await import('jspdf-autotable');
  }
  return autoTableModule;
};

/**
 * Base PDF Service Class
 * Provides common PDF operations with lazy loading
 */
export class PdfService {
  protected doc: jsPDF | null = null;
  protected config: PdfConfig;
  protected options: PdfOptions;

  constructor(options: PdfOptions = {}) {
    this.config = getPdfConfig();
    this.options = {
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      ...options,
    };
  }

  /**
   * Initialize the PDF document (lazy loaded)
   */
  async initialize(): Promise<jsPDF> {
    if (this.doc) return this.doc;

    const { jsPDF } = await loadJsPdf();
    this.doc = new jsPDF({
      orientation: this.options.orientation,
      unit: this.options.unit,
      format: this.options.format,
      compress: this.options.compress,
    });

    return this.doc;
  }

  /**
   * Get the current document (must be initialized first)
   */
  getDocument(): jsPDF {
    if (!this.doc) {
      throw new Error('PDF document not initialized. Call initialize() first.');
    }
    return this.doc;
  }

  /**
   * Add company logo to the document
   */
  async addLogo(
    position: { x: number; y: number; width: number; height: number } = {
      x: 15,
      y: 15,
      width: 60,
      height: 15,
    }
  ): Promise<void> {
    const doc = this.getDocument();
    const logoPath = this.config.company.logoPath;

    if (logoPath) {
      try {
        const logo = new Image();
        logo.src = logoPath;
        await new Promise((resolve, reject) => {
          logo.onload = resolve;
          logo.onerror = reject;
        });
        doc.addImage(logo, 'png', position.x, position.y, position.width, position.height);
      } catch {
        // Logo failed to load, continue without it
        console.warn('Failed to load logo:', logoPath);
      }
    }
  }

  /**
   * Add title text with styling
   */
  addTitle(text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }): void {
    const doc = this.getDocument();
    doc.setFontSize(this.config.fonts.size.title);
    doc.setFont(this.config.fonts.bold, 'bold');
    doc.text(text, x, y, options);
    doc.setFont(this.config.fonts.default, 'normal');
  }

  /**
   * Add body text
   */
  addText(text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }): void {
    const doc = this.getDocument();
    doc.setFontSize(this.config.fonts.size.body);
    doc.text(text, x, y, options);
  }

  /**
   * Add a horizontal line
   */
  addLine(x1: number, y1: number, x2: number, y2: number): void {
    const doc = this.getDocument();
    doc.line(x1, y1, x2, y2);
  }

  /**
   * Set text color
   */
  setTextColor(color: [number, number, number]): void {
    const doc = this.getDocument();
    doc.setTextColor(...color);
  }

  /**
   * Reset text color to default
   */
  resetTextColor(): void {
    this.setTextColor(this.config.colors.text);
  }

  /**
   * Add a table using jspdf-autotable
   */
  async addTable(tableData: TableData): Promise<void> {
    const doc = this.getDocument();
    const { autoTable } = await loadAutoTable();

    const defaultOptions = {
      startY: 100,
      styles: { halign: 'center' as const },
      headStyles: { fillColor: this.config.colors.primary },
      alternateRowStyles: { fillColor: this.config.colors.alternate },
      tableLineColor: this.config.colors.primary,
      tableLineWidth: 0.1,
    };

    autoTable(doc, {
      head: [tableData.headers],
      body: tableData.rows,
      ...defaultOptions,
      ...tableData.options,
      styles: { ...defaultOptions.styles, ...tableData.options?.styles },
      headStyles: { ...defaultOptions.headStyles, ...tableData.options?.headStyles },
      alternateRowStyles: {
        ...defaultOptions.alternateRowStyles,
        ...tableData.options?.alternateRowStyles,
      },
    });
  }

  /**
   * Add QR code image to the document
   */
  async addQrCode(
    qrDataUrl: string,
    options: QrCodeOptions = {}
  ): Promise<void> {
    const doc = this.getDocument();
    const { size = 80, position } = options;
    const defaultX = (doc.internal.pageSize.getWidth() - size) / 2;
    const defaultY = 110;

    doc.addImage(
      qrDataUrl,
      'png',
      position?.x ?? defaultX,
      position?.y ?? defaultY,
      size,
      size
    );
  }

  /**
   * Get the current page width
   */
  getPageWidth(): number {
    const doc = this.getDocument();
    return doc.internal.pageSize.getWidth();
  }

  /**
   * Get the current page height
   */
  getPageHeight(): number {
    const doc = this.getDocument();
    return doc.internal.pageSize.getHeight();
  }

  /**
   * Save the PDF with the given filename
   */
  save(filename: string): void {
    const doc = this.getDocument();
    doc.save(filename);
  }

  /**
   * Get the PDF as a Blob
   */
  toBlob(): Blob {
    const doc = this.getDocument();
    return doc.output('blob');
  }

  /**
   * Get the PDF as a data URL
   */
  toDataUrl(): string {
    const doc = this.getDocument();
    return doc.output('datauristring');
  }

  /**
   * Open the PDF in a new window
   */
  openInNewWindow(): void {
    const doc = this.getDocument();
    window.open(doc.output('bloburl'));
  }
}

/**
 * Create a new PDF service instance
 */
export const createPdfService = async (options?: PdfOptions): Promise<PdfService> => {
  const service = new PdfService(options);
  await service.initialize();
  return service;
};
