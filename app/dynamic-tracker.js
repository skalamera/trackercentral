class TrackerApp {
    constructor(trackerType, config) {
        this.trackerType = trackerType;
        this.config = config;
        this.client = null;
        this.quillEditors = {};
        this.aggregatedScreenshotFiles = [];
        this.ticketData = {
            isVip: false,
            districtName: '',
            currentTicketId: null,
            requesterEmail: '',
            ticketRequesterEmail: ''
        };

        // Initialize event listeners
        this.initEventListeners();
    }

    async createTicket(formData) {
        // Get loading overlay element
        const loadingOverlay = document.getElementById('loadingOverlay');

        // Show loading overlay if it exists
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            loadingOverlay.querySelector('.spinner-text').textContent = "Creating ticket...";
        }

        try {
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

            // For SEDCUST template: If VIP is "Yes", set priority to 4 (Urgent)
            console.log(`Checking VIP priority override - trackerType: "${this.trackerType}", isVIP value: "${formData.isVIP}"`);

            // Additional debug for all form data fields
            if (this.trackerType === 'sedcust') {
                console.log('SEDCUST form data keys:', Object.keys(formData));
                console.log('SEDCUST priority before override:', basicTicketData.priority);
                console.log('SEDCUST isVIP field value:', formData.isVIP);
            }

            if (this.trackerType === 'sedcust' && formData.isVIP === 'Yes') {
                basicTicketData.priority = 4;
                console.log("SEDCUST VIP detected - setting priority to Urgent (4)");
            } else if (this.trackerType === 'sedcust') {
                console.log("SEDCUST but not VIP - keeping priority as is");
            }

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

                // Enhanced error logging for SEDCUST template
                if (this.trackerType === 'sedcust') {
                    console.error('SEDCUST: Enhanced error analysis starting...');

                    // Log the exact data being sent
                    console.error('SEDCUST: Basic ticket data sent to API:', JSON.stringify(basicTicketData, null, 2));

                    // Check if our validation function exists and run it
                    if (window.validateSedcustFields) {
                        const validation = window.validateSedcustFields();
                        if (!validation.isValid) {
                            console.error('SEDCUST: Client-side validation would have failed:', validation.errors);
                        } else {
                            console.error('SEDCUST: Client-side validation passed, but API validation failed');
                        }
                    }

                    // Log all form data for debugging
                    console.error('SEDCUST: Form data at time of error:', Object.keys(formData).map(key => `${key}: "${formData[key]}"`));
                }

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
                            } else {
                                // Create a more helpful error message
                                const errorMessages = errorResponse.errors.map(err => {
                                    if (err.field && err.message) {
                                        return `${err.field}: ${err.message}`;
                                    } else if (err.code && err.message) {
                                        return `${err.code}: ${err.message}`;
                                    } else {
                                        return JSON.stringify(err);
                                    }
                                });
                                errorDetails = `Validation errors: ${errorMessages.join(', ')}`;
                            }
                        }
                    } else if (apiError.message) {
                        errorDetails = apiError.message;
                    }
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                    errorDetails = "Error parsing API response";
                }

                // Add template-specific error guidance
                if (this.trackerType === 'sedcust') {
                    errorDetails += "\n\nFor SEDCUST template, please ensure all required fields are filled:\n- Xcode\n- Program Name\n- Resource\n- Path\n- Specific Issue\n- District Name\n- District State (unless District Name is 'Benchmark Education Company')\n- Related Tickets\n- Email";
                }

                throw new Error('Failed to create ticket: ' + errorDetails);
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
            console.error('Error stack:', error.stack);

            // Hide loading overlay if it exists
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }

            this.showError('Failed to create ticket: ' + (error.message || 'Unknown error'));
        }
    }

    // Required helper methods referenced by createTicket
    generateDescription() {
        // Get values from all form fields
        const formData = this.getFormData();

        // Use the description generator from the config
        let description = '';
        if (this.config.descriptionGenerator && typeof this.config.descriptionGenerator === 'function') {
            try {
                description = this.config.descriptionGenerator(formData);
                console.log("Successfully generated description using template's descriptionGenerator function");
            } catch (error) {
                console.error("Error using template's descriptionGenerator:", error);
                // Fallback to default description
                description = `<div>${formData.subject || 'No subject'}</div>`;
            }
        } else {
            // Default description generator for blank template
            description = `<div>${formData.subject || 'No subject'}</div>`;
        }

        return description;
    }

    getFormData() {
        // Get values from all form fields
        const formData = {};

        // Get values from Quill editors
        Object.keys(this.quillEditors).forEach(id => {
            const editor = this.quillEditors[id];
            const textareaElement = document.getElementById(id);
            if (textareaElement) {
                const content = editor.root.innerHTML;
                textareaElement.value = content;
                formData[id] = content;
            }
        });

        // Get values from regular form fields
        const formElements = document.getElementById('trackerForm').elements;
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            if (element.name && element.name !== '') {
                formData[element.name] = element.value;
            }
            // Also collect by ID if no name is set
            else if (element.id && element.id !== '' && !formData[element.id]) {
                formData[element.id] = element.value;
            }
        }

        // Add district dropdown field explicitly
        if (this.districtDropdownValue) {
            formData.districtDropdownValue = this.districtDropdownValue;
        } else if (formData.districtField) {
            // If districtDropdownValue is not available, use districtField
            formData.districtDropdownValue = formData.districtField;
        }

        return formData;
    }

    showError(message) {
        console.error(message);
        // Display error in UI
        if (typeof client !== 'undefined') {
            client.interface.trigger("showNotify", {
                type: "danger",
                message: message
            }).catch(err => console.error("Error showing notification:", err));
        } else {
            console.error('Error:', message);
        }
    }

    handleTicketCreationSuccess(ticketData) {
        console.log('Ticket created successfully:', ticketData);

        // Get loading overlay element
        const loadingOverlay = document.getElementById('loadingOverlay');

        // Hide loading overlay only after all operations (including attachments) are done
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex'; // Keep showing until attachments are processed
            loadingOverlay.querySelector('.spinner-text').textContent = "Processing attachments...";
        }

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Tracker ticket #${ticketData.id} created successfully!
        `;

        // Insert at the top of the form
        const form = document.getElementById('trackerForm');
        form.insertBefore(successMessage, form.firstChild);

        // Increment the daily tracker count
        try {
            if (window.incrementTrackerCount && typeof window.incrementTrackerCount === 'function') {
                window.incrementTrackerCount(this.trackerType);
                console.log(`Incremented tracker count for template: ${this.trackerType}`);
            } else {
                console.warn('incrementTrackerCount function not available');
            }
        } catch (error) {
            console.error('Error incrementing tracker count:', error);
        }

        // We'll use Promise.all to make sure we process all async operations
        const processingTasks = [];

        // Upload any attachments as a separate note
        const hasScreenshots = this.aggregatedScreenshotFiles && this.aggregatedScreenshotFiles.length > 0;
        // Check for HAR file in all SIM templates
        const hasHarFile = this.trackerType.startsWith('sim-') && this.harFile;

        if (hasScreenshots || hasHarFile) {
            processingTasks.push(this.addAttachmentsAsNote(ticketData.id));
        }

        // Wait for all processing to complete
        Promise.all(processingTasks)
            .then(() => {
                console.log('All post-creation tasks completed successfully');

                // Hide loading overlay
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                }

                // Disable submit button
                const submitButton = document.getElementById('createTracker');
                if (submitButton) {
                    submitButton.disabled = true;
                }

                // Show notification
                this.client.interface.trigger("showNotify", {
                    type: "success",
                    message: `Tracker ticket #${ticketData.id} created successfully!`
                }).catch(err => console.error("Error showing notification:", err));

                // Get the Freshdesk subdomain and automatically open the ticket in a new tab
                this.client.iparams.get("freshdesk_subdomain").then(iparams => {
                    const subdomain = iparams.freshdesk_subdomain.replace(/\.freshdesk\.com$/i, '');
                    const ticketUrl = `https://${subdomain}.freshdesk.com/a/tickets/${ticketData.id}`;

                    // Open in a new tab
                    window.open(ticketUrl, '_blank');

                    // Return to template selector after a short delay
                    setTimeout(() => {
                        window.location.href = 'template-selector.html';
                    }, 1500);
                }).catch((error) => {
                    console.error("Error getting subdomain:", error);
                    // Fallback to generic URL
                    window.open(`https://freshdesk.com/a/tickets/${ticketData.id}`, '_blank');

                    // Return to template selector after a short delay
                    setTimeout(() => {
                        window.location.href = 'template-selector.html';
                    }, 1500);
                });
            })
            .catch(error => {
                console.error('Error during post-creation tasks:', error);

                // Hide loading overlay
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                }

                // Show a more helpful error message
                this.showError('Ticket created, but there was an error uploading attachments. You may need to manually add files to the ticket.');

                // Still open the ticket
                this.client.iparams.get("freshdesk_subdomain").then(iparams => {
                    const subdomain = iparams.freshdesk_subdomain.replace(/\.freshdesk\.com$/i, '');
                    const ticketUrl = `https://${subdomain}.freshdesk.com/a/tickets/${ticketData.id}`;
                    window.open(ticketUrl, '_blank');

                    // Return to template selector after a short delay
                    setTimeout(() => {
                        window.location.href = 'template-selector.html';
                    }, 1500);
                }).catch(() => {
                    window.open(`https://freshdesk.com/a/tickets/${ticketData.id}`, '_blank');
                    setTimeout(() => window.location.href = 'template-selector.html', 1500);
                });
            });
    }

    updateFormattedSubject() {
        const xcodeValue = document.getElementById('xcode')?.value || '';
        const applicationValue = document.getElementById('application')?.value || '';
        const versionValue = document.getElementById('version')?.value || '';
        const specificIssueValue = document.getElementById('specificIssue')?.value || '';
        const gradesImpactedValue = document.getElementById('gradesImpacted')?.value || '';

        // Include version if selected (not empty)
        const versionPart = versionValue ? ` v${versionValue}` : '';

        const formattedSubject =
            `${xcodeValue} | ${applicationValue}${versionPart} | ${specificIssueValue} : ${gradesImpactedValue}`;

        const formattedSubjectField = document.getElementById('formattedSubject');
        if (formattedSubjectField) {
            formattedSubjectField.value = formattedSubject;

            // Also update the hidden subject field to ensure it's submitted correctly
            const subjectField = document.getElementById('subject');
            if (subjectField) {
                subjectField.value = formattedSubject;
            }
        }
    }

    updateSedcustSubject() {
        const xcodeValue = document.getElementById('xcode')?.value || '';
        const applicationValue = document.getElementById('application')?.value || '';
        const versionValue = document.getElementById('version')?.value || '';
        const stateNationalValue = document.getElementById('versionState')?.value || '';
        const resourcePathValue = document.getElementById('resourcePath')?.value || '';
        const specificIssueValue = document.getElementById('specificIssue')?.value || '';
        const isVIP = document.getElementById('isVIP')?.value || 'No';

        console.log('SEDCUST Subject Update - Field Values:', {
            xcode: xcodeValue,
            application: applicationValue,
            version: versionValue,
            stateNational: stateNationalValue,
            resourcePath: resourcePathValue,
            specificIssue: specificIssueValue,
            isVIP: isVIP
        });

        // Build the subject line dynamically, only including parts that have values
        const subjectParts = [];

        // First part: XCODE
        if (xcodeValue.trim()) {
            subjectParts.push(xcodeValue.trim());
        }

        // Second part: VIP or Standard
        const vipStatus = isVIP === 'Yes' ? 'VIP' : 'Standard';
        subjectParts.push(vipStatus);

        // Third part: Application • Version State/National
        let applicationPart = '';
        if (applicationValue.trim()) {
            applicationPart = applicationValue.trim();

            // Add version and state/national if they exist
            const versionParts = [];
            if (versionValue.trim()) {
                versionParts.push(versionValue.trim());
            }
            if (stateNationalValue.trim()) {
                versionParts.push(stateNationalValue.trim());
            }

            if (versionParts.length > 0) {
                applicationPart += ` • ${versionParts.join(' ')}`;
            }
        }
        if (applicationPart) {
            subjectParts.push(applicationPart);
        }

        // Fourth part: Resource Path - Specific Issue
        let resourceIssuePart = '';
        if (resourcePathValue.trim() && specificIssueValue.trim()) {
            resourceIssuePart = `${resourcePathValue.trim()} - ${specificIssueValue.trim()}`;
        } else if (resourcePathValue.trim()) {
            resourceIssuePart = resourcePathValue.trim();
        } else if (specificIssueValue.trim()) {
            resourceIssuePart = specificIssueValue.trim();
        }
        if (resourceIssuePart) {
            subjectParts.push(resourceIssuePart);
        }

        // Join all parts with " | " separator
        const formattedSubject = subjectParts.join(' | ');

        console.log('SEDCUST Subject Update - Generated Subject:', formattedSubject);

        const formattedSubjectField = document.getElementById('formattedSubject');
        if (formattedSubjectField) {
            formattedSubjectField.value = formattedSubject;

            // Also update the hidden subject field to ensure it's submitted correctly
            const subjectField = document.getElementById('subject');
            if (subjectField) {
                subjectField.value = formattedSubject;
            }
        }
    }

    formatUserRoles(selectedRoles) {
        if (!selectedRoles || selectedRoles.length === 0) {
            return '';
        }

        // Handle the special case of "All Users"
        if (selectedRoles.includes('allUsers')) {
            return 'All Users';
        }

        const roleMap = {
            'students': 'Students',
            'teachers': 'Teachers',
            'admin': 'Admin'
        };

        const formattedRoles = selectedRoles
            .filter(role => roleMap[role])
            .map(role => roleMap[role]);

        if (formattedRoles.length === 0) {
            return '';
        } else if (formattedRoles.length === 1) {
            return formattedRoles[0];
        } else if (formattedRoles.length === 2) {
            return `${formattedRoles[0]} and ${formattedRoles[1]}`;
        } else {
            const lastRole = formattedRoles.pop();
            return `${formattedRoles.join(', ')}, and ${lastRole}`;
        }
    }

    updateSimAssignmentSubject() {
        const isVipField = document.getElementById('isVIP');
        const districtNameField = document.getElementById('districtName');
        const districtStateField = document.getElementById('districtState');
        const applicationField = document.getElementById('application');
        const versionField = document.getElementById('version');
        const versionStateField = document.getElementById('versionState');
        const resourceField = document.getElementById('resource');
        const specificIssueField = document.getElementById('specificIssue');
        const formattedSubjectField = document.getElementById('formattedSubject');

        if (!isVipField || !districtNameField || !districtStateField || !applicationField ||
            !specificIssueField || !formattedSubjectField || !resourceField) {
            console.log("Missing required fields for subject formatting");
            return;
        }

        // Debug logging
        console.log("Updating SIM Assignment subject. Resource:", resourceField.value);

        // Get user roles
        const userRoleCheckboxes = document.querySelectorAll('input[name="userRole"]:checked');
        const selectedRoles = Array.from(userRoleCheckboxes).map(cb => cb.value);
        const formattedUserRole = this.formatUserRoles(selectedRoles);

        const isVip = isVipField.value === 'Yes';
        const districtName = districtNameField.value || '';
        const districtState = districtStateField.value || '';
        const application = applicationField.value || '';

        // Get version value (handle custom versions)
        let version = '';
        if (versionField.value === "Other" && versionField.hasAttribute('data-custom-value')) {
            version = versionField.getAttribute('data-custom-value');
        } else {
            version = versionField.value || '';
        }

        // Get version state value (handle custom version states)
        let versionState = '';
        if (versionStateField) {
            if (versionStateField.value === "Other" && versionStateField.hasAttribute('data-custom-value')) {
                versionState = versionStateField.getAttribute('data-custom-value');
            } else {
                versionState = versionStateField.value || '';
            }
        }

        // Get Resource value
        const resource = resourceField.value || '';
        const specificIssue = specificIssueField.value || '';

        console.log("Subject update values - Resource:", resource);

        // Build the subject line directly with explicit control over separators
        let formattedSubject = '';

        // First part: VIP or Standard District Name • District State
        let districtPart = '';
        if (districtName.trim() && districtState.trim()) {
            if (isVip) {
                districtPart = `VIP * ${districtName.trim()} • ${districtState.trim()}`;
            } else {
                districtPart = `${districtName.trim()} • ${districtState.trim()}`;
            }
        } else if (districtName.trim()) {
            if (isVip) {
                districtPart = `VIP * ${districtName.trim()}`;
            } else {
                districtPart = districtName.trim();
            }
        } else if (districtState.trim()) {
            if (isVip) {
                districtPart = `VIP * ${districtState.trim()}`;
            } else {
                districtPart = districtState.trim();
            }
        }
        if (districtPart) {
            formattedSubject = districtPart;
        }

        // Second part: Application Name • Version State/National
        let applicationPart = '';
        if (application.trim()) {
            applicationPart = application.trim();

            // Add version and state/national if they exist
            const versionParts = [];
            if (version.trim()) {
                versionParts.push(version.trim());
            }
            if (versionState.trim()) {
                versionParts.push(versionState.trim());
            }

            if (versionParts.length > 0) {
                applicationPart += ` • ${versionParts.join(' ')}`;
            }
        }
        if (applicationPart) {
            if (formattedSubject) {
                formattedSubject += ' | ' + applicationPart;
            } else {
                formattedSubject = applicationPart;
            }
        }

        // Third part: Resource and specific issue with custom separator
        let issuePart = '';
        if (resource) {
            issuePart = resource;
            if (specificIssue) {
                issuePart += ` • ${specificIssue}`;
            }
        } else if (specificIssue) {
            issuePart = specificIssue;
        }

        if (formattedUserRole) {
            issuePart += ` for ${formattedUserRole}`;
        }
        if (issuePart.trim()) {
            formattedSubject += ' | ' + issuePart;
        }

        console.log("Updated SIM Assignment subject line:", formattedSubject);

        formattedSubjectField.value = formattedSubject;

        // Also update the hidden subject field
        const subjectField = document.getElementById('subject');
        if (subjectField) {
            subjectField.value = formattedSubject;
        }
    }

    updateSIMAssessmentReportsSubject() {
        const isVipField = document.getElementById('isVIP');
        const districtNameField = document.getElementById('districtName');
        const districtStateField = document.getElementById('districtState');
        const applicationField = document.getElementById('application');
        const versionField = document.getElementById('version');
        const versionStateField = document.getElementById('versionState');
        const resourceField = document.getElementById('resource');
        const reportTypeField = document.getElementById('reportType');
        const specificIssueField = document.getElementById('specificIssue');
        const formattedSubjectField = document.getElementById('formattedSubject');

        if (!isVipField || !districtNameField || !districtStateField || !applicationField ||
            !versionField || !specificIssueField || !formattedSubjectField) {
            console.log("Missing required fields for subject formatting");
            return;
        }

        // Get user roles
        const userRoles = [];
        const roleCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]:checked');
        roleCheckboxes.forEach(cb => {
            if (cb.id === 'allUsers') {
                userRoles.push('All Users');
            } else {
                const label = cb.parentElement.textContent.trim();
                if (label) userRoles.push(label);
            }
        });

        const isVip = isVipField.value === 'Yes';
        const districtName = districtNameField.value || '';
        const districtState = districtStateField.value || '';
        const application = applicationField.value || '';

        // Get version value (handle custom versions)
        let version = '';
        if (versionField.value === "Other" && versionField.hasAttribute('data-custom-value')) {
            version = versionField.getAttribute('data-custom-value');
        } else {
            version = versionField.value || '';
        }

        // Get version state value (handle custom version states)
        let versionState = '';
        if (versionStateField) {
            if (versionStateField.value === "Other" && versionStateField.hasAttribute('data-custom-value')) {
                versionState = versionStateField.getAttribute('data-custom-value');
            } else {
                versionState = versionStateField.value || '';
            }
        }

        const resource = resourceField ? resourceField.value || '' : '';
        const reportType = reportTypeField ? reportTypeField.value || '' : '';
        const specificIssue = specificIssueField.value || '';
        const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

        // Build the subject line dynamically, only including parts that have values
        const subjectParts = [];

        // First part: VIP or Standard District Name • District State
        let districtPart = '';
        if (districtName.trim() && districtState.trim()) {
            if (isVip) {
                districtPart = `VIP * ${districtName.trim()} • ${districtState.trim()}`;
            } else {
                districtPart = `${districtName.trim()} • ${districtState.trim()}`;
            }
        } else if (districtName.trim()) {
            if (isVip) {
                districtPart = `VIP * ${districtName.trim()}`;
            } else {
                districtPart = districtName.trim();
            }
        } else if (districtState.trim()) {
            if (isVip) {
                districtPart = `VIP * ${districtState.trim()}`;
            } else {
                districtPart = districtState.trim();
            }
        }
        if (districtPart) {
            subjectParts.push(districtPart);
        }

        // Second part: Application Name • Version State/National
        let applicationPart = '';
        if (application.trim()) {
            applicationPart = application.trim();

            // Add version and state/national if they exist
            const versionParts = [];
            if (version.trim()) {
                versionParts.push(version.trim());
            }
            if (versionState.trim()) {
                versionParts.push(versionState.trim());
            }

            if (versionParts.length > 0) {
                applicationPart += ` • ${versionParts.join(' ')}`;
            }
        }
        if (applicationPart) {
            subjectParts.push(applicationPart);
        }

        // Third part: Resource (with Report Type if applicable)
        let resourcePart = '';
        if (resource && resource.trim() && resource !== 'Placeholder') {
            resourcePart = resource.trim();

            // Add Report Type if Resource is "Reports" and Report Type is selected
            if (resource === 'Reports' && reportType && reportType.trim()) {
                resourcePart += `: ${reportType.trim()}`;
            }

            subjectParts.push(resourcePart);
            console.log("Added resource to SIM Assessment Reports subject:", resourcePart);
        } else {
            console.log("Resource not added to SIM Assessment Reports subject. Resource value:", resource);
        }

        // Fourth part: Resource and specific issue with custom separator
        let issuePart = '';
        if (resource) {
            issuePart = resource;
            if (specificIssue) {
                issuePart += ` • ${specificIssue}`;
            }
        } else if (specificIssue) {
            issuePart = specificIssue;
        }

        if (userRoleText) {
            issuePart += ` for ${userRoleText}`;
        }
        if (issuePart.trim()) {
            subjectParts.push(issuePart);
        }

        // Join all parts with " | " separator
        const formattedSubject = subjectParts.join(' | ');

        console.log("Updated SIM Assessment Reports subject line:", formattedSubject);

        formattedSubjectField.value = formattedSubject;

        // Also update the hidden subject field
        const subjectField = document.getElementById('subject');
        if (subjectField) {
            subjectField.value = formattedSubject;
        }
    }

    updateSimLibraryViewSubject() {
        const isVIP = document.getElementById('isVIP')?.value || 'No';
        const vipPrefix = isVIP === "Yes" ? "VIP * " : "";
        const districtValue = document.getElementById('districtName')?.value || '';
        const applicationValue = document.getElementById('application')?.value || '';
        const versionValue = document.getElementById('version')?.value || '';
        const specificIssueValue = document.getElementById('specificIssue')?.value || '';

        // Include version if selected (not empty)
        const versionPart = versionValue ? ` v${versionValue}` : '';

        // Get all checked user role checkboxes
        const userRoleCheckboxes = document.querySelectorAll('input[name="userRole"]:checked');
        const selectedRoles = Array.from(userRoleCheckboxes).map(cb => cb.value);
        const formattedUserRole = this.formatUserRoles(selectedRoles);

        // Only add the "for" part if there are selected roles
        const userRolePart = formattedUserRole ? ` for ${formattedUserRole}` : '';

        const formattedSubject =
            `${vipPrefix}${districtValue} | ${applicationValue}${versionPart} - ${specificIssueValue}${userRolePart}`;

        const formattedSubjectField = document.getElementById('formattedSubject');
        if (formattedSubjectField) {
            formattedSubjectField.value = formattedSubject;

            // Also update the hidden subject field
            const subjectField = document.getElementById('subject');
            if (subjectField) {
                subjectField.value = formattedSubject;
            }
        }
    }

    updateSimFsaSubject() {
        const isVIPField = document.querySelector('select[name="isVIP"]');
        const districtNameField = document.querySelector('input[name="districtName"]');
        const applicationField = document.querySelector('input[name="application"]');
        const versionField = document.querySelector('select[name="version"]');
        const specificIssueField = document.querySelector('input[name="specificIssue"]');

        // Get all checked user role checkboxes
        const userRoleCheckboxes = document.querySelectorAll('input[name="userRole"]:checked');
        const selectedRoles = Array.from(userRoleCheckboxes).map(cb => cb.value);
        const formattedUserRole = this.formatUserRoles(selectedRoles);

        // Include version if selected (not empty)
        const versionValue = versionField?.value || '';
        const versionPart = versionValue ? ` v${versionValue}` : '';

        // Build the subject line
        let subject = '';
        if (isVIPField && isVIPField.value === 'Yes') {
            subject += 'VIP* ';
        }
        if (districtNameField && districtNameField.value) {
            subject += `${districtNameField.value} | `;
        }
        if (applicationField && applicationField.value) {
            subject += `${applicationField.value}${versionPart}`;
        }
        if (specificIssueField && specificIssueField.value) {
            subject += ` - ${specificIssueField.value}`;
        }
        if (formattedUserRole) {
            subject += ` for ${formattedUserRole}`;
        }

        // Update both the formatted and hidden subject fields
        const formattedSubjectField = document.querySelector('input[name="formattedSubject"]');
        const hiddenSubjectField = document.querySelector('input[name="subject"]');

        if (formattedSubjectField) {
            formattedSubjectField.value = subject;
        }
        if (hiddenSubjectField) {
            hiddenSubjectField.value = subject;
        }
    }

    updateSimOrrSubject() {
        const isVIPField = document.querySelector('select[name="isVIP"]');
        const districtNameField = document.querySelector('input[name="districtName"]');
        const districtStateField = document.querySelector('input[name="districtState"]');
        const applicationField = document.querySelector('input[name="application"]');
        const versionField = document.querySelector('select[name="version"]');
        const versionStateField = document.querySelector('select[name="versionState"]');
        const resourceField = document.querySelector('select[name="resource"]');
        const specificIssueField = document.querySelector('input[name="specificIssue"]');

        // Get all checked user role checkboxes
        const userRoleCheckboxes = document.querySelectorAll('input[name="userRole"]:checked');
        const selectedRoles = Array.from(userRoleCheckboxes).map(cb => cb.value);
        const formattedUserRole = this.formatUserRoles(selectedRoles);

        const isVip = isVIPField?.value === 'Yes';
        const districtName = districtNameField?.value || '';
        const districtState = districtStateField?.value || '';
        const application = applicationField?.value || '';
        const version = versionField?.value || '';
        const versionState = versionStateField?.value || '';
        const resource = resourceField?.value || '';
        const specificIssue = specificIssueField?.value || '';

        // Build the subject line dynamically, only including parts that have values
        const subjectParts = [];

        // First part: VIP status and district info
        let districtPart = '';
        if (isVip) {
            districtPart = `VIP * ${districtName} • ${districtState}`;
        } else {
            districtPart = `${districtName} • ${districtState}`;
        }
        if (districtPart.trim() && districtPart !== ' • ') {
            subjectParts.push(districtPart);
        }

        // Second part: Application, version, and version state
        let appPart = application;
        if (version) {
            appPart += ` • ${version}`;
        }
        if (versionState) {
            appPart += ` ${versionState}`;
        }
        if (appPart.trim()) {
            subjectParts.push(appPart);
        }

        // Third part: Resource and specific issue with custom separator
        let issuePart = '';
        if (resource) {
            issuePart = resource;
            if (specificIssue) {
                issuePart += ` • ${specificIssue}`;
            }
        } else if (specificIssue) {
            issuePart = specificIssue;
        }

        if (formattedUserRole) {
            issuePart += ` for ${formattedUserRole}`;
        }
        if (issuePart.trim()) {
            subjectParts.push(issuePart);
        }

        // Join all parts with " | "
        const subject = subjectParts.join(' | ');

        // Update both the formatted and hidden subject fields
        const formattedSubjectField = document.querySelector('input[name="formattedSubject"]');
        const hiddenSubjectField = document.querySelector('input[name="subject"]');

        if (formattedSubjectField) {
            formattedSubjectField.value = subject;
        }
        if (hiddenSubjectField) {
            hiddenSubjectField.value = subject;
        }

        console.log("Updated SIM ORR subject line:", subject);
    }

    updateAchievementLevelsSubjectSync() {
        // ... existing code ...
    }

    initEventListeners() {
        // Add dynamic subject line builder for Assembly template
        if (this.trackerType === 'assembly') {
            const subjectFields = ['xcode', 'application', 'version', 'specificIssue', 'gradesImpacted'];
            const formattedSubjectField = document.getElementById('formattedSubject');

            if (formattedSubjectField) {
                // Make it read-only
                formattedSubjectField.readOnly = true;

                // Update the formatted subject when any of the subject fields change
                subjectFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.addEventListener('input', () => {
                            this.updateFormattedSubject();
                        });
                        // Add change event for select fields
                        if (field.tagName === 'SELECT') {
                            field.addEventListener('change', () => {
                                this.updateFormattedSubject();
                            });
                        }
                    }
                });

                // Initial update
                this.updateFormattedSubject();
            }
        }

        // Add dynamic subject line builder for SEDCUST template
        if (this.trackerType === 'sedcust') {
            const subjectFields = ['xcode', 'isVIP', 'application', 'version', 'versionState', 'resourcePath', 'specificIssue'];
            const formattedSubjectField = document.getElementById('formattedSubject');

            if (formattedSubjectField) {
                // Make it read-only
                formattedSubjectField.readOnly = true;

                // Update the formatted subject when any of the subject fields change
                subjectFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.addEventListener('input', () => {
                            this.updateSedcustSubject();
                        });
                        // Add change event for select fields
                        if (field.tagName === 'SELECT') {
                            field.addEventListener('change', () => {
                                this.updateSedcustSubject();
                            });
                        }
                    }
                });

                // Initial update
                this.updateSedcustSubject();

                // Also schedule a delayed update to catch any draft data that might load later
                setTimeout(() => {
                    this.updateSedcustSubject();
                }, 600);
            }
        }

        // Add dynamic subject line builder for SIM Assignment template
        if (this.trackerType === 'sim-assignment') {
            const subjectFields = ['isVIP', 'districtName', 'districtState', 'application', 'version', 'versionState', 'resource', 'specificIssue'];
            const formattedSubjectField = document.getElementById('formattedSubject');

            if (formattedSubjectField) {
                // Make it read-only
                formattedSubjectField.readOnly = true;

                // Update the formatted subject when any of the subject fields change
                subjectFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.addEventListener('input', () => {
                            this.updateSimAssignmentSubject();
                        });
                        field.addEventListener('change', () => {
                            this.updateSimAssignmentSubject();
                        });
                    }
                });

                // Special handling for userRole checkboxes
                const userRoleCheckboxes = document.querySelectorAll('input[name="userRole"]');
                userRoleCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        console.log('User role checkbox changed, updating subject');
                        // Store current Resource value before update
                        const currentResource = document.getElementById('resource')?.value;
                        console.log('Before update - Resource:', currentResource);

                        this.updateSimAssignmentSubject();

                        // Verify values after update
                        const afterResource = document.getElementById('resource')?.value;
                        console.log('After update - Resource:', afterResource);
                    });
                });

                // Initial update
                this.updateSimAssignmentSubject();

                // Also do a delayed update to catch any dynamically loaded values
                setTimeout(() => {
                    this.updateSimAssignmentSubject();
                }, 500);
            }
        }

        // Add dynamic subject line builder for SIM Assessment Reports template
        if (this.trackerType === 'sim-assessment-reports') {
            const subjectFields = ['isVIP', 'districtName', 'districtState', 'application', 'version', 'versionState', 'resource', 'specificIssue'];
            const formattedSubjectField = document.getElementById('formattedSubject');

            if (formattedSubjectField) {
                // Make it read-only
                formattedSubjectField.readOnly = true;

                // Update the formatted subject when any of the subject fields change
                subjectFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.addEventListener('input', () => {
                            this.updateSIMAssessmentReportsSubject();
                        });
                        field.addEventListener('change', () => {
                            this.updateSIMAssessmentReportsSubject();
                        });
                    }
                });

                // Special handling for userRole checkboxes
                const userRoleCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
                userRoleCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        console.log('User role checkbox changed, updating SIM Assessment Reports subject');
                        this.updateSIMAssessmentReportsSubject();
                    });
                });

                // Note: reportType field removed since SIM Assessment Reports no longer has conditional Report Type field

                // Initial update
                this.updateSIMAssessmentReportsSubject();

                // Also do a delayed update to catch any dynamically loaded values
                setTimeout(() => {
                    this.updateSIMAssessmentReportsSubject();
                }, 500);
            }
        }

        // Add dynamic subject line builder for SIM Achievement Levels template
        if (this.trackerType === 'sim-achievement-levels') {
            // No changes needed here, this template doesn't get the version dropdown
        }

        // Add dynamic subject line builder for SIM Library View template
        if (this.trackerType === 'sim-library-view') {
            const subjectFields = ['isVIP', 'districtName', 'districtState', 'application', 'version', 'versionState', 'resource', 'specificIssue', 'userRole'];
            const formattedSubjectField = document.getElementById('formattedSubject');

            if (formattedSubjectField) {
                // Make it read-only
                formattedSubjectField.readOnly = true;

                // Update the formatted subject when any of the subject fields change
                subjectFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.addEventListener('input', () => {
                            this.updateSimLibraryViewSubject();
                        });
                        field.addEventListener('change', () => {
                            this.updateSimLibraryViewSubject();
                        });
                    }
                });

                // Initial update
                this.updateSimLibraryViewSubject();
            }
        }

        // Add this to the initEventListeners method, where the other template-specific subject handlers are
        if (this.trackerType === 'sim-fsa') {
            const subjectFields = ['isVIP', 'districtName', 'districtState', 'application', 'version', 'versionState', 'resource', 'specificIssue', 'userRole'];
            const formattedSubjectField = document.getElementById('formattedSubject');

            if (formattedSubjectField) {
                // Make it read-only
                formattedSubjectField.readOnly = true;

                // Update the formatted subject when any of the subject fields change
                subjectFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.addEventListener('input', () => {
                            this.updateSimFsaSubject();
                        });
                        field.addEventListener('change', () => {
                            this.updateSimFsaSubject();
                        });
                    }
                });

                // Initial update
                this.updateSimFsaSubject();
            }
        }

        // Add dynamic subject line builder for SIM ORR template
        if (this.trackerType === 'sim-orr') {
            const subjectFields = ['isVIP', 'districtName', 'districtState', 'application', 'version', 'versionState', 'resource', 'specificIssue'];
            const formattedSubjectField = document.getElementById('formattedSubject');

            if (formattedSubjectField) {
                // Make it read-only
                formattedSubjectField.readOnly = true;

                // Update the formatted subject when any of the subject fields change
                subjectFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.addEventListener('input', () => {
                            this.updateSimOrrSubject();
                        });
                        field.addEventListener('change', () => {
                            this.updateSimOrrSubject();
                        });
                    }
                });

                // Special handling for userRole checkboxes
                const userRoleCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
                userRoleCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        console.log('User role checkbox changed, updating SIM ORR subject');
                        this.updateSimOrrSubject();
                    });
                });

                // Initial update
                this.updateSimOrrSubject();

                // Also do a delayed update to catch any dynamically loaded values
                setTimeout(() => {
                    this.updateSimOrrSubject();
                }, 500);
            }
        }
    }
}

// If using ES modules, uncomment the line below
// export default TrackerApp; 