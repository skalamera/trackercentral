async createTicket(formData) {
    try {
        const loadingOverlay = document.getElementById('loadingOverlay');

        // Get the formatted subject from the form
        const formattedSubjectField = document.getElementById('formattedSubject');
        let subject = formattedSubjectField ? formattedSubjectField.value : formData.subject;

        // If no formatted subject, fall back to regular subject
        if (!subject) {
            subject = formData.subject || `${this.config.title} - ${new Date().toLocaleDateString()}`;
        }

        // Parse and validate related tickets
        let relatedTicketIds = [];
        if (formData.relatedTickets) {
            relatedTicketIds = formData.relatedTickets.split(',')
                .map(id => id.trim())
                .filter(id => id !== '')
                .map(id => parseInt(id, 10))
                .filter(id => !isNaN(id));
        }

        // ADDED LOGGING: Check that we have valid related tickets
        console.log("Related tickets to be associated:", relatedTicketIds);
        if (relatedTicketIds.length === 0) {
            console.warn("No valid related tickets found");
        }

        // Get source ticket data from the first related ticket
        let sourceTicketData = null;
        if (relatedTicketIds.length > 0) {
            try {
                const sourceTicketId = relatedTicketIds[0];
                console.log("Fetching source ticket data for ID:", sourceTicketId);
                const response = await this.client.request.invokeTemplate("getTicketDetails", {
                    context: { ticketId: sourceTicketId }
                });
                sourceTicketData = JSON.parse(response.response);
                console.log("Retrieved source ticket data:", sourceTicketData);
            } catch (error) {
                console.error("Error getting source ticket data:", error);
                // Log the detailed error
                console.error("Error details:", {
                    message: error.message,
                    stack: error.stack,
                    response: error.response ? JSON.stringify(error.response) : 'No response data'
                });
            }
        }

        // Generate description BEFORE creating ticketData
        const description = this.generateDescription();
        document.getElementById('description').value = description;
        console.log("Generated description length:", description.length);

        // Create a very basic ticket data object with only core fields
        const basicTicketData = {
            email: formData.email,
            subject: subject,
            description: description,
            status: parseInt(formData.status || 2),
            priority: parseInt(formData.priority || 2),
            source: 101,
            type: "Incident"
        };

        // ADDED LOGGING: Log email and subject
        console.log("Creating ticket with:", {
            email: basicTicketData.email,
            subject: basicTicketData.subject,
            status: basicTicketData.status,
            priority: basicTicketData.priority
        });

        // Add related tickets if available
        if (relatedTicketIds.length > 0) {
            basicTicketData.related_ticket_ids = relatedTicketIds;
        }

        // Add group ID if available
        if (formData.groupField) {
            let groupId = parseInt(formData.groupField);
            if (!isNaN(groupId)) {
                basicTicketData.group_id = groupId;
                console.log("Setting group_id:", groupId);
            } else {
                console.warn("Invalid group ID (non-numeric):", formData.groupField);
            }
        }

        // Add agent ID if available
        if (formData.agentField) {
            let agentId = parseInt(formData.agentField);
            if (!isNaN(agentId)) {
                basicTicketData.responder_id = agentId;
                console.log("Setting responder_id:", agentId);
            } else {
                console.warn("Invalid agent ID (non-numeric):", formData.agentField);
            }
        }

        // Add tags
        basicTicketData.tags = [`tracker-${this.trackerType}`];
        console.log("Setting tags:", basicTicketData.tags);

        // Add custom fields if we have them in the source ticket
        if (sourceTicketData && sourceTicketData.custom_fields) {
            basicTicketData.custom_fields = {};

            // Copy specific custom fields from source ticket
            const customFieldsToPreserve = [
                'cf_account_manager',
                'cf_rvp',
                'cf_categorization',
                'cf_subcategory',
                'cf_issue_detail',
                'cf_product_type',
                'cf_product',
                'cf_product_subsection',
                'cf_vip'
            ];

            customFieldsToPreserve.forEach(field => {
                if (sourceTicketData.custom_fields[field] !== undefined) {
                    basicTicketData.custom_fields[field] = sourceTicketData.custom_fields[field];
                    console.log(`Copied custom field ${field} from source ticket:`, basicTicketData.custom_fields[field]);
                }
            });

            // Add district field if available
            if (formData.districtField) {
                basicTicketData.custom_fields.cf_district509811 = String(formData.districtField);
                console.log("Setting district field:", formData.districtField);
            }
            else if (formData.districtName) {
                basicTicketData.custom_fields.cf_district509811 = String(formData.districtName);
                console.log("Setting district field from districtName:", formData.districtName);
            }

            // Add district state if available
            if (formData.districtStateName) {
                console.log("Setting district state:", formData.districtStateName);
                // No direct field for district state, this will be in the description
            }
        } else {
            console.warn("No custom fields found in source ticket, creating empty custom_fields object");
            basicTicketData.custom_fields = {};

            // Still try to set district field
            if (formData.districtField) {
                basicTicketData.custom_fields.cf_district509811 = String(formData.districtField);
                console.log("Setting district field without source ticket:", formData.districtField);
            }
            else if (formData.districtName) {
                basicTicketData.custom_fields.cf_district509811 = String(formData.districtName);
                console.log("Setting district field from districtName without source ticket:", formData.districtName);
            }
        }

        // Log the basic ticket data
        console.log('Basic ticket data to send:', JSON.stringify(basicTicketData, null, 2));

        // ADDED: Check for required fields
        if (!basicTicketData.email) {
            console.error("Missing required email field");
            throw new Error("Requester email is required to create a ticket");
        }

        if (!basicTicketData.subject) {
            console.error("Missing required subject field");
            throw new Error("Subject is required to create a ticket");
        }

        if (!basicTicketData.description) {
            console.error("Missing required description field");
            throw new Error("Description is required to create a ticket");
        }

        try {
            console.log("Calling createfdTicket template to create ticket");
            const response = await this.client.request.invokeTemplate("createfdTicket", {
                body: JSON.stringify(basicTicketData)
            });

            console.log('Ticket created successfully, raw response:', response.response);
            const responseData = JSON.parse(response.response);
            console.log('Parsed ticket data:', responseData);

            this.handleTicketCreationSuccess(responseData);
        } catch (apiError) {
            console.error('API Error creating ticket:', apiError);

            // Detailed error logging
            let errorDetails = "Unknown error";
            try {
                if (apiError.response) {
                    console.error("API response error:", apiError.response);
                    const errorResponse = JSON.parse(apiError.response);
                    console.error('Detailed API error response:', errorResponse);

                    if (errorResponse.errors && errorResponse.errors.length > 0) {
                        // Log each error in the response
                        errorResponse.errors.forEach((err, index) => {
                            console.error(`API Error ${index + 1}:`, err);
                        });

                        // Try to extract the invalid field name
                        const invalidFieldError = errorResponse.errors.find(err => err.code === 'invalid_field');
                        if (invalidFieldError && invalidFieldError.field) {
                            errorDetails = `Invalid field: ${invalidFieldError.field}`;
                        } else if (errorResponse.description) {
                            errorDetails = errorResponse.description;
                        }
                    }
                } else if (apiError.message) {
                    errorDetails = apiError.message;
                }
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
                errorDetails = "Error parsing API response";
            }

            throw new Error('Failed to create ticket: ' + errorDetails);
        }
    } catch (error) {
        console.error('Error creating ticket:', error);
        console.error('Error stack:', error.stack);

        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }

        this.showError('Failed to create ticket: ' + (error.message || 'Unknown error'));
    }
} 