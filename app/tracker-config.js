function formatDate(dateString) {
    if (!dateString) return '';

    try {
        // Check if the string follows the YYYY-MM-DD pattern
        // A valid date should have exactly two hyphens and split into 3 parts
        const parts = dateString.split('-');
        if (parts.length !== 3) {
            return dateString; // Return original if not in YYYY-MM-DD format
        }

        // Additional validation - check if the first part looks like a year
        const year = parts[0];
        if (year.length !== 4 || isNaN(parseInt(year))) {
            return dateString;
        }

        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    } catch (e) {
        console.error('Error formatting date:', e);
        return dateString; // Return original if parsing fails
    }
}

const TRACKER_CONFIGS = {
    // Assembly Rollover
    "assembly-rollover": {
        title: "Assembly Rollover Tracker",
        icon: "fa-tools",
        description: "For requests regarding removing legacy assembly codes from a district",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true, hint: "BL Xcode removal request" }
                ]
            },
            {
                id: "summary",
                title: "SUMMARY",
                icon: "fa-file-alt",
                fields: [
                    { id: "summaryContent", type: "richtext", label: "", required: true }
                ]
            },
            {
                id: "details",
                title: "DESCRIPTION",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "realm", type: "text", label: "Realm (BURC Link)", required: true, hint: "Provide BURC Link to the district realm." },
                    { id: "effectiveDate", type: "date", label: "Effective Return Date", required: true, hint: "The effective return date is the date the customer service rep. processed the return in NetSuite. This date should be provided in the initial ticket request. If it is not provided you will need to ask the person who submitted the ticket." },
                    { id: "assemblyCodes", type: "textarea", label: "Assembly Codes To Be Removed", required: true, hint: "Include the list of assembly codes that need to be removed from the district's account. This list of codes will be included in the initial ticket request." }
                ]
            }
        ],
        // Function to generate description HTML for this tracker type
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div>Please see the BL Xcode removal request below.</div>';
            description += '<div style="margin-bottom: 20px;"></div>';

            // Add summary section if provided
            if (fields.summaryContent && fields.summaryContent.trim() !== '<p><br></p>') {
                description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SUMMARY</span></div>';
                description += `<div>${fields.summaryContent || ''}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">DESCRIPTION</span></div>';
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `User BURC Link: ${fields.realm || ''}<br>`;
            description += `Effective Return Date: ${formatDate(fields.effectiveDate) || ''}<br>`;
            description += `Assembly Codes To Be Removed:<br>${fields.assemblyCodes || ''}`;

            return description;
        },
        // Add onLoad function to tag the source ticket with "ESCALATED TO ASSEMBLY"
        onLoad: function () {
            console.log("Assembly Rollover onLoad function executing");

            // First populate Application Name from product info
            populateApplicationName();

            // Try to get the source ticket ID from localStorage
            let sourceTicketId = null;
            try {
                const ticketData = localStorage.getItem('ticketData');
                if (ticketData) {
                    const parsedData = JSON.parse(ticketData);
                    if (parsedData && parsedData.id) {
                        sourceTicketId = parsedData.id;
                        console.log(`Found source ticket ID: ${sourceTicketId}`);
                    }
                }
            } catch (error) {
                console.error("Error getting source ticket ID from localStorage:", error);
            }

            // If we have a source ticket ID, add the tag
            if (sourceTicketId) {
                console.log(`Adding "ESCALATED TO ASSEMBLY" tag to source ticket ${sourceTicketId}`);

                // Function to update source ticket tags
                const updateSourceTicketTags = async () => {
                    try {
                        // First get the current ticket details to retrieve existing tags
                        const response = await client.request.invokeTemplate("getTicketDetails", {
                            context: { ticketId: sourceTicketId }
                        });

                        if (response && response.response) {
                            const ticketDetails = JSON.parse(response.response);

                            // Get existing tags and add the new one if it doesn't exist
                            let tags = ticketDetails.tags || [];

                            // Convert to array if it's not already
                            if (!Array.isArray(tags)) {
                                tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                            }

                            // Check if tag already exists
                            if (!tags.includes("ESCALATED TO ASSEMBLY")) {
                                tags.push("ESCALATED TO ASSEMBLY");

                                // Prepare data for update
                                const updateData = {
                                    tags: tags
                                };

                                try {
                                    // Use the updateTicket template instead of direct API call
                                    console.log(`Updating source ticket ${sourceTicketId} tags using updateTicket template`);
                                    await client.request.invokeTemplate("updateTicket", {
                                        context: {
                                            ticketId: sourceTicketId
                                        },
                                        body: JSON.stringify(updateData)
                                    });

                                    console.log("Source ticket successfully tagged with ESCALATED TO ASSEMBLY");

                                    // Add a private note about the escalation
                                    await client.request.invokeTemplate("addNoteToTicket", {
                                        context: {
                                            ticketId: sourceTicketId
                                        },
                                        body: JSON.stringify({
                                            body: "This ticket has been escalated to Assembly. An Assembly tracker ticket has been created.",
                                            private: true
                                        })
                                    });

                                    console.log("Private note added to source ticket");
                                } catch (error) {
                                    console.error("Error updating source ticket:", error);

                                    // Try to add at least a private note as fallback
                                    try {
                                        console.log("Attempting to add private note as fallback");
                                        await client.request.invokeTemplate("addNoteToTicket", {
                                            context: {
                                                ticketId: sourceTicketId
                                            },
                                            body: JSON.stringify({
                                                body: "This ticket has been escalated to Assembly. An Assembly tracker ticket has been created. (Note: Unable to add ESCALATED TO ASSEMBLY tag automatically)",
                                                private: true
                                            })
                                        });
                                        console.log("Private note added to source ticket as fallback");
                                    } catch (noteError) {
                                        console.error("Error adding private note:", noteError);
                                    }
                                }
                            } else {
                                console.log("Source ticket already has ESCALATED TO ASSEMBLY tag");
                            }
                        }
                    } catch (error) {
                        console.error("Error updating source ticket tags:", error);
                    }
                };

                // Execute the update
                updateSourceTicketTags();
            }
        }
    },

    // Standard Assembly
    "assembly": {
        title: "Assembly Tracker",
        icon: "fa-puzzle-piece",
        description: "For issues regarding component assembly",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    { id: "xcode", type: "text", label: "XCODE", required: true, hint: "<a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720168' target='_blank'>How to Find a Resource Xcode</a>", placeholder: "e.g. X56723" },
                    { id: "hasMultipleXcodes", type: "select", label: "Multiple Xcodes?", required: true, options: ["No", "Yes"], hint: "Select 'Yes' if this issue affects multiple Xcodes" },
                    { id: "application", type: "text", label: "Application Name", required: true, placeholder: "e.g. BAdvance c2022" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: true,
                        options: ["", "2.0", "2.5", "2.75", "3.0", "3.5", "Other"]
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "e.g. Symbols Of Our Country Missing" },
                    { id: "gradesImpacted", type: "text", label: "Grades Impacted", required: true, placeholder: "e.g. Grade 2" },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will be submitted as your ticket subject" }
                ]
            },
            {
                id: "summary",
                title: "SUMMARY",
                icon: "fa-file-alt",
                fields: [
                    { id: "summary", type: "richtext", label: "", required: true }
                ]
            },
            {
                id: "details",
                title: "DESCRIPTION",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "issue", type: "richtext", label: "Issue", required: true, hint: "Explain the issue the user has reported in detail." },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "schoolName", type: "text", label: "School Name", required: true, hint: "Provide the customer account and name of the user that the issue is affecting, as well as the role they have within Benchmark Universe (district admin, school admin, teacher). EX: Echo Lake Elementary School" },
                    { id: "districtState", type: "text", label: "District State", required: true },
                    { id: "program", type: "text", label: "Program/Product Impacted", required: true, hint: "Provide the name of the product where the issue is prevalent. Include the assembly code (ie: subscription code pulled from TA Subs). Make sure you include the state if it a state specific assembly. EX: Benchmark Advance - c2022 VA:  X101055" },
                    { id: "programVariation", type: "text", label: "Program Variation (if known)", required: true, hint: "Provide the program variation if known. This includes state variation and / or numerical variation such as 2.75 or 2.5. EX: Benchmark Advance -c2022 or Benchmark Advance 2.75" },
                    { id: "dateReported", type: "date", label: "Date issue reported by user", required: true, hint: "Provide the date the user reported the issue. EX: 5/18/23" },
                    { id: "subscriptionCodes", type: "richtext", label: "Subscription codes customer is onboarded with", required: true, hint: "Provide the subscription code of the product the user has the issue in. EX: X71647 <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720168' target='_blank'>How to find an Xcode</a>" },
                    {
                        id: "impactScope",
                        type: "select",
                        label: "Teacher vs Student impact",
                        required: true,
                        options: ["", "Teacher Only", "Student Only", "Both Teacher and Student"],
                        hint: "Identify if the teacher or the student is impacted by the issue. EX: Teacher and Student"
                    },
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Customer",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Identify if the user is a VIP customer. EX: No <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP District List</a>"
                    }
                ]
            },
            {
                id: "stepsToReproduce",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "pathField",
                        type: "text",
                        label: "Path",
                        required: true,
                        hint: "Path taken to recreate issue and screenshots if necessary. EX: BAdvance -c2022 > TRS > G5 > U1 > W2 > L12"
                    },
                    {
                        id: "actualResults",
                        type: "richtext",
                        label: "Actual results",
                        required: true,
                        hint: "Provide Screenshots and any other information that would be helpful to replicate the reported issue."
                    },
                    {
                        id: "expectedResults",
                        type: "richtext",
                        label: "Expected results",
                        required: true,
                        hint: "Explain/show how the system should be functioning if working correctly. Our role is to convey what the user is requesting. Ie. the user feels a certain standard is missing from a lesson. Request that rationale be provided. Example of expected results: Provide title for lesson, Fix hyperlink, Provide rationale, Fix grammatical errors."
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS",
                icon: "fa-images",
                fields: [
                    {
                        id: "screenshotsDescription",
                        type: "richtext",
                        label: "Screenshots and Supporting Materials",
                        required: false,
                        hint: "Paste screenshots or add descriptions of visual evidence here"
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // Add summary section if provided
            if (fields.summary && fields.summary.trim() !== '<p><br></p>') {
                description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SUMMARY</span></div>';
                description += `<div>${fields.summary || ''}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            } else {
                // Add empty summary section if not provided to ensure it's always in the ticket
                description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SUMMARY</span></div>';
                description += '<div><em>No summary provided.</em></div>';
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Add description with all fields
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">DESCRIPTION</span></div>';
            description += `<div><strong>Issue:</strong></div>`;
            description += `<div>${fields.issue || ''}</div>`;
            description += `District Name: ${fields.districtName || ''}<br>`;
            if (fields.schoolName) description += `School Name: ${fields.schoolName}<br>`;
            if (fields.districtState) description += `District State: ${fields.districtState}<br>`;
            description += `Program/Product Impacted: ${fields.program || ''}<br>`;
            if (fields.programVariation) description += `Program Variation: ${fields.programVariation}<br>`;
            if (fields.dateReported) description += `Date issue reported by user: ${formatDate(fields.dateReported)}<br>`;
            if (fields.subscriptionCodes && fields.subscriptionCodes.trim() !== '<p><br></p>') {
                description += `<div><strong>Subscription codes:</strong></div>`;
                description += `<div>${fields.subscriptionCodes}</div>`;
            }
            if (fields.impactScope) description += `Teacher vs Student impact: ${fields.impactScope}<br>`;
            description += `VIP Customer: ${fields.isVIP || 'No'}<br>`;

            // Add steps to reproduce section
            description += '<div style="margin-bottom: 20px;"></div>';
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">STEPS TO REPRODUCE</span></div>';

            // Add path field
            if (fields.pathField) {
                description += `Path: ${fields.pathField}<br>`;
                description += '<div style="margin-bottom: 10px;"></div>';
            } else {
                description += '<div><em>No path provided.</em></div>';
                description += '<div style="margin-bottom: 10px;"></div>';
            }

            // Add actual results
            if (fields.actualResults && fields.actualResults.trim() !== '<p><br></p>') {
                description += `<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">Actual results</span></div>`;
                description += `<div>${fields.actualResults}</div>`;
                description += '<div style="margin-bottom: 10px;"></div>';
            } else {
                description += `<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">Actual results</span></div>`;
                description += '<div><em>No actual results provided.</em></div>';
                description += '<div style="margin-bottom: 10px;"></div>';
            }

            // Add expected results
            if (fields.expectedResults && fields.expectedResults.trim() !== '<p><br></p>') {
                description += `<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">Expected results</span></div>`;
                description += `<div>${fields.expectedResults}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            } else {
                description += `<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">Expected results</span></div>`;
                description += '<div><em>No expected results provided.</em></div>';
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Add screenshots section if provided
            if (fields.screenshotsDescription && fields.screenshotsDescription.trim() !== '<p><br></p>') {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS & SUPPORTING MATERIALS</span></div>';
                description += `<div>${fields.screenshotsDescription}</div>`;
            }

            return description;
        },
        // Add onLoad function to tag the source ticket with "ESCALATED TO ASSEMBLY"
        onLoad: function () {
            console.log("Assembly Tracker onLoad function executing");

            // First populate Application Name from product info
            populateApplicationName();

            // Function to sync fields from Subject to other sections
            function syncFields() {
                // Get the source fields from Subject section
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');

                // Get the target fields
                const programField = document.getElementById('program');
                const programVariationField = document.getElementById('programVariation');

                // Sync application to program field if both fields exist
                if (applicationField && programField) {
                    programField.value = applicationField.value || '';
                    console.log(`Synced Application Name to Program/Product Impacted field: ${applicationField.value}`);
                }

                // Sync version to program variation field if both fields exist
                if (versionField && programVariationField) {
                    programVariationField.value = versionField.value || '';
                    console.log(`Synced Version to Program Variation field: ${versionField.value}`);
                }
            }

            // Set up event listeners for the source fields
            const applicationField = document.getElementById('application');
            if (applicationField) {
                applicationField.addEventListener('input', syncFields);
                console.log("Added event listener to Application Name field");
            }

            const versionField = document.getElementById('version');
            if (versionField) {
                versionField.addEventListener('change', syncFields);
                console.log("Added event listener to Version field");
            }

            // Initial sync attempt
            syncFields();

            // Schedule another sync after a small delay to ensure fields are loaded
            setTimeout(syncFields, 500);

            // Function to update subject line according to new format
            function updateSubjectLine() {
                // Define all required field variables properly
                const xcodeField = document.getElementById('xcode');
                const hasMultipleXcodesField = document.getElementById('hasMultipleXcodes');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const specificIssueField = document.getElementById('specificIssue');
                const gradesImpactedField = document.getElementById('gradesImpacted');
                const formattedSubjectField = document.getElementById('formattedSubject');
                const isVIPField = document.getElementById('isVIP');

                if (!xcodeField || !hasMultipleXcodesField || !applicationField || !versionField ||
                    !specificIssueField || !gradesImpactedField || !formattedSubjectField) {
                    console.log("Missing required fields for subject formatting");
                    return;
                }

                const xcode = xcodeField.value || '';
                const hasMultipleXcodes = hasMultipleXcodesField.value === 'Yes';
                const application = applicationField.value || '';
                const version = versionField.value || '';
                const specificIssue = specificIssueField.value || '';
                const gradesImpacted = gradesImpactedField.value || '';

                // Check if this is a VIP customer
                let isVIP = false;
                if (isVIPField) {
                    isVIP = isVIPField.value === 'Yes';
                }

                // Format: "Xcode (indicate if more than one) | VIP or Standard | Application Name • Version | Specific issue: grades impacted"
                let subject = xcode;
                if (hasMultipleXcodes) {
                    subject += ' (multiple)';
                }
                subject += ' | ';

                // Add VIP status if applicable
                if (isVIP) {
                    subject += 'VIP | ';
                }

                // Add application and version
                subject += application;
                if (version) {
                    subject += ` • ${version}`;
                }

                // Add specific issue and grades impacted
                subject += ` | ${specificIssue}: ${gradesImpacted}`;

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners for subject line formatting
            document.getElementById('xcode')?.addEventListener('input', updateSubjectLine);
            document.getElementById('hasMultipleXcodes')?.addEventListener('change', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('specificIssue')?.addEventListener('input', updateSubjectLine);
            document.getElementById('gradesImpacted')?.addEventListener('input', updateSubjectLine);
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);

            // Try to get the source ticket ID from localStorage
            let sourceTicketId = null;
            try {
                const ticketData = localStorage.getItem('ticketData');
                if (ticketData) {
                    const parsedData = JSON.parse(ticketData);
                    if (parsedData && parsedData.id) {
                        sourceTicketId = parsedData.id;
                        console.log(`Found source ticket ID: ${sourceTicketId}`);
                    }
                }
            } catch (error) {
                console.error("Error getting source ticket ID from localStorage:", error);
            }

            // Initial attempt to update subject line
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);

            // If we have a source ticket ID, add the tag
            if (sourceTicketId) {
                console.log(`Adding "ESCALATED TO ASSEMBLY" tag to source ticket ${sourceTicketId}`);

                // Function to update source ticket tags
                const updateSourceTicketTags = async () => {
                    try {
                        // First get the current ticket details to retrieve existing tags
                        const response = await client.request.invokeTemplate("getTicketDetails", {
                            context: { ticketId: sourceTicketId }
                        });

                        if (response && response.response) {
                            const ticketDetails = JSON.parse(response.response);

                            // Get existing tags and add the new one if it doesn't exist
                            let tags = ticketDetails.tags || [];

                            // Convert to array if it's not already
                            if (!Array.isArray(tags)) {
                                tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                            }

                            // Check if tag already exists
                            if (!tags.includes("ESCALATED TO ASSEMBLY")) {
                                tags.push("ESCALATED TO ASSEMBLY");

                                // Prepare data for update
                                const updateData = {
                                    tags: tags
                                };

                                try {
                                    // Use the updateTicket template instead of direct API call
                                    console.log(`Updating source ticket ${sourceTicketId} tags using updateTicket template`);
                                    await client.request.invokeTemplate("updateTicket", {
                                        context: {
                                            ticketId: sourceTicketId
                                        },
                                        body: JSON.stringify(updateData)
                                    });

                                    console.log("Source ticket successfully tagged with ESCALATED TO ASSEMBLY");

                                    // Add a private note about the escalation
                                    await client.request.invokeTemplate("addNoteToTicket", {
                                        context: {
                                            ticketId: sourceTicketId
                                        },
                                        body: JSON.stringify({
                                            body: "This ticket has been escalated to Assembly. An Assembly tracker ticket has been created.",
                                            private: true
                                        })
                                    });

                                    console.log("Private note added to source ticket");
                                } catch (error) {
                                    console.error("Error updating source ticket:", error);

                                    // Try to add at least a private note as fallback
                                    try {
                                        console.log("Attempting to add private note as fallback");
                                        await client.request.invokeTemplate("addNoteToTicket", {
                                            context: {
                                                ticketId: sourceTicketId
                                            },
                                            body: JSON.stringify({
                                                body: "This ticket has been escalated to Assembly. An Assembly tracker ticket has been created. (Note: Unable to add ESCALATED TO ASSEMBLY tag automatically)",
                                                private: true
                                            })
                                        });
                                        console.log("Private note added to source ticket as fallback");
                                    } catch (noteError) {
                                        console.error("Error adding private note:", noteError);
                                    }
                                }
                            } else {
                                console.log("Source ticket already has ESCALATED TO ASSEMBLY tag");
                            }
                        }
                    } catch (error) {
                        console.error("Error updating source ticket tags:", error);
                    }
                };

                // Execute the update
                updateSourceTicketTags();
            }
        }
    },

    // Feature Request
    "feature-request": {
        title: "Feature Request Tracker",
        icon: "fa-lightbulb",
        description: "For requests regarding new functionality within Benchmark Universe",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"]
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "application", type: "text", label: "Application Name", required: true },
                    { id: "resourceName", type: "text", label: "Resource Name", required: true },
                    { id: "shortDescription", type: "text", label: "Short Description of Request", required: true },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ]
                    },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will be submitted as your ticket subject", readOnly: true, disabled: true }
                ]
            },
            {
                id: "team",
                title: "TEAM",
                icon: "fa-users",
                fields: [
                    {
                        id: "team",
                        type: "select",
                        label: "Team",
                        required: true,
                        options: [
                            "Assessments (Marty O'Kane)",
                            "Editorial English (Max Prinz)",
                            "SIM (Colleen Baker)",
                            "TRS (Edgar Fernandez)"
                        ]
                    }
                ]
            },
            {
                id: "featureDetails",
                title: "FEATURE REQUEST SUMMARY",
                icon: "fa-clipboard-list",
                fields: [
                    {
                        id: "applicationDetails",
                        type: "text",
                        label: "Application",
                        required: true,
                        hint: "Provide the application in which the user is referring to. EX: Assessments."
                    },
                    {
                        id: "shortDescriptionDetails",
                        type: "text",
                        label: "Short description",
                        required: true,
                        hint: "Explain what the user is requesting. EX: Allow students to enable text to speech for the writing portion of assessments."
                    }
                ]
            },
            {
                id: "additionalDetails",
                title: "ADDITIONAL DETAILS",
                icon: "fa-info-circle",
                fields: [
                    { id: "additionalDetails", type: "richtext", label: "", required: true }
                ]
            },
            {
                id: "userInfo",
                title: "USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "username", type: "text", label: "Username", required: true, hint: "Provide the username of the customer submitting the request. EX: mitizishepard." },
                    { id: "role", type: "text", label: "Role", required: true, hint: "Provide the role of the customer submitting the request. EX: District Admin, School Admin, Teacher, or Student." },
                    { id: "name", type: "text", label: "Name", required: true, hint: "Provide the name of the customer submitting the request. EX: Mitizi Shepard" },
                    { id: "customer_email", type: "email", label: "Email", required: true, hint: "Provide the email of the customer submitting the request." },
                    { id: "dateRequested", type: "date", label: "Date Requested", required: true }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">TEAM</span></div>';
            description += `<div>${fields.team || ''}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">FEATURE REQUEST SUMMARY</span></div>';
            description += `<div><strong>Application:</strong></div>`;
            description += `<div>${fields.applicationDetails || ''}</div>`;
            description += `<div><strong>Short description:</strong></div>`;
            description += `<div>${fields.shortDescriptionDetails || ''}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.additionalDetails) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ADDITIONAL DETAILS</span></div>';
                description += `<div>${fields.additionalDetails}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">USER INFO</span></div>';
            description += `VIP Status: ${fields.isVIP === 'Yes' ? 'VIP' : 'Core'}<br>`;
            description += `District: ${fields.districtName || ''}<br>`;
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.role) description += `Role: ${fields.role}<br>`;
            if (fields.name) description += `Name: ${fields.name}<br>`;
            if (fields.customer_email) description += `Email: ${fields.customer_email}<br>`;
            if (fields.dateRequested) description += `Date Requested: ${formatDate(fields.dateRequested) || ''}<br>`;

            return description;
        },

        // Add onLoad function for dynamic subject line formatting
        onLoad: function () {
            console.log("Feature Request onLoad function executing");

            // Hide the Requester Email property field as it will always be the logged in agent
            // Look specifically for the ticket property field, not our custom form field
            const hideRequesterEmail = function () {
                // Try multiple selectors to find the ticket properties requester email field
                const requesterEmailSelectors = [
                    'label[for="email"].required-field', // Label with "for" attribute
                    '.ticket-property-field label:contains("Requester Email")', // Label text contains
                    '[data-field-name="requester_email"]', // Data attribute
                    '#requesterEmail', // Direct ID
                    '.field-container:has(label:contains("Requester Email"))' // Container with label
                ];

                // Try each selector
                for (const selector of requesterEmailSelectors) {
                    try {
                        const elements = document.querySelectorAll(selector);
                        if (elements.length > 0) {
                            elements.forEach(el => {
                                // Find the parent container and hide it
                                const container = el.closest('.field-container') || el.closest('.field-group') ||
                                    el.closest('.form-group') || el.closest('.field') || el.parentElement;
                                if (container) {
                                    container.style.display = 'none';
                                    console.log(`Successfully hid requester email field using selector: ${selector}`);
                                    return true;
                                }
                            });
                        }
                    } catch (e) {
                        console.error(`Error with selector ${selector}:`, e);
                    }
                }

                console.log("Could not find requester email field to hide");
                return false;
            };

            // Try immediately
            hideRequesterEmail();

            // And also try after a short delay to ensure the DOM is fully loaded
            setTimeout(hideRequesterEmail, 500);

            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const applicationField = document.getElementById('application');
                const resourceNameField = document.getElementById('resourceName');
                const shortDescriptionField = document.getElementById('shortDescription');
                const formattedSubjectField = document.getElementById('formattedSubject');

                if (!isVipField || !districtNameField || !applicationField ||
                    !resourceNameField || !shortDescriptionField || !formattedSubjectField) {
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
                const application = applicationField.value || '';
                const resourceName = resourceNameField.value || '';
                const shortDescription = shortDescriptionField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(', ') : '';

                // Format: "VIP * District Name | Application Name | Resource Name - Short Description of Request for User Role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} | ${application} | ${resourceName} - ${shortDescription} for ${userRoleText}`;
                } else {
                    subject = `${districtName} | ${application} | ${resourceName} - ${shortDescription} for ${userRoleText}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set default date for Date Requested field to today
            const dateRequestedField = document.getElementById('dateRequested');
            if (dateRequestedField) {
                const today = new Date().toISOString().split('T')[0];
                dateRequestedField.value = today;
                console.log("Set default date for Date Requested:", today);
            }

            // Autopopulate VIP and District Name from the subject section
            function syncUserInfoFields() {
                // These fields should be synchronized from subject fields to user info display
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');

                if (isVipField && districtNameField) {
                    // Display VIP status and district name in the USER INFO section
                    const userInfoSection = document.querySelector('#userInfo');
                    if (userInfoSection) {
                        // Create a display element for VIP status if not exists
                        let vipDisplay = document.getElementById('vipDisplay');
                        if (!vipDisplay) {
                            vipDisplay = document.createElement('div');
                            vipDisplay.id = 'vipDisplay';
                            vipDisplay.className = 'form-group';
                            vipDisplay.innerHTML = `
                                <label>VIP</label>
                                <div id="vipValue" class="field-value"></div>
                            `;
                            userInfoSection.prepend(vipDisplay);
                        }

                        // Create a display element for district name if not exists
                        let districtDisplay = document.getElementById('districtDisplay');
                        if (!districtDisplay) {
                            districtDisplay = document.createElement('div');
                            districtDisplay.id = 'districtDisplay';
                            districtDisplay.className = 'form-group';
                            districtDisplay.innerHTML = `
                                <label>District Name</label>
                                <div id="districtValue" class="field-value"></div>
                            `;
                            userInfoSection.prepend(districtDisplay);
                        }

                        // Update the display values
                        document.getElementById('vipValue').textContent = isVipField.value || 'No';
                        document.getElementById('districtValue').textContent = districtNameField.value || '';

                        // Add style to make it look like a field
                        const style = document.createElement('style');
                        style.textContent = `
                            .field-value {
                                padding: 8px;
                                border: 1px solid #ccc;
                                border-radius: 4px;
                                background-color: #f9f9f9;
                                min-height: 37px;
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }
            }

            // Run sync once at load
            setTimeout(syncUserInfoFields, 500);

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', function () {
                updateSubjectLine();
                syncUserInfoFields();
            });
            document.getElementById('districtName')?.addEventListener('input', function () {
                updateSubjectLine();
                syncUserInfoFields();
            });
            document.getElementById('application')?.addEventListener('input', function () {
                updateSubjectLine();
                syncFeatureRequestFields();
            });
            document.getElementById('resourceName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('shortDescription')?.addEventListener('input', function () {
                updateSubjectLine();
                syncFeatureRequestFields();
            });

            // Function to sync fields from Subject to Feature Request Summary
            function syncFeatureRequestFields() {
                const applicationField = document.getElementById('application');
                const shortDescriptionField = document.getElementById('shortDescription');
                const applicationDetailsField = document.getElementById('applicationDetails');
                const shortDescriptionDetailsField = document.getElementById('shortDescriptionDetails');

                // Simple direct field-to-field population for text fields
                if (applicationField && applicationDetailsField) {
                    applicationDetailsField.value = applicationField.value;
                    console.log("Updated Application in Feature Request Summary:", applicationField.value);
                } else {
                    console.log("Application fields not found for syncing");
                }

                if (shortDescriptionField && shortDescriptionDetailsField) {
                    shortDescriptionDetailsField.value = shortDescriptionField.value;
                    console.log("Updated Short Description in Feature Request Summary:", shortDescriptionField.value);
                } else {
                    console.log("Short Description fields not found for syncing");
                }
            }

            // Try to synchronize after DOM is fully loaded
            setTimeout(syncFeatureRequestFields, 500);
            setTimeout(syncFeatureRequestFields, 1000);

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', function () {
                updateSubjectLine();
                syncUserInfoFields();
            });
            document.getElementById('districtName')?.addEventListener('input', function () {
                updateSubjectLine();
                syncUserInfoFields();
            });
            document.getElementById('application')?.addEventListener('input', function () {
                updateSubjectLine();
                syncFeatureRequestFields();
            });
            document.getElementById('resourceName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('shortDescription')?.addEventListener('input', function () {
                updateSubjectLine();
                syncFeatureRequestFields();
            });

            // When the feature details section becomes visible, try to sync again
            const featureDetailsObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const featureDetailsSection = document.getElementById('featureDetails');
                        if (featureDetailsSection && window.getComputedStyle(featureDetailsSection).display !== 'none') {
                            console.log("Feature details section is now visible, syncing fields");
                            syncFeatureRequestFields();
                        }
                    }
                });
            });

            // Start observing the feature details section
            const featureDetailsSection = document.getElementById('featureDetails');
            if (featureDetailsSection) {
                featureDetailsObserver.observe(featureDetailsSection, { attributes: true });
            }

            // Add listeners to all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSubjectLine);
            });

            // Initial update attempt
            updateSubjectLine();

            // Initial sync of feature request fields
            syncFeatureRequestFields();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);
        }
    },

    // SEDCUST - Content/Editorial
    "sedcust": {
        title: "Content/Editorial Tracker",
        icon: "fa-book",
        description: "For issues regarding content errors, broken links, and other editorial concerns",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    { id: "xcode", type: "text", label: "XCODE", required: true, placeholder: "e.g. X56723" },
                    { id: "application", type: "text", label: "Application Name", required: true, placeholder: "e.g. BAdvance -c2022" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: true,
                        options: ["", "2.0", "2.5", "2.75", "3.0", "3.5", "Other"]
                    },
                    { id: "resourcePath", type: "text", label: "Resource Path", required: true, placeholder: "e.g. TRS: G5>U1>W2>L12" },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "e.g. Title Missing" },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will be submitted as your ticket subject", readOnly: true }
                ]
            },
            {
                id: "summary",
                title: "SUMMARY",
                icon: "fa-file-alt",
                fields: [
                    {
                        id: "issueSummary", type: "richtext", label: "", required: true,
                        hint: "Short descriptor of the issue being reported. EX: User reports that in BAdvance -c2022 > TRS > G5 > U1> W2 > L12 the title is missing for the lesson."
                    }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    {
                        id: "issueDetails", type: "richtext", label: "", required: true,
                        hint: "Describe in detail the issue reported by the user. You can insert exactly what the user reports in their submitted ticket. EX: User reports \"On the Benchmark Advance platform, unit 1 of grade 5, please filter to week 2 lesson 12. The title is missing from the lesson plan. Please add the title.\""
                    }
                ]
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    {
                        id: "isVIP", type: "select", label: "VIP Customer", required: true, options: ["No", "Yes"],
                        hint: "If the district is VIP, select yes. If the district is not, select no. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP District List</a>"
                    },
                    {
                        id: "username", type: "text", label: "Username", required: true,
                        hint: "Provide the username of the user that the issue is affecting. Note: the username and email is often the same for many users. EX: amiller3"
                    },
                    {
                        id: "userEmail", type: "email", label: "Email", required: true,
                        hint: "Provide the email of the user that the issue is affecting. Note: the username and email are often the same for many users. EX: adam.miller@palmbeachschools.org"
                    },
                    {
                        id: "userRole", type: "text", label: "Role", required: true,
                        hint: "Provide the role of the user that the issue is affecting. EX: District Admin, School Admin, Teacher or Student"
                    },
                    {
                        id: "productImpacted", type: "text", label: "Application/Program Impacted", required: true,
                        hint: "Provide the name of the product where the issue is prevalent. Ex: Benchmark Advance Florida"
                    },
                    {
                        id: "xcodeInfo", type: "text", label: "Xcode", required: true,
                        hint: "Provide the Xcode of component where the issue is prevalent. EX: X72525. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720168' target='_blank'>How to find an Xcode</a>"
                    },
                    {
                        id: "districtState", type: "text", label: "District state", required: true,
                        hint: "Provide the state where the district is located. EX: Florida or FL. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720295' target='_blank'>Verify district realm/state</a>"
                    },
                    {
                        id: "impactType", type: "select", label: "Digital and/or Print Impact", required: true,
                        options: ["", "Digital Only", "Print Only", "Both Digital and Print"],
                        hint: "Identify if the issue only occurs on the digital platform or if it occurs in both digital and print. EX: Digital"
                    },
                    {
                        id: "dateReported", type: "date", label: "Date Issue reported by user", required: true,
                        hint: "Provide the date the user reported the issue. EX: 5/18/23"
                    },
                    {
                        id: "impactScope", type: "select", label: "Teacher and/or Student impact", required: true,
                        options: ["", "Teacher Only", "Student Only", "Both Teacher and Student"],
                        hint: "Identify if the teacher or the student is impacted by the issue. EX: Teacher"
                    }
                ]
            },
            {
                id: "components",
                title: "PROGRAM COMPONENTS",
                icon: "fa-puzzle-piece",
                fields: [
                    {
                        id: "components", type: "richtext", label: "", required: true,
                        hint: "Specific application or component affected e.g., Assessment, Assignments, ePlanner, TRS. EX: TRS (teacher resource system)"
                    }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "pathField", type: "text", label: "Path", required: true,
                        hint: "Path taken to recreate issue and screenshots if necessary. EX: BAdvance -c2022 > TRS > G5 > U1 > W2 > L12"
                    },
                    {
                        id: "actualResults", type: "richtext", label: "Actual results", required: true,
                        hint: "Provide Screenshots and any other information that would be helpful to replicate the reported issue."
                    },
                    {
                        id: "expectedResults", type: "richtext", label: "Expected results", required: true,
                        hint: "Explain/show how the system should be functioning if working correctly. Our role is to convey what the user is requesting. Ie. the user feels a certain standard is missing from a lesson. Request that rationale be provided. Example of expected results: Provide title for lesson, Fix hyperlink, Provide rationale, Fix grammatical errors."
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            if (fields.issueSummary) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SUMMARY</span></div>';
                description += `<div>${fields.issueSummary}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            if (fields.issueDetails) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DETAILS</span></div>';
                description += `<div>${fields.issueDetails}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">IMPACTED USER INFO</span></div>';
            if (fields.isVIP) description += `VIP Customer: ${fields.isVIP}<br>`;
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.userEmail) description += `Email: ${fields.userEmail}<br>`;
            if (fields.userRole) description += `Role: ${fields.userRole}<br>`;
            if (fields.productImpacted) description += `Product Impacted: ${fields.productImpacted}<br>`;
            if (fields.xcodeInfo) description += `Xcode: ${fields.xcodeInfo}<br>`;
            if (fields.districtState) description += `District State: ${fields.districtState}<br>`;
            if (fields.impactType) description += `Impact Type: ${fields.impactType}<br>`;
            if (fields.dateReported) description += `Date Reported: ${formatDate(fields.dateReported) || ''}<br>`;
            if (fields.impactScope) description += `Impact Scope: ${fields.impactScope}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.components) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">PROGRAM COMPONENTS</span></div>';
                description += `<div>${fields.components}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Reproduction section
            if (fields.pathField || fields.actualResults || fields.expectedResults) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">STEPS TO REPRODUCE</span></div>';
                if (fields.pathField) description += `Path: ${fields.pathField}<br>`;
                description += '<div style="margin-bottom: 10px;"></div>';

                if (fields.actualResults) {
                    description += `<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">Actual results</span></div>`;
                    description += `<div>${fields.actualResults}</div>`;
                    description += '<div style="margin-bottom: 10px;"></div>';
                }

                if (fields.expectedResults) {
                    description += `<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">Expected results</span></div>`;
                    description += `<div>${fields.expectedResults}</div>`;
                }
            }

            return description;
        },
        // Add new onLoad function for SEDCUST to sync fields
        onLoad: function () {
            console.log("SEDCUST onLoad function executing");

            // First populate Application Name from product info
            populateApplicationName();

            // Function to sync XCODE and Resource Path fields
            function syncFields() {
                // Get the source fields from Subject section
                const xcodeField = document.getElementById('xcode');
                const resourcePathField = document.getElementById('resourcePath');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');

                // Get the target fields
                const pathField = document.getElementById('pathField');
                const xcodeInfoField = document.getElementById('xcodeInfo');
                const productImpactedField = document.getElementById('productImpacted');

                // Sync XCODE to xcodeInfo if both fields exist
                if (xcodeField && xcodeInfoField) {
                    xcodeInfoField.value = xcodeField.value;
                    console.log("Synced XCODE to Xcode field in user info section");
                }

                // Sync resourcePath to pathField if both fields exist
                if (resourcePathField && pathField) {
                    pathField.value = resourcePathField.value;
                    console.log("Synced Resource Path to Path field in steps to reproduce section");
                }

                // Sync application and version to productImpacted if the fields exist
                if (applicationField && productImpactedField) {
                    let productImpacted = applicationField.value || '';

                    // Add version if it exists
                    if (versionField && versionField.value) {
                        productImpacted += ` • ${versionField.value}`;
                    }

                    productImpactedField.value = productImpacted;
                    console.log(`Synced Application Name + Version to Application/Program Impacted field: ${productImpacted}`);
                }
            }

            // Set up event listeners for the source fields
            // Define xcode field first
            const xcodeField = document.getElementById('xcode');
            if (xcodeField) {
                xcodeField.addEventListener('input', syncFields);
                console.log("Added event listener to XCODE field");
            }

            const resourcePathField = document.getElementById('resourcePath');
            if (resourcePathField) {
                resourcePathField.addEventListener('input', syncFields);
                console.log("Added event listener to Resource Path field");
            }

            const applicationField = document.getElementById('application');
            if (applicationField) {
                applicationField.addEventListener('input', syncFields);
                console.log("Added event listener to Application Name field");
            }

            const versionField = document.getElementById('version');
            if (versionField) {
                versionField.addEventListener('change', syncFields);
                console.log("Added event listener to Version field");
            }

            // Add function to update subject line according to new format
            function updateSubjectLine() {
                // Define all field variables properly
                const xcodeField = document.getElementById('xcode');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const resourcePathField = document.getElementById('resourcePath');
                const specificIssueField = document.getElementById('specificIssue');
                const formattedSubjectField = document.getElementById('formattedSubject');
                const isVIPField = document.getElementById('isVIP');

                if (!xcodeField || !applicationField || !versionField || !resourcePathField || !specificIssueField || !formattedSubjectField) {
                    console.log("Missing required fields for subject formatting");
                    return;
                }

                const xcode = xcodeField.value || '';
                const application = applicationField.value || '';
                const version = versionField.value || '';
                const resourcePath = resourcePathField.value || '';
                const specificIssue = specificIssueField.value || '';

                // Check if this is a VIP customer
                let isVIP = false;
                if (isVIPField) {
                    isVIP = isVIPField.value === 'Yes';
                }

                // Format: "Xcode | VIP or Standard | Application Name • Version | Resource Path - Specific Issue"
                let subject = `${xcode} | `;

                // Add VIP status
                if (isVIP) {
                    subject += 'VIP | ';
                }

                // Add application and version
                subject += application;
                if (version) {
                    subject += ` • ${version}`;
                }

                // Add resource path and specific issue
                subject += ` | ${resourcePath} - ${specificIssue}`;

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners for subject line formatting
            document.getElementById('xcode')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('resourcePath')?.addEventListener('input', updateSubjectLine);
            document.getElementById('specificIssue')?.addEventListener('input', updateSubjectLine);
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);

            // Try to get the source ticket ID from localStorage
            let sourceTicketId = null;
            try {
                const ticketData = localStorage.getItem('ticketData');
                if (ticketData) {
                    const parsedData = JSON.parse(ticketData);
                    if (parsedData && parsedData.id) {
                        sourceTicketId = parsedData.id;
                        console.log(`Found source ticket ID: ${sourceTicketId}`);
                    }
                }
            } catch (error) {
                console.error("Error getting source ticket ID from localStorage:", error);
            }

            // Initial attempt to update subject line
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);

            // If we have a source ticket ID, add the tag
            if (sourceTicketId) {
                console.log(`Adding "ESCALATED TO ASSEMBLY" tag to source ticket ${sourceTicketId}`);

                // Function to update source ticket tags
                const updateSourceTicketTags = async () => {
                    try {
                        // First get the current ticket details to retrieve existing tags
                        const response = await client.request.invokeTemplate("getTicketDetails", {
                            context: { ticketId: sourceTicketId }
                        });

                        if (response && response.response) {
                            const ticketDetails = JSON.parse(response.response);

                            // Get existing tags and add the new one if it doesn't exist
                            let tags = ticketDetails.tags || [];

                            // Convert to array if it's not already
                            if (!Array.isArray(tags)) {
                                tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                            }

                            // Check if tag already exists
                            if (!tags.includes("ESCALATED TO ASSEMBLY")) {
                                tags.push("ESCALATED TO ASSEMBLY");

                                // Prepare data for update
                                const updateData = {
                                    tags: tags
                                };

                                try {
                                    // Use the updateTicket template instead of direct API call
                                    console.log(`Updating source ticket ${sourceTicketId} tags using updateTicket template`);
                                    await client.request.invokeTemplate("updateTicket", {
                                        context: {
                                            ticketId: sourceTicketId
                                        },
                                        body: JSON.stringify(updateData)
                                    });

                                    console.log("Source ticket successfully tagged with ESCALATED TO ASSEMBLY");

                                    // Add a private note about the escalation
                                    await client.request.invokeTemplate("addNoteToTicket", {
                                        context: {
                                            ticketId: sourceTicketId
                                        },
                                        body: JSON.stringify({
                                            body: "This ticket has been escalated to Assembly. An Assembly tracker ticket has been created.",
                                            private: true
                                        })
                                    });

                                    console.log("Private note added to source ticket");
                                } catch (error) {
                                    console.error("Error updating source ticket:", error);

                                    // Try to add at least a private note as fallback
                                    try {
                                        console.log("Attempting to add private note as fallback");
                                        await client.request.invokeTemplate("addNoteToTicket", {
                                            context: {
                                                ticketId: sourceTicketId
                                            },
                                            body: JSON.stringify({
                                                body: "This ticket has been escalated to Assembly. An Assembly tracker ticket has been created. (Note: Unable to add ESCALATED TO ASSEMBLY tag automatically)",
                                                private: true
                                            })
                                        });
                                        console.log("Private note added to source ticket as fallback");
                                    } catch (noteError) {
                                        console.error("Error adding private note:", noteError);
                                    }
                                }
                            } else {
                                console.log("Source ticket already has ESCALATED TO ASSEMBLY tag");
                            }
                        }
                    } catch (error) {
                        console.error("Error updating source ticket tags:", error);
                    }
                };

                // Execute the update
                updateSourceTicketTags();
            }
        }
    },

    // SIM Assignment
    "sim-assignment": {
        title: "SIM Assignment Tracker",
        icon: "fa-tasks",
        description: "For issues regarding assignment and/or eAssessment functionality",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "<a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP District List</a>"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    {
                        id: "districtState", type: "text", label: "District State", required: true,
                        hint: "Use 2-letter state abbreviation (e.g., NY, CA, TX)"
                    },
                    { id: "application", type: "text", label: "Application", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: true,
                        options: ["", "2.0", "2.5", "2.75", "3.0", "3.5", "Other"]
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ]
                    },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will be submitted as your ticket subject", readOnly: true }
                ]
            },
            {
                id: "issueDescription",
                title: "ISSUE DESCRIPTION",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueDetails", type: "richtext", label: "Specific details outlining user impact", required: true,
                        hint: "EX: Teacher is receiving a server error upon clicking \"Grade View\" for the Unit 3 Assessment (Gr. 2)"
                    },
                    {
                        id: "resourceXcode", type: "text", label: "Resource Xcode", required: true,
                        hint: "Provide the resource xcode. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720168' target='_blank'>How to Find a Resource Xcode</a>"
                    },
                    {
                        id: "resourceTitle", type: "text", label: "Resource Title", required: true,
                        hint: "Provide the title of the Resource"
                    }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "stepsToReproduce",
                        type: "richtext",
                        label: "The exact path taken by the user and yourself to get to the reported issue",
                        required: true,
                        placeholder: "EX:\n1. Log in as Teacher\n2. On Dashboard Click ORR"
                    }
                ]
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "username", type: "text", label: "Username", required: true, placeholder: "EX: mitzisheppard", hint: "Provide the users username at the district." },
                    {
                        id: "studentInternalId", type: "text", label: "Student Internal ID", required: true,
                        hint: "Provide the impacted students internal ID(s). <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>Locating a User's Internal ID</a>"
                    },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, hint: "Provide BURC Link to the affected teacher/administrator" },
                    { id: "device", type: "text", label: "Device", required: true, placeholder: "EX: Chromebook", hint: "Provide the device the users are on." },
                    {
                        id: "realm", type: "text", label: "Realm", required: true,
                        hint: "Provide the districts realm."
                    },
                    {
                        id: "assignmentId", type: "text", label: "Assignment ID", required: true,
                        placeholder: "EX: https://bec-micro.benchmarkuniverse.com/?#assignments/6727303",
                        hint: "Provide the assignment ID where the issue is prevalent. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720821' target='_blank'>Finding assignment ID</a>"
                    },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: true, hint: "Provide the date the user reported the issue. EX: 01/10/2023" },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR file attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "HAR files help identify browser network issues"
                    },
                    {
                        id: "harFileReason",
                        type: "text",
                        label: "Reason if HAR file not attached",
                        required: false
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS",
                icon: "fa-images",
                fields: [] // Empty array since we handle this in setupCustomFileUploaders
            },
            {
                id: "expectedResults",
                title: "EXPECTED RESULTS",
                icon: "fa-check-circle",
                fields: [
                    {
                        id: "expectedResults", type: "richtext", label: "Explain/Show how the system should be functioning if working correctly",
                        required: true, hint: "EX: All student's should appear in teacher list as completed and graded."
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // Issue Description
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DESCRIPTION</span></div>';
            if (fields.issueDetails) {
                description += `<div>${fields.issueDetails}</div>`;
            }
            description += `Resource xcode: ${fields.resourceXcode || ''}<br>`;
            description += `Resource title: ${fields.resourceTitle || ''}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            // Steps to Reproduce
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">STEPS TO REPRODUCE</span></div>';
            if (fields.stepsToReproduce) {
                description += `<div>${fields.stepsToReproduce}</div>`;
            } else {
                description += '<div><em>No steps to reproduce provided.</em></div>';
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Screenshots and Videos
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS and/or VIDEOS</span></div>';
            description += '<div>(please include URL in screen capture)</div>';
            description += '<div style="margin-bottom: 20px;"></div>';

            // Impacted User Info
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">IMPACTED USER INFO</span></div>';
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.role) description += `Role: ${fields.role || ''}<br>`;
            if (fields.studentInternalId) description += `Student Internal ID: ${fields.studentInternalId}<br>`;
            if (fields.BURCLink) description += `BURC Link: ${fields.BURCLink}<br>`;
            if (fields.device) description += `Device: ${fields.device}<br>`;
            if (fields.realm) description += `Realm: ${fields.realm}<br>`;
            if (fields.assignmentId) description += `Assignment ID: ${fields.assignmentId}<br>`;
            if (fields.dateReported) description += `Date Issue Reported: ${formatDate(fields.dateReported)}<br>`;
            if (fields.harFileAttached) {
                description += `HAR file attached: ${fields.harFileAttached}`;
                if (fields.harFileAttached === "No" && fields.harFileReason) {
                    description += ` (${fields.harFileReason})`;
                }
                description += '<br>';
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Expected Results
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">EXPECTED RESULTS</span></div>';
            if (fields.expectedResults) {
                description += `<div>${fields.expectedResults}</div>`;
            } else {
                description += '<div><em>No expected results provided.</em></div>';
            }

            return description;
        },
        // Add onLoad function to populate Application Name
        onLoad: function () {
            console.log("SIM Assignment Tracker onLoad function executing");

            // Call the helper functions to populate fields
            populateApplicationName();
            populateDistrictState();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
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
                const version = versionField.value || '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

                // Format per requirements: "VIP or Standard District Name • District State (Abv) | Application Name • Version | Specific issue for user role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} • ${districtState} | ${application}`;
                } else {
                    subject = `${districtName} • ${districtState} | ${application}`;
                }

                // Add version if provided
                if (version) {
                    subject += ` • ${version}`;
                }

                // Add specific issue and user role
                subject += ` | ${specificIssue}`;
                if (userRoleText) {
                    subject += ` for ${userRoleText}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('specificIssue')?.addEventListener('input', updateSubjectLine);

            // Add listeners to all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSubjectLine);
            });

            // Initial update attempt
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);
        }
    },

    // SIM Assessment Reports
    "sim-assessment-reports": {
        title: "SIM Assessment Reports Tracker",
        icon: "fa-chart-bar",
        description: "For issues regarding functionality of assessment reports",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "<a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP District List</a>"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    {
                        id: "districtState", type: "text", label: "District State", required: true,
                        hint: "Use 2-letter state abbreviation (e.g., NY, CA, TX)"
                    },
                    { id: "application", type: "text", label: "Application", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: true,
                        options: ["", "2.0", "2.5", "2.75", "3.0", "3.5", "Other"]
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ]
                    },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: true, hint: "This will be submitted as your ticket subject", readOnly: true }
                ]
            },
            {
                id: "issueDescription",
                title: "ISSUE DESCRIPTION",
                icon: "fa-exclamation-circle",
                fields: [
                    { id: "reportName", type: "text", label: "Name of impacted report", required: true },
                    {
                        id: "issueDetails",
                        type: "richtext",
                        label: "Specific details outlining user impact",
                        required: true,
                        hint: "EX: Teacher is receiving a server error upon clicking \"Grade View\" for the Unit 3 Assessment (Gr. 2)"
                    }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS / FILTERS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "stepsToReproduce",
                        type: "richtext",
                        label: "",
                        required: true,
                        placeholder: "EX:\n1. Log in as Teacher\n2. On Dashboard Click ORR"
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS and/or VIDEOS",
                icon: "fa-images",
                fields: [
                    {
                        id: "screenshotsDescription",
                        type: "richtext",
                        label: "(please include URL in screen capture)",
                        required: false
                    }
                ]
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "teacherName", type: "text", label: "Teacher/Admin Name", required: true },
                    { id: "username", type: "text", label: "Username", required: true, placeholder: "EX: mitzisheppard", hint: "Provide the users username at the district." },
                    {
                        id: "userRole",
                        type: "text",
                        label: "Role",
                        required: true,
                        hint: "Provide the users role at the district. EX: District Admin, School Admin, Teacher, Student"
                    },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, hint: "Provide BURC Link to the affected teacher/administrator" },
                    {
                        id: "realm", type: "text", label: "Realm", required: true,
                        hint: "Provide the districts realm."
                    },
                    { id: "browser", type: "text", label: "Browser", required: true },
                    {
                        id: "assessmentId", type: "text", label: "Assessment Assignment ID", required: true,
                        placeholder: "EX: https://bec-micro.benchmarkuniverse.com/?#assignments/6727303",
                        hint: "Provide the assignment ID where the issue is prevalent. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720821' target='_blank'>Finding assignment ID</a>"
                    },
                    { id: "assessmentUrl", type: "text", label: "Assessment Assignment URL", required: true },
                    { id: "dateTaken", type: "date", label: "Date test was taken", required: true },
                    { id: "dateGraded", type: "date", label: "Date test was graded", required: true },
                    { id: "className", type: "text", label: "Impacted Class Name", required: true },
                    { id: "classLink", type: "text", label: "Impacted Class BURC Link", required: true },
                    {
                        id: "studentIds", type: "text", label: "Impacted Student(s) Internal ID(s)", required: true,
                        hint: "<a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>How to Locate a User's Internal ID</a>"
                    },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: true, hint: "Provide the date the user reported the issue. EX: 01/10/2023" },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR file attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "HAR files help identify browser network issues"
                    },
                    {
                        id: "harFileReason",
                        type: "text",
                        label: "Reason if HAR file not attached",
                        required: false
                    }
                ]
            },
            {
                id: "expectedResults",
                title: "EXPECTED RESULTS",
                icon: "fa-check-circle",
                fields: [
                    {
                        id: "expectedResults",
                        type: "richtext",
                        label: "",
                        required: true
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // Issue Description
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DESCRIPTION</span></div>';
            description += `Name of impacted report: ${fields.reportName || ''}<br>`;
            if (fields.issueDetails) {
                description += `<div>Specific details outlining user impact:</div>`;
                description += `<div>${fields.issueDetails}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Steps to Reproduce
            if (fields.stepsToReproduce) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">STEPS / FILTERS TO REPRODUCE</span></div>';
                description += `<div>${fields.stepsToReproduce}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Screenshots and Videos
            if (fields.screenshotsDescription) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS and/or VIDEOS</span></div>';
                description += `<div>${fields.screenshotsDescription}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Impacted User Info
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">IMPACTED USER INFO</span></div>';
            if (fields.teacherName) description += `Teacher/Admin Name: ${fields.teacherName}<br>`;
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.userRole) description += `Role: ${fields.userRole}<br>`;

            // Process BURC Link as hyperlink
            if (fields.BURCLink) {
                let techLink = fields.BURCLink.trim();
                if (!techLink.startsWith('http://') && !techLink.startsWith('https://')) {
                    techLink = 'https://' + techLink;
                }
                description += `BURC Link: <a href="${techLink}" target="_blank">${fields.BURCLink}</a><br>`;
            }

            if (fields.realm) description += `Realm: ${fields.realm}<br>`;
            if (fields.browser) description += `Browser: ${fields.browser}<br>`;
            if (fields.assessmentId) description += `Assessment Assignment ID: ${fields.assessmentId}<br>`;

            // Process Assessment URL as hyperlink
            if (fields.assessmentUrl) {
                let assessmentLink = fields.assessmentUrl.trim();
                if (!assessmentLink.startsWith('http://') && !assessmentLink.startsWith('https://')) {
                    assessmentLink = 'https://' + assessmentLink;
                }
                description += `Assessment Assignment URL: <a href="${assessmentLink}" target="_blank">${fields.assessmentUrl}</a><br>`;
            }

            if (fields.dateTaken) description += `Date test was taken: ${formatDate(fields.dateTaken)}<br>`;
            if (fields.dateGraded) description += `Date test was graded: ${formatDate(fields.dateGraded)}<br>`;
            if (fields.className) description += `Impacted Class Name: ${fields.className}<br>`;

            // Process Class BURC Link as hyperlink
            if (fields.classLink) {
                let classAdminLink = fields.classLink.trim();
                if (!classAdminLink.startsWith('http://') && !classAdminLink.startsWith('https://')) {
                    classAdminLink = 'https://' + classAdminLink;
                }
                description += `Impacted Class BURC Link: <a href="${classAdminLink}" target="_blank">${fields.classLink}</a><br>`;
            }

            if (fields.studentIds) description += `Impacted Student(s) Internal ID(s): ${fields.studentIds}<br><br>`;
            if (fields.dateReported) description += `Date Issue Reported: ${formatDate(fields.dateReported)}<br>`;
            if (fields.harFileAttached) {
                description += `HAR file attached: ${fields.harFileAttached}`;
                if (fields.harFileAttached === "No" && fields.harFileReason) {
                    description += ` (${fields.harFileReason})`;
                }
                description += '<br>';
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Expected Results
            if (fields.expectedResults) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">EXPECTED RESULTS</span></div>';
                description += `<div>${fields.expectedResults}</div>`;
            }

            return description;
        },
        // Add onLoad function to populate Application Name
        onLoad: function () {
            console.log("SIM Assessment Reports Tracker onLoad function executing");

            // Call the helper functions to populate fields
            populateApplicationName();
            populateDistrictState();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
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
                const version = versionField.value || '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

                // Format per requirements: "VIP or Standard District Name • District State (Abv) | Application Name • Version | Specific issue for user role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} • ${districtState} | ${application}`;
                } else {
                    subject = `${districtName} • ${districtState} | ${application}`;
                }

                // Add version if provided
                if (version) {
                    subject += ` • ${version}`;
                }

                // Add specific issue and user role
                subject += ` | ${specificIssue}`;
                if (userRoleText) {
                    subject += ` for ${userRoleText}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('specificIssue')?.addEventListener('input', updateSubjectLine);

            // Add listeners to all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSubjectLine);
            });

            // Initial update attempt
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);
        }
    },

    // SIM Achievement Levels
    "sim-achievement-levels": {
        title: "SIM Achievement Levels Tracker",
        icon: "fa-trophy",
        description: "For issues regarding SIM achievement levels and benchmarks",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    // Remove the isVIP and districtName fields, keep only formattedSubject
                    { id: "formattedSubject", type: "text", label: "Subject", required: false, hint: "This will be submitted as your ticket subject", readOnly: true }
                ]
            },
            {
                id: "summary",
                title: "SUMMARY",
                icon: "fa-file-alt",
                fields: [
                    {
                        id: "summaryContent", type: "richtext", label: "Include name of school district that is requesting customized achievement levels", required: true,
                        hint: "EX. Jersey City Public School district is requesting customized achievement levels."
                    }
                ]
            },
            {
                id: "userDetails",
                title: "DESCRIPTION",
                icon: "fa-clipboard-list",
                fields: [
                    {
                        id: "username", type: "text", label: "Username", required: true,
                        hint: "Provide the username of the user requesting the customized achievement levels"
                    },
                    {
                        id: "userRole", type: "text", label: "Role", required: true,
                        hint: "Provide the role they have within Benchmark Universe (user must have a district admin. role)"
                    },
                    {
                        id: "realm", type: "text", label: "Realm (BURC Link)", required: true,
                        hint: "Provide BURC Link to the District realm"
                    },
                    {
                        id: "districtName", type: "text", label: "District Name", required: true,
                        hint: "Provide the name of the district"
                    },
                    {
                        id: "districtState", type: "text", label: "District State", required: true,
                        hint: "State where the district is located"
                    },
                    {
                        id: "dateRequested", type: "date", label: "Date Requested By Customer", required: true,
                        hint: "Provide the date the user requested the custom achievement levels"
                    }
                ]
            },
            {
                id: "attachments",
                title: "ATTACH SMARTSHEET TO TRACKER",
                icon: "fa-paperclip",
                fields: [
                    // Remove the info field and keep only the file upload field
                    // This will be handled by setupSmartsheetUploader which creates the proper UI
                    { id: "dummyField", type: "hidden" } // Just a placeholder field
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // Add summary section
            if (fields.summaryContent) {
                description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SUMMARY</span></div>';
                description += `<div>${fields.summaryContent || ''}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Add description with user details
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">DESCRIPTION</span></div>';
            description += `Username: ${fields.username || ''}<br>`;
            description += `Role: ${fields.userRole || ''}<br>`;
            description += `Realm (BURC Link): ${fields.realm || ''}<br>`;
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `District State: ${fields.districtState || ''}<br>`;
            description += `Date Requested By Customer: ${formatDate(fields.dateRequested) || ''}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            // Replace ATTACHMENTS section title with the requested text in bold blue
            description += '<div><strong style="color: #0000FF;">See smartsheet for specifications of achievement levels.</strong></div>';

            // Add content from Quill editor if available
            if (fields.smartsheetNotes && fields.smartsheetNotes.trim() !== '<p><br></p>') {
                description += `<div>${fields.smartsheetNotes}</div>`;
            }

            return description;
        }
    },

    // 4. SIM FSA
    "sim-fsa": {
        title: "SIM FSA Tracker",
        icon: "fa-check-circle",
        description: "For issues regarding SIM Formative Student Assessment functionality",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "<a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP District List</a>"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    {
                        id: "districtState", type: "text", label: "District State", required: true,
                        hint: "Use 2-letter state abbreviation (e.g., NY, CA, TX)"
                    },
                    { id: "application", type: "text", label: "Application", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: true,
                        options: ["", "2.0", "2.5", "2.75", "3.0", "3.5", "Other"]
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ]
                    },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: true, hint: "This will be submitted as your ticket subject", readOnly: true }
                ]
            },
            {
                id: "issueDescription",
                title: "ISSUE DESCRIPTION",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueDetails",
                        type: "richtext",
                        label: "Specific Issue Details",
                        required: true,
                        hint: "EX: Teacher is receiving a server error upon clicking \"Grade View\" for the Unit 3 Assessment (Gr. 2)"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "districtBURCLink", type: "text", label: "District BURC Link", required: true, hint: "Provide BURC Link to the district" },
                    { id: "schoolName", type: "text", label: "School Name", required: true },
                    { id: "schoolBURCLink", type: "text", label: "School BURC Link", required: true, hint: "Provide BURC Link to the school" }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "stepsToReproduce",
                        type: "richtext",
                        label: "The exact path taken by the user and yourself to get to the reported issue",
                        required: true,
                        placeholder: "EX:\n1. Log in as Teacher\n2. On Dashboard Click ORR"
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS and/or VIDEOS",
                icon: "fa-images",
                fields: [
                    {
                        id: "screenshotsDescription",
                        type: "richtext",
                        label: "(please include URL in screen capture)",
                        required: false
                    }
                ]
            },
            {
                id: "userInfo",
                title: "IMPACTED TEACHER INFO",
                icon: "fa-user",
                fields: [
                    { id: "username", type: "text", label: "Username", required: true, placeholder: "EX: mitzisheppard", hint: "Provide the users username at the district." },
                    { id: "name", type: "text", label: "Name", required: true },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, hint: "Provide BURC Link to the affected teacher/administrator" },
                    { id: "administrationUrl", type: "text", label: "Administration URL", required: true },
                    { id: "device", type: "text", label: "Device", required: true, placeholder: "EX: Chromebook", hint: "Provide the device the users are on." },
                    {
                        id: "studentInternalId", type: "text", label: "Student Internal ID", required: true,
                        hint: "Provide the impacted students internal ID(s). <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>Locating a User's Internal ID</a>"
                    },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: true, hint: "Provide the date the user reported the issue. EX: 01/10/2023" },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR file attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "HAR files help identify browser network issues"
                    },
                    {
                        id: "harFileReason",
                        type: "text",
                        label: "Reason if HAR file not attached",
                        required: false,
                        condition: {
                            field: "harFileAttached",
                            value: "No"
                        }
                    }
                ]
            },
            {
                id: "expectedResults",
                title: "EXPECTED RESULTS",
                icon: "fa-check-circle",
                fields: [
                    {
                        id: "expectedResults",
                        type: "richtext",
                        label: "Explain/Show how the system should be functioning if working correctly",
                        required: true
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // Issue Description
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DESCRIPTION</span></div>';
            if (fields.issueDetails) {
                description += `<div>${fields.issueDetails}</div>`;
                description += '<div style="margin-bottom: 10px;"></div>';
            }
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `District BURC Link: ${fields.districtBURCLink || ''}<br>`;
            if (fields.schoolName) description += `School Name: ${fields.schoolName}<br>`;
            if (fields.schoolBURCLink) description += `School BURC Link: ${fields.schoolBURCLink}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            // Steps to Reproduce
            if (fields.stepsToReproduce) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">STEPS TO REPRODUCE</span></div>';
                description += `<div>${fields.stepsToReproduce}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Screenshots and Videos
            if (fields.screenshotsDescription) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS & SUPPORTING MATERIALS</span></div>';
                description += `<div>${fields.screenshotsDescription}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Impacted Teacher Info
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">IMPACTED TEACHER INFO</span></div>';
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.name) description += `Name: ${fields.name}<br>`;
            if (fields.BURCLink) {
                let techLink = fields.BURCLink.trim();
                if (!techLink.startsWith('http://') && !techLink.startsWith('https://')) {
                    techLink = 'https://' + techLink;
                }
                description += `BURC Link: <a href="${techLink}" target="_blank">${fields.BURCLink}</a><br>`;
            }
            if (fields.administrationUrl) {
                let adminUrl = fields.administrationUrl.trim();
                if (!adminUrl.startsWith('http://') && !adminUrl.startsWith('https://')) {
                    adminUrl = 'https://' + adminUrl;
                }
                description += `Administration URL: <a href="${adminUrl}" target="_blank">${fields.administrationUrl}</a><br>`;
            }
            if (fields.device) description += `Device: ${fields.device}<br>`;
            if (fields.studentInternalId) description += `Student Internal ID: ${fields.studentInternalId}<br>`;
            if (fields.dateReported) description += `Date Issue Reported: ${formatDate(fields.dateReported)}<br>`;
            if (fields.harFileAttached) {
                description += `HAR file attached: ${fields.harFileAttached}`;
                if (fields.harFileAttached === "No" && fields.harFileReason) {
                    description += ` (${fields.harFileReason})`;
                }
                description += '<br>';
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Expected Results
            if (fields.expectedResults) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">EXPECTED RESULTS</span></div>';
                description += `<div>${fields.expectedResults}</div>`;
            }

            return description;
        },
        // Add onLoad function to populate Application Name
        onLoad: function () {
            console.log("SIM FSA Tracker onLoad function executing");

            // Call the helper functions to populate fields
            populateApplicationName();
            populateDistrictState();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
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
                const version = versionField.value || '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

                // Format per requirements: "VIP or Standard District Name • District State (Abv) | Application Name • Version | Specific issue for user role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} • ${districtState} | ${application}`;
                } else {
                    subject = `${districtName} • ${districtState} | ${application}`;
                }

                // Add version if provided
                if (version) {
                    subject += ` • ${version}`;
                }

                // Add specific issue and user role
                subject += ` | ${specificIssue}`;
                if (userRoleText) {
                    subject += ` for ${userRoleText}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('specificIssue')?.addEventListener('input', updateSubjectLine);

            // Add listeners to all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSubjectLine);
            });

            // Initial update attempt
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);
        }
    },

    // 5. SIM Library View
    "sim-library-view": {
        title: "SIM Library View Tracker",
        icon: "fa-book-open",
        description: "For issues regarding functionality in the resource library",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "<a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP District List</a>"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    {
                        id: "districtState", type: "text", label: "District State", required: true,
                        hint: "Use 2-letter state abbreviation (e.g., NY, CA, TX)"
                    },
                    { id: "application", type: "text", label: "Application", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: true,
                        options: ["", "2.0", "2.5", "2.75", "3.0", "3.5", "Other"]
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ]
                    },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will be submitted as your ticket subject", readOnly: true }
                ]
            },
            {
                id: "issueDescription",
                title: "ISSUE DESCRIPTION",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "resourceXcode", type: "text", label: "Resource xcode", required: true,
                        hint: "Provide the resource xcode. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720168' target='_blank'>How to Find a Resource Xcode</a>"
                    },
                    { id: "resourceTitle", type: "text", label: "Resource title", required: true, hint: "Provide the title of the Resource" },
                    { id: "pathFilters", type: "text", label: "Path/Filters", required: true, hint: "EX: Teacher dashboard > Assignments > Unit 3 Assessment (Gr. 2)" },
                    {
                        id: "issueDetails",
                        type: "richtext",
                        label: "Specific details outlining user impact",
                        required: true,
                        hint: "EX: Teacher is receiving a server error upon clicking \"Grade View\" for the Unit 3 Assessment (Gr. 2)"
                    }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "stepsToReproduce",
                        type: "richtext",
                        label: "The exact path taken by the user and yourself to get to the reported issue",
                        required: true,
                        placeholder: "EX:\n1. Log in as Teacher\n2. On Dashboard Click ORR"
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS",
                icon: "fa-images",
                fields: [] // Empty array since we handle this in setupCustomFileUploaders
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "username", type: "text", label: "Username", required: true, placeholder: "EX: mitzisheppard", hint: "Provide the users username at the district." },
                    {
                        id: "role", type: "text", label: "Role", required: true,
                        hint: "Provide the users role at the district. EX: District Admin, School Admin, Teacher, Student"
                    },
                    {
                        id: "studentInternalId", type: "text", label: "Student Internal ID", required: true,
                        hint: "Provide the impacted students internal ID(s). <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>Locating a User's Internal ID</a>"
                    },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, hint: "Provide BURC Link to the affected teacher/administrator" },
                    { id: "device", type: "text", label: "Device", required: true, placeholder: "EX: Chromebook", hint: "Provide the device the users are on." },
                    {
                        id: "realm", type: "text", label: "Realm", required: true,
                        hint: "Provide the districts realm."
                    },
                    {
                        id: "assignmentId", type: "text", label: "Assignment ID", required: true,
                        placeholder: "EX: https://bec-micro.benchmarkuniverse.com/?#assignments/6727303",
                        hint: "Provide the assignment ID where the issue is prevalent. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720821' target='_blank'>Finding assignment ID</a>"
                    },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: true, hint: "Provide the date the user reported the issue. EX: 01/10/2023" },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR file attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "HAR files help identify browser network issues"
                    },
                    {
                        id: "harFileReason",
                        type: "text",
                        label: "Reason if HAR file not attached",
                        required: false,
                        condition: {
                            field: "harFileAttached",
                            value: "No"
                        }
                    }
                ]
            },
            {
                id: "expectedResults",
                title: "EXPECTED RESULTS",
                icon: "fa-check-circle",
                fields: [
                    {
                        id: "expectedResults",
                        type: "richtext",
                        label: "Explain/Show how the system should be functioning if working correctly",
                        required: true
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // Issue Description
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DESCRIPTION</span></div>';
            description += `Resource xcode: ${fields.resourceXcode || ''}<br>`;
            description += `Resource title: ${fields.resourceTitle || ''}<br>`;
            description += `Path/Filters: ${fields.pathFilters || ''}<br>`;
            if (fields.issueDetails) {
                description += `<div>${fields.issueDetails}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Steps to Reproduce
            if (fields.stepsToReproduce) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">STEPS TO REPRODUCE</span></div>';
                description += `<div>${fields.stepsToReproduce}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Screenshots and Videos
            if (fields.screenshotsDescription) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS & SUPPORTING MATERIALS</span></div>';
                description += `<div>${fields.screenshotsDescription}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Impacted User Info
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">IMPACTED USER INFO</span></div>';
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.role) description += `Role: ${fields.role}<br>`;
            if (fields.studentInternalId) description += `Student Internal ID: ${fields.studentInternalId}<br>`;
            if (fields.BURCLink) {
                let techLink = fields.BURCLink.trim();
                if (!techLink.startsWith('http://') && !techLink.startsWith('https://')) {
                    techLink = 'https://' + techLink;
                }
                description += `BURC Link: <a href="${techLink}" target="_blank">${fields.BURCLink}</a><br>`;
            }
            if (fields.device) description += `Device: ${fields.device}<br>`;
            if (fields.realm) description += `Realm: ${fields.realm}<br>`;
            if (fields.assignmentId) description += `Assignment ID: ${fields.assignmentId}<br>`;
            if (fields.dateReported) description += `Date Issue Reported: ${formatDate(fields.dateReported)}<br>`;
            if (fields.harFileAttached) {
                description += `HAR file attached: ${fields.harFileAttached}`;
                if (fields.harFileAttached === "No" && fields.harFileReason) {
                    description += ` (${fields.harFileReason})`;
                }
                description += '<br>';
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Expected Results
            if (fields.expectedResults) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">EXPECTED RESULTS</span></div>';
                description += `<div>${fields.expectedResults}</div>`;
            }

            return description;
        },
        // Add onLoad function to populate Application Name
        onLoad: function () {
            console.log("SIM Library View Tracker onLoad function executing");

            // Call the helper functions to populate fields
            populateApplicationName();
            populateDistrictState();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
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
                const version = versionField.value || '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

                // Format per requirements: "VIP or Standard District Name • District State (Abv) | Application Name • Version | Specific issue for user role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} • ${districtState} | ${application}`;
                } else {
                    subject = `${districtName} • ${districtState} | ${application}`;
                }

                // Add version if provided
                if (version) {
                    subject += ` • ${version}`;
                }

                // Add specific issue and user role
                subject += ` | ${specificIssue}`;
                if (userRoleText) {
                    subject += ` for ${userRoleText}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('specificIssue')?.addEventListener('input', updateSubjectLine);

            // Add listeners to all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSubjectLine);
            });

            // Initial update attempt
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);
        }
    },

    // 6. SIM ORR
    "sim-orr": {
        title: "SIM ORR Tracker",
        icon: "fa-file-signature",
        description: "For issues regarding functionality of oral reading records (ORR)",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "<a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP District List</a>"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    {
                        id: "districtState", type: "text", label: "District State", required: true,
                        hint: "Use 2-letter state abbreviation (e.g., NY, CA, TX)"
                    },
                    { id: "application", type: "text", label: "Application", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: true,
                        options: ["", "2.0", "2.5", "2.75", "3.0", "3.5", "Other"]
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ]
                    },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will be submitted as your ticket subject", readOnly: true }
                ]
            },
            {
                id: "issueDescription",
                title: "ISSUE DESCRIPTION",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueDetails",
                        type: "richtext",
                        label: "Specific details outlining user impact",
                        required: true,
                        hint: "EX: teacher administered ORR but it is not appearing"
                    }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "stepsToReproduce",
                        type: "richtext",
                        label: "The exact path taken by the user and yourself to get to the reported issue",
                        required: true,
                        placeholder: "EX:\n1. Log in as Teacher\n2. On Dashboard Click ORR"
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS",
                icon: "fa-images",
                fields: [] // Empty array since we handle this in setupCustomFileUploaders
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "username", type: "text", label: "Username", required: true, placeholder: "EX: mitzisheppard", hint: "Provide the users username at the district." },
                    {
                        id: "role", type: "text", label: "Role", required: true,
                        hint: "Provide the users role at the district. EX: District Admin, School Admin, Teacher, Student"
                    },
                    {
                        id: "studentInternalId", type: "text", label: "Student Internal ID", required: true,
                        hint: "Provide the impacted students internal ID(s). <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>Locating a User's Internal ID</a>"
                    },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, hint: "Provide BURC Link to the affected teacher/administrator" },
                    { id: "device", type: "text", label: "Device", required: true, placeholder: "EX: Chromebook", hint: "Provide the device the users are on." },
                    {
                        id: "realm", type: "text", label: "Realm", required: true,
                        hint: "Provide the districts realm."
                    },
                    {
                        id: "assignmentId", type: "text", label: "Assignment ID", required: true,
                        placeholder: "EX: https://bec-micro.benchmarkuniverse.com/?#assignments/6727303",
                        hint: "Provide the assignment ID where the issue is prevalent. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720821' target='_blank'>Finding assignment ID</a>"
                    },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: true, hint: "Provide the date the user reported the issue. EX: 01/10/2023" },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR file attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "HAR files help identify browser network issues"
                    },
                    {
                        id: "harFileReason",
                        type: "text",
                        label: "Reason if HAR file not attached",
                        required: false,
                        condition: {
                            field: "harFileAttached",
                            value: "No"
                        }
                    }
                ]
            },
            {
                id: "expectedResults",
                title: "EXPECTED RESULTS",
                icon: "fa-check-circle",
                fields: [
                    {
                        id: "expectedResults",
                        type: "richtext",
                        label: "Explain/Show how the system should be functioning if working correctly",
                        required: true
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // Issue Description
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DESCRIPTION</span></div>';
            description += `<div>${fields.issueDetails}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            // Steps to Reproduce
            if (fields.stepsToReproduce) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">STEPS TO REPRODUCE</span></div>';
                description += `<div>${fields.stepsToReproduce}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Screenshots and Videos
            if (fields.screenshotsDescription) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS & SUPPORTING MATERIALS</span></div>';
                description += `<div>${fields.screenshotsDescription}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Impacted User Info
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">IMPACTED USER INFO</span></div>';
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.role) description += `Role: ${fields.role}<br>`;
            if (fields.studentInternalId) description += `Student Internal ID: ${fields.studentInternalId}<br>`;

            // Handle BURC Link as a hyperlink
            if (fields.BURCLink) {
                let techLink = fields.BURCLink.trim();
                if (!techLink.startsWith('http://') && !techLink.startsWith('https://')) {
                    techLink = 'https://' + techLink;
                }
                description += `BURC Link: <a href="${techLink}" target="_blank">${fields.BURCLink}</a><br>`;
            }

            // Handle Tech Admin Link as a hyperlink
            if (fields.techAdminLink) {
                let adminLink = fields.techAdminLink.trim();
                if (!adminLink.startsWith('http://') && !adminLink.startsWith('https://')) {
                    adminLink = 'https://' + adminLink;
                }
                description += `Tech Admin: <a href="${adminLink}" target="_blank">${fields.techAdminLink}</a><br>`;
            }

            if (fields.device) description += `Device: ${fields.device}<br>`;
            if (fields.realm) description += `Realm: ${fields.realm}<br>`;
            if (fields.assignmentId) description += `Assignment ID: ${fields.assignmentId}<br>`;
            if (fields.dateReported) description += `Date Issue Reported: ${formatDate(fields.dateReported) || ''}<br>`;
            if (fields.harFileAttached) {
                description += `HAR file attached: ${fields.harFileAttached}`;
                if (fields.harFileAttached === "No" && fields.harFileReason) {
                    description += ` (${fields.harFileReason})`;
                }
                description += '<br>';
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Expected Results
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">EXPECTED RESULTS</span></div>';
            description += `<div>${fields.expectedResults}</div>`;

            return description;
        },


        // Add onLoad function to populate Application Name
        onLoad: function () {
            console.log("SIM ORR Tracker onLoad function executing");

            // Call the helper functions to populate fields
            populateApplicationName();
            populateDistrictState();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
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
                const version = versionField.value || '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

                // Format per requirements: "VIP or Standard District Name • District State (Abv) | Application Name • Version | Specific issue for user role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} • ${districtState} | ${application}`;
                } else {
                    subject = `${districtName} • ${districtState} | ${application}`;
                }

                // Add version if provided
                if (version) {
                    subject += ` • ${version}`;
                }

                // Add specific issue and user role
                subject += ` | ${specificIssue}`;
                if (userRoleText) {
                    subject += ` for ${userRoleText}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('specificIssue')?.addEventListener('input', updateSubjectLine);

            // Add listeners to all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSubjectLine);
            });

            // Initial update attempt
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);

            setupHarFileCondition();
        }
    },

    // 7. SIM Plan & Teach
    "sim-plan-teach": {
        title: "SIM Plan & Teach Tracker",
        icon: "fa-chalkboard-teacher",
        description: "For issues regarding the functionality of the Plan & Teach Tool",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "<a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP District List</a>"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    {
                        id: "districtState", type: "text", label: "District State", required: true,
                        hint: "Use 2-letter state abbreviation (e.g., NY, CA, TX)"
                    },
                    { id: "application", type: "text", label: "Application", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: true,
                        options: ["", "2.0", "2.5", "2.75", "3.0", "3.5", "Other"]
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ]
                    },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will be submitted as your ticket subject", readOnly: true }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DESCRIPTION",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueDescription",
                        type: "richtext",
                        label: "Issue Description: Specific details outlining user impact.",
                        hint: "EX: Teacher is receiving a server error upon clicking \"Grade View\" for the Unit 3 Assessment (Gr. 2)",
                        required: true
                    }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "stepsToReproduce",
                        type: "richtext",
                        label: "Steps to Reproduce",
                        required: true,
                        placeholder: "EX:\n1. Log in as Teacher\n2. On Dashboard Click ORR",
                        hint: "The exact path taken by the user and yourself to get to the reported issue"
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS",
                icon: "fa-images",
                fields: [] // Empty array since we handle this in setupCustomFileUploaders
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "username", type: "text", label: "Username", required: true, placeholder: "EX: mitzisheppard", hint: "Provide the users username at the district." },
                    {
                        id: "role", type: "text", label: "Role", required: true,
                        hint: "Provide the users role at the district. EX: District Admin, School Admin, Teacher, Student"
                    },
                    {
                        id: "studentInternalID", type: "text", label: "Student Internal ID", required: true,
                        hint: "Provide the impacted students internal ID(s). <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>Locating a User's Internal ID</a>"
                    },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, hint: "Provide BURC Link to the affected teacher/administrator" },
                    { id: "device", type: "text", label: "Device", required: true, placeholder: "EX: Chromebook", hint: "Provide the device the users are on." },
                    {
                        id: "realm", type: "text", label: "Realm", required: true,
                        hint: "Provide the districts realm."
                    },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: true, hint: "Provide the date the user reported the issue. EX: 01/10/2023" },
                    { id: "subscriptions", type: "text", label: "List of District Subscriptions", required: true },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR file attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "HAR files help identify browser network issues"
                    },
                    {
                        id: "harFileReason",
                        type: "text",
                        label: "Reason if HAR file not attached",
                        required: false,
                        condition: {
                            field: "harFileAttached",
                            value: "No"
                        }
                    }
                ]
            },
            {
                id: "expectedResults",
                title: "EXPECTED RESULTS",
                icon: "fa-check-circle",
                fields: [
                    {
                        id: "expectedResults",
                        type: "richtext",
                        label: "Explain/Show how the system should be functioning if working correctly",
                        required: true
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            // Removed: description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SIM PLAN & TEACH ISSUE</span></div>';

            // Issue Description
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DESCRIPTION</span></div>';
            if (fields.issueDescription) {
                description += `<div>${fields.issueDescription}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Steps to Reproduce
            if (fields.stepsToReproduce) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">STEPS TO REPRODUCE</span></div>';
                description += `<div>${fields.stepsToReproduce}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Screenshots and Videos
            if (fields.screenshotsDescription) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS & SUPPORTING MATERIALS</span></div>';
                description += `<div>${fields.screenshotsDescription}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Impacted User Info
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">IMPACTED USER INFO</span></div>';
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.role) description += `Role: ${fields.role}<br>`;
            if (fields.studentInternalID) description += `Student Internal ID: ${fields.studentInternalID}<br>`;

            // Handle BURC Link as a hyperlink
            if (fields.BURCLink) {
                let techLink = fields.BURCLink.trim();
                if (!techLink.startsWith('http://') && !techLink.startsWith('https://')) {
                    techLink = 'https://' + techLink;
                }
                description += `BURC Link: <a href="${techLink}" target="_blank">${fields.BURCLink}</a><br>`;
            }

            if (fields.device) description += `Device: ${fields.device}<br>`;
            if (fields.realm) description += `Realm: ${fields.realm}<br>`;
            if (fields.dateReported) description += `Date Issue Reported: ${formatDate(fields.dateReported) || ''}<br>`;
            if (fields.subscriptions) description += `List of District Subscriptions: ${fields.subscriptions}<br>`;
            if (fields.harFileAttached) {
                description += `HAR file attached: ${fields.harFileAttached}`;
                if (fields.harFileAttached === "No" && fields.harFileReason) {
                    description += ` (${fields.harFileReason})`;
                }
                description += '<br>';
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Expected Results
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">EXPECTED RESULTS</span></div>';
            description += `<div>${fields.expectedResults}</div>`;

            return description;
        },

        // Add onLoad function for dynamic subject line formatting
        onLoad: function () {
            console.log("SIM Plan & Teach onLoad function executing");

            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
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
                // districtState variable removed (unused)
                const application = applicationField.value || '';
                // version variable removed (unused)
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(', ') : '';

                // Format: "VIP * District Name | Application - Specific Issue for User Role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} | ${application} - ${specificIssue} for ${userRoleText}`;
                } else {
                    subject = `${districtName} | ${application} - ${specificIssue} for ${userRoleText}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('specificIssue')?.addEventListener('input', updateSubjectLine);

            // Add listeners to all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSubjectLine);
            });

            // Initial update attempt
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);
        },
        // Add onLoad function to populate Application Name
        onLoad: function () {
            console.log("SIM Plan & Teach Tracker onLoad function executing");

            // Call the helper functions to populate fields
            populateApplicationName();
            populateDistrictState();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
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
                const version = versionField.value || '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

                // Format per requirements: "VIP or Standard District Name • District State (Abv) | Application Name • Version | Specific issue for user role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} • ${districtState} | ${application}`;
                } else {
                    subject = `${districtName} • ${districtState} | ${application}`;
                }

                // Add version if provided
                if (version) {
                    subject += ` • ${version}`;
                }

                // Add specific issue and user role
                subject += ` | ${specificIssue}`;
                if (userRoleText) {
                    subject += ` for ${userRoleText}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('specificIssue')?.addEventListener('input', updateSubjectLine);

            // Add listeners to all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSubjectLine);
            });

            // Initial update attempt
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);
        }
    },

    // 8. SIM Reading Log
    "sim-reading-log": {
        title: "SIM Reading Log Tracker",
        icon: "fa-book-reader",
        description: "For issues regarding Reading Log functionality",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "<a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP District List</a>"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    {
                        id: "districtState", type: "text", label: "District State", required: true,
                        hint: "Use 2-letter state abbreviation (e.g., NY, CA, TX)"
                    },
                    { id: "application", type: "text", label: "Application", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: true,
                        options: ["", "2.0", "2.5", "2.75", "3.0", "3.5", "Other"]
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ]
                    },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will be submitted as your ticket subject", readOnly: true }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DESCRIPTION",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueDescription",
                        type: "richtext",
                        label: "Issue Description: Specific details outlining user impact:",
                        hint: "EX: A book has a 5 star rating, however my student has not been assigned this book.",
                        required: true
                    }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "stepsToReproduce",
                        type: "richtext",
                        label: "Steps to Reproduce",
                        required: true,
                        placeholder: "EX: Teacher dashboard > Assignments > Unit 3 Assessment (Gr. 2)",
                        hint: "The exact path taken by the user and yourself to get to the reported issue"
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS",
                icon: "fa-images",
                fields: [] // Empty array since we handle this in setupCustomFileUploaders
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "username", type: "text", label: "Username", required: true, placeholder: "EX: mitzisheppard", hint: "Provide the users username at the district." },
                    {
                        id: "role", type: "text", label: "Role", required: true,
                        hint: "Provide the users role at the district. EX: District Admin, School Admin, Teacher, Student"
                    },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, hint: "Provide BURC Link to the affected teacher/administrator" },
                    { id: "className", type: "text", label: "Class Name", required: true },
                    { id: "classBURCLink", type: "text", label: "Class BURC Link", required: true, hint: "Provide BURC Link to the class" },
                    {
                        id: "studentInternalID", type: "text", label: "Student Internal ID", required: true,
                        hint: "Provide the impacted students internal ID(s). <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>Locating a User's Internal ID</a>"
                    },
                    { id: "device", type: "text", label: "Device", required: true, placeholder: "EX: Chromebook", hint: "Provide the device the users are on." },
                    {
                        id: "realm", type: "text", label: "Realm", required: true,
                        hint: "Provide the districts realm."
                    },
                    {
                        id: "assignmentID", type: "text", label: "Assignment ID", required: true,
                        placeholder: "EX: https://bec-micro.benchmarkuniverse.com/?#assignments/6727303",
                        hint: "Provide the assignment ID where the issue is prevalent. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720821' target='_blank'>Finding assignment ID</a>"
                    },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: true, hint: "Provide the date the user reported the issue. EX: 01/10/2023" },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR file attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "HAR files help identify browser network issues"
                    },
                    {
                        id: "harFileReason",
                        type: "text",
                        label: "Reason if HAR file not attached",
                        required: false,
                        condition: {
                            field: "harFileAttached",
                            value: "No"
                        }
                    }
                ]
            },
            {
                id: "expectedResults",
                title: "EXPECTED RESULTS",
                icon: "fa-check-circle",
                fields: [
                    {
                        id: "expectedResults",
                        type: "richtext",
                        label: "Explain/Show how the system should be functioning if working correctly",
                        required: true
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // Issue Description
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DESCRIPTION</span></div>';
            if (fields.issueDescription) {
                description += `<div>${fields.issueDescription}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Steps to Reproduce
            if (fields.stepsToReproduce) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">STEPS TO REPRODUCE</span></div>';
                description += `<div>${fields.stepsToReproduce}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Screenshots and Videos
            if (fields.screenshotsDescription) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS & SUPPORTING MATERIALS</span></div>';
                description += `<div>${fields.screenshotsDescription}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Impacted User Info
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">IMPACTED USER INFO</span></div>';
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.role) description += `Role: ${fields.role}<br>`;

            // Handle BURC Link as a hyperlink
            if (fields.BURCLink) {
                let techLink = fields.BURCLink.trim();
                if (!techLink.startsWith('http://') && !techLink.startsWith('https://')) {
                    techLink = 'https://' + techLink;
                }
                description += `Teacher / Admin BURC Link: <a href="${techLink}" target="_blank">${fields.BURCLink}</a><br>`;
            }

            if (fields.studentInternalId) description += `Student Internal ID: ${fields.studentInternalId}<br>`;
            if (fields.device) description += `Device: ${fields.device}<br>`;
            if (fields.realm) description += `Realm: ${fields.realm}<br>`;
            if (fields.dateReported) description += `Date Issue Reported By Customer: ${formatDate(fields.dateReported) || ''}<br>`;
            if (fields.harFileAttached) {
                description += `HAR File Attached: ${fields.harFileAttached}`;
                if (fields.harFileAttached === "No" && fields.harFileReason) {
                    description += ` (${fields.harFileReason})`;
                }
                description += '<br>';
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Expected Results
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">EXPECTED RESULTS</span></div>';
            description += `<div>${fields.expectedResults}</div>`;

            return description;
        },

        // Add onLoad function for dynamic subject line formatting
        onLoad: function () {
            console.log("SIM Reading Log Tracker onLoad function executing");

            // Call the helper functions to populate fields
            populateApplicationName();
            populateDistrictState();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
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
                const version = versionField.value || '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

                // Format per requirements: "VIP or Standard District Name • District State (Abv) | Application Name • Version | Specific issue for user role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} • ${districtState} | ${application}`;
                } else {
                    subject = `${districtName} • ${districtState} | ${application}`;
                }

                // Add version if provided
                if (version) {
                    subject += ` • ${version}`;
                }

                // Add specific issue and user role
                subject += ` | ${specificIssue}`;
                if (userRoleText) {
                    subject += ` for ${userRoleText}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('specificIssue')?.addEventListener('input', updateSubjectLine);

            // Add listeners to all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSubjectLine);
            });

            // Initial update attempt
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);
        }
    },

    // 9. SIM Dashboard
    "sim-dashboard": {
        title: "SIM Dashboard Tracker",
        icon: "fa-tachometer-alt",
        description: "For issues regarding functionality of the dashboard",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "<a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP District List</a>"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    {
                        id: "districtState", type: "text", label: "District State", required: true,
                        hint: "Use 2-letter state abbreviation (e.g., NY, CA, TX)"
                    },
                    { id: "application", type: "text", label: "Application", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: true,
                        options: ["", "2.0", "2.5", "2.75", "3.0", "3.5", "Other"]
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ]
                    },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will be submitted as your ticket subject", readOnly: true }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DESCRIPTION",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueDescription",
                        type: "richtext",
                        label: "Issue Description: Specific details outlining user impact.",
                        hint: "EX: Teacher is unable to view student progress on the dashboard",
                        required: true
                    }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "stepsToReproduce",
                        type: "richtext",
                        label: "Steps to Reproduce",
                        required: true,
                        placeholder: "EX:\n1. Log in as Teacher\n2. Navigate to Dashboard",
                        hint: "The exact path taken by the user and yourself to get to the reported issue"
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS",
                icon: "fa-images",
                fields: [] // Empty array since we handle this in setupCustomFileUploaders
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "username", type: "text", label: "Username", required: true, placeholder: "EX: mitzisheppard", hint: "Provide the user's username at the district." },
                    {
                        id: "role", type: "text", label: "Role", required: true,
                        hint: "Provide the user's role at the district. EX: District Admin, School Admin, Teacher, Student"
                    },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, hint: "Provide BURC Link to the affected teacher/administrator" },
                    {
                        id: "studentInternalId",
                        type: "text",
                        label: "Student Internal ID",
                        required: true,
                        hint: "Remove if Teacher or Admin are experiencing issue."
                    },
                    { id: "device", type: "text", label: "Device", required: true, placeholder: "EX: Chromebook", hint: "Provide the device the users are on." },
                    {
                        id: "realm", type: "text", label: "Realm", required: true,
                        hint: "Provide the district's realm."
                    },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: true, hint: "Provide the date the user reported the issue. EX: 01/10/2023" },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR file attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "HAR files help identify browser network issues"
                    },
                    {
                        id: "harFileReason",
                        type: "text",
                        label: "Reason if HAR file not attached",
                        required: false,
                        condition: {
                            field: "harFileAttached",
                            value: "No"
                        }
                    }
                ]
            },
            {
                id: "expectedResults",
                title: "EXPECTED RESULTS",
                icon: "fa-check-circle",
                fields: [
                    {
                        id: "expectedResults",
                        type: "richtext",
                        label: "Explain/Show how the system should be functioning if working correctly",
                        required: true
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // Issue Description
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DESCRIPTION</span></div>';
            description += 'Specific details outlining user impact:<br>';
            if (fields.issueDescription) {
                description += `<div>${fields.issueDescription}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Steps to Reproduce
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">STEPS TO REPRODUCE</span></div>';
            if (fields.stepsToReproduce) {
                description += `<div>${fields.stepsToReproduce}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Screenshots and Videos
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS and/or VIDEOS</span></div>';
            description += '<div>(please include URL in screen capture)</div>';
            description += '<div style="margin-bottom: 20px;"></div>';

            // Impacted User Info
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">IMPACTED USER INFO</span></div>';
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.role) description += `Role: ${fields.role}<br>`;
            if (fields.BURCLink) description += `BURC Link: ${fields.BURCLink}<br>`;
            if (fields.studentInternalId) description += `Student Internal ID: ${fields.studentInternalId}<br>`;
            if (fields.device) description += `Device: ${fields.device}<br>`;
            if (fields.realm) description += `Realm: ${fields.realm}<br>`;
            if (fields.dateReported) description += `Date Issue Reported: ${formatDate(fields.dateReported)}<br>`;
            if (fields.harFileAttached) {
                description += `HAR file attached: ${fields.harFileAttached}`;
                if (fields.harFileAttached === "No" && fields.harFileReason) {
                    description += ` (${fields.harFileReason})`;
                }
                description += '<br>';
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // Expected Results
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">EXPECTED RESULTS</span></div>';
            if (fields.expectedResults) {
                description += `<div>${fields.expectedResults}</div>`;
            } else {
                description += '<div><em>No expected results provided.</em></div>';
            }

            return description;
        },
        // Add onLoad function to populate Application Name and District State
        onLoad: function () {
            console.log("SIM Dashboard Tracker onLoad function executing");

            // Call the helper functions to populate fields
            populateApplicationName();
            populateDistrictState();

            // Add or update subject line formatter
            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
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
                const version = versionField.value || '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

                // Format per requirements: "VIP or Standard District Name • District State (Abv) | Application Name • Version | Specific issue for user role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} • ${districtState} | ${application}`;
                } else {
                    subject = `${districtName} • ${districtState} | ${application}`;
                }

                // Add version if provided
                if (version) {
                    subject += ` • ${version}`;
                }

                // Add specific issue and user role
                subject += ` | ${specificIssue}`;
                if (userRoleText) {
                    subject += ` for ${userRoleText}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine); // This line was missing
            document.getElementById('specificIssue')?.addEventListener('input', updateSubjectLine);

            // Add listeners to all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSubjectLine);
            });

            // Initial update attempt
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);
        }
    },

    // DPT (Customized eAssessment)
    "dpt": {
        title: "DPT (Customized eAssessment) Tracker",
        icon: "fa-file-alt",
        description: "For requests to add districts to the District Preference Table for customized eAssessments",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "<a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP District List</a>"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    {
                        id: "userRole",
                        type: "text",
                        label: "Role",
                        required: true,
                        hint: "District Admin Only"
                    },
                    { id: "formattedSubject", type: "text", label: "Subject", required: false, hint: "This will be submitted as your ticket subject", readOnly: true }
                ]
            },
            {
                id: "summary",
                title: "SUMMARY",
                icon: "fa-file-alt",
                fields: [
                    {
                        id: "summaryContent",
                        type: "richtext",
                        label: "Summary of request",
                        required: true,
                        hint: "Explain that the district would like to be added to the District Preference Table for customized eAssessments."
                    },
                    { id: "districtNameField", type: "text", label: "District name", required: true },
                    { id: "districtState", type: "text", label: "District State", required: true },
                    { id: "districtBUID", type: "text", label: "District BU ID", required: true, hint: "Provide the District's BU ID" }
                ]
            },
            {
                id: "scenario",
                title: "SCENARIO",
                icon: "fa-sitemap",
                fields: [
                    {
                        id: "scenarioDescription",
                        type: "richtext",
                        label: "Describe the scenario",
                        required: true,
                        hint: "Explain if the district has multiple eAssessments that have already been taken by students but they still want access to update those eAssessments."
                    }
                ]
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "username", type: "text", label: "Username", required: true },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, hint: "Provide BURC Link to the user" },
                    { id: "dateRequested", type: "date", label: "Date Requested", required: true, hint: "Provide the date the user requested this change" }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // SUMMARY
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SUMMARY</span></div>';
            if (fields.summaryContent) {
                description += `<div>${fields.summaryContent}</div>`;
            } else {
                description += `${fields.districtNameField || fields.districtName} wants to be added to the District Preference Table for customized eAssessments<br>`;
            }
            description += `District name: ${fields.districtNameField || fields.districtName}<br>`;
            description += `District State: ${fields.districtState || ''}<br>`;
            description += `District BU ID ${fields.districtBUID || ''}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            // SCENARIO
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCENARIO</span></div>';
            if (fields.scenarioDescription) {
                description += `<div>${fields.scenarioDescription}</div>`;
            } else {
                description += 'District has multiple eAssessments that have already been taken by students but they still want access to update those eAssessments.';
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            // IMPACTED USER INFO
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">IMPACTED USER INFO</span></div>';
            if (fields.userRole) description += `Role: ${fields.userRole}<br>`;
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.BURCLink) description += `BURC Link: ${fields.BURCLink}<br>`;
            if (fields.dateRequested) description += `Date Requested: ${formatDate(fields.dateRequested)}<br>`;

            return description;
        },
        onLoad: function () {
            console.log("DPT Tracker onLoad function executing");

            // Call helper function to populate district state
            populateDistrictState();

            // Set default value for Role field
            const roleField = document.getElementById('userRole');
            if (roleField && !roleField.value) {
                roleField.value = "District Admin Only";
            }

            // Function to update the subject line based on district name and VIP status
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const userRoleField = document.getElementById('userRole');
                const formattedSubjectField = document.getElementById('formattedSubject');

                if (!isVipField || !districtNameField || !formattedSubjectField) {
                    console.log("Missing required fields for subject formatting");
                    return;
                }

                const isVip = isVipField.value === 'Yes';
                const districtName = districtNameField.value || '';
                const userRole = userRoleField ? userRoleField.value || 'District Admin' : 'District Admin';

                // Format: "VIP* Status District Name | DPT (Customized eAssessments) - User Role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} | DPT (Customized eAssessments) - ${userRole}`;
                } else {
                    subject = `${districtName} | DPT (Customized eAssessments) - ${userRole}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);

                // Also update the district name in the summary section
                const districtNameSummaryField = document.getElementById('districtNameField');
                if (districtNameSummaryField) {
                    districtNameSummaryField.value = districtName;
                }

                // Also update the district state in the summary section if it's not already set
                const districtStateSummaryField = document.getElementById('districtState');
                const districtStateField = document.getElementById('districtState');
                if (districtStateSummaryField && districtStateField && districtStateField.value) {
                    districtStateSummaryField.value = districtStateField.value;
                }
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('userRole')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);

            // Initial update attempt
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);
        }
    },

    // Timeout Extension
    "timeout-extension": {
        title: "Timeout Extension Tracker",
        icon: "fa-clock",
        description: "For requests regarding time out extensions in BU",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    { id: "formattedSubject", type: "text", label: "Subject", required: true, hint: "This will be submitted as your ticket subject" }
                ]
            },
            {
                id: "details",
                title: "DESCRIPTION",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "requestedLength", type: "text", label: "REQUESTED TIME OUT LENGTH (max 12 hours)", required: true },
                    { id: "isVIP", type: "select", label: "VIP (yes or no)", required: true, options: ["No", "Yes"] },
                    { id: "username", type: "text", label: "Username", required: true },
                    { id: "role", type: "text", label: "Role (Must be district or tech admin)", required: true },
                    { id: "adminLink", type: "text", label: "BURC Link", required: true },
                    { id: "realm", type: "text", label: "Realm", required: true },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "districtState", type: "text", label: "District State", required: true },
                    { id: "dateRequested", type: "date", label: "Date requested by customer", required: true }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">DESCRIPTION</span></div>';
            description += `REQUESTED TIME OUT LENGTH (max 12 hours): ${fields.requestedLength || ''}<br>`;
            description += `VIP: ${fields.isVIP || 'No'}<br>`;
            description += `Username: ${fields.username || ''}<br>`;
            description += `Role (Must be district or tech admin): ${fields.role || ''}<br>`;
            description += `BURC Link: ${fields.adminLink || ''}<br>`;
            description += `Realm: ${fields.realm || ''}<br>`;
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `District State: ${fields.districtState || ''}<br>`;
            description += `Date requested by customer: ${formatDate(fields.dateRequested) || ''}<br>`;

            return description;
        },
        onLoad: function () {
            console.log("Timeout Extension Tracker onLoad function executing");

            // Call the helper functions to populate fields
            populateDistrictState();

            // Format subject line based on district name and VIP status
            function updateSubjectLine() {
                const districtNameField = document.getElementById('districtName');
                const isVIPField = document.getElementById('isVIP');
                const requestedLengthField = document.getElementById('requestedLength');
                const formattedSubjectField = document.getElementById('formattedSubject');

                if (!districtNameField || !isVIPField || !formattedSubjectField) {
                    console.log("Missing required fields for subject formatting");
                    return;
                }

                const districtName = districtNameField.value || '';
                const isVip = isVIPField.value === 'Yes';
                const timeOutLength = requestedLengthField ? requestedLengthField.value : '';

                // Format: "VIP * District Name | Time Out Extension - Time Out Length" or "District Name | Time Out Extension - Time Out Length"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} | Time Out Extension`;
                } else {
                    subject = `${districtName} | Time Out Extension`;
                }

                // Add the time out length if provided
                if (timeOutLength) {
                    subject += ` - ${timeOutLength}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('requestedLength')?.addEventListener('input', updateSubjectLine);

            // Initial update attempt
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);
        }
    }
};

// Export the tracker configurations for use in tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TRACKER_CONFIGS };
}

// Helper function to populate Application Name from product info
function populateApplicationName() {
    console.log("Attempting to populate Application Name field");

    // Check if we have access to the window.trackerApp
    if (!window.trackerApp || !window.trackerApp.ticketData) {
        console.warn("Cannot populate Application Name: trackerApp not available");
        return;
    }

    const { productType, product } = window.trackerApp.ticketData;
    console.log("Source ticket product data:", { productType, product });

    // Find the application field
    const applicationField = document.getElementById('application');
    if (!applicationField) {
        console.warn("Cannot populate Application Name: application field not found");
        return;
    }

    // Only populate if the field is empty
    if (applicationField.value) {
        console.log("Application field already has a value, not overwriting");
        return;
    }

    let applicationName = "";

    // Apply the rules
    if (!productType || productType === "Not Product Specific") {
        // Leave the Application Name blank
        applicationName = "";
    } else if (productType === "Assess 360") {
        applicationName = "Assess 360";
    } else if (productType === "Benchmark Workshop") {
        applicationName = "Benchmark Workshop";
    } else if (productType === "Benchmark Taller") {
        applicationName = "Benchmark Taller";
    } else if (productType === "Ready To Advance") {
        applicationName = "Ready To Advance";
    } else if (productType === "Benchmark Advance") {
        // Rule: If Product type = "Benchmark Advance" AND Product = "Benchmark Advance", then Application Name = "B. Advance"
        if (product === "Benchmark Advance") {
            applicationName = "B. Advance";
        } else {
            // Combine with product value and use "B. Advance" shortening
            applicationName = "B. Advance";
            if (product) {
                applicationName += ` ${product}`;
            }
        }
    } else if (productType === "Benchmark Adelante") {
        // Rule: If Product type = "Benchmark Adelante" AND Product = "Adelante", then Application Name = "B. Adelante"
        if (product === "Adelante") {
            applicationName = "B. Adelante";
        } else {
            // Combine with product value and use "B. Adelante" shortening
            applicationName = "B. Adelante";
            if (product) {
                applicationName += ` ${product}`;
            }
        }
    } else if (productType === "Listos Y Adelante") {
        applicationName = "Listos Y Adelante";
        if (product) {
            applicationName += ` ${product}`;
        }
    } else if (productType === "Supplemental") {
        // Just use the product value
        applicationName = product || "";
    }

    // Set the application field value
    if (applicationName) {
        applicationField.value = applicationName;
        console.log(`Application Name field populated with: "${applicationName}"`);

        // Trigger any listeners on the application field (like subject line formatters)
        const event = new Event('input', { bubbles: true });
        applicationField.dispatchEvent(event);
    } else {
        console.log("No Application Name to populate based on the rules");
    }
}

// Helper function to fetch and populate district state from company data
async function populateDistrictState() {
    try {
        console.log("Attempting to fetch and populate district state");

        // Access client through the global trackerApp instance
        if (!window.trackerApp || !window.trackerApp.client) {
            console.error("TrackerApp or client not available");
            return;
        }

        // Get the district state field
        const districtStateField = document.getElementById('districtState');
        if (!districtStateField) {
            console.log("District state field not found");
            return;
        }

        // Skip if the field already has a value
        if (districtStateField.value) {
            console.log("District state already has a value:", districtStateField.value);
            return;
        }

        // Try to get ticket data
        const ticketData = await window.trackerApp.client.data.get("ticket");
        if (ticketData && ticketData.ticket && ticketData.ticket.company_id) {
            const companyId = ticketData.ticket.company_id;
            console.log("Found company ID:", companyId);

            // Fetch company data to get state
            try {
                const response = await window.trackerApp.client.request.invokeTemplate("getCompanyDetails", {
                    context: { companyId: companyId }
                });

                const companyData = JSON.parse(response.response);
                console.log("Company data:", companyData);

                // Extract state from custom fields
                if (companyData && companyData.custom_fields && companyData.custom_fields.state) {
                    const stateValue = companyData.custom_fields.state;
                    console.log(`Found company state: ${stateValue}`);

                    // Set the district state field with the retrieved state
                    districtStateField.value = stateValue;
                    console.log(`Set district state field to: ${stateValue}`);

                    // Trigger change event to update subject line
                    const event = new Event('input', { bubbles: true });
                    districtStateField.dispatchEvent(event);
                } else {
                    console.log("Company data doesn't contain state custom field");
                }
            } catch (error) {
                console.error("Error fetching company data:", error);
            }
        } else {
            console.log("No company ID found in ticket data");
        }
    } catch (error) {
        console.error("Error in populateDistrictState:", error);
    }
}
