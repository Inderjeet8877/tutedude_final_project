const PDFDocument = require('pdfkit');

exports.generatePDFPass = (passData) => {
  // Returns a promise that resolves with the PDF buffer
  return new Promise((resolve, reject) => {
    try {
      // 1. Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];

      // Collect data chunks as they are generated
      doc.on('data', chunk => buffers.push(chunk));
      
      // When done, combine them into one buffer
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // 2. Add Content to the PDF
      doc.fontSize(20).text('Visitor Pass', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(14).text(`Visitor Name: ${passData.visitorName}`);
      doc.text(`Host: ${passData.employeeName}`);
      doc.text(`Date & Time: ${new Date(passData.date).toLocaleDateString()} at ${passData.time}`);
      doc.moveDown();
      
      doc.fontSize(16).text(`Pass Code: ${passData.passCode}`, { align: 'center' });
      doc.moveDown();

      // 3. Add QR Code Image if provided
      if (passData.qrCodeUrl) {
        // Remove the data metadata from the base64 string
        const base64Data = passData.qrCodeUrl.replace(/^data:image\/png;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Add the image to the center of the document
        doc.image(imageBuffer, (doc.page.width - 150) / 2, doc.y, { width: 150 });
      }

      // 4. Finish the document
      doc.end();
      
    } catch (error) {
      console.log("Error creating PDF:", error);
      reject(error);
    }
  });
};
