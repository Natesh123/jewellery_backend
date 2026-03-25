const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateReceipt = async ({
  invoiceNumber,
  date,
  customerName,
  amount,
  currency,
  method,
  status,
  description,
  companyInfo
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Convert amount to number if needed
      const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

      // Header - Company Info
      doc.fontSize(10).fillColor('#666666')
         .text(companyInfo.name, { align: 'right' })
         .text(companyInfo.address, { align: 'right' })
         .text(companyInfo.contact, { align: 'right' })
         .moveDown();

      // Title
      doc.fontSize(16).fillColor('#000000').text('PAYMENT RECEIPT', { align: 'center' })
         .moveDown(2);

      // Invoice Details
      doc.fontSize(12)
         .text(`Invoice Number: ${invoiceNumber || 'N/A'}`)
         .text(`Date: ${new Date(date).toLocaleDateString()}`)
         .text(`Customer: ${customerName}`)
         .moveDown(2);

      // Payment Summary Table
      const tableTop = doc.y;
      const tableLeft = 50;
      const cellPadding = 5;
      const col1Width = 300;
      const col2Width = 100;

      // Table Header
      doc.font('Helvetica-Bold').fontSize(10)
         .text('Description', tableLeft, tableTop)
         .text('Amount', tableLeft + col1Width, tableTop, { width: col2Width, align: 'right' });

      // Table Rows
      let currentY = tableTop + 20;
      
      function addRow(label, value) {
        doc.font('Helvetica').fontSize(10)
           .text(label, tableLeft, currentY)
           .text(value, tableLeft + col1Width, currentY, { width: col2Width, align: 'right' });
        currentY += 20;
      }

      addRow('Subtotal', `${currency} ${amountNum.toFixed(2)}`);
      addRow('Payment Method', method);
      addRow('Status', status);
      addRow('Total', `${currency} ${amountNum.toFixed(2)}`);

      // Draw table borders
      doc.strokeColor('#aaaaaa').lineWidth(1)
         .moveTo(tableLeft, tableTop + 15)
         .lineTo(tableLeft + col1Width + col2Width, tableTop + 15)
         .stroke()
         .moveTo(tableLeft, currentY)
         .lineTo(tableLeft + col1Width + col2Width, currentY)
         .stroke();

      // Additional Notes
      if (description) {
        doc.moveDown(2).fontSize(10)
           .text('Additional Notes:', { underline: true })
           .moveDown(0.5)
           .text(description, { width: 400 });
      }

      // Footer
      doc.moveTo(50, doc.page.height - 100)
         .lineTo(doc.page.width - 50, doc.page.height - 100)
         .stroke();
      
      doc.fontSize(8).fillColor('#666666')
         .text('Thank you for your business!', { align: 'center' })
         .text(`This is an official payment receipt from ${companyInfo.name}`, { align: 'center' });

      doc.end();
    } catch (error) {
      console.error('Error generating receipt:', error);
      reject(error);
    }
  });
};

module.exports = {
  generateReceipt
};