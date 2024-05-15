import fetch from 'node-fetch';

// Assuming you have these stored securely and can retrieve them
let accessToken = 'sl.B02O6z7KBCXaVp-DMvcKpRP32Uv8yC9i5gHTMrWDaz0AsFEMN79IZJkT9Lgwa9-Z-7SIZofxgokLVk46-kej7sGuLPk04l9BPuiPPQXHezwTElHF84Ph55obFin6lQRYGfhwm9_XGuWG2G1JeLtp-zE';
const refreshToken = '7Hj2peBHnUoAAAAAAAAAAR8EEHRGSFb1DQ4UNNf1IdpicYdt_pNE-YNLmgfLBbgU';
const clientId = 'fqpoksb8sfws71p';
const clientSecret = 'ne3yd3q9bn3cvco';


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
    body: body
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token.');
  }

  const data = await response.json();
  accessToken = data.access_token; // Update the access token
}

async function uploadFileAndGetShareLink(file) {
  const uploadUrl = `${dropboxContentDomain}/2/files/upload`;
  const shareUrl = `${dropboxApiDomain}/2/sharing/create_shared_link_with_settings`;

  try {
    // Always refresh the access token first
    await refreshAccessToken();

    const uploadHeaders = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/octet-stream",
      "Dropbox-API-Arg": JSON.stringify({
        "path": `/Matrix Mirrors/RFQs/${file.name}`,
        "mode": "add",
        "autorename": true,
        "mute": false
      })
    };

    // Attempt to upload the file
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
      "Authorization": `Bearer ${accessToken}`,
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

