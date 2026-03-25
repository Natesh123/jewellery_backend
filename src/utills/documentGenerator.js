const { jsPDF } = require('jspdf');
require('jspdf-autotable');

// Generate PDF document
const generatePDF = async ({ title, headers, data }) => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    // Add table
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 20,
      styles: {
        cellPadding: 5,
        fontSize: 10,
        valign: 'middle',
        halign: 'center',
      },
      headStyles: {
        fillColor: [44, 82, 130], // Dark blue header
        textColor: 255, // White text
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [237, 242, 247], // Light gray alternate rows
      }
    });
    
    // Return as buffer
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Generate CSV document
const generateCSV = async ({ headers, data }) => {
  try {
    // Convert headers to CSV format
    const csvHeaders = headers.join(',');
    
    // Convert data rows to CSV format
    const csvRows = data.map(row => 
      row.map(field => {
        // Escape fields that contain commas or quotes
        if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(',')
    );
    
    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    // Convert to buffer
    return Buffer.from(csvContent, 'utf8');
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
};

module.exports = {
  generatePDF,
  generateCSV
};