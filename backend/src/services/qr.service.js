const QRCode = require('qrcode');

exports.generateQRCode = async (text) => {
  try {
    console.log("Generating QR Code for:", text);
    // Convert the text into a base64 encoded image string
    const dataUrl = await QRCode.toDataURL(text);
    return dataUrl;
  } catch (error) {
    console.log("Error generating QR code:", error);
    throw error;
  }
};
