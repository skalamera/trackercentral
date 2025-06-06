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
                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "e.g. Advance c2022" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: false,
                        options: [
                            "",
                            "2.0",
                            "2.5",
                            "2.5 Mod / 2.6",
                            "2.5 Mod / 2.6 National",
                            "2.5 National",
                            "2.75",
                            "2.75 National",
                            "2.8",
                            "2.8 National",
                            "2.8 Florida",
                            "Florida",
                            "National",
                            "Other"
                        ],
                        hint: "<a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000741470' target='_blank'>Benchmark Program Variations</a>"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        options: [],
                        hint: "Select the state or location variation for this version"
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
                    { id: "program", type: "text", label: "Program Impacted", required: true, hint: "This field will be automatically populated with Program Name • Version State/National" },
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
                        hint: "Path taken to recreate issue and screenshots if necessary. EX: Advance -c2022 > TRS > G5 > U1 > W2 > L12"
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
            description += `Program Impacted: ${fields.program || ''}<br>`;
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

            // Handle custom version input when "Other" is selected
            setupCustomVersionInput();

            // Also setup custom version state input when "Other" is selected
            setupCustomVersionStateInput();

            // Function to sync fields from Subject to other sections
            function syncFields() {
                // Get the source fields from Subject section
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const versionStateField = document.getElementById('versionState');

                // Get the target field
                const programField = document.getElementById('program');

                // Sync combined values to program field
                if (applicationField && programField) {
                    let programValue = applicationField.value || '';

                    // Add version if available
                    const version = getVersionValue(versionField);
                    if (version) {
                        programValue += ` • ${version}`;
                    }

                    // Add state/national if available
                    const versionState = versionStateField ? getVersionStateValue(versionStateField) : '';
                    if (versionState) {
                        programValue += ` ${versionState}`;
                    }

                    programField.value = programValue;
                    console.log(`Synced to Program Impacted field: ${programValue}`);
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

            const versionStateField = document.getElementById('versionState');
            if (versionStateField) {
                versionStateField.addEventListener('change', syncFields);
                console.log("Added event listener to Version State field");
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
                const versionStateField = document.getElementById('versionState');
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
                const version = getVersionValue(versionField) || '';
                const versionState = versionStateField ? getVersionStateValue(versionStateField) : '';
                const specificIssue = specificIssueField.value || '';
                const gradesImpacted = gradesImpactedField.value || '';

                // Check if this is a VIP customer
                let isVIP = false;
                if (isVIPField) {
                    isVIP = isVIPField.value === 'Yes';
                }

                // Build the subject line dynamically, only including parts that have values
                const subjectParts = [];

                // First part: Xcode (indicate if more than one)
                let xcodePart = '';
                if (xcode.trim()) {
                    xcodePart = xcode.trim();
                    if (hasMultipleXcodes) {
                        xcodePart += ' (multiple)';
                    }
                }
                if (xcodePart) {
                    subjectParts.push(xcodePart);
                }

                // VIP status part (if applicable)
                if (isVIP) {
                    subjectParts.push('VIP');
                }

                // Application and version part
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

                // Specific issue and grades part
                let issueGradesPart = '';
                if (specificIssue.trim() && gradesImpacted.trim()) {
                    issueGradesPart = `${specificIssue.trim()}: ${gradesImpacted.trim()}`;
                } else if (specificIssue.trim()) {
                    issueGradesPart = specificIssue.trim();
                } else if (gradesImpacted.trim()) {
                    issueGradesPart = gradesImpacted.trim();
                }
                if (issueGradesPart) {
                    subjectParts.push(issueGradesPart);
                }

                // Join all parts with " | " separator
                const subject = subjectParts.join(' | ');

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners for subject line formatting
            document.getElementById('xcode')?.addEventListener('input', updateSubjectLine);
            document.getElementById('hasMultipleXcodes')?.addEventListener('change', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('versionState')?.addEventListener('change', updateSubjectLine);
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
                    { id: "xcode", type: "text", label: "Xcode", required: true, placeholder: "e.g. X72525", hint: "Enter the XCODE of component where the issue is prevalent." },
                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "e.g. Advance -c2022", hint: "Auto-populates from original ticket." },
                    {
                        id: "version",
                        type: "select",
                        label: "Subscription Version",
                        required: false,
                        options: [],
                        hint: "Select the appropriate subscription version number from the dropdown. Ex: 2.5"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        options: [],
                        hint: "Select the corresponding state or national version from the dropdown. Ex: 2.5 Virginia. Note: Just because a district is in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    { id: "resourcePath", type: "text", label: "Resource Path", required: true, placeholder: "e.g. TRS: G5>U1>W2>L12", hint: "Enter the path of clicks taken to recreate issue." },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "e.g. Title Missing", hint: "Enter a succinct description of issue. Note: if the user is requesting a rationale use: Rationale" },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: Xcode | VIP or Standard | Application Name • Variation National or State if SS | Resource name: Grade > Unit > Week > Day > Lesson - Short description of issue. EX: X11111 | VIP | Advance • 2.8 Florida | TRS: G5 > U1 > W2 > L12 - Title Missing", readOnly: true }
                ]
            },
            {
                id: "summary",
                title: "Summary",
                icon: "fa-file-alt",
                fields: [
                    {
                        id: "issueSummary", type: "richtext", label: "", required: true,
                        hint: "Enter a short summary of the issue reported by the user. EX: In Advance FL 2.8 TRS: G5 > U1 > W2 > L12. The title is missing from the lesson plan."
                    }
                ]
            },
            {
                id: "issueDetails",
                title: "Issue Details",
                icon: "fa-clipboard-list",
                fields: [
                    {
                        id: "issueDetails", type: "richtext", label: "", required: true,
                        hint: "Describe in detail the issue reported by the user. You can insert exactly what the user reports in their submitted ticket if needed for clarification. However only do so if it is clear and helpful. IE: request for rationale or similar. EX: User reports \"The kindergarten team at Bryant Elementary had questions about two different questions on the assessment. They both have to do with opposites, which has not been instructed in the curriculum at this point. It also has them read and identify the word in question one and then in question 15 they are supposed to know what each picture really shows, which to us were not that clear, especially the cane. See attachment below. Thank you!.\""
                    }
                ]
            },
            {
                id: "userInfo",
                title: "Impacted User",
                icon: "fa-user",
                fields: [
                    {
                        id: "isVIP", type: "select", label: "VIP Customer", required: true, options: ["No", "Yes"],
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the VIP list if you are unsure but the original ticket should indicate if the user's district is VIP. Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    {
                        id: "username", type: "text", label: "Username", required: true, placeholder: "e.g. amiller3",
                        hint: "Enter the Username of the impacted user."
                    },
                    {
                        id: "userEmail", type: "email", label: "E-mail", required: true, placeholder: "e.g. adam.miller@palmbeachschools.org",
                        hint: "Enter the Email of the user that the issue is affecting. Note: the username and email can be the same, but supply both."
                    },
                    {
                        id: "userRole", type: "text", label: "Role", required: true, placeholder: "e.g. District Admin, School Admin, Teacher or Student",
                        hint: "Enter the role of the user that the issue is affecting."
                    },
                    {
                        id: "productImpacted", type: "text", label: "Program Impacted", required: true, placeholder: "e.g. Advance • 2.8 Florida",
                        hint: "Auto-populates from the subject details."
                    },
                    {
                        id: "xcodeInfo", type: "text", label: "Xcode", required: true, placeholder: "e.g. X72525",
                        hint: "Auto-populates from the subject details."
                    },
                    {
                        id: "districtState", type: "text", label: "District State", required: true, placeholder: "e.g. FL",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate you should verify the company details of the district in FD."
                    },
                    {
                        id: "impactType", type: "select", label: "Digital and/or Print Impact", required: true,
                        options: ["", "Digital Only", "Print Only", "Both Digital and Print"],
                        hint: "Identify if the issue only occurs on the digital platform or if it occurs in both digital and print."
                    },
                    {
                        id: "dateReported", type: "date", label: "Date Issue reported by user", required: true, placeholder: "e.g. 05/01/2025",
                        hint: "Select the date the user reported the issue."
                    },
                    {
                        id: "impactScope", type: "select", label: "Staff and/or Student impact", required: true,
                        options: ["", "Teacher Only", "Student Only", "Both Teacher and Student"],
                        hint: "Select the appropriate option based on the impacted user role. EX: Teacher"
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
                        hint: "Enter the specific component affected e.g., eAssessment, Assignments, TRS, Plan & Teach, eBook, ePocketchart, etc. EX: TRS (teacher resource system)"
                    }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "pathField", type: "text", label: "Path", required: true, placeholder: "e.g. Advance -c2022 > TRS: G5 > U1 > W2 > L12",
                        hint: "Auto-populates from the subject details."
                    },
                    {
                        id: "actualResults", type: "richtext", label: "Actual results", required: true,
                        hint: "Enter any information that would be helpful to replicate the reported issue. To add screen shots you can either click the image icon > select the image file > click Open or paste the screenshot in the box. Add as many as you see fit to explain the issue (if needed you can add additional screenshots or video see Step 9) To add links type the word or phrase indicating what you are linking to > clink the link icon and paste URL > click Save."
                    },
                    {
                        id: "expectedResults", type: "richtext", label: "Expected results", required: true,
                        hint: "Enter details of what the user expects once the issue has been resolved. Note: our role is to convey what the user is requesting be done to fix the issue. Example of expected results: Provide rationale. Provide title for lesson. Fix hyperlink. Fix grammatical errors."
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
                        hint: "Click Upload Files to add any additional information that will be helpful."
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

            // Handle custom version input when "Other" is selected
            setupCustomVersionInput();

            // Also setup custom version state input when "Other" is selected
            setupCustomVersionStateInput();

            // Function to sync XCODE and Resource Path fields
            function syncFields() {
                // Get the source fields from Subject section
                const xcodeField = document.getElementById('xcode');
                const resourcePathField = document.getElementById('resourcePath');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                // const versionStateField = document.getElementById('versionState'); // Currently unused

                // Get the target fields
                const pathField = document.getElementById('pathField');
                const xcodeInfoField = document.getElementById('xcodeInfo');
                const productImpactedField = document.getElementById('productImpacted');

                // Sync XCODE to xcodeInfo if both fields exist
                if (xcodeField && xcodeInfoField) {
                    xcodeInfoField.value = xcodeField.value;
                    console.log("Synced XCODE to Xcode field in user info section");
                }

                // Sync applicationName and resourcePath to pathField if the fields exist
                if (pathField) {
                    // Only populate the Path field if both Application Name and Resource Path fields have values
                    if (applicationField && applicationField.value && resourcePathField && resourcePathField.value) {
                        const pathValue = applicationField.value + ' > ' + resourcePathField.value;
                        pathField.value = pathValue;
                        console.log("Synced Application Name + Resource Path to Path field: " + pathValue);
                    } else {
                        // Clear the path field if either input is missing
                        pathField.value = '';
                        console.log("Path field cleared - both Application Name and Resource Path are required");
                    }
                }

                // Sync application and version to productImpacted if the fields exist
                if (applicationField && productImpactedField) {
                    let productImpacted = applicationField.value || '';

                    // Add version if available
                    if (versionField && versionField.value) {
                        const version = getVersionValue(versionField);
                        productImpacted += ` • ${version}`;

                        // Add state/national if available
                        if (versionStateField && versionStateField.value) {
                            const versionState = getVersionStateValue(versionStateField);
                            productImpacted += ` ${versionState}`;
                        }
                    }

                    productImpactedField.value = productImpacted;
                    console.log(`Synced Application Name + Version + State/National to Program Impacted field: ${productImpacted}`);
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

            // Version State field event listener (not using the value currently, but keeping the listener for future use)
            const versionStateField = document.getElementById('versionState');
            if (versionStateField) {
                versionStateField.addEventListener('change', syncFields);
                console.log("Added event listener to Version State field");
            }

            // Add function to update subject line according to new format
            function updateSubjectLine() {
                // Define all field variables properly
                const xcodeField = document.getElementById('xcode');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const versionStateField = document.getElementById('versionState');
                const resourcePathField = document.getElementById('resourcePath');
                const specificIssueField = document.getElementById('specificIssue');
                const formattedSubjectField = document.getElementById('formattedSubject');
                const isVIPField = document.getElementById('isVIP');

                if (!xcodeField || !applicationField || !resourcePathField || !specificIssueField || !formattedSubjectField) {
                    console.log("Missing required fields for subject formatting");
                    return;
                }

                const xcode = xcodeField.value || '';
                const application = applicationField.value || '';
                const version = versionField ? getVersionValue(versionField) : '';
                const versionState = versionStateField ? versionStateField.value : '';
                const resourcePath = resourcePathField.value || '';
                const specificIssue = specificIssueField.value || '';

                // Check if this is a VIP customer
                let isVIP = false;
                if (isVIPField) {
                    isVIP = isVIPField.value === 'Yes';
                }

                // Build the subject line dynamically, only including parts that have values
                const subjectParts = [];

                // First part: XCODE
                if (xcode.trim()) {
                    subjectParts.push(xcode.trim());
                }

                // Second part: VIP or Standard
                if (isVIP) {
                    subjectParts.push('VIP');
                } else {
                    subjectParts.push('Standard');
                }

                // Third part: Application • Version State/National
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

                // Fourth part: Resource Path - Specific Issue
                let resourceIssuePart = '';
                if (resourcePath.trim() && specificIssue.trim()) {
                    resourceIssuePart = `${resourcePath.trim()} - ${specificIssue.trim()}`;
                } else if (resourcePath.trim()) {
                    resourceIssuePart = resourcePath.trim();
                } else if (specificIssue.trim()) {
                    resourceIssuePart = specificIssue.trim();
                }
                if (resourceIssuePart) {
                    subjectParts.push(resourceIssuePart);
                }

                // Join all parts with " | " separator
                const subject = subjectParts.join(' | ');

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners for subject line formatting
            document.getElementById('xcode')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('versionState')?.addEventListener('change', updateSubjectLine);
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
                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: false,
                        options: [
                            "",
                            "2.0",
                            "2.5",
                            "2.5 Mod / 2.6",
                            "2.5 Mod / 2.6 National",
                            "2.5 National",
                            "2.75",
                            "2.75 National",
                            "2.8",
                            "2.8 National",
                            "2.8 Florida",
                            "Florida",
                            "National",
                            "Other"
                        ],
                        hint: "<a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000741470' target='_blank'>Benchmark Program Variations</a>"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        options: [],
                        hint: "Select the state or location variation for this version"
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        options: ["", "1", "2", "3"],
                        hint: "Select the resource type"
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

            // Handle custom version input when "Other" is selected
            setupCustomVersionInput();

            // Also setup custom version state input when "Other" is selected
            setupCustomVersionStateInput();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const versionStateField = document.getElementById('versionState');
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
                const version = getVersionValue(versionField) || '';
                const versionState = versionStateField ? getVersionStateValue(versionStateField) : '';
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

                // Third part: Resource
                const resourceField = document.getElementById('resource');
                const resource = resourceField ? resourceField.value || '' : '';

                let resourcePart = '';
                if (resource && resource.trim()) {
                    resourcePart = `Resource: ${resource.trim()}`;
                    subjectParts.push(resourcePart);
                }

                // Fourth part: Specific issue for user role
                let issuePart = specificIssue;
                if (userRoleText) {
                    issuePart += ` for ${userRoleText}`;
                }
                if (issuePart.trim()) {
                    subjectParts.push(issuePart);
                }

                // Build subject with custom separators - use "•" between Resource and Specific Issue
                let subject = '';
                if (subjectParts.length > 0) {
                    for (let i = 0; i < subjectParts.length; i++) {
                        if (i === 0) {
                            subject = subjectParts[i];
                        } else {
                            // Use "•" separator if this is the issue part and resource exists
                            if (i === subjectParts.length - 1 && issuePart.trim() && resourcePart) {
                                subject += ' • ' + subjectParts[i];
                            } else {
                                subject += ' | ' + subjectParts[i];
                            }
                        }
                    }
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
            document.getElementById('versionState')?.addEventListener('change', updateSubjectLine);
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
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },

                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: false,
                        options: [
                            "",
                            "2.0",
                            "2.5",
                            "2.5 Mod / 2.6",
                            "2.5 Mod / 2.6 National",
                            "2.5 National",
                            "2.75",
                            "2.75 National",
                            "2.8",
                            "2.8 National",
                            "2.8 Florida",
                            "Florida",
                            "National",
                            "Other"
                        ],
                        hint: "<a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000741470' target='_blank'>Benchmark Program Variations</a>"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        options: [],
                        hint: "Select the state or location variation for this version"
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        options: ["", "1", "2", "3"],
                        hint: "Select the resource type"
                    },
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

            // Handle custom version input when "Other" is selected
            setupCustomVersionInput();

            // Also setup custom version state input when "Other" is selected
            setupCustomVersionStateInput();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const versionStateField = document.getElementById('versionState');
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
                const version = getVersionValue(versionField) || '';
                const versionState = versionStateField ? getVersionStateValue(versionStateField) : '';
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

                // Third part: Resource
                const resourceField = document.getElementById('resource');
                const resource = resourceField ? resourceField.value || '' : '';

                let resourcePart = '';
                if (resource && resource.trim()) {
                    resourcePart = `Resource: ${resource.trim()}`;
                    subjectParts.push(resourcePart);
                }

                // Fourth part: Specific issue for user role
                let issuePart = specificIssue;
                if (userRoleText) {
                    issuePart += ` for ${userRoleText}`;
                }
                if (issuePart.trim()) {
                    subjectParts.push(issuePart);
                }

                // Build subject with custom separators - use "•" between Resource and Specific Issue
                let subject = '';
                if (subjectParts.length > 0) {
                    for (let i = 0; i < subjectParts.length; i++) {
                        if (i === 0) {
                            subject = subjectParts[i];
                        } else {
                            // Use "•" separator if this is the issue part and resource exists
                            if (i === subjectParts.length - 1 && issuePart.trim() && resourcePart) {
                                subject += ' • ' + subjectParts[i];
                            } else {
                                subject += ' | ' + subjectParts[i];
                            }
                        }
                    }
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
            document.getElementById('versionState')?.addEventListener('change', updateSubjectLine);
            document.getElementById('resource')?.addEventListener('change', updateSubjectLine);
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
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },

                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: false,
                        options: [
                            "",
                            "2.0",
                            "2.5",
                            "2.5 Mod / 2.6",
                            "2.5 Mod / 2.6 National",
                            "2.5 National",
                            "2.75",
                            "2.75 National",
                            "2.8",
                            "2.8 National",
                            "2.8 Florida",
                            "Florida",
                            "National",
                            "Other"
                        ],
                        hint: "<a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000741470' target='_blank'>Benchmark Program Variations</a>"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        options: [],
                        hint: "Select the state or location variation for this version"
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        options: ["", "1", "2", "3"],
                        hint: "Select the resource type"
                    },
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

            // Handle custom version input when "Other" is selected
            setupCustomVersionInput();

            // Also setup custom version state input when "Other" is selected
            setupCustomVersionStateInput();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const versionStateField = document.getElementById('versionState');
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
                const version = getVersionValue(versionField) || '';
                const versionState = versionStateField ? getVersionStateValue(versionStateField) : '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

                // Build the subject line dynamically, only including parts that have values
                const subjectParts = [];

                // First part: VIP or Standard District Name • District State
                let districtPart = '';
                if (isVip) {
                    districtPart = `VIP * ${districtName} • ${districtState}`;
                } else {
                    districtPart = `${districtName} • ${districtState}`;
                }
                if (districtPart.trim() && districtPart !== ' • ') {
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

                // Third part: Resource
                const resourceField = document.getElementById('resource');
                const resource = resourceField ? resourceField.value || '' : '';

                let resourcePart = '';
                if (resource && resource.trim()) {
                    resourcePart = `Resource: ${resource.trim()}`;
                    subjectParts.push(resourcePart);
                }

                // Fourth part: Specific issue for user role
                let issuePart = specificIssue;
                if (userRoleText) {
                    issuePart += ` for ${userRoleText}`;
                }
                if (issuePart.trim()) {
                    subjectParts.push(issuePart);
                }

                // Build subject with custom separators - use "•" between Resource and Specific Issue
                let subject = '';
                if (subjectParts.length > 0) {
                    for (let i = 0; i < subjectParts.length; i++) {
                        if (i === 0) {
                            subject = subjectParts[i];
                        } else {
                            // Use "•" separator if this is the issue part and resource exists
                            if (i === subjectParts.length - 1 && issuePart.trim() && resourcePart) {
                                subject += ' • ' + subjectParts[i];
                            } else {
                                subject += ' | ' + subjectParts[i];
                            }
                        }
                    }
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
            document.getElementById('versionState')?.addEventListener('change', updateSubjectLine);
            document.getElementById('resource')?.addEventListener('change', updateSubjectLine);
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
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },

                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: false,
                        options: [
                            "",
                            "2.0",
                            "2.5",
                            "2.5 Mod / 2.6",
                            "2.5 Mod / 2.6 National",
                            "2.5 National",
                            "2.75",
                            "2.75 National",
                            "2.8",
                            "2.8 National",
                            "2.8 Florida",
                            "Florida",
                            "National",
                            "Other"
                        ],
                        hint: "<a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000741470' target='_blank'>Benchmark Program Variations</a>"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        options: [],
                        hint: "Select the state or location variation for this version"
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        options: ["", "1", "2", "3"],
                        hint: "Select the resource type"
                    },
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

            // Handle custom version input when "Other" is selected
            setupCustomVersionInput();

            // Also setup custom version state input when "Other" is selected
            setupCustomVersionStateInput();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const versionStateField = document.getElementById('versionState');
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
                const version = getVersionValue(versionField) || '';
                const versionState = versionStateField ? getVersionStateValue(versionStateField) : '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

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

                // Third part: Resource
                const resourceField = document.getElementById('resource');
                const resource = resourceField ? resourceField.value || '' : '';

                let resourcePart = '';
                if (resource && resource.trim()) {
                    resourcePart = `Resource: ${resource.trim()}`;
                    subjectParts.push(resourcePart);
                }

                // Fourth part: Specific issue and user role
                let issuePart = specificIssue;
                if (userRoleText) {
                    issuePart += ` for ${userRoleText}`;
                }
                if (issuePart.trim()) {
                    subjectParts.push(issuePart);
                }

                // Build subject with custom separators - use "•" between Resource and Specific Issue
                let subject = '';
                if (subjectParts.length > 0) {
                    for (let i = 0; i < subjectParts.length; i++) {
                        if (i === 0) {
                            subject = subjectParts[i];
                        } else {
                            // Use "•" separator if this is the issue part and resource exists
                            if (i === subjectParts.length - 1 && issuePart.trim() && resourcePart) {
                                subject += ' • ' + subjectParts[i];
                            } else {
                                subject += ' | ' + subjectParts[i];
                            }
                        }
                    }
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
            document.getElementById('versionState')?.addEventListener('change', updateSubjectLine);
            document.getElementById('resource')?.addEventListener('change', updateSubjectLine);
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
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },

                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: false,
                        options: [
                            "",
                            "2.0",
                            "2.5",
                            "2.5 Mod / 2.6",
                            "2.5 Mod / 2.6 National",
                            "2.5 National",
                            "2.75",
                            "2.75 National",
                            "2.8",
                            "2.8 National",
                            "2.8 Florida",
                            "Florida",
                            "National",
                            "Other"
                        ],
                        hint: "<a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000741470' target='_blank'>Benchmark Program Variations</a>"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        options: [],
                        hint: "Select the state or location variation for this version"
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        options: ["", "1", "2", "3"],
                        hint: "Select the resource type"
                    },
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

            // Handle custom version input when "Other" is selected
            setupCustomVersionInput();

            // Also setup custom version state input when "Other" is selected
            setupCustomVersionStateInput();

            // Add or update subject line formatter
            function updateSubjectLine() {
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
                const version = getVersionValue(versionField) || '';
                const versionState = versionStateField ? getVersionStateValue(versionStateField) : '';
                const resource = resourceField ? resourceField.value : '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

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
                    issuePart = `Resource: ${resource}`;
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

                // Join all parts with " | "
                const subject = subjectParts.join(' | ');

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('versionState')?.addEventListener('change', updateSubjectLine);
            document.getElementById('resource')?.addEventListener('change', updateSubjectLine);
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
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },

                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: false,
                        options: [
                            "",
                            "2.0",
                            "2.5",
                            "2.5 Mod / 2.6",
                            "2.5 Mod / 2.6 National",
                            "2.5 National",
                            "2.75",
                            "2.75 National",
                            "2.8",
                            "2.8 National",
                            "2.8 Florida",
                            "Florida",
                            "National",
                            "Other"
                        ],
                        hint: "<a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000741470' target='_blank'>Benchmark Program Variations</a>"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        options: [],
                        hint: "Select the state or location variation for this version"
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        options: ["Placeholder", "Reports"],
                        hint: "Select the resource type"
                    },
                    {
                        id: "reportType",
                        type: "select",
                        label: "Report Type",
                        required: false,
                        options: ["Report Type 1", "Report Type 2", "Report Type 3"],
                        hint: "Select the report type",
                        showIf: "resource:Reports"
                    },
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


        // Add onLoad function to populate Application Name
        onLoad: function () {
            console.log("SIM Plan & Teach Tracker onLoad function executing");

            // Call the helper functions to populate fields
            populateApplicationName();
            populateDistrictState();

            // Handle custom version input when "Other" is selected
            setupCustomVersionInput();

            // Also setup custom version state input when "Other" is selected
            setupCustomVersionStateInput();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const versionStateField = document.getElementById('versionState');
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
                const version = getVersionValue(versionField) || '';
                const versionState = versionStateField ? getVersionStateValue(versionStateField) : '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

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

                // Third part: Specific issue and user role
                let issuePart = specificIssue;
                if (userRoleText) {
                    issuePart += ` for ${userRoleText}`;
                }
                if (issuePart.trim()) {
                    subjectParts.push(issuePart);
                }

                // Join all parts with " | "
                const subject = subjectParts.join(' | ');

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('versionState')?.addEventListener('change', updateSubjectLine);
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
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },

                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: false,
                        options: [
                            "",
                            "2.0",
                            "2.5",
                            "2.5 Mod / 2.6",
                            "2.5 Mod / 2.6 National",
                            "2.5 National",
                            "2.75",
                            "2.75 National",
                            "2.8",
                            "2.8 National",
                            "2.8 Florida",
                            "Florida",
                            "National",
                            "Other"
                        ],
                        hint: "<a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000741470' target='_blank'>Benchmark Program Variations</a>"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        options: [],
                        hint: "Select the state or location variation for this version"
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        options: ["Placeholder", "Reports"],
                        hint: "Select the resource type"
                    },
                    {
                        id: "reportType",
                        type: "select",
                        label: "Report Type",
                        required: false,
                        options: ["Report Type 1", "Report Type 2", "Report Type 3"],
                        hint: "Select the report type",
                        showIf: "resource:Reports"
                    },
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

            // Handle custom version input when "Other" is selected
            setupCustomVersionInput();

            // Also setup custom version state input when "Other" is selected
            setupCustomVersionStateInput();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const versionStateField = document.getElementById('versionState');
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
                const version = getVersionValue(versionField) || '';
                const versionState = versionStateField ? getVersionStateValue(versionStateField) : '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

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

                // Third part: Specific issue and user role
                let issuePart = specificIssue;
                if (userRoleText) {
                    issuePart += ` for ${userRoleText}`;
                }
                if (issuePart.trim()) {
                    subjectParts.push(issuePart);
                }
                // Join all parts with " | "
                const subject = subjectParts.join(' | ');

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('versionState')?.addEventListener('change', updateSubjectLine);
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
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "EX: Server Error Received" },

                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "EX: Grade View" },
                    {
                        id: "version",
                        type: "select",
                        label: "Version",
                        required: false,
                        options: [
                            "",
                            "2.0",
                            "2.5",
                            "2.5 Mod / 2.6",
                            "2.5 Mod / 2.6 National",
                            "2.5 National",
                            "2.75",
                            "2.75 National",
                            "2.8",
                            "2.8 National",
                            "2.8 Florida",
                            "Florida",
                            "National",
                            "Other"
                        ],
                        hint: "<a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000741470' target='_blank'>Benchmark Program Variations</a>"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        options: [],
                        hint: "Select the state or location variation for this version"
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        options: ["Placeholder", "Reports"],
                        hint: "Select the resource type"
                    },
                    {
                        id: "reportType",
                        type: "select",
                        label: "Report Type",
                        required: false,
                        options: ["Report Type 1", "Report Type 2", "Report Type 3"],
                        hint: "Select the report type",
                        showIf: "resource:Reports"
                    },
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

            // Handle custom version input when "Other" is selected
            setupCustomVersionInput();

            // Also setup custom version state input when "Other" is selected
            setupCustomVersionStateInput();

            // Add or update subject line formatter
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const versionStateField = document.getElementById('versionState');
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
                const version = getVersionValue(versionField) || '';
                const versionState = versionStateField ? getVersionStateValue(versionStateField) : '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

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

                // Third part: Specific issue and user role
                let issuePart = specificIssue;
                if (userRoleText) {
                    issuePart += ` for ${userRoleText}`;
                }
                if (issuePart.trim()) {
                    subjectParts.push(issuePart);
                }

                // Join all parts with " | "
                const subject = subjectParts.join(' | ');

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);
            document.getElementById('application')?.addEventListener('input', updateSubjectLine);
            document.getElementById('version')?.addEventListener('change', updateSubjectLine);
            document.getElementById('versionState')?.addEventListener('change', updateSubjectLine);
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
                        hint: "District Admin"
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
                roleField.value = "District Admin";
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
    },

    // Help Article
    "help-article": {
        title: "Help Article Tracker",
        icon: "fa-question-circle",
        description: "For requests to create or update a BU Help article",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pencil-alt",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true, hint: "Name of the help article" }
                ]
            },
            {
                id: "summary",
                title: "SUMMARY",
                icon: "fa-file-alt",
                fields: [
                    { id: "summaryContent", type: "richtext", label: "", required: true, hint: "Include information of what needs to be updated or changed.\nEx: The dropdown menu options no longer reflect the listed items in the article." }
                ]
            },
            {
                id: "details",
                title: "DESCRIPTION",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "requester", type: "text", label: "Requester", required: true, hint: "Provide the name of the requestor.\nEX: Jen Boyle" },
                    { id: "dateRequested", type: "date", label: "Date requested", required: true, hint: "Provide date requested.\nEX: 4/1/2024" },
                    { id: "articleName", type: "text", label: "Name of BU Help Article", required: true, hint: "Provide the name of the help article.\nEX: About Grading eAssessments" },
                    { id: "articleUrl", type: "text", label: "URL of BU Help Article", required: false, hint: "Provide the URL of the article.\nEX: https://help.benchmarkuniverse.com/bubateacher/Content/eAssessments/Grading/About%20Grading%20eAssessments.htm" },
                    { id: "referenceImages", type: "richtext", label: "Images for reference", required: false, hint: "Include any images reference needed changes." }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // Add summary section if provided
            if (fields.summaryContent && fields.summaryContent.trim() !== '<p><br></p>') {
                description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SUMMARY</span></div>';
                description += `<div>${fields.summaryContent || ''}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Add description with all fields
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">DESCRIPTION</span></div>';
            description += `Requester: ${fields.requester || ''}<br>`;
            if (fields.dateRequested) description += `Date requested: ${formatDate(fields.dateRequested)}<br>`;
            description += `Name of BU Help Article: ${fields.articleName || ''}<br>`;
            if (fields.articleUrl) description += `URL of BU Help Article: ${fields.articleUrl}<br>`;

            // Add reference images if provided
            if (fields.referenceImages && fields.referenceImages.trim() !== '<p><br></p>') {
                description += `<div>Images for reference:</div>`;
                description += `<div>${fields.referenceImages}</div>`;
            }

            return description;
        },
        onLoad: function () {
            console.log("Help Article Tracker onLoad function executing");

            // Set default date for Date Requested field to today
            const dateRequestedField = document.getElementById('dateRequested');
            if (dateRequestedField) {
                const today = new Date().toISOString().split('T')[0];
                dateRequestedField.value = today;
                console.log("Set default date for Date Requested:", today);
            }
        }
    }
};

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
        applicationName = "Workshop";
    } else if (productType === "Benchmark Taller") {
        applicationName = "Taller";
    } else if (productType === "Ready To Advance") {
        applicationName = "Ready To Advance";
    } else if (productType === "Benchmark Advance") {
        // Rule: If Product type = "Benchmark Advance" AND Product = "Benchmark Advance", then Application Name = "Advance"
        if (product === "Benchmark Advance") {
            applicationName = "Advance";
        } else {
            // Combine with product value and use "Advance" shortening
            applicationName = "Advance";
            if (product) {
                applicationName += ` ${product}`;
            }
        }
    } else if (productType === "Benchmark Adelante") {
        // Rule: If Product type = "Benchmark Adelante" AND Product = "Adelante", then Application Name = "Adelante"
        if (product === "Adelante") {
            applicationName = "Adelante";
        } else {
            // Combine with product value and use "Adelante" shortening
            applicationName = "Adelante";
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
    } else if (productType === "Plan & Teach") {
        applicationName = "Plan & Teach";
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

// Helper function to set up custom version input when "Other" is selected
function setupCustomVersionInput() {
    console.log("Setting up custom version input handler");

    // Find the version dropdown
    const versionSelect = document.getElementById('version');
    if (!versionSelect) {
        console.warn("Version dropdown not found");
        return;
    }

    // Function to handle change in version dropdown
    const handleVersionChange = function () {
        // Check if current container already has a custom input field
        let customInputContainer = document.getElementById('customVersionContainer');

        // If "Other" is selected, create a custom input field if it doesn't exist
        if (versionSelect.value === "Other") {
            console.log("Other selected, handling custom input field");

            // If the container doesn't exist yet, create it
            if (!customInputContainer) {
                console.log("Creating new custom input field");

                // Create container for custom input
                customInputContainer = document.createElement('div');
                customInputContainer.id = 'customVersionContainer';
                customInputContainer.className = 'form-group';
                customInputContainer.style.marginTop = '10px';

                // Create label for custom input
                const label = document.createElement('label');
                label.textContent = 'Custom Version';
                label.className = 'control-label';

                // Create input field
                const customInput = document.createElement('input');
                customInput.type = 'text';
                customInput.id = 'customVersion';
                customInput.className = 'form-control';
                customInput.placeholder = 'Enter custom version';

                // Retrieve any previous custom value if available
                if (versionSelect.hasAttribute('data-custom-value')) {
                    customInput.value = versionSelect.getAttribute('data-custom-value');
                }

                // Add event listener to update version value
                customInput.addEventListener('input', function () {
                    // Always store the current value, even if empty
                    versionSelect.setAttribute('data-custom-value', customInput.value);

                    // Trigger change event for subject line update
                    const event = new Event('change', { bubbles: true });
                    versionSelect.dispatchEvent(event);
                });

                // Append elements to container
                customInputContainer.appendChild(label);
                customInputContainer.appendChild(customInput);

                // Insert container after version select
                versionSelect.parentNode.insertBefore(customInputContainer, versionSelect.nextSibling);

                // Focus the input field to make it immediately usable
                setTimeout(() => {
                    customInput.focus();
                }, 50);
            }
        } else {
            // If not "Other", remove the custom input container if it exists
            if (customInputContainer) {
                customInputContainer.remove();
            }
        }
    };

    // Add event listener to version dropdown
    versionSelect.addEventListener('change', handleVersionChange);

    // Run once on load in case "Other" is already selected
    handleVersionChange();
}

// Helper function to set up custom version state input when "Other" is selected
function setupCustomVersionStateInput() {
    console.log("Setting up custom version state input handler");

    // Find the version state dropdown
    const versionStateSelect = document.getElementById('versionState');
    if (!versionStateSelect) {
        console.warn("Version state dropdown not found");
        return;
    }

    // Function to handle change in version state dropdown
    const handleVersionStateChange = function () {
        // Check if current container already has a custom input field
        let customInputContainer = document.getElementById('customVersionStateContainer');

        // If "Other" is selected, create a custom input field if it doesn't exist
        if (versionStateSelect.value === "Other") {
            console.log("Other selected for version state, handling custom input field");

            // If the container doesn't exist yet, create it
            if (!customInputContainer) {
                console.log("Creating new custom version state input field");

                // Create container for custom input
                customInputContainer = document.createElement('div');
                customInputContainer.id = 'customVersionStateContainer';
                customInputContainer.className = 'form-group';
                customInputContainer.style.marginTop = '10px';

                // Create label for custom input
                const label = document.createElement('label');
                label.textContent = 'Custom State/Location';
                label.className = 'control-label';

                // Create input field
                const customInput = document.createElement('input');
                customInput.type = 'text';
                customInput.id = 'customVersionState';
                customInput.className = 'form-control';
                customInput.placeholder = 'Enter custom state/location';

                // Retrieve any previous custom value if available
                if (versionStateSelect.hasAttribute('data-custom-value')) {
                    customInput.value = versionStateSelect.getAttribute('data-custom-value');
                }

                // Add event listener to update version state value
                customInput.addEventListener('input', function () {
                    // Always store the current value, even if empty
                    versionStateSelect.setAttribute('data-custom-value', customInput.value);

                    // Trigger change event for subject line update
                    const event = new Event('change', { bubbles: true });
                    versionStateSelect.dispatchEvent(event);
                });

                // Append elements to container
                customInputContainer.appendChild(label);
                customInputContainer.appendChild(customInput);

                // Insert container after version state select
                versionStateSelect.parentNode.insertBefore(customInputContainer, versionStateSelect.nextSibling);

                // Focus the input field to make it immediately usable
                setTimeout(() => {
                    customInput.focus();
                }, 50);
            }
        } else {
            // If not "Other", remove the custom input container if it exists
            if (customInputContainer) {
                customInputContainer.remove();
            }
        }
    };

    // Add event listener to version state dropdown
    versionStateSelect.addEventListener('change', handleVersionStateChange);

    // Run once on load in case "Other" is already selected
    handleVersionStateChange();
}

// Helper to get version value (custom or selected)
function getVersionValue(versionField) {
    if (versionField.value === "Other" && versionField.hasAttribute('data-custom-value')) {
        return versionField.getAttribute('data-custom-value');
    }
    return versionField.value;
}

// Helper to get version state value (custom or selected)
function getVersionStateValue(versionStateField) {
    if (versionStateField.value === "Other" && versionStateField.hasAttribute('data-custom-value')) {
        return versionStateField.getAttribute('data-custom-value');
    }
    return versionStateField.value;
}

// Setup clear formatting button for Quill editors
function setupClearFormattingButton() {
    // Check if Quill is available
    if (typeof Quill === 'undefined') {
        console.warn("Quill not found for setting up clear formatting button");
        // Retry after a delay in case Quill is still loading
        setTimeout(setupClearFormattingButton, 1000);
        return;
    }

    // Add custom format button to Quill toolbar if possible
    addFormatButtonToQuillDefaults();

    // First check for toolbars directly - this is more reliable
    const toolbars = document.querySelectorAll('.ql-toolbar');
    if (toolbars.length > 0) {
        console.log(`Found ${toolbars.length} Quill toolbars`);

        toolbars.forEach((toolbar, index) => {
            // Skip if toolbar already has a clean button
            if (toolbar.querySelector('.ql-clean')) return;

            // Create clean formatting button
            const cleanButton = document.createElement('button');
            cleanButton.className = 'ql-clean';
            cleanButton.type = 'button';
            cleanButton.innerHTML = '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="5" x2="13" y1="3" y2="3"></line><line class="ql-stroke" x1="6" x2="9.35" y1="12" y2="3"></line><line class="ql-stroke" x1="11" x2="15" y1="11" y2="15"></line><line class="ql-stroke" x1="15" x2="11" y1="11" y2="15"></line><rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="7" x="2" y="14"></rect></svg>';
            cleanButton.title = 'Clear formatting';

            // Add button to toolbar
            toolbar.appendChild(cleanButton);

            // Find the associated editor container and editor
            const editorContainer = toolbar.closest('.quill-editor-container, .quill-editor, .richtext-container');
            let editor = null;

            if (editorContainer) {
                editor = editorContainer.querySelector('.ql-editor');
            } else {
                // Look for an editor that follows this toolbar
                const parentContainer = toolbar.parentElement;
                if (parentContainer) {
                    editor = parentContainer.querySelector('.ql-editor');
                }
            }

            // Add click handler
            cleanButton.addEventListener('click', () => {
                // Try to find the Quill instance
                let quill = null;

                try {
                    // Method 1: Look for Quill instance in the editor's parent
                    if (editor) {
                        const editorParent = editor.parentElement;
                        if (editorParent && editorParent.__quill) {
                            quill = editorParent.__quill;
                        }
                    }

                    // Method 2: Use Quill.find if available
                    if (!quill && editor && Quill.find) {
                        quill = Quill.find(editor);
                    }

                    // Method 3: Check for Quill instance in container
                    if (!quill && editorContainer && editorContainer.__quill) {
                        quill = editorContainer.__quill;
                    }

                    if (!quill) {
                        console.log("Could not find Quill instance for toolbar");
                        return;
                    }

                    // Get current selection
                    const range = quill.getSelection();
                    if (range && range.length > 0) {
                        // Remove all formatting from the selected text
                        quill.removeFormat(range.index, range.length);
                    } else if (range) {
                        // If cursor is just placed, use the current word
                        const text = quill.getText();
                        const currentPos = range.index;

                        // Find word boundaries
                        let startPos = currentPos;
                        while (startPos > 0 && !/\s/.test(text[startPos - 1])) {
                            startPos--;
                        }

                        let endPos = currentPos;
                        while (endPos < text.length && !/\s/.test(text[endPos])) {
                            endPos++;
                        }

                        if (endPos > startPos) {
                            quill.removeFormat(startPos, endPos - startPos);
                        }
                    } else {
                        console.log('Select text to clear formatting');
                    }
                } catch (error) {
                    console.error("Error while applying clear formatting:", error);
                }
            });

            console.log(`Added clear formatting button to toolbar ${index + 1}`);
        });

        // Skip editor search if we already processed all toolbars
        return;
    }

    // Fallback: find all Quill editor instances using element classes
    // This is less reliable but provides backward compatibility
    const quillElements = document.querySelectorAll('.ql-container, .ql-editor, [data-quill="true"], .quill-editor');

    // Filter elements to only include likely editor containers
    const likelyEditors = Array.from(quillElements).filter(el => {
        // Skip elements that are children of .ql-container (they're already covered by their parent)
        if (el.closest('.ql-container') && !el.classList.contains('ql-container')) {
            return false;
        }

        // Skip elements that don't have or contain an editor
        if (!el.classList.contains('ql-editor') && !el.querySelector('.ql-editor')) {
            return false;
        }

        return true;
    });

    if (likelyEditors.length > 0) {
        console.log(`Found ${likelyEditors.length} likely Quill editors`);
    } else {
        // No editors found, no need to continue
        return;
    }

    // Process each likely editor
    likelyEditors.forEach((element, index) => {
        // Find the actual editor - might be the element itself or a child
        const editorElement = element.classList.contains('ql-editor') ? element : element.querySelector('.ql-editor');
        if (!editorElement) return;

        // Find the toolbar - might be a sibling or ancestor's child
        let toolbar = null;

        // Method 1: Look for a direct toolbar in the editor's container
        const container = editorElement.closest('.quill-editor, .rich-text-editor, .richtext-container, .ql-container');
        if (container) {
            toolbar = container.querySelector('.ql-toolbar');
            // Also check previous sibling
            if (!toolbar && container.previousElementSibling && container.previousElementSibling.classList.contains('ql-toolbar')) {
                toolbar = container.previousElementSibling;
            }
        }

        // Method 2: Look for a toolbar as previous sibling of the container
        if (!toolbar && container && container.previousElementSibling) {
            if (container.previousElementSibling.classList.contains('ql-toolbar')) {
                toolbar = container.previousElementSibling;
            }
        }

        // Method 3: Look for a toolbar in a common parent
        if (!toolbar) {
            const parent = editorElement.parentElement;
            if (parent) {
                toolbar = parent.querySelector('.ql-toolbar');
                // Look at parent's siblings
                if (!toolbar && parent.previousElementSibling) {
                    if (parent.previousElementSibling.classList.contains('ql-toolbar')) {
                        toolbar = parent.previousElementSibling;
                    }
                }
            }
        }

        if (!toolbar) {
            // Only log if debug is enabled or first occurrence
            if (index === 0) {
                console.log(`Could not find toolbar for editor ${index + 1}`);
            }
            return;
        }

        // Check if toolbar already has a clear button
        if (toolbar.querySelector('.ql-clean')) {
            return;
        }

        // Create clean formatting button
        const cleanButton = document.createElement('button');
        cleanButton.className = 'ql-clean';
        cleanButton.type = 'button';
        cleanButton.innerHTML = '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="5" x2="13" y1="3" y2="3"></line><line class="ql-stroke" x1="6" x2="9.35" y1="12" y2="3"></line><line class="ql-stroke" x1="11" x2="15" y1="11" y2="15"></line><line class="ql-stroke" x1="15" x2="11" y1="11" y2="15"></line><rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="7" x="2" y="14"></rect></svg>';
        cleanButton.title = 'Clear formatting';

        // Add button to toolbar
        toolbar.appendChild(cleanButton);

        // Add click handler
        cleanButton.addEventListener('click', () => {
            // Try to find the Quill instance
            let quill = null;

            try {
                // Method 1: Use Quill.find if available
                if (Quill.find && editorElement) {
                    quill = Quill.find(editorElement);
                }

                // Method 2: Check for Quill instance in data attribute
                if (!quill && container && container.__quill) {
                    quill = container.__quill;
                }

                // Method 3: Find the editor's container and look for quill instance
                if (!quill) {
                    const editorContainer = editorElement.closest('[data-quill]');
                    if (editorContainer && editorContainer.__quill) {
                        quill = editorContainer.__quill;
                    }
                }

                // Method 4: Look for Quill instance in the editor's parent
                if (!quill && editorElement.parentElement && editorElement.parentElement.__quill) {
                    quill = editorElement.parentElement.__quill;
                }

                if (!quill) {
                    console.warn("Could not find Quill instance for editor");
                    return;
                }

                // Get current selection
                const range = quill.getSelection();
                if (range && range.length > 0) {
                    // Remove all formatting from the selected text
                    quill.removeFormat(range.index, range.length);
                } else if (range) {
                    // If cursor is just placed, use the current word
                    const text = quill.getText();
                    const currentPos = range.index;

                    // Find word boundaries
                    let startPos = currentPos;
                    while (startPos > 0 && !/\s/.test(text[startPos - 1])) {
                        startPos--;
                    }

                    let endPos = currentPos;
                    while (endPos < text.length && !/\s/.test(text[endPos])) {
                        endPos++;
                    }

                    if (endPos > startPos) {
                        quill.removeFormat(startPos, endPos - startPos);
                    }
                } else {
                    console.log('Select text to clear formatting');
                }
            } catch (error) {
                console.error("Error while applying clear formatting:", error);
            }
        });

        console.log(`Added clear formatting button to Quill editor ${index + 1}`);
    });
}

// Function to add clear formatting to Quill defaults if possible
function addFormatButtonToQuillDefaults() {
    try {
        // Try to add the clean button to default Quill configuration
        if (typeof Quill !== 'undefined' && Quill.import) {
            // Import Toolbar module
            const Toolbar = Quill.import('modules/toolbar');
            if (!Toolbar) return;

            // Get default modules
            const defaultModules = Quill.imports && Quill.imports.modules;
            if (!defaultModules) return;

            // Add to all toolbar instances on page
            const toolbars = document.querySelectorAll('.ql-toolbar');
            toolbars.forEach(toolbar => {
                // Skip if it already has a clean button
                if (toolbar.querySelector('.ql-clean')) return;

                // Create clean formatting button
                const cleanButton = document.createElement('button');
                cleanButton.className = 'ql-clean';
                cleanButton.type = 'button';
                cleanButton.innerHTML = '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="5" x2="13" y1="3" y2="3"></line><line class="ql-stroke" x1="6" x2="9.35" y1="12" y2="3"></line><line class="ql-stroke" x1="11" x2="15" y1="11" y2="15"></line><line class="ql-stroke" x1="15" x2="11" y1="11" y2="15"></line><rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="7" x="2" y="14"></rect></svg>';
                cleanButton.title = 'Clear formatting';

                // Add button to toolbar
                toolbar.appendChild(cleanButton);

                // Try to associate with a Quill instance
                const editorContainer = toolbar.closest('.quill-editor');
                const editor = editorContainer ? editorContainer.querySelector('.ql-editor') : null;

                // Add click handler
                cleanButton.addEventListener('click', () => {
                    // Try different methods to find the Quill instance
                    let quill = null;

                    // Method 1: Use cached instance if available
                    if (editorContainer && editorContainer.__quill) {
                        quill = editorContainer.__quill;
                    }
                    // Method 2: Find via Quill.find
                    else if (editor && Quill.find) {
                        quill = Quill.find(editor);
                    }

                    if (quill) {
                        const range = quill.getSelection();
                        if (range && range.length > 0) {
                            quill.removeFormat(range.index, range.length);
                        } else if (range) {
                            // If cursor is just placed, use the current word
                            const text = quill.getText();
                            const currentPos = range.index;

                            // Find word boundaries
                            let startPos = currentPos;
                            while (startPos > 0 && !/\s/.test(text[startPos - 1])) {
                                startPos--;
                            }

                            let endPos = currentPos;
                            while (endPos < text.length && !/\s/.test(text[endPos])) {
                                endPos++;
                            }

                            if (endPos > startPos) {
                                quill.removeFormat(startPos, endPos - startPos);
                            }
                        }
                    }
                });
            });

            console.log("Added clear formatting to Quill defaults");
        }
    } catch (error) {
        console.error("Error adding format button to Quill defaults:", error);
    }
}

// Set up clear formatting button when editors are loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initial setup
    setTimeout(setupClearFormattingButton, 1000);

    // Try again after a delay to catch any editors loaded later
    setTimeout(setupClearFormattingButton, 2500);

    // Add mutation observer to watch for dynamically added editors
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                // Check if any added nodes contain Quill editors or toolbars
                let hasEditor = false;
                let hasToolbar = false;

                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Check for editor elements
                        if (node.classList &&
                            (node.classList.contains('ql-editor') ||
                                node.classList.contains('quill-editor') ||
                                node.querySelector('.ql-editor'))) {
                            hasEditor = true;
                        }

                        // Check for toolbar elements
                        if (node.classList &&
                            (node.classList.contains('ql-toolbar') ||
                                node.querySelector('.ql-toolbar'))) {
                            hasToolbar = true;
                        }
                    }
                });

                if (hasEditor || hasToolbar) {
                    console.log("Detected new Quill editor or toolbar, updating formatting buttons");
                    setTimeout(setupClearFormattingButton, 100);
                }
            }
        });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for events that might indicate a new editor has been created
    document.addEventListener('quill-editor-created', function () {
        console.log("Quill editor created event detected");
        setTimeout(setupClearFormattingButton, 100);
    });

    // Also check when tab visibility changes (user might have switched back to the tab)
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            setTimeout(setupClearFormattingButton, 500);
        }
    });
});

// Add setupClearFormattingButton to each tracker's onLoad function

// Modify the assembly-rollover onLoad function
const originalAssemblyRolloverOnLoad = TRACKER_CONFIGS["assembly-rollover"].onLoad;
TRACKER_CONFIGS["assembly-rollover"].onLoad = function () {
    originalAssemblyRolloverOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// Modify the assembly onLoad function
const originalAssemblyOnLoad = TRACKER_CONFIGS["assembly"].onLoad;
TRACKER_CONFIGS["assembly"].onLoad = function () {
    originalAssemblyOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// Modify the feature-request onLoad function
const originalFeatureRequestOnLoad = TRACKER_CONFIGS["feature-request"].onLoad;
TRACKER_CONFIGS["feature-request"].onLoad = function () {
    originalFeatureRequestOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// Modify the sedcust onLoad function
const originalSedcustOnLoad = TRACKER_CONFIGS["sedcust"].onLoad;
TRACKER_CONFIGS["sedcust"].onLoad = function () {
    originalSedcustOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// Modify the sim-assignment onLoad function
const originalSimAssignmentOnLoad = TRACKER_CONFIGS["sim-assignment"].onLoad;
TRACKER_CONFIGS["sim-assignment"].onLoad = function () {
    originalSimAssignmentOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
    // Note: setupResourceReportTypeCondition removed since SIM Assignment no longer has conditional Report Type field
};

// Modify the sim-assessment-reports onLoad function
const originalSimAssessmentReportsOnLoad = TRACKER_CONFIGS["sim-assessment-reports"].onLoad;
TRACKER_CONFIGS["sim-assessment-reports"].onLoad = function () {
    originalSimAssessmentReportsOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
    // Note: setupResourceReportTypeCondition removed since SIM Assessment Reports no longer has conditional Report Type field
};

// sim-fsa
const originalSimFsaOnLoad = TRACKER_CONFIGS["sim-fsa"].onLoad;
TRACKER_CONFIGS["sim-fsa"].onLoad = function () {
    originalSimFsaOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
    // Note: setupResourceReportTypeCondition removed since SIM FSA no longer has conditional Report Type field
};

// sim-library-view
const originalSimLibraryViewOnLoad = TRACKER_CONFIGS["sim-library-view"].onLoad;
TRACKER_CONFIGS["sim-library-view"].onLoad = function () {
    originalSimLibraryViewOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
    // Note: setupResourceReportTypeCondition removed since SIM Library View no longer has conditional Report Type field
};

// sim-orr
const originalSimOrrOnLoad = TRACKER_CONFIGS["sim-orr"].onLoad;
TRACKER_CONFIGS["sim-orr"].onLoad = function () {
    originalSimOrrOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
    setTimeout(setupResourceReportTypeCondition, 100);
};

// sim-plan-teach
const originalSimPlanTeachOnLoad = TRACKER_CONFIGS["sim-plan-teach"].onLoad;
TRACKER_CONFIGS["sim-plan-teach"].onLoad = function () {
    originalSimPlanTeachOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
    setTimeout(setupResourceReportTypeCondition, 100);
};

// sim-reading-log
const originalSimReadingLogOnLoad = TRACKER_CONFIGS["sim-reading-log"].onLoad;
TRACKER_CONFIGS["sim-reading-log"].onLoad = function () {
    originalSimReadingLogOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
    setTimeout(setupResourceReportTypeCondition, 100);
};

// sim-dashboard
const originalSimDashboardOnLoad = TRACKER_CONFIGS["sim-dashboard"].onLoad;
TRACKER_CONFIGS["sim-dashboard"].onLoad = function () {
    originalSimDashboardOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
    setTimeout(setupResourceReportTypeCondition, 100);
};

// Add function to sim-achievement-levels which doesn't have an onLoad function yet
TRACKER_CONFIGS["sim-achievement-levels"].onLoad = function () {
    console.log("SIM Achievement Levels Tracker onLoad function executing");
    setTimeout(setupClearFormattingButton, 500);

    // If the trackerApp is available, call its setupSmartsheetUploader method
    if (window.trackerApp && typeof window.trackerApp.setupSmartsheetUploader === 'function') {
        console.log("Setting up smartsheet uploader through trackerApp");
        window.trackerApp.setupSmartsheetUploader();
    } else {
        console.warn("TrackerApp or setupSmartsheetUploader not available");
    }
};

// dpt
const originalDptOnLoad = TRACKER_CONFIGS["dpt"].onLoad;
TRACKER_CONFIGS["dpt"].onLoad = function () {
    originalDptOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// timeout-extension
const originalTimeoutExtensionOnLoad = TRACKER_CONFIGS["timeout-extension"].onLoad;
TRACKER_CONFIGS["timeout-extension"].onLoad = function () {
    originalTimeoutExtensionOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// help-article
const originalHelpArticleOnLoad = TRACKER_CONFIGS["help-article"].onLoad;
TRACKER_CONFIGS["help-article"].onLoad = function () {
    originalHelpArticleOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// Export the tracker configurations for use in tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TRACKER_CONFIGS };
}

// Helper function to setup conditional field display for Resource/Report Type
function setupResourceReportTypeCondition(retryCount = 0) {
    console.log(`Setting up Resource/Report Type conditional display (attempt ${retryCount + 1})`);

    const resourceField = document.getElementById('resource');
    const reportTypeField = document.getElementById('reportType');

    // If fields aren't found, retry up to 5 times
    if (!resourceField || !reportTypeField) {
        if (retryCount < 5) {
            console.log(`Fields not found yet, retrying in 500ms...`);
            setTimeout(() => setupResourceReportTypeCondition(retryCount + 1), 500);
            return;
        } else {
            console.error("Could not find Resource or Report Type fields after 5 attempts");
            return;
        }
    }

    // Find the form-group container for the Report Type field
    const reportTypeContainer = reportTypeField.closest('.form-group');

    if (!reportTypeContainer) {
        console.error("Report Type container (.form-group) not found");
        return;
    }

    // Function to trigger subject line update
    function triggerSubjectUpdate() {
        // Check if we have the tracker app instance with the appropriate update method
        if (window.trackerApp) {
            if (window.trackerApp.trackerType === 'sim-assignment' && typeof window.trackerApp.updateSimAssignmentSubject === 'function') {
                console.log("Triggering SIM Assignment subject update after Resource/Report Type change");
                window.trackerApp.updateSimAssignmentSubject();
            } else if (window.trackerApp.trackerType === 'sim-assessment-reports' && typeof window.trackerApp.updateSIMAssessmentReportsSubject === 'function') {
                console.log("Triggering SIM Assessment Reports subject update after Resource/Report Type change");
                window.trackerApp.updateSIMAssessmentReportsSubject();
            }
            // Add other SIM tracker types here if they use Resource/Report Type fields
        }
    }

    // Function to toggle report type visibility
    function toggleReportType() {
        const selectedValue = resourceField.value;
        console.log(`Resource field value changed to: ${selectedValue}`);

        if (selectedValue === 'Reports') {
            reportTypeContainer.style.display = '';
            // Make the field required when shown
            reportTypeField.required = true;

            // Re-attach event listeners to Report Type field when shown
            reportTypeField.removeEventListener('change', triggerSubjectUpdate);
            reportTypeField.removeEventListener('input', triggerSubjectUpdate);
            reportTypeField.addEventListener('change', triggerSubjectUpdate);
            reportTypeField.addEventListener('input', triggerSubjectUpdate);
        } else {
            reportTypeContainer.style.display = 'none';
            // Clear the value and make it not required when hidden
            reportTypeField.value = '';
            reportTypeField.required = false;
        }

        // Always trigger subject update when Resource changes
        triggerSubjectUpdate();
    }

    // Ensure the Resource field has a default value if none is set
    if (!resourceField.value || resourceField.value === '') {
        // Check if there's an empty option and if so, select "Placeholder" instead
        const placeholderOption = Array.from(resourceField.options).find(opt => opt.value === 'Placeholder');
        if (placeholderOption) {
            resourceField.value = 'Placeholder';
            console.log('Set Resource field default value to "Placeholder"');
        }
    }

    // Force hide the Report Type field initially unless "Reports" is selected
    if (resourceField.value !== 'Reports') {
        reportTypeContainer.style.display = 'none';
        reportTypeField.value = '';
        reportTypeField.required = false;
        console.log('Initially hiding Report Type field');
    } else {
        // If Reports is initially selected, attach event listeners to Report Type
        reportTypeField.removeEventListener('change', triggerSubjectUpdate);
        reportTypeField.removeEventListener('input', triggerSubjectUpdate);
        reportTypeField.addEventListener('change', triggerSubjectUpdate);
        reportTypeField.addEventListener('input', triggerSubjectUpdate);
    }

    // Add event listener to Resource field
    resourceField.removeEventListener('change', toggleReportType);
    resourceField.addEventListener('change', toggleReportType);

    // Also ensure the Resource field triggers subject updates
    resourceField.removeEventListener('change', triggerSubjectUpdate);
    resourceField.removeEventListener('input', triggerSubjectUpdate);
    resourceField.addEventListener('change', triggerSubjectUpdate);
    resourceField.addEventListener('input', triggerSubjectUpdate);

    console.log("Resource/Report Type conditional display setup complete");

    // Trigger initial subject update in case fields are pre-populated
    setTimeout(triggerSubjectUpdate, 100);
}

// Draft Management System
class DraftManager {
    constructor() {
        this.storageKey = 'trackerDrafts';
    }

    // Generate a unique draft ID
    generateDraftId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Save a draft
    saveDraft(draftName, templateType, formData, options = {}) {
        try {
            const drafts = this.getAllDrafts();
            const draftId = options.draftId || this.generateDraftId();

            const draft = {
                id: draftId,
                name: draftName,
                templateType: templateType,
                formData: formData,
                createdAt: options.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: '1.0'
            };

            drafts[draftId] = draft;
            localStorage.setItem(this.storageKey, JSON.stringify(drafts));

            console.log(`Draft "${draftName}" saved successfully`);
            return draftId;
        } catch (error) {
            console.error('Error saving draft:', error);
            throw new Error('Failed to save draft');
        }
    }

    // Get all drafts
    getAllDrafts() {
        try {
            const drafts = localStorage.getItem(this.storageKey);
            return drafts ? JSON.parse(drafts) : {};
        } catch (error) {
            console.error('Error loading drafts:', error);
            return {};
        }
    }

    // Get a specific draft
    getDraft(draftId) {
        const drafts = this.getAllDrafts();
        return drafts[draftId] || null;
    }

    // Delete a draft
    deleteDraft(draftId) {
        try {
            const drafts = this.getAllDrafts();
            if (drafts[draftId]) {
                delete drafts[draftId];
                localStorage.setItem(this.storageKey, JSON.stringify(drafts));
                console.log(`Draft ${draftId} deleted successfully`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting draft:', error);
            throw new Error('Failed to delete draft');
        }
    }

    // Get drafts as an array sorted by last updated
    getDraftsArray() {
        const drafts = this.getAllDrafts();
        return Object.values(drafts).sort((a, b) =>
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
    }

    // Update an existing draft
    updateDraft(draftId, draftName, formData) {
        const draft = this.getDraft(draftId);
        if (!draft) {
            throw new Error('Draft not found');
        }

        return this.saveDraft(draftName, draft.templateType, formData, {
            draftId: draftId,
            createdAt: draft.createdAt
        });
    }

    // Clean up old drafts (optional - keep last 20 drafts)
    cleanupOldDrafts(maxDrafts = 20) {
        try {
            const draftsArray = this.getDraftsArray();
            if (draftsArray.length > maxDrafts) {
                const drafts = this.getAllDrafts();
                const toDelete = draftsArray.slice(maxDrafts);

                toDelete.forEach(draft => {
                    delete drafts[draft.id];
                });

                localStorage.setItem(this.storageKey, JSON.stringify(drafts));
                console.log(`Cleaned up ${toDelete.length} old drafts`);
            }
        } catch (error) {
            console.error('Error cleaning up old drafts:', error);
        }
    }

    // Get template configuration for a draft
    getTemplateConfig(templateType) {
        return TRACKER_CONFIGS[templateType] || null;
    }

    // Extract form data from the current form
    extractFormData() {
        const formData = {};

        // Get all form inputs
        const form = document.getElementById('tracker-form');
        if (!form) return formData;

        // Regular form fields
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.name && input.name.startsWith('userRole')) {
                    // Handle checkbox groups
                    if (!formData[input.name]) {
                        formData[input.name] = [];
                    }
                    if (input.checked) {
                        formData[input.name].push(input.value || input.id);
                    }
                } else {
                    formData[input.id] = input.checked;
                }
            } else {
                formData[input.id] = input.value;
            }
        });

        // Quill editors (rich text)
        const quillEditors = document.querySelectorAll('.ql-editor');
        quillEditors.forEach(editor => {
            const container = editor.closest('[id]');
            if (container) {
                formData[container.id] = editor.innerHTML;
            }
        });

        return formData;
    }

    // Populate form with draft data
    populateForm(formData) {
        if (!formData) return;

        // Populate regular form fields
        Object.keys(formData).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            if (field.type === 'checkbox') {
                field.checked = formData[fieldId];
            } else if (field.name && field.name.startsWith('userRole') && Array.isArray(formData[fieldId])) {
                // Handle checkbox groups
                formData[fieldId].forEach(value => {
                    const checkbox = document.getElementById(value) ||
                        document.querySelector(`input[value="${value}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            } else {
                field.value = formData[fieldId];
            }
        });

        // Populate Quill editors
        setTimeout(() => {
            Object.keys(formData).forEach(fieldId => {
                const container = document.getElementById(fieldId);
                if (container && container.classList.contains('ql-container')) {
                    const editor = container.querySelector('.ql-editor');
                    if (editor && typeof formData[fieldId] === 'string' && formData[fieldId].includes('<')) {
                        editor.innerHTML = formData[fieldId];
                    }
                }
            });
        }, 500);
    }
}

// Global draft manager instance
window.draftManager = new DraftManager();

// Helper functions for form integration
window.saveDraftFromForm = function (draftName) {
    if (!window.trackerApp || !window.trackerApp.selectedTemplate) {
        console.error('No template selected');
        if (window.trackerApp && typeof window.trackerApp.showNotification === 'function') {
            window.trackerApp.showNotification('No template selected', 'error');
        }
        return;
    }

    try {
        const formData = window.draftManager.extractFormData();
        const draftId = window.draftManager.saveDraft(
            draftName,
            window.trackerApp.selectedTemplate,
            formData
        );

        console.log(`Draft "${draftName}" saved successfully!`);
        if (window.trackerApp && typeof window.trackerApp.showNotification === 'function') {
            window.trackerApp.showNotification(`Draft "${draftName}" saved successfully!`, 'success');
        }
        return draftId;
    } catch (error) {
        console.error('Error saving draft from form:', error);
        if (window.trackerApp && typeof window.trackerApp.showNotification === 'function') {
            window.trackerApp.showNotification('Failed to save draft. Please try again.', 'error');
        }
    }
};

window.loadDraftToForm = function (draftId) {
    try {
        const draft = window.draftManager.getDraft(draftId);
        if (!draft) {
            console.error('Draft not found');
            if (window.trackerApp && typeof window.trackerApp.showNotification === 'function') {
                window.trackerApp.showNotification('Draft not found', 'error');
            }
            return;
        }

        // Store the draft info for later use
        localStorage.setItem('loadingDraft', JSON.stringify({
            draftId: draftId,
            formData: draft.formData
        }));

        // Navigate to the tracker form
        localStorage.setItem('selectedTemplate', draft.templateType);
        window.location.href = 'dynamic-tracker.html';
    } catch (error) {
        console.error('Error loading draft:', error);
        if (window.trackerApp && typeof window.trackerApp.showNotification === 'function') {
            window.trackerApp.showNotification('Failed to load draft. Please try again.', 'error');
        }
    }
};

