const PDFDocument = require('pdfkit');

exports.generatePDFPass = (passData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A5', layout: 'landscape', margin: 40 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Draw Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#3b82f6');

      // Header
      doc.fillColor('#1e40af').fontSize(26).text('OFFICIAL VISITOR PASS', { align: 'center' });
      doc.moveDown(1.5);

      // Body format
      doc.fillColor('#334155').fontSize(14);
      doc.text(`Visitor Name:  ${passData.visitor.name}`);
      doc.text(`Company:       ${passData.visitor.company || 'N/A'}`);
      doc.moveDown(0.5);
      doc.text(`Host:          ${passData.employee.name}`);
      doc.text(`Date & Time:   ${new Date(passData.date).toDateString()} @ ${passData.time}`);
      doc.moveDown(0.5);
      doc.fillColor('#000000').font('Helvetica-Bold').text(`Pass Code: ${passData.passCode}`);

      // Embed QR code from data URI
      if (passData.qrCodeUrl) {
        // Strip data meta headers from base64 representation
        const base64Data = passData.qrCodeUrl.replace(/^data:image\/png;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');
        doc.image(imageBuffer, 400, 100, { fit: [120, 120] });
      }

      // Footer
      doc.moveDown(3);
      doc.fillColor('#94a3b8').fontSize(10).text('Please present this QR code or Pass Number at the security desk upon arrival.', 50, doc.page.height - 50, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
