const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

async function uploadFileAndGetShareLink(file) {
    const url = 'https://content.dropboxapi.com/2/files/upload';
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
            "path": `/Matrix Mirrors/RFQs/${file.name}`,
            "mode": "add",
            "autorename": true,
            "mute": false,
            "strict_conflict": false
        })
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: file
        });

        if (!response.ok) throw new Error('Failed to upload file.');

        const data = await response.json();
        const shareLinkResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "path": data.path_lower,
                "settings": {
                    "requested_visibility": "public"
                }
            })
        });

        if (!shareLinkResponse.ok) throw new Error('Failed to create share link.');

        const shareLinkData = await shareLinkResponse.json();
        // relace 'dl=0' with 'raw=1' to get the direct download link
        return shareLinkData.url.replace('dl=0', 'raw=1');
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export { uploadFileAndGetShareLink };
