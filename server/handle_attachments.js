/**
 * Server component to handle file uploads for Freshdesk tickets
 * Based on Freshdesk API documentation for adding a note with attachment
 */

exports = {
    /**
     * Upload an attachment as a note to a ticket
     * @param {object} args - Arguments containing file information and ticket ID
     */
    uploadAttachment: async function (args) {
        console.log("Processing attachment upload request");

        try {
            // Extract the data from the request
            const { ticketId, noteBody, isPrivate, fileContent, fileName, fileType } = args.data;

            if (!ticketId || !fileContent || !fileName) {
                console.error("Missing required fields for attachment upload");
                return {
                    status: 400,
                    body: { error: "Missing required fields: ticketId, fileContent, or fileName" }
                };
            }

            console.log(`Preparing to upload file ${fileName} to ticket #${ticketId}`);

            // Get installation parameters
            const iparams = await $request.getIparams();
            if (!iparams || !iparams.freshdesk_subdomain || !iparams.freshdesk_api_key) {
                console.error("Missing required installation parameters");
                return {
                    status: 500,
                    body: { error: "Missing installation parameters" }
                };
            }

            // Create boundary for multipart/form-data
            const boundary = 'freshdesk-attachment-boundary';

            // Create the multipart form-data body manually
            let reqBody = '';

            // Add body field
            reqBody += `--${boundary}\r\n`;
            reqBody += 'Content-Disposition: form-data; name="body"\r\n\r\n';
            reqBody += noteBody || `Attachment: ${fileName}`;
            reqBody += `\r\n`;

            // Add private field
            reqBody += `--${boundary}\r\n`;
            reqBody += 'Content-Disposition: form-data; name="private"\r\n\r\n';
            reqBody += (isPrivate ? 'true' : 'false');
            reqBody += `\r\n`;

            // Add attachment field
            reqBody += `--${boundary}\r\n`;
            reqBody += `Content-Disposition: form-data; name="attachments[]"; filename="${fileName}"\r\n`;
            reqBody += `Content-Type: ${fileType || 'application/octet-stream'}\r\n\r\n`;

            // Convert base64 to binary for the file contents
            const binaryData = Buffer.from(fileContent, 'base64');
            reqBody += binaryData;
            reqBody += `\r\n`;

            // End boundary
            reqBody += `--${boundary}--`;

            // Construct auth header
            const authHeader = `Basic ${Buffer.from(iparams.freshdesk_api_key + ':X').toString('base64')}`;

            // Make the API request to create a note with attachment using raw request
            const response = await $request.request({
                method: 'POST',
                url: `https://${iparams.freshdesk_subdomain}.freshdesk.com/api/v2/tickets/${ticketId}/notes`,
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': `multipart/form-data; boundary=${boundary}`
                },
                body: reqBody,
                isEncodedBody: true  // Important to indicate we've already encoded the body
            });

            console.log("Attachment uploaded successfully");

            return {
                status: response.status,
                body: response.body
            };
        } catch (error) {
            console.error("Error uploading attachment:", error);
            return {
                status: 500,
                body: { error: error.message || "Unknown error during file upload" }
            };
        }
    }
};

/**
 * Convert base64 data URI to Blob
 * @param {string} dataURI - Base64 data URI
 * @param {string} mimeType - MIME type of the file
 * @returns {Blob} - Blob object
 */
function dataURItoBlob(dataURI, mimeType) {
    const byteString = atob(dataURI);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeType || 'application/octet-stream' });
}

/**
 * Get installation parameters
 * @returns {Promise} - Promise resolving to the installation parameters
 */
async function renderData() {
    try {
        return await $request.invokeTemplate("renderData", {});
    } catch (error) {
        console.error("Error getting installation parameters:", error);
        return null;
    }
}