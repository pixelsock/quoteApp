import jsonData from './data/output.json';
import { generatePDF } from './generatePDF.js';
// for testing purposes if a user clicks on an item with data-w-id="3c2f2722-e3c7-6f05-8576-623a08bbaedd" it will select the first item in every dropdown and add a quantity of 1
document.addEventListener('click', function(event) {
    if (event.target.getAttribute('data-w-id') === '3c2f2722-e3c7-6f05-8576-623a08bbaedd') {
        const formFields = fieldOrder;
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = field.options[1].value;
                field.setAttribute('data-auto-selected', 'true');
                currentSelections[fieldId] = field.options[1].value;
                field.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            }
        });
        document.getElementById('quantity').value = '1';
        addFilteredItemToQuote();
    }
}
);


let currentSelections = {
    'product-line': "",
    'frame-color': "",
    'mirror-controls': "",
    'mirror-style': "",
    'light-direction': "",
    'size': "",
    'mounting-orientation': "",
    'color-temperature': "",
    'light-output': "",
    'dimming': "",
    'accessories': ""

};

let jsondata = jsonData;

function generateSKU(currentSelections) {
    const skuOrder = [
        'mirror-style', 'light-direction', 'size', 
        'light-output', 'color-temperature', 'dimming', 'mounting-orientation', 
        'accessories', 'frame-color'
    ];

    const skuParts = skuOrder.map(field => {
        let value = currentSelections[field];

        // Special handling for 'size' to format as "nnnn"
        if (field === 'size' && value) {
            value = value.replace(/"/g, '').replace('x', ''); // Remove all inches symbols and 'x'
        }
        // Extract SKU code from the description
        else if (value) {
            const match = value.match(/\(([^)]+)\)/); // Matches anything between parentheses
            if (match) {
                value = match[1]; // Extract the SKU code
            }
        }
        // Exclude 'frame-color' if it's "N/A"
        if (field === 'frame-color' && value === "N/A") {
            return '';
        }
        return value || '';
    });

    // Join the parts to form the SKU, filtering out any empty values
    const sku = skuParts.filter(part => part !== '').join('-');
    return sku;
}

function generateProductDescription(currentSelections) {
    const productLine = currentSelections['product-line'].trim();
    const mirrorStyle = currentSelections['mirror-style'].replace(/\([^)]*\)/g, '').trim();
    const lightDirection = currentSelections['light-direction'].replace(/\([^)]*\)/g, '').trim();
    const accessories = currentSelections['accessories'].replace(/\([^)]*\)/g, '').trim();
    const description = `${productLine} ${mirrorStyle} ${lightDirection} With ${accessories}`;
    return description;
}

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
const fields = {
    'product-line': "Product Line",
    'frame-color': "Frame Color",
    'mirror-controls': "Mirror Controls",
    'mirror-style': "Mirror Style",
    'light-direction': "Light Direction",
    'size': "Size",
    'mounting-orientation': "Mounting Orientation",
    'color-temperature': "Color Temperature",
    'light-output': "Light Output",
    'dimming': "Dimming",
    'accessories': "Accessories",
};

function populateFormFields(jsonData) {
    Object.entries(fields).forEach(([fieldId, jsonKey]) => {
        const selectElement = document.getElementById(fieldId);
        let options = jsonData.map(item => item[jsonKey]);

        // Flatten the array if the options are arrays and remove duplicates
        options = options.flat();
        options = [...new Set(options)]; // Remove duplicates

        // Check if all options are "N/A" after deduplication
        if (options.length === 1 && options[0] === "N/A") {
            const wrapperElement = document.getElementById(`${fieldId}-wrapper`);
            if (wrapperElement) {
                wrapperElement.style.display = 'none';
            }
            return; // Skip further processing for this field
        }

        // Ensure the wrapper is visible (in case it was previously hidden)
        const wrapperElement = document.getElementById(`${fieldId}-wrapper`);
        if (wrapperElement) {
            wrapperElement.style.display = '';
        }

        populateSelectField(selectElement, options);
    });
}

// Define the order of fields
const fieldOrder = Object.keys(fields);

console.log('Field order:', fieldOrder);

let lastUserInteractedFieldId = null;

function setupFieldInteractions() {
    const formFields = fieldOrder; // Assuming this is your ordered list of field IDs
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', () => {
                lastUserInteractedFieldId = fieldId;
                // Any other logic you need to run on field change
            });
        }
    });
}

// Call this function once to set up the interactions
setupFieldInteractions();

function goBackAndResetField() {
    if (lastUserInteractedFieldId) {
        const currentIndex = fieldOrder.indexOf(lastUserInteractedFieldId);

        // If going back to the very first field, perform a bulk reset for efficiency
        if (currentIndex === 0) {
            clearFormAndResetSelections();
        } else {
            // Reset only the auto-selected fields that come after the last interacted field
            for (let i = currentIndex + 1; i < fieldOrder.length; i++) {
                const fieldId = fieldOrder[i];
                const field = document.getElementById(fieldId);
                if (field.getAttribute('data-auto-selected') === 'true') {
                    resetField(fieldId);
                }
            }
            // Ensure the last interacted field itself is also reset if needed
            resetField(lastUserInteractedFieldId);
        }

        // Update the last interacted field tracker
        lastUserInteractedFieldId = currentIndex > 0 ? fieldOrder[currentIndex - 1] : null;
    }
}

function resetField(fieldId) {
    const fieldToReset = document.getElementById(fieldId);
    if (fieldToReset) {
        fieldToReset.value = "";
        fieldToReset.removeAttribute('data-auto-selected');
        currentSelections[fieldId] = "";
        // Trigger change event to update dependent fields/UI dynamically
        fieldToReset.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
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
        if (allFieldsHidden) {
            console.log("All fields before 'quantity' are hidden. Current selections:", currentSelections);
            console.log('Generated SKU:', generateSKU(currentSelections));
        }
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
    const formFields = fieldOrder;

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
                    // Adjust filtering for fields with array values
                    filteredData = filteredData.filter(item => {
                        const value = item[key];
                        if (Array.isArray(value)) {
                            return value.includes(selectedValue);
                        }
                        return value === selectedValue;
                    });
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
    formFields.forEach(fieldId => {
        const selectElement = document.getElementById(fieldId);
        const key = fields[fieldId]; // Assuming 'fields' maps fieldId to JSON key
        let options = [];

        // Aggregate options from filteredData
        filteredData.forEach(item => {
            const value = item[key];
            if (Array.isArray(value)) {
                // If the value is an array, add its elements to options
                options = options.concat(value);
            } else {
                // If it's not an array, just add the value
                options.push(value);
            }
        });

        // Deduplicate options
        options = [...new Set(options)];
        // console log frame color options
        if (fieldId === 'frame-color') {
            console.log('Frame color options:', options.length, options);
        }
        // Check if all options are "N/A" after deduplication
        if (options.length === 1) {
            // wait for the select element to be available
            selectElement.value = options[0];
         
            
        } else {
            const wrapperElement = document.getElementById(`${fieldId}-wrapper`);
            if (wrapperElement) {
                wrapperElement.style.display = '';
            }
        }

        populateSelectField(selectElement, options, true);
    });
}

function attachRemoveButtonListeners() {
    const removeButtons = document.querySelectorAll('[qs-value="remove"]');
    removeButtons.forEach(button => {
        button.removeEventListener('click', handleRemoveItemClick); // Prevent multiple bindings
        button.addEventListener('click', handleRemoveItemClick);
    });
}

function handleRemoveItemClick(event) {
    // Assuming each item is contained in a parent element, like a div or li
    const itemElement = event.target.closest('.qs-line-item-row');
    if (itemElement) {
        console.log('Removing item:', itemElement);
        itemElement.remove(); // Remove the item from the DOM
        updateTotals(); // Update the totals after removing the item
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Attach a single event listener to the parent container
    const lineItemContainer = document.getElementById('line-item-container');
    if (lineItemContainer) {
        lineItemContainer.addEventListener('click', function(event) {
            // Check if the clicked element or its parent has qs-value="remove"
            const removeButton = event.target.closest('[qs-value="remove"]');
            if (removeButton) {
                handleRemoveItemClick(event);
            }
        });
    }
    await populateFormFields(jsonData);
    attachRemoveButtonListeners();
    setupDynamicFiltering(jsonData);
    updateFieldVisibility();
    document.getElementById('go-back').style.display = 'none'; // Initially hide the "go-back" button
    document.getElementById('go-back').addEventListener('click', goBackAndResetField);

    // Initially hide the "add-another" button
    const addAnotherButton = document.getElementById('add-another');
    addAnotherButton.style.display = 'none';
    const generateQuoteButton = document.getElementById('generate-quote');
    generateQuoteButton.style.display = 'none'; // Initially hide the "generate-quote" button

    // Show the "add-another" button when the quantity field is updated
    document.getElementById('quantity').addEventListener('change', function() {
        if (this.value) {
            addAnotherButton.style.display = ''; // Show the button
            
        } else {
            addAnotherButton.style.display = 'none'; // Hide the button if quantity is empty
            
        }
    });

    // Add event listener for the "add-another" button
    addAnotherButton.addEventListener('click', function() {
        addFilteredItemToQuote();
        generateQuoteButton.style.display = ''; // Show the "generate-quote" button after adding an item
    
    });

   
    
    if (generateQuoteButton) {
        generateQuoteButton.addEventListener('click', () => {
            const quoteItems = getQuoteItems(); // This should return an array of objects with sku and total_price
            const finalTotal = getFinalTotal(); // This should return the final total as a number
            const totalFreight = getTotalFreight(); // This should return the total freight as a number
            const quoteNumber = '12345'; // Replace with the actual quote number

            // Call the generatePDF function with the gathered data
            generatePDF(quoteItems, finalTotal, totalFreight, quoteNumber);
        });
    }
});

function addFilteredItemToQuote() {
    const description = generateProductDescription(currentSelections);

    const quantityField = document.getElementById('quantity');
    const quantity = quantityField.value;
    if (quantity <= 0) {
        alert('Please specify a quantity.');
        return;
    }
    const mirrorSize = parseInt(currentSelections['size'], 10);

    // Get the SKU and calculate the total price based on the quantity
    const currentSelection = filteredData[0];
    const sku = generateSKU(currentSelections);
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
    const freightItemElement = clone.querySelector('[qs-value="item-freight"]');
    if (freightItemElement) {
        freightItemElement.textContent = `$${freightCharge}`;
    }
    const descriptionElement = clone.querySelector('[qs-value="description"]');
    if (descriptionElement) {
        descriptionElement.textContent = description;
    }
    // Update the freight total which is the sum of all freight item Elements
    let freightTotal = 0;
    const freightItems = document.querySelectorAll('[qs-value="item-freight"]');
    freightItems.forEach(item => {
        freightTotal += parseFloat(item.textContent.replace('$', ''));
    });
    freightElement.textContent = `$${freightTotal}`;
    console.log('New freight total:', freightTotal);
    if (skuElement && quantityElement && priceElement) {
        skuElement.textContent = sku;
        quantityElement.textContent = quantity;
        priceElement.textContent = `$${totalPrice}`;
        document.getElementById('line-item-container').appendChild(clone);
        // Need to create this function
        clearFormAndResetSelections();
    } else {
        console.error('One or more elements could not be found in the template.');
    }

    updateTotals();
  
}

function clearFormAndResetSelections() {
    // Reset each select field in the form to its default state
   
    populateFormFields(jsonData);

    // Reset the internal object tracking the current selections
    for (const key in currentSelections) {
        if (currentSelections.hasOwnProperty(key)) {
            currentSelections[key] = "";
        }
    }

    // Optionally, you could also reset any visual feedback or additional UI elements that are affected by the selections.
    // For example, hiding the 'generate-quote' button again or clearing any displayed error messages.
    const generateQuoteButton = document.getElementById('generate-quote');
    if (generateQuoteButton) {
        generateQuoteButton.style.display = 'none'; // Assuming you want to hide it again after adding an item
    }

    // Reset the quantity field separately if necessary
    const quantityField = document.getElementById('quantity');
    if (quantityField) {
        quantityField.value = ''; // Clear any existing value
    }

    // Since the script includes dynamic updating of field visibility, call updateFieldVisibility() to ensure the UI is updated accordingly
    updateFieldVisibility();

    // Call any additional functions needed to reset the state of the form or update the UI
}

// Then, this function should be called after a new quote item is added.
// It's already correctly placed in the addFilteredItemToQuote function.


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
    let totalFreight = 0.0;

    // Assuming each item added to the quote is within a container with a specific class
    const items = document.querySelectorAll('.qs-line-item-row');
    items.forEach(item => {
        const quantity = parseInt(item.querySelector('[qs-value="quantity"]').textContent, 10);
        const price = parseFloat(item.querySelector('[qs-value="price"]').textContent.replace('$', ''));
        totalQuantity += quantity;
        totalPrice += price; // Only add the price here, freight is handled separately
    });

    // Calculate and update total freight
    const freightElements = document.querySelectorAll('[qs-value="item-freight"]');
    freightElements.forEach(element => {
        const freightValue = parseFloat(element.textContent.replace('$', '')) || 0;
        totalFreight += freightValue;
    });

    const totalFreightElement = document.querySelector('[qs-value="freight"]');
    if (totalFreightElement) {
        totalFreightElement.textContent = `$${totalFreight.toFixed(2)}`;
    }

    // Update the total quantity, total price, and total freight elements
    const totalElement = document.querySelector('[qs-value="total"]');
    const quantityTotalElement = document.querySelector('[qs-value="quantity-total"]');
    const freightTotalElement = document.querySelector('[qs-value="freight-total"]'); // Assuming there's an element for freight total
    
    if (totalElement) {
        totalElement.textContent = `$${(totalPrice + totalFreight).toFixed(2)}`; // Include freight in the total price displayed
    }
    
    if (quantityTotalElement) {
        quantityTotalElement.textContent = totalQuantity.toString();
    }

    if (freightTotalElement) {
        freightTotalElement.textContent = `$${totalFreight.toFixed(2)}`; // Display the total freight separately
    }
}



// Example implementations of the functions to gather data (you'll need to adjust these based on your actual data structure)
function getQuoteItems() {
    // Example: Fetching quote items from the DOM or state
    // Return an array of quote item objects
    return [...document.querySelectorAll('.qs-line-item-row')].map(item => {
        return {
            quantity: parseInt(item.querySelector('[qs-value="quantity"]').textContent, 10),
            product: item.querySelector('[qs-value="sku"]').textContent,
            description: item.querySelector('[qs-value="description"]').textContent,
            freight: parseFloat(item.querySelector('[qs-value="item-freight"]').textContent.replace('$', '')),
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
