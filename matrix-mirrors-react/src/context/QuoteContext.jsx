import { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

const QuoteContext = createContext();

export const useQuote = () => useContext(QuoteContext);

export const QuoteProvider = ({ children }) => {
  const [quoteItems, setQuoteItems] = useState([]);
  const [formData, setFormData] = useState({
    productLine: '',
    frameColor: '',
    mirrorControls: '',
    mirrorStyle: '',
    lightDirection: '',
    size: '',
    mountingOrientation: '',
    colorTemperature: '',
    lightOutput: '',
    dimming: '',
    accessories: '',
    quantity: '',
  });

  const addQuoteItem = (item) => {
    setQuoteItems((prevItems) => [...prevItems, item]);
  };

  const removeQuoteItem = (index) => {
    setQuoteItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const updateFormData = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const value = {
    quoteItems,
    formData,
    addQuoteItem,
    removeQuoteItem,
    updateFormData,
  };

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
};

QuoteProvider.propTypes = {
  children: PropTypes.node.isRequired,
};