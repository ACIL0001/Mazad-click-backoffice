/**
 * QR Code PDF Generator
 * Generates PDF documents with QR codes
 */

import { PdfService, createPdfService } from './PdfService';
import type { UserInfo, PdfOptions } from './types';

// Cache for lazy-loaded QRCode module
let qrCodeModule: typeof import('qrcode') | null = null;

/**
 * Lazy load QRCode module
 */
const loadQrCode = async (): Promise<typeof import('qrcode')> => {
  if (!qrCodeModule) {
    qrCodeModule = await import('qrcode');
  }
  return qrCodeModule;
};

/**
 * Generate QR code as data URL
 */
export const generateQrCodeDataUrl = async (text: string): Promise<string> => {
  const QRCode = await loadQrCode();
  return QRCode.toDataURL(text);
};

/**
 * QR Code PDF Generator Class
 * Extends PdfService with QR code specific functionality
 */
export class QrCodeGenerator extends PdfService {
  /**
   * Generate a user info PDF with QR code
   */
  async generateUserQrPdf(user: UserInfo): Promise<void> {
    await this.initialize();
    const doc = this.getDocument();
    const pageWidth = this.getPageWidth();

    // Add logo
    await this.addLogo({
      x: pageWidth / 2.6,
      y: 10,
      width: 50,
      height: 60,
    });

    // Add user info
    const networkName = user.network?.name || '';
    const userInfoText = networkName ? `${user.name} | ${networkName}` : user.name;
    
    this.addText(userInfoText, pageWidth / 2, 90, { align: 'center' });
    this.addText(new Date().toDateString(), pageWidth / 2, 100, { align: 'center' });

    // Generate and add QR code
    const qrDataUrl = await generateQrCodeDataUrl(user.name);
    await this.addQrCode(qrDataUrl);

    // Add footer
    this.addText('Merci de ne pas partager ce document.', pageWidth / 2, 210, { align: 'center' });

    // Save the PDF
    this.save(`${user.name}_info.pdf`);
  }
}

/**
 * Create a QR code generator instance
 */
export const createQrCodeGenerator = async (options?: PdfOptions): Promise<QrCodeGenerator> => {
  const generator = new QrCodeGenerator(options);
  await generator.initialize();
  return generator;
};

/**
 * Convenience function to generate user QR PDF
 */
export const generateUserQrPdf = async (user: UserInfo): Promise<void> => {
  const generator = await createQrCodeGenerator();
  await generator.generateUserQrPdf(user);
};
