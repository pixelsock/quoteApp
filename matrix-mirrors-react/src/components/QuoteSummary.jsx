import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuote } from '../context/QuoteContext';
import { generatePDF } from '../utils/pdfGenerator';

const QuoteSummary = () => {
  const navigate = useNavigate();
  const { quoteItems } = useQuote();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const calculateTotal = () => {
    return quoteItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdfBlob = await generatePDF(quoteItems, calculateTotal());
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="quote-summary">
      <h2>Quote Summary</h2>
      {quoteItems.length === 0 ? (
        <p>No items in the quote. Please add some items.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {quoteItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.sku}</td>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4">Total</td>
                <td>${calculateTotal().toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <div className="actions">
            <button onClick={() => navigate('/')}>Add Another Item</button>
            <button onClick={handleGeneratePDF} disabled={isGeneratingPDF}>
              {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF'}
            </button>
            {pdfUrl && (
              <a href={pdfUrl} download="quote.pdf" className="download-link">
                Download PDF
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuoteSummary;