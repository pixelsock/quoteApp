import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { uploadFileAndGetShareLink } from './dropbox';

export { generatePDF };

// Adjust the function signature to include new parameters
function generatePDF(bool, quoteItems, finalTotal, companyName, quoteNumber, projectName, specifierInfo, callback) {
    return new Promise((resolve, reject) => {
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

        // Add the quote number and project name under the logo
        pdf.setFontSize(12); // Adjust size as needed
        const quoteNumberY = 100; // Y position under the logo, adjust as needed
        pdf.text(`Quote Number: ${quoteNumber}\nProject: ${projectName}\nSpecifier & Location: ${specifierInfo}`, 40, quoteNumberY);

        // Add the company info - align to the left
        pdf.setFontSize(10); // Adjust size as needed
        pdf.text("Matrix Mirrors\n6464 Warren Drive\nNorcross, GA 30093", 180, 40); // 

        // Add the title, quote number, date, expiry date, and company - align to the right
        pdf.setFontSize(16);
        pdf.text("Sales Quote", pdf.internal.pageSize.width - 40, 50, null, null, 'right'); // Adjust position as needed
        pdf.setFontSize(12);
        const quoteDate = new Date();
        pdf.text(`Quote Date: ${quoteDate.toLocaleDateString()}`, pdf.internal.pageSize.width - 40, 80, null, null, 'right'); // Adjust position as needed
        const expiryDate = new Date(quoteDate);
        expiryDate.setDate(expiryDate.getDate() + 90);
        pdf.text(`Expiry Date: ${expiryDate.toLocaleDateString()}`, pdf.internal.pageSize.width - 40, 100, null, null, 'right'); // Adjust position as needed
        pdf.text(`Company: ${companyName}`, pdf.internal.pageSize.width - 40, 120, null, null, 'right'); // Adjust position as needed

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

        // Add freight note right below the table, right-justified in small red bold text
        const freightNoteY = pdf.autoTable.previous.finalY + 10; // Position below the table
        pdf.setTextColor(255, 0, 0); // Red color
        pdf.setFontSize(8); // Smaller font
        pdf.setFont('Helvetica', 'bold'); // Bold text
        pdf.text("*Freight Not Included. Can be provided upon request", pdf.internal.pageSize.width - 45, freightNoteY, { align: 'right' });

       // Add table notes directly below the freight note
const notesY = freightNoteY + 10; // Position below the freight note
pdf.setTextColor(0, 0, 0); // Black color
pdf.setFontSize(8); // Smaller font
pdf.setFont('Helvetica', 'normal'); // Normal text
const maxWidth = pdf.internal.pageSize.width / 2 - 40; // 50% of the page width minus left margin
pdf.text([
    "• This quote is valid for 3 months following its creation.",
    "• No returns on custom products or on quantities of more than 5 mirrors.",
    "• Returns of up to five standard sized mirrors from a single order are acceptable with a 25% restocking fee and no refunds on shipping.",
    "• Estimated ship dates (ESD) are subject to change.",
    "• Concealed damage must be reported BEFORE INSTALLATION and within 30 days of receiving.",
    "• Visible damage must be reported to the carrier upon receipt.",
    "• Customers are responsible for any tariffs incurred during shipping.",
    "• Matrix Mirrors Warranty Statement covers parts, glass, and electrical components for five years from the date of purchase and drivers for seven years from the date of purchase.",
    "• For the full, detailed Terms and Conditions and Warranty Statement applicable to all products sold and quotes made by Matrix Mirrors, visit matrixmirrors.com or email admin@matrixmirrors.com.",
    "***Residential dropship or limited access freight deliveries may incur additional shipping charges.",
    "***Mirrors larger than 64\" are not eligible for liftgate delivery.",
    "***Please contact us if whiteglove delivery is needed."
], 40, notesY, { maxWidth: maxWidth }); // Adjust the X position as needed

        if (bool) {
            pdf.save(`Matrix-${quoteNumber}.pdf`);
            resolve();
        } else {
            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], `Matrix-${quoteNumber}.pdf`, { type: "application/pdf" });

            uploadFileAndGetShareLink(pdfFile)
                .then(shareLink => {
                    console.log('Share link:', shareLink);
                    resolve(shareLink); // Resolve with the share link
                    if (callback) callback(null, shareLink); // Call the callback with no error and the share link
                })
                .catch(error => {
                    console.error('Error uploading PDF to Dropbox:', error);
                    reject(error); // Reject the Promise if there's an error
                    if (callback) callback(error); // Call the callback with the error
                });
        }
    });
}

