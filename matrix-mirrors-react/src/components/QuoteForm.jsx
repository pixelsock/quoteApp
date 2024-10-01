import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuote } from '../context/QuoteContext';
import jsonData from '../data/output.json';

const QuoteForm = () => {
  const navigate = useNavigate();
  const { formData, updateFormData, addQuoteItem } = useQuote();
  const [options, setOptions] = useState({});
  const [filteredData, setFilteredData] = useState(jsonData);

  useEffect(() => {
    populateFormFields();
  }, [filteredData]);

  const populateFormFields = () => {
    const newOptions = {};
    Object.keys(formData).forEach(field => {
      newOptions[field] = [...new Set(filteredData.map(item => item[field]).flat())].filter(option => option !== "N/A");
    });
    setOptions(newOptions);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    updateFormData(name, value);

    // Filter data based on current selections
    const newFilteredData = jsonData.filter(item => {
      return Object.entries(formData).every(([key, val]) => {
        if (key === name) return item[key] === value;
        if (val === "") return true;
        return item[key] === val;
      });
    });

    setFilteredData(newFilteredData);

    // Special rules for Touch Sensor and Adjustable Color Temperature
    if (name === 'mirrorControls' && value === 'Touch Sensor') {
      if (formData.colorTemperature === 'Adjustable 2700k-6500k (00)') {
        updateFormData('dimming', 'Non-Dimming (N)');
        updateFormData('lightOutput', 'High Output - 6W/ft | 750lm/ft (H)');
      } else {
        updateFormData('dimming', 'Non-Dimming (N)');
      }
    }
  };

  const generateSKU = () => {
    const skuOrder = [
      'mirrorStyle', 'lightDirection', 'size', 
      'lightOutput', 'colorTemperature', 'dimming', 'mountingOrientation', 
      'accessories', 'frameColor'
    ];

    return skuOrder.map(field => {
      let value = formData[field];
      if (field === 'size' && value) {
        value = value.replace(/"/g, '').replace('x', '').replace(' Diameter', '').padStart(4, '0');
      } else if (value) {
        const match = value.match(/\(([^)]+)\)/);
        if (match) value = match[1];
      }
      if (field === 'frameColor' && value === "N/A") return '';
      return value || '';
    }).filter(part => part !== '').join('-');
  };

  const calculatePrice = () => {
    const selectedItem = filteredData.find(item => 
      Object.entries(formData).every(([key, value]) => item[key] === value)
    );
    return selectedItem ? parseFloat(selectedItem['Total Price'].replace('$', '')) : 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const sku = generateSKU();
    const price = calculatePrice();
    const newItem = {
      sku,
      quantity: parseInt(formData.quantity, 10),
      description: `${formData.productLine} ${formData.mirrorStyle} ${formData.lightDirection}`,
      price,
    };
    addQuoteItem(newItem);
    navigate('/summary');
  };

  return (
    <form onSubmit={handleSubmit}>
      {Object.entries(formData).map(([field, value]) => (
        <div key={field}>
          <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
          <select
            id={field}
            name={field}
            value={value}
            onChange={handleInputChange}
            required
          >
            <option value="">Select One...</option>
            {options[field]?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      ))}
      <button type="submit">Add to Quote</button>
    </form>
  );
};

export default QuoteForm;