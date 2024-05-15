// src/dropbox.js
import dotenv from 'dotenv';
dotenv.config();

import { Buffer } from 'buffer';

let dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;

const dropboxApiDomain = 'https://api.dropboxapi.com';
const dropboxContentDomain = 'https://content.dropboxapi.com';

async function refreshAccessToken() {
    const url = `${dropboxApiDomain}/oauth2/token`;
    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
    });

    const data = await response.json(); // Get response data for more detailed error info
    if (!response.ok) {
        console.error('Failed to refresh access token:', data);
        throw new Error('Failed to refresh access token.');
    }

    dropboxToken = data.access_token;
}

async function uploadFileAndGetShareLink(file) {
    const uploadUrl = `${dropboxContentDomain}/2/files/upload`;
    const shareUrl = `${dropboxApiDomain}/2/sharing/create_shared_link_with_settings`;

    try {
        await refreshAccessToken();

        const uploadHeaders = {
            "Authorization": `Bearer ${dropboxToken}`,
            "Content-Type": "application/octet-stream",
            "Dropbox-API-Arg": JSON.stringify({
                "path": `/Matrix Mirrors/RFQs/${file.name}`,
                "mode": "add",
                "autorename": true,
                "mute": false
            })
        };

        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: uploadHeaders,
            body: file
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload file.');
        }

        const uploadData = await uploadResponse.json();

        const shareHeaders = {
            "Authorization": `Bearer ${dropboxToken}`,
            "Content-Type": "application/json"
        };

        const shareBody = JSON.stringify({
            "path": uploadData.path_lower,
            "settings": {
                "requested_visibility": "public"
            }
        });

        const shareLinkResponse = await fetch(shareUrl, {
            method: 'POST',
            headers: shareHeaders,
            body: shareBody
        });

        if (!shareLinkResponse.ok) {
            throw new Error('Failed to create share link.');
        }

        const shareLinkData = await shareLinkResponse.json();
        return shareLinkData.url;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export { uploadFileAndGetShareLink };
