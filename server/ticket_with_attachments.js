/**
 * Server component to handle ticket creation with attachments
 * This bypasses CORS limitations by running server-side
 */

exports = {
    /**
     * Creates a ticket with attachments
     * 
     * @param {object} args - Arguments from the client
     * @returns {object} - Response with status and data
     */
    uploadTicketWithAttachments: async function (args) {
        const { iparams } = args;

        try {
            // Sanitize subdomain - ensure it doesn't contain .freshdesk.com
            const sanitizedSubdomain = iparams.freshdesk_subdomain.replace(/\.freshdesk\.com$/i, '');

            // Extract data from the request
            const ticketData = args.data.ticket;
            const attachments = args.data.attachments || [];

            if (!ticketData) {
                return {
                    status: 400,
                    data: { error: "Missing required parameter (ticketData)" }
                };
            }

            console.log(`Creating ticket with ${attachments.length} attachments`);

            // Freshdesk API requires multipart/form-data for attachments
            // We'll use the request library with formData
            const options = {
                method: 'POST',
                url: `https://${sanitizedSubdomain}.freshdesk.com/api/v2/tickets`,
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${iparams.freshdesk_api_key}:X`).toString('base64')
                },
                formData: {}
            };

            // Add ticket data to form
            Object.keys(ticketData).forEach(key => {
                if (key === 'custom_fields') {
                    // Handle custom_fields differently as it's an object
                    Object.keys(ticketData.custom_fields).forEach(cfKey => {
                        options.formData[`custom_fields[${cfKey}]`] = ticketData.custom_fields[cfKey];
                    });
                } else {
                    options.formData[key] = ticketData[key];
                }
            });

            // Add attachments if any
            if (attachments && attachments.length > 0) {
                options.formData['attachments[]'] = attachments.map(attachment => {
                    return {
                        value: Buffer.from(attachment.content, 'base64'),
                        options: {
                            filename: attachment.name,
                            contentType: attachment.contentType
                        }
                    };
                });
            }

            // Make the API request
            const request = require('request');

            return new Promise((resolve, reject) => {
                request(options, function (error, response, body) {
                    if (error) {
                        console.error('Error in uploadTicketWithAttachments:', error);
                        reject({
                            status: 500,
                            data: { error: error.message }
                        });
                    } else {
                        try {
                            const responseData = JSON.parse(body);

                            if (response.statusCode >= 400) {
                                reject({
                                    status: response.statusCode,
                                    data: responseData
                                });
                            } else {
                                resolve({
                                    status: response.statusCode,
                                    data: responseData
                                });
                            }
                        } catch (parseError) {
                            console.error('Error parsing response:', parseError);
                            resolve({
                                status: response.statusCode,
                                data: { message: body }
                            });
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Unexpected error in uploadTicketWithAttachments:', error);
            return {
                status: 500,
                data: { error: error.message || 'Unknown server error' }
            };
        }
    }
}; 