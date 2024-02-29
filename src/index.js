import jsonData from './data/output.json';
import { generatePDF } from './generatePDF.js';


let currentSelections = {
    'product-line': "",
    'mirror-style': "",
    'light-direction': "",
    'size': "",
    'mirror-controls': "",
    'accessories': "",
    'sku': ""
};




function clearSelectOptions(selectElement) {
    while (selectElement.options.length > 0) {
        selectElement.remove(0);
    }
}

function populateSelectField(selectElement, options, keepSelection = false) {
    const currentSelection = keepSelection ? selectElement.value : null; // Store current selection if needed
    clearSelectOptions(selectElement); // Clears the existing options
    
    // Determine the text for the default option based on whether a selection has been made
    const defaultOptionText = currentSelection ? "Change This Selection" : "Select One...";
    const defaultOption = new Option(defaultOptionText, "");
    selectElement.add(defaultOption);
    
    // Populate with new options
    options.forEach(optionValue => {
        const option = new Option(optionValue, optionValue);
        selectElement.add(option);
    });
    
    // If keeping the selection and it's still valid, re-select it
    if (keepSelection && options.includes(currentSelection)) {
        selectElement.value = currentSelection;
    }
}

function populateFormFields(jsonData) {
    const fields = {
        'product-line': "Product Line",
        'mirror-style': "Mirror Style",
        'light-direction': "Light Direction",
        'size': "Size",
        'mirror-controls': "Mirror Controls",
        'accessories': "Accessories",
        
    };

    Object.entries(fields).forEach(([fieldId, jsonKey]) => {
        const selectElement = document.getElementById(fieldId);
        const currentSelection = selectElement.value; // Store the current selection
        const options = [...new Set(jsonData.map(item => item[jsonKey]))];
        populateSelectField(selectElement, options);

        // After repopulating options, attempt to restore the previously selected value if possible
        if (options.includes(currentSelection)) {
            selectElement.value = currentSelection; // Restore the current selection if it's still valid
        } else {
            // Handle cases where the selection does not exist anymore (e.g., reset to default or handle accordingly)
            selectElement.value = ""; // Reset to default or handle accordingly
        }
    });
}

function updateDropdownOptions(selectElement, allPossibleOptions, currentSelections) {
    // Determine valid options based on current selections and constraints
    const validOptions = determineValidOptions(allPossibleOptions, currentSelections);

    // Add missing valid options back to the dropdown
    validOptions.forEach(optionValue => {
        if (!Array.from(selectElement.options).map(o => o.value).includes(optionValue)) {
            const option = new Option(optionValue, optionValue);
            selectElement.add(option);
        }
    });

    // Remove invalid options from the dropdown
    Array.from(selectElement.options).forEach(option => {
        if (!validOptions.includes(option.value) && option.value !== "") {
            selectElement.remove(option.index);
        }
    });
}


function filterJsonData(jsonData) {
    let filteredData = jsonData;
    // Apply all current selections for filtering
    Object.keys(currentSelections).forEach(selectionKey => {
        const selectionValue = currentSelections[selectionKey];
        if (selectionValue) {
            // Convert the selection key to the JSON key format
            const jsonKey = selectionKey.split('-').map((word, index) => 
                index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
                .join(' ');
            filteredData = filteredData.filter(item => item[jsonKey] === selectionValue);
        }
    });

    return filteredData;
}

// Define the order of fields
const fieldOrder = ['product-line', 'mirror-style', 'mirror-controls', 'light-direction', 'size', 'accessories', 'quantity'];

function goBackAndResetField() {
    const formFields = ['product-line', 'mirror-style', 'light-direction', 'size', 'mirror-controls', 'accessories'];
    let lastSelectedIndex = -1;

    // Find the last selected field before the first empty field
    for (let i = 0; i < formFields.length; i++) {
        if (document.getElementById(formFields[i]).value === "") {
            break;
        }
        lastSelectedIndex = i;
    }

    // If there's a field to reset
    if (lastSelectedIndex !== -1) {
        const fieldIdToReset = formFields[lastSelectedIndex];
        document.getElementById(fieldIdToReset).value = ""; // Reset the field
        currentSelections[fieldIdToReset] = ""; // Update the currentSelections object

        // Trigger the change event manually to update the form and fields visibility
        document.getElementById(fieldIdToReset).dispatchEvent(new Event('change'));
    }
}

function updateFieldVisibility() {
    let allFieldsHidden = true;
    let anyFieldSelected = false; // Track if any field has been selected

    const fieldsBeforeQuantity = fieldOrder.filter(fieldId => fieldId !== 'quantity');
    
    for (let i = 0; i < fieldsBeforeQuantity.length; i++) {
        const fieldId = fieldsBeforeQuantity[i];
        const wrapperId = `${fieldId}-wrapper`;
        const wrapperElement = document.getElementById(wrapperId);
        const selectElement = document.getElementById(fieldId);

        if (wrapperElement) {
            if (allFieldsHidden) {
                if (selectElement.value) {
                    wrapperElement.style.display = 'none';
                    anyFieldSelected = true; // Update if any field has been selected
                } else {
                    wrapperElement.style.display = '';
                    allFieldsHidden = false;
                }
            } else {
                wrapperElement.style.display = 'none';
            }
        }
    }

    const quantityWrapper = document.getElementById('quantity-wrapper');
    if (quantityWrapper) {
        quantityWrapper.style.display = allFieldsHidden ? '' : 'none';
    }

    // Control the "go-back" button visibility based on anyFieldSelected
    const goBackButton = document.getElementById('go-back');
    if (goBackButton) {
        goBackButton.style.display = anyFieldSelected ? '' : 'none';
    }

    // Show the "add-another" button based on the quantity field's value
    const addAnotherButton = document.getElementById('add-another');
    if (document.getElementById('quantity').value) {
        addAnotherButton.style.display = '';
    } else {
        addAnotherButton.style.display = 'none';
    }
}

let filteredData;

function setupDynamicFiltering(jsonData) {
    const formFields = ['product-line', 'mirror-style', 'light-direction', 'size', 'mirror-controls', 'accessories'];

    formFields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('change', () => {
           filteredData = jsonData;
            // Update currentSelections based on the current state of all form fields
            formFields.forEach(fid => {
                const selectedValue = document.getElementById(fid).value;
                currentSelections[fid] = selectedValue;
                if (selectedValue !== "") {
                    const key = fid.replace(/-/g, ' ')
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');
                    filteredData = filteredData.filter(item => item[key] === selectedValue);
                }
            });
            console.log(`Filtered data after selecting ${fieldId}:`, filteredData);

            updateFormFields(filteredData, formFields, fieldId);

            // After updating form fields based on the selection, update the visibility of fields
            updateFieldVisibility();
        });
    });

    // Initially update field visibility based on default selections
    updateFieldVisibility();
}

function updateFormFields(filteredData, formFields, currentFieldId) {
    // Iterate through all form fields
    formFields.forEach(fieldId => {
        const selectElement = document.getElementById(fieldId);
        const currentSelection = selectElement.value;

        // Dynamically update based on filtered data
        const key = fieldId.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const uniqueOptions = [...new Set(filteredData.map(item => item[key]))];

        // Repopulate the field with options based on the filtered data
        populateSelectField(selectElement, uniqueOptions, true);

        // If the current selection is still valid, keep it; otherwise, allow the user to change it
        if (uniqueOptions.includes(currentSelection) || currentFieldId === fieldId) {
            selectElement.value = currentSelection;
        } else {
            // If the current selection is no longer valid and the change was triggered by another field,
            // keep the field empty or reset to a default value, indicating a selection needs to be made
            if (currentFieldId !== fieldId) {
                selectElement.value = ""; // Or set to a default value if applicable
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await populateFormFields(jsonData);
    setupDynamicFiltering(jsonData);
    updateFieldVisibility();
    document.getElementById('go-back').style.display = 'none'; // Initially hide the "go-back" button
    document.getElementById('go-back').addEventListener('click', goBackAndResetField);

    // Initially hide the "add-another" button
    const addAnotherButton = document.getElementById('add-another');
    addAnotherButton.style.display = 'none';

    // Show the "add-another" button when the quantity field is updated
    document.getElementById('quantity').addEventListener('change', function() {
        if (this.value) {
            addAnotherButton.style.display = ''; // Show the button
        } else {
            addAnotherButton.style.display = 'none'; // Hide the button if quantity is empty
        }
    });

    // Add event listener for the "add-another" button
    addAnotherButton.addEventListener('click', addFilteredItemToQuote);

    const generateQuoteButton = document.getElementById('generate-quote');
    
    if (generateQuoteButton) {
        generateQuoteButton.addEventListener('click', () => {
            const quoteItems = getQuoteItems(); // Implement this function based on your application
            const finalTotal = getFinalTotal(); // Implement this function based on your application
            const totalFreight = getTotalFreight(); // Implement this function based on your application

            // Call the generatePDF function with the gathered data
            generatePDF(quoteItems, finalTotal, totalFreight);
        });
    }
});

function addFilteredItemToQuote() {
    const quantityField = document.getElementById('quantity');
    const quantity = quantityField.value;
    if (quantity <= 0) {
        alert('Please specify a quantity.');
        return;
    }
    const mirrorSize = parseInt(currentSelections['size'], 10);

    // Get the SKU and calculate the total price based on the quantity
    const currentSelection = filteredData[0];
    const sku = currentSelection['SKU'];
    const basePrice = parseFloat(currentSelection['Total Price'].replace('$', ''));
    const totalPrice = (basePrice * quantity).toFixed(2); // Assuming quantity affects total price linearly
    const freightCharge = calculateFreightCharge(mirrorSize, quantity);
    console.log('Freight charge:', freightCharge);


    if (!sku) {
        console.error('No item selected or SKU details are missing.');
        return;
    }

    // Clone the template and update its content
    const template = document.getElementById('qs-line-item-template');
    if (!template) {
        console.error('Template element not found.');
        return;
    }

    const clone = template.content.cloneNode(true); // Ensure you're cloning the content for templates
    const skuElement = clone.querySelector('[qs-value="sku"]');
    const quantityElement = clone.querySelector('[qs-value="quantity"]');
    const priceElement = clone.querySelector('[qs-value="price"]');
    const freightElement = document.querySelector('[qs-value="freight"]');
    let currentFreightTotal = freightElement.textContent.replace('$', '');
    // Check if currentFreightTotal is not a number or zero, then initialize it to 0.0
    currentFreightTotal = isNaN(parseFloat(currentFreightTotal)) ? 0.0 : parseFloat(currentFreightTotal);
    const newFreightTotal = (currentFreightTotal + freightCharge).toFixed(2);
    freightElement.textContent = `$${newFreightTotal}`;
    console.log('New freight total:', newFreightTotal);
    if (skuElement && quantityElement && priceElement) {
        skuElement.textContent = sku;
        quantityElement.textContent = quantity;
        priceElement.textContent = `$${totalPrice}`;
        document.getElementById('line-item-container').appendChild(clone);
        clearFormAndResetSelections();
    } else {
        console.error('One or more elements could not be found in the template.');
    }

    updateTotals();
  
}

function calculateFreightCharge(mirrorSize, quantity) {
    if (mirrorSize < 3636) { // Mirrors smaller than 36"x36"
        if (quantity <= 6) {
            return 50 * quantity;
        } else {
            return calculateFreightChargeForTotal(quantity);
        }
    } else {
        return calculateFreightChargeForTotal(quantity);
    }
}

function calculateFreightChargeForTotal(totalQuantity) {
    if (totalQuantity < 6) {
        return 300;
    } else if (totalQuantity >= 6 && totalQuantity < 11) {
        return 450;
    } else if (totalQuantity >= 11 && totalQuantity < 16) {
        return 600;
    } else if (totalQuantity >= 16 && totalQuantity < 21) {
        return 700;
    } else if (totalQuantity >= 21 && totalQuantity < 26) {
        return 800;
    } else {
        console.log("For orders with more than 25 mirrors, please contact quotes@matrixmirrors.com.");
        return 0; // Assuming you want to return 0 or handle this case differently.
    }
}

function updateTotals() {
    let totalQuantity = 0;
    let totalPrice = 0.0;

    // Assuming each item added to the quote is within a container with a specific class
    const items = document.querySelectorAll('.qs-line-item-row');
    items.forEach(item => {
        const quantity = parseInt(item.querySelector('[qs-value="quantity"]').textContent, 10);
        const price = parseFloat(item.querySelector('[qs-value="price"]').textContent.replace('$', ''));
        const freight = parseFloat(document.querySelector('[qs-value="freight"]').textContent.replace('$', ''));
        
        totalQuantity += quantity;
        totalPrice += price + freight;
    });

    // Update the total quantity and total price elements
    const totalElement = document.querySelector('[qs-value="total"]');
    const quantityTotalElement = document.querySelector('[qs-value="quantity-total"]');
    
    if (totalElement) {
        totalElement.textContent = `$${totalPrice.toFixed(2)}`;
    }
    
    if (quantityTotalElement) {
        quantityTotalElement.textContent = totalQuantity.toString();
    }
}

function clearFormAndResetSelections() {
    // Reset the form fields to their default state
    const formFields = ['product-line', 'mirror-style', 'light-direction', 'size', 'mirror-controls', 'accessories', 'quantity'];
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = ""; // Reset field value
        }
    });

    // Clear the currentSelections object
    Object.keys(currentSelections).forEach(key => {
        currentSelections[key] = "";
    });

    // Optionally, reset any UI elements or visibility states as needed
    // For example, hide the "add-another" button again
    document.getElementById('add-another').style.display = 'none';

    // Reset visibility and UI state as needed
    updateFieldVisibility();
    updateTotals();

    // If you have any additional UI reset logic, include it here
}

// Example implementations of the functions to gather data (you'll need to adjust these based on your actual data structure)
function getQuoteItems() {
    // Example: Fetching quote items from the DOM or state
    // Return an array of quote item objects
    return [...document.querySelectorAll('.qs-line-item-row')].map(item => {
        return {
            quantity: parseInt(item.querySelector('[qs-value="quantity"]').textContent, 10),
            product: item.querySelector('[qs-value="sku"]').textContent,
            total_price: parseFloat(item.querySelector('[qs-value="price"]').textContent.replace('$', ''))
        };
    });
}

function getFinalTotal() {
    // Example: Fetching final total from the DOM
    return parseFloat(document.querySelector('[qs-value="total"]').textContent.replace('$', ''));
}

function getTotalFreight() {
    // Example: Fetching total freight from the DOM
    return parseFloat(document.querySelector('[qs-value="freight"]').textContent.replace('$', ''));
}