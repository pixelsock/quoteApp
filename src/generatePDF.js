import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { uploadFileAndGetShareLink } from './data/dropbox'; // Corrected import path

export { generatePDF };

function generatePDF(bool, quoteItems, finalTotal, customerNumber, quoteNumber) {
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'letter', // Assuming letter size
    });

    // Add the logo
    const logoUrl = 'https://uploads-ssl.webflow.com/638fbc9b6d164e234dc677d7/64e27f2a344c637a5c2038d4_logo.png'; // Replace with the path or base64 string of your logo
    pdf.addImage(logoUrl, 'PNG', 40, 30, 131, 45); // Adjust dimensions as needed

    // Set font for the entire document
    pdf.setFont('Helvetica');

    // Add the quote number under the logo
    pdf.setFontSize(12); // Adjust size as needed
    const quoteNumberY = 100; // Y position under the logo, adjust as needed
    pdf.text(`Quote Number: ${quoteNumber}`, 40, quoteNumberY);

    // Add the company info - align to the left
    pdf.setFontSize(10); // Adjust size as needed
    pdf.text("Matrix Mirrors\n6464 Warren Drive\nNorcross, GA\n30093 USA", 180, 40); // Adjust position as needed

    // Add the title, quote number, date, expiry date, and customer number - align to the right
    pdf.setFontSize(16);
    pdf.text("Sales Quote", pdf.internal.pageSize.width - 40, 50, null, null, 'right'); // Adjust position as needed
    pdf.setFontSize(12);
    const quoteDate = new Date();
    pdf.text(`Quote Date: ${quoteDate.toLocaleDateString()}`, pdf.internal.pageSize.width - 40, 80, null, null, 'right'); // Adjust position as needed
    const expiryDate = new Date(quoteDate);
    expiryDate.setDate(expiryDate.getDate() + 90);
    pdf.text(`Expiry Date: ${expiryDate.toLocaleDateString()}`, pdf.internal.pageSize.width - 40, 100, null, null, 'right'); // Adjust position as needed
    pdf.text(`Customer Number: ${customerNumber}`, pdf.internal.pageSize.width - 40, 120, null, null, 'right'); // Adjust position as needed

    // Add a line break (horizontal line)
    pdf.setDrawColor(0, 0, 0); // Set draw color to black
    pdf.line(40, 140, pdf.internal.pageSize.width - 40, 140); // Draw a line from left to right

    // Add the table header and items without FREIGHT
    autoTable(pdf, {
        startY: 150,
        margin: { left: 40, right: 40 }, // Set left and right margins
        tableWidth: pdf.internal.pageSize.width - 40, // Set the table width to match the line length
        styles: {
            fontSize: 10, // Default font size for the table
            cellPadding: 5,
        },
        columnStyles: {
            0: { cellWidth: 140 }, // ITEM NUMBER
            1: { cellWidth: 190 }, // DESCRIPTION
            2: { cellWidth: 60, textAlign: 'center' }, // QTY
            3: { cellWidth: 60}, // BASE
            4: { cellWidth: 80, halign: 'right' }, // TOTAL COST
        },
        headStyles: {
            fillColor: [211, 211, 211], // A light gray background for the header
            textColor: [0, 0, 0], // Black text for the header
        },
        head: [
            ['ITEM NUMBER', 'DESCRIPTION', 'QTY', 'BASE', 'COST']
        ],
        body: quoteItems.map(item => [
            item.product,
            item.description,
            item.quantity, 
            `$${(Number(item.total_price) / item.quantity || 0).toFixed(2)}`, // BASE
            `$${(Number(item.total_price) || 0).toFixed(2)}` // TOTAL COST
        ]),
        footStyles: {
            fillColor: [4, 7, 7], // A dark gray background for the footer
            textColor: [255, 255, 255], // White text
            fontSize: 10, // Slightly larger text for the footer
            cellPadding: 10, // Increased height for the footer
            textAlign: 'right', // Align text to the right
        },
        foot: [
            ['TOTALS','', '', '', `$${finalTotal.toFixed(2)}`]
        ],
        didParseCell: function(data) {
            // Check if this is a header cell and for the 'COST' column
            if (data.row.section === 'head' && data.column.dataKey === 4) {
                data.cell.styles.halign = 'right'; // Align this header cell to the right
            }
            // do the same for the footer total
            if (data.row.section === 'foot' && data.column.dataKey === 4) {
                data.cell.styles.halign = 'right'; // Align this header cell to the right
            }
        }
    });
    // Add footer notes - align to the left
    const notesY = pdf.internal.pageSize.height - 100; // Position from the bottom of the page
    pdf.setFontSize(8); // Smaller font for footer notes
    pdf.text("* This quote is valid for 3 months following its creation.", 40, notesY);
    // Add more notes here

    // Convert the PDF to a blob
    const pdfBlob = pdf.output('blob');

    // Create a new File object from the blob
    const pdfFile = new File([pdfBlob], `Matrix-${quoteNumber}.pdf`, { type: "application/pdf" });

    if (bool) {
        // Generate the pdf and download it
        pdf.save(`Matrix-${quoteNumber}.pdf`);
    } else {
        // Upload the PDF to Dropbox and get the share link
        uploadFileAndGetShareLink(pdfFile)
            .then(function(shareLink) {
                if (shareLink) {
                    console.log('PDF uploaded to Dropbox and shared link:', shareLink);
                    // add the value of shareLink to the value of input field with id 'quote-data'
                    document.getElementById('quote-data').value = shareLink;
                } else {
                    console.error('Error uploading PDF to Dropbox');
                }
            })
            .catch(function(error) {
                console.error('Error uploading PDF to Dropbox:', error);
            });
    }
}

