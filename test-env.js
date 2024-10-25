require('dotenv').config();
const fetch = require('node-fetch');

async function testDropboxConnection() {
    console.log('Environment Variable Test');
    console.log('-------------------------');
    console.log('DROPBOX_ACCESS_TOKEN:', process.env.DROPBOX_ACCESS_TOKEN ? '[SET]' : '[NOT SET]');
    console.log('CLIENT_ID:', process.env.CLIENT_ID || '[NOT SET]');
    console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET ? '[SET]' : '[NOT SET]');
    console.log('REFRESH_TOKEN:', process.env.REFRESH_TOKEN ? '[SET]' : '[NOT SET]');

    // Test refresh token flow
    const refreshUrl = 'https://api.dropboxapi.com/oauth2/token';
    const refreshBody = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.REFRESH_TOKEN,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
    });

    console.log('\nRefresh Token Request details:');
    console.log('URL:', refreshUrl);
    console.log('Client ID:', process.env.CLIENT_ID);
    console.log('Refresh Token:', process.env.REFRESH_TOKEN ? '[FIRST 5 CHARS]: ' + process.env.REFRESH_TOKEN.substr(0, 5) : '[NOT SET]');
    console.log('Access Token:', process.env.DROPBOX_ACCESS_TOKEN ? process.env.DROPBOX_ACCESS_TOKEN.substr(0, 5) + '...' : '[NOT SET]');

    try {
        const refreshResponse = await fetch(refreshUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: refreshBody
        });

        const refreshData = await refreshResponse.json();
        console.log('Refresh Token Response:', refreshResponse.status, refreshData);

        // Test direct API call with access token
        const apiUrl = 'https://api.dropboxapi.com/2/users/get_current_account';
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: 'null'  // Send 'null' as a string
        });

        if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            console.log('API Response:', apiResponse.status, apiData);
        } else {
            const errorText = await apiResponse.text();
            console.log('API Error Response:', apiResponse.status, errorText);
        }

    } catch (error) {
        console.error('Error testing Dropbox connection:', error.message);
    }
}

testDropboxConnection();
