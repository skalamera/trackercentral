/**
 * Server component to handle file uploads for Freshdesk tickets
 * This bypasses CORS limitations by running server-side
 */

exports = {
    /**
     * Adds a note with attachment to a Freshdesk ticket
     * 
     * @param {object} args - Arguments from the client
     * @returns {object} - Response with status and data
     */
    uploadAttachment: async function (args) {
        const { iparams } = args;

        try {
            // Extract data from the request
            const ticketId = args.data.ticketId;
            const noteBody = args.data.noteBody || 'Attachment from tracker app';
            const isPrivate = args.data.isPrivate === false ? false : true;
            const base64Data = args.data.fileContent;
            const fileName = args.data.fileName || 'attachment.png';
            const fileType = args.data.fileType || 'image/png';

            if (!ticketId || !base64Data) {
                return {
                    status: 400,
                    body: { error: "Missing required parameters (ticketId or fileContent)" }
                };
            }

            console.log(`Adding attachment to ticket #${ticketId}: ${fileName} (${fileType})`);

            // Freshdesk API requires multipart/form-data for attachments
            // We'll use the request library with formData
            const options = {
                method: 'POST',
                url: `https://${iparams.freshdesk_subdomain}.freshdesk.com/api/v2/tickets/${ticketId}/notes`,
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${iparams.freshdesk_api_key}:X`).toString('base64')
                },
                formData: {
                    'body': noteBody,
                    'private': isPrivate.toString()
                }
            };

            // Add the attachment if provided
            if (base64Data) {
                // Convert base64 to Buffer
                const fileBuffer = Buffer.from(base64Data, 'base64');

                // Add file to the form data
                options.formData['attachments[]'] = {
                    value: fileBuffer,
                    options: {
                        filename: fileName,
                        contentType: fileType
                    }
                };
            }

            // Make the API request
            const request = require('request');

            return new Promise((resolve, reject) => {
                request(options, function (error, response, body) {
                    if (error) {
                        console.error('Error in uploadAttachment server component:', error);
                        reject({
                            status: 500,
                            body: { error: error.message }
                        });
                    } else {
                        try {
                            const responseData = JSON.parse(body);
                            resolve({
                                status: response.statusCode,
                                body: responseData
                            });
                        } catch (parseError) {
                            resolve({
                                status: response.statusCode,
                                body: { message: body }
                            });
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Unexpected error in uploadAttachment server component:', error);
            return {
                status: 500,
                body: { error: error.message || 'Unknown server error' }
            };
        }
    }
};