const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;
let dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;

const dropboxApiDomain = 'https://api.dropboxapi.com';
const dropboxContentDomain = 'https://content.dropboxapi.com';

console.log('Environment variables:');
console.log('DROPBOX_ACCESS_TOKEN:', dropboxToken ? '[SET]' : '[NOT SET]');
console.log('CLIENT_ID:', clientId || '[NOT SET]');
console.log('CLIENT_SECRET:', clientSecret ? '[SET]' : '[NOT SET]');
console.log('REFRESH_TOKEN:', refreshToken ? '[SET]' : '[NOT SET]');

async function refreshAccessToken() {
    const url = 'https://api.dropboxapi.com/oauth2/token';
    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
    });

    console.log('Refreshing access token...');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json();
        dropboxToken = data.access_token;
        console.log('Access token refreshed successfully');
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        throw error;
    }
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
            const errorText = await uploadResponse.text();
            throw new Error(`Failed to upload file. Status: ${uploadResponse.status}, Body: ${errorText}`);
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
            const errorText = await shareLinkResponse.text();
            throw new Error(`Failed to create share link. Status: ${shareLinkResponse.status}, Body: ${errorText}`);
        }

        const shareLinkData = await shareLinkResponse.json();
        return shareLinkData.url;
    } catch (error) {
        console.error('Error in uploadFileAndGetShareLink:', error);
        throw error;
    }
}

function uploadPDFToDropbox(pdfBlob, fileName) {
  return new Promise((resolve, reject) => {
    // ... existing Dropbox upload logic ...
  }).catch((error) => {
    console.error("Error uploading PDF to Dropbox:", error);
    reject(error);
    // Remove the following line if 'm' is not defined in this scope
    // m && m(error);
  });
}

export { uploadFileAndGetShareLink };
