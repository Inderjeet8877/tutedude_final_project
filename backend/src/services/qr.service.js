const QRCode = require('qrcode');

/**
 * Generates a base64 encoded string of a QR Code graphic
 * @param {string} text - Secure pass string or full scan URL
 * @returns {Promise<string>} Base64 Data URI
 */
exports.generateQRCode = async (text) => {
  try {
    const dataUri = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H', // High error correction
      margin: 1,
      color: {
        dark: '#0f172a',  // Slate 900
        light: '#ffffff'  // White background
      }
    });
    return dataUri;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error('Failed to generate pass QR code');
  }
};
