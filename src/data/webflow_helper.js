const axios = require("axios").default;

function updateQuoteNumber(callback) {
    const options = {
        method: 'POST',
        url: 'https://cors-proxy1.p.rapidapi.com/v1',
        headers: {
            'content-type': 'application/json',
            'x-rapidapi-host': 'cors-proxy1.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY
        },
        data: {
            url: 'https://api.webflow.com/collections/6638674cd97c361d51e81b7e/items',
            method: 'GET',
            headers: {
                'Authorization': process.env.WEBFLOW_API_TOKEN,
                'accept-version': '1.0.0'
            }
        }
    };

    fetch('https://cors-proxy1.p.rapidapi.com/v1', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.items && data.items.length > 0) {
                const latestItem = data.items[0];
                const currentQuoteNumber = latestItem['quote-number'];
                const newQuoteNumber = currentQuoteNumber + 1;

                // Update the quoteNumber variable
                document.getElementById('quote-number').value = newQuoteNumber;

                // Optionally, update the item in the collection if needed
                // This part would require a PATCH request to update the item in Webflow

                // Callback with no error
                callback(null, newQuoteNumber);
            } else {
                // Callback with error message if no items found
                callback('No items found in the collection');
            }
        })
        .catch(error => {
            console.error('Failed to update quote number:', error);
            // Callback with error
            callback(error);
        });
}

// Example usage
updateQuoteNumber((err, newQuoteNumber) => {
    if (err) {
        console.error('Error updating quote number:', err);
    } else {
        console.log('Quote number updated to:', newQuoteNumber);
    }
});

export { updateQuoteNumber };
