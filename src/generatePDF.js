import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
export { generatePDF };

function generatePDF(quoteItems, finalTotal, totalFreight, quoteNumber, sku) {
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'letter', // Assuming letter size
    });

    // Add the logo
    // Assuming the logo is accessible at this path
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
    pdf.text("Customer Number: 12345", pdf.internal.pageSize.width - 40, 120, null, null, 'right'); // Adjust position as needed

    // Add a line break (horizontal line)
    pdf.setDrawColor(0, 0, 0); // Set draw color to black
    pdf.line(40, 140, pdf.internal.pageSize.width - 40, 140); // Draw a line from left to right

    // Add the table header and items with added DESCRIPTION and FREIGHT
    autoTable(pdf, {
        startY: 150,
        styles: {
            fontSize: 10, // Default font size for the table
            cellPadding: 5,
        },
       // make the table width the same size and the pdf.line above
        columnStyles: {
            0: { cellWidth: 140 }, // ITEM NUMBER
            1: { cellWidth: 140 }, // DESCRIPTION
            2: { cellWidth: 40 }, // QTY
            3: { cellWidth: 70 }, // BASE
            4: { cellWidth: 70 }, // FREIGHT
            5: { cellWidth: 70 }, // TOTAL COST
        },
        headStyles: {
            fillColor: [211, 211, 211], // A light gray background for the header
            textColor: [0, 0, 0], // Black text for the header
        },
        head: [['ITEM NUMBER', 'DESCRIPTION', 'QTY', 'BASE', 'FREIGHT', 'TOTAL COST']],
        body: quoteItems.map(item => [
            item.product,
            item.description,
            item.quantity, 
            `$${(Number(item.total_price) / item.quantity || 0).toFixed(2)}`, // Renamed to 'BASE'
            `$${(Number(item.freight) || 0).toFixed(2)}`,
            `$${(Number(item.total_price) || 0).toFixed(2)}`
        ]),
        footStyles: {
            fillColor: [4, 7, 7], // A dark gray background for the footer

            textColor: [255, 255, 255], // White text
            fontSize: 10, // Slightly larger text for the footer
            cellPadding: 10, // Increased height for the footer
        },
        foot: [
            ['TOTALS','', '', '', `$${totalFreight.toFixed(2)}`, `$${(finalTotal + totalFreight).toFixed(2)}`]
        ]
    });

    // Add footer notes - align to the left
    const notesY = pdf.internal.pageSize.height - 100; // Position from the bottom of the page
    pdf.setFontSize(8); // Smaller font for footer notes
    pdf.text("* This quote is valid for 3 months following its creation.", 40, notesY);
    // Add more notes here

    // Save the PDF
    window.open(pdf.output('bloburl'), '_blank');
}
