import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

const DROPBOX_API_URL = 'https://content.dropboxapi.com/2/files/upload';
const DROPBOX_SHARE_URL = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';

export const generatePDF = async (quoteItems, totalPrice) => {
  const pdf = new jsPDF();

  // Add logo
  // Note: You'll need to replace this with the actual path to your logo
  const logoUrl = 'path/to/your/logo.png';
  pdf.addImage(logoUrl, 'PNG', 10, 10, 50, 20);

  // Add title
  pdf.setFontSize(18);
  pdf.text('Quote Summary', 105, 40, null, null, 'center');

  // Add date
  pdf.setFontSize(12);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 10, 50);

  // Add table
  pdf.autoTable({
    startY: 60,
    head: [['SKU', 'Description', 'Quantity', 'Price', 'Total']],
    body: quoteItems.map(item => [
      item.sku,
      item.description,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ]),
    foot: [['', '', '', 'Total', `$${totalPrice.toFixed(2)}`]],
    theme: 'striped',
  });

  // Add terms and conditions
  const termsY = pdf.lastAutoTable.finalY + 10;
  pdf.setFontSize(10);
  pdf.text('Terms and Conditions:', 10, termsY);
  pdf.setFontSize(8);
  const terms = [
    '• This quote is valid for 3 months following its creation.',
    '• No returns on custom products or on quantities of more than 5 mirrors.',
    '• Returns of up to five standard sized mirrors from a single order are acceptable with a 25% restocking fee and no refunds on shipping.',
    '• Estimated ship dates (ESD) are subject to change.',
    '• Concealed damage must be reported BEFORE INSTALLATION and within 30 days of receiving.',
    '• Visible damage must be reported to the carrier upon receipt.',
    '• Customers are responsible for any tariffs incurred during shipping.',
    '• For full Terms and Conditions, visit our website or contact us.',
  ];
  pdf.setFont('helvetica', 'normal');
  pdf.text(terms, 10, termsY + 10, { maxWidth: 180, lineHeightFactor: 1.5 });

  // Generate PDF blob
  const pdfBlob = pdf.output('blob');

  // Upload to Dropbox and get share link
  const shareLink = await uploadToDropboxAndGetShareLink(pdfBlob);

  return { pdfBlob, shareLink };
};

const uploadToDropboxAndGetShareLink = async (pdfBlob) => {
  try {
    const accessToken = import.meta.env.VITE_DROPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('Dropbox access token is not set');
    }

    const fileName = `Quote_${Date.now()}.pdf`;

    // Upload file to Dropbox
    const uploadResponse = await axios.post(DROPBOX_API_URL, pdfBlob, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: `/Matrix Mirrors/RFQs/${fileName}`,
          mode: 'add',
          autorename: true,
          mute: false
        })
      }
    });

    // Create shared link
    const shareResponse = await axios.post(DROPBOX_SHARE_URL, {
      path: uploadResponse.data.path_lower,
      settings: {
        requested_visibility: 'public'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return shareResponse.data.url;
  } catch (error) {
    console.error('Error uploading to Dropbox:', error);
    throw error;
  }
};