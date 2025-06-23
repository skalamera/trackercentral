// Import utility functions
// Note: In browser environment, these functions will be loaded from utils/*.js files
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState from app/utils/fieldPopulators.js
// - setupCustomVersionInput, setupCustomVersionStateInput, getVersionValue, getVersionStateValue from app/utils/versionFieldHandlers.js
// - setupClearFormattingButton, addFormatButtonToQuillDefaults from app/utils/quillHelpers.js

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
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Auto-populates from original ticket. If not, choose Yes if the District is VIP and No if it is not. You can review the VIP list if you are unsure, but the original ticket should indicate if the user's district is VIP. Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    {
                        id: "districtName",
                        type: "text",
                        label: "District Name",
                        required: true,
                        hint: "Auto-populates from original ticket.",
                        readOnly: true
                    },
                    {
                        id: "districtState",
                        type: "text",
                        label: "District State",
                        required: true,
                        placeholder: "Ex: FL",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field, be sure to only use the state abbreviation."
                    },
                    {
                        id: "issue",
                        type: "text",
                        label: "Issue",
                        required: true,
                        value: "Assembly Rollover",
                        hint: "This field will auto-populate and always be \"Assembly Rollover\" and cannot be edited",
                        readOnly: true
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy.",
                        readOnly: true
                    }
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
                        label: "",
                        required: true,
                        defaultValue: "This district has received new subscriptions / assemblies & Order Concerns is unable to remove the old subs / assemblies."
                    }
                ]
            },
            {
                id: "details",
                title: "DESCRIPTION",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "districtName", type: "text", label: "District Name", required: true, hint: "Auto-populates from original ticket.", readOnly: true },
                    { id: "districtBURCLink", type: "text", label: "District BURC Link", required: true, hint: "Paste the district's BURC Link.", placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/3138327/dashboard" },
                    { id: "effectiveDate", type: "date", label: "Effective Return Date", required: true, hint: "Select the effective return date.<br>Note: the effective return date is the date the customer service rep processed the return in NetSuite. This date should be provided in the initial ticket request. If it is not provided, you will need to ask the person who submitted the ticket." },
                    { id: "assemblyCodes", type: "textarea", label: "Assembly Codes To Be Removed", required: true, hint: "Enter or upload the assembly codes that need to be removed.", placeholder: "Ex: X100876 BEC Benchmark Advance 2022 (National Edition) Gr. 2 Student Digital Subscription" }
                ]
            }
        ],
        // Function to generate description HTML for this tracker type
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div>Please see the BL Xcode removal request below.</div>';
            description += '<div style="margin-bottom: 20px;"></div>';

            // Always add summary section (includes default text if no custom content)
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SUMMARY</span></div>';
            if (fields.summaryContent && fields.summaryContent.trim() !== '<p><br></p>') {
                description += `<div>${fields.summaryContent}</div>`;
            } else {
                // Use default text if no content provided
                description += '<div>This district has received new subscriptions / assemblies & Order Concerns is unable to remove the old subs / assemblies.</div>';
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">DESCRIPTION</span></div>';
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `District BURC Link: ${fields.districtBURCLink || ''}<br>`;
            description += `Effective Return Date: ${formatDate(fields.effectiveDate) || ''}<br>`;
            description += `Assembly Codes To Be Removed:<br>${fields.assemblyCodes || ''}`;

            return description;
        },
        // Add onLoad function to tag the source ticket with "ESCALATED TO ASSEMBLY"
        onLoad: function () {
            console.log("Assembly Rollover onLoad function executing");

            // First populate Application Name from product info
            populateApplicationName();

            // Auto-populate district state for assembly rollover
            populateDistrictState();

            // Populate summary section with default text
            function populateSummaryDefault(retryCount = 0) {
                console.log(`Assembly Rollover: Attempting to populate summary (attempt ${retryCount + 1})`);

                // Debug: Log all elements we can find
                if (retryCount === 0) {
                    console.log("Assembly Rollover: Debug - All elements with ID summaryContent:", document.querySelectorAll('#summaryContent'));
                    console.log("Assembly Rollover: Debug - All .ql-editor elements:", document.querySelectorAll('.ql-editor'));
                    console.log("Assembly Rollover: Debug - All .quill-editor elements:", document.querySelectorAll('.quill-editor'));
                    console.log("Assembly Rollover: Debug - Looking for TrackerApp.quillInstances");
                    if (window.trackerApp && window.trackerApp.quillInstances) {
                        console.log("Assembly Rollover: Debug - TrackerApp quill instances:", Object.keys(window.trackerApp.quillInstances));
                    }
                }

                // Method 1: Try to use the Quill instance directly
                let quillInstance = null;
                if (window.trackerApp && window.trackerApp.quillInstances && window.trackerApp.quillInstances.summaryContent) {
                    quillInstance = window.trackerApp.quillInstances.summaryContent;
                    console.log("Assembly Rollover: Found Quill instance for summaryContent");
                }

                if (quillInstance) {
                    const currentContent = quillInstance.root.innerHTML;
                    console.log("Assembly Rollover: Current Quill content via instance:", currentContent);

                    // Check if content is empty or just contains default Quill placeholder
                    if (!currentContent ||
                        currentContent.trim() === '' ||
                        currentContent.trim() === '<p><br></p>' ||
                        currentContent.trim() === '<p></p>' ||
                        currentContent.trim() === '<div><br></div>') {

                        quillInstance.root.innerHTML = '<p>This district has received new subscriptions / assemblies & Order Concerns is unable to remove the old subs / assemblies.</p>';
                        console.log("Assembly Rollover: Populated summary via Quill instance");

                        // Trigger Quill change event
                        quillInstance.emitter.emit('text-change');
                        return;
                    } else {
                        console.log("Assembly Rollover: Summary already has content via Quill instance, not overwriting");
                        return;
                    }
                }

                // Method 2: Try multiple selectors for the Quill editor
                let summaryEditor = document.querySelector('#summaryContent .ql-editor');
                if (!summaryEditor) {
                    summaryEditor = document.querySelector('[data-field-id="summaryContent"] .ql-editor');
                }
                if (!summaryEditor) {
                    summaryEditor = document.querySelector('.section[data-section-id="summary"] .ql-editor');
                }
                if (!summaryEditor) {
                    // Look for any Quill editor in the summary section
                    const summarySection = document.querySelector('.section[data-section-id="summary"]');
                    if (summarySection) {
                        summaryEditor = summarySection.querySelector('.ql-editor');
                    }
                }
                if (!summaryEditor) {
                    // Try looking for the summaryContent element and find any .ql-editor within it or its siblings
                    const summaryContent = document.getElementById('summaryContent');
                    if (summaryContent) {
                        summaryEditor = summaryContent.querySelector('.ql-editor');
                        if (!summaryEditor && summaryContent.parentElement) {
                            summaryEditor = summaryContent.parentElement.querySelector('.ql-editor');
                        }
                    }
                }

                console.log(`Assembly Rollover: Summary editor found via DOM:`, !!summaryEditor);

                if (summaryEditor) {
                    const currentContent = summaryEditor.innerHTML;
                    console.log(`Assembly Rollover: Current content via DOM:`, currentContent);

                    // Check if content is empty or just contains default Quill placeholder
                    if (!currentContent ||
                        currentContent.trim() === '' ||
                        currentContent.trim() === '<p><br></p>' ||
                        currentContent.trim() === '<p></p>' ||
                        currentContent.trim() === '<div><br></div>') {

                        summaryEditor.innerHTML = '<p>This district has received new subscriptions / assemblies & Order Concerns is unable to remove the old subs / assemblies.</p>';
                        console.log("Assembly Rollover: Populated summary section with default text via DOM");

                        // Try to trigger any change events
                        const event = new Event('input', { bubbles: true });
                        summaryEditor.dispatchEvent(event);
                    } else {
                        console.log("Assembly Rollover: Summary already has content via DOM, not overwriting");
                    }
                } else if (retryCount < 10) {
                    // Retry if editor not found yet
                    console.log(`Assembly Rollover: Summary editor not found, retrying in 500ms (attempt ${retryCount + 1}/10)`);
                    setTimeout(() => populateSummaryDefault(retryCount + 1), 500);
                } else {
                    console.warn("Assembly Rollover: Could not find summary editor after 10 attempts");
                }
            }

            // Try to populate immediately and with delays
            setTimeout(() => populateSummaryDefault(), 100);
            setTimeout(() => populateSummaryDefault(), 500);
            setTimeout(() => populateSummaryDefault(), 1500);
            setTimeout(() => populateSummaryDefault(), 3000);
            setTimeout(() => populateSummaryDefault(), 5000);

            // Set up a MutationObserver to watch for when Quill editors are added
            const summaryObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) { // Element node
                                // Check if this node or its children contain a Quill editor
                                if (node.classList && (node.classList.contains('ql-editor') || node.classList.contains('quill-editor') || node.querySelector('.ql-editor'))) {
                                    console.log("Assembly Rollover: MutationObserver detected Quill editor being added:", node);

                                    // Check if it's related to summary content
                                    const summarySection = document.querySelector('.section[data-section-id="summary"]');
                                    const summaryContent = document.getElementById('summaryContent');

                                    if ((summarySection && (summarySection.contains(node) || node.contains(summarySection))) ||
                                        (summaryContent && (summaryContent.contains(node) || node.contains(summaryContent))) ||
                                        node.id === 'summaryContent' ||
                                        node.classList.contains('ql-editor')) {
                                        console.log("Assembly Rollover: Detected summary-related Quill editor being added to DOM");
                                        setTimeout(() => populateSummaryDefault(), 100);
                                    }
                                }
                            }
                        });
                    }
                });
            });

            // Start observing
            summaryObserver.observe(document.body, { childList: true, subtree: true });

            // Stop observing after 10 seconds to avoid memory leaks
            setTimeout(() => {
                summaryObserver.disconnect();
                console.log("Assembly Rollover: Stopped observing for summary editor");
            }, 10000);

            // Set the Issue field to "Assembly Rollover" and make it readonly
            const issueField = document.getElementById('issue');
            if (issueField) {
                issueField.value = "Assembly Rollover";
                issueField.readOnly = true;
                issueField.style.backgroundColor = '#f0f0f0';
                issueField.style.color = '#666';
                issueField.style.border = '1px solid #ddd';
                issueField.style.cursor = 'not-allowed';
            }

            // Function to sync District Name from subject to description section
            function syncDistrictName() {
                // Get all district name fields (there should be 2 - one in subject, one in description)
                const allDistrictNameFields = document.querySelectorAll('#districtName');

                console.log(`Assembly Rollover: Found ${allDistrictNameFields.length} district name fields`);

                if (allDistrictNameFields.length >= 2) {
                    // The first one should be in the subject section, the second in description
                    const subjectDistrictNameField = allDistrictNameFields[0];
                    const descriptionDistrictNameField = allDistrictNameFields[1];

                    // Copy value from subject to description
                    descriptionDistrictNameField.value = subjectDistrictNameField.value;

                    // Make sure the description field is styled as auto-populated
                    if (!descriptionDistrictNameField.readOnly) {
                        descriptionDistrictNameField.style.backgroundColor = '#f0f0f0';
                        descriptionDistrictNameField.style.color = '#666';
                    }

                    console.log("Assembly Rollover: Synced District Name to description section:", subjectDistrictNameField.value);
                } else {
                    // Fallback to more specific selectors
                    const subjectDistrictNameField = document.querySelector('#section-subject #districtName') ||
                        document.querySelector('[data-section-id="subject"] #districtName') ||
                        document.getElementById('districtName');

                    const descriptionDistrictNameField = document.querySelector('#section-details #districtName') ||
                        document.querySelector('[data-section-id="details"] #districtName') ||
                        document.querySelector('#details #districtName');

                    if (subjectDistrictNameField && descriptionDistrictNameField) {
                        descriptionDistrictNameField.value = subjectDistrictNameField.value;

                        // Make sure the description field is styled as auto-populated
                        if (!descriptionDistrictNameField.readOnly) {
                            descriptionDistrictNameField.style.backgroundColor = '#f0f0f0';
                            descriptionDistrictNameField.style.color = '#666';
                        }

                        console.log("Assembly Rollover: Synced District Name to description section using fallback selectors:", subjectDistrictNameField.value);
                    } else {
                        console.log("Assembly Rollover: Could not find district name fields for syncing", {
                            subjectField: !!subjectDistrictNameField,
                            descriptionField: !!descriptionDistrictNameField,
                            totalFields: allDistrictNameFields.length
                        });
                    }
                }
            }

            // Set up event listener for District Name field synchronization
            // Use a more specific approach to ensure we get the right field
            setTimeout(() => {
                const allDistrictNameFields = document.querySelectorAll('#districtName');
                if (allDistrictNameFields.length > 0) {
                    // The first district name field should be in the subject section
                    const subjectDistrictNameField = allDistrictNameFields[0];
                    subjectDistrictNameField.addEventListener('input', syncDistrictName);
                    subjectDistrictNameField.addEventListener('change', syncDistrictName);
                    console.log("Assembly Rollover: Added event listeners to subject district name field");
                } else {
                    // Fallback approach
                    const subjectDistrictNameField = document.getElementById('districtName');
                    if (subjectDistrictNameField) {
                        subjectDistrictNameField.addEventListener('input', syncDistrictName);
                        subjectDistrictNameField.addEventListener('change', syncDistrictName);
                        console.log("Assembly Rollover: Added event listeners to district name field (fallback)");
                    }
                }
                // Initial sync
                syncDistrictName();
            }, 100);

            // Also check for district name population from ticket data
            setTimeout(() => {
                if (window.trackerApp && window.trackerApp.ticketData && window.trackerApp.ticketData.company) {
                    const companyName = window.trackerApp.ticketData.company.name;
                    const allDistrictNameFields = document.querySelectorAll('#districtName');

                    if (companyName && allDistrictNameFields.length > 0) {
                        const subjectDistrictNameField = allDistrictNameFields[0];
                        if (!subjectDistrictNameField.value) {
                            subjectDistrictNameField.value = companyName;
                            console.log("Assembly Rollover: Auto-populated district name from ticket data:", companyName);

                            // Trigger input event to ensure any listeners are fired
                            const event = new Event('input', { bubbles: true });
                            subjectDistrictNameField.dispatchEvent(event);

                            // Trigger sync after setting the value
                            setTimeout(syncDistrictName, 100);
                        }
                    }
                }
            }, 200);

            // Initialize TemplateBase for subject line formatting
            const templateBase = new TemplateBase({
                templateName: 'assembly-rollover',
                subjectLineFormat: 'assembly-rollover',
                additionalFields: ['issue'],
                requiredFields: ['districtName', 'districtState']
            });

            // Initialize the template (sets up event listeners and formats subject)
            templateBase.initialize();

            // Schedule District Name sync at multiple intervals to ensure it works
            setTimeout(syncDistrictName, 100);
            setTimeout(syncDistrictName, 500);
            setTimeout(syncDistrictName, 1000);
            setTimeout(syncDistrictName, 2000);

            // Set up a MutationObserver to watch for when the description section is added/rendered
            const districtNameObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) { // Element node
                                // Check if this node contains a district name field
                                const hasDistrictNameField = node.id === 'districtName' ||
                                    (node.querySelector && node.querySelector('#districtName'));

                                if (hasDistrictNameField) {
                                    console.log("Assembly Rollover: District name field detected in DOM");

                                    // Check if we now have both fields
                                    setTimeout(() => {
                                        const allDistrictNameFields = document.querySelectorAll('#districtName');
                                        if (allDistrictNameFields.length >= 2) {
                                            console.log("Assembly Rollover: Both district name fields now present, syncing");
                                            syncDistrictName();

                                            // Re-setup event listeners on the subject field
                                            const subjectField = allDistrictNameFields[0];
                                            subjectField.removeEventListener('input', syncDistrictName);
                                            subjectField.removeEventListener('change', syncDistrictName);
                                            subjectField.addEventListener('input', syncDistrictName);
                                            subjectField.addEventListener('change', syncDistrictName);
                                        }
                                    }, 100);
                                }
                            }
                        });
                    }
                });
            });

            // Start observing for dynamic content
            districtNameObserver.observe(document.body, { childList: true, subtree: true });

            // Stop observing after 10 seconds to avoid memory leaks
            setTimeout(() => {
                districtNameObserver.disconnect();
                console.log("Assembly Rollover: Stopped observing for description section");
            }, 10000);

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
                    { id: "xcode", type: "text", label: "Xcode", required: true, hint: "Enter the Xcode of the impacted resource.<br>Ex: X72525", placeholder: "Ex: X72525" },
                    { id: "hasMultipleXcodes", type: "select", label: "Multiple Xcodes", required: true, options: ["No", "Yes"], hint: "Select whether more than one Xcode is impacted.<br>Ex: Yes" },
                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "Ex: Advance -c2022", hint: "Auto-populates from original ticket." },
                    {
                        id: "version",
                        type: "select",
                        label: "Subscription Version",
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
                        hint: "Select the appropriate subscription version number from the dropdown.<br>Ex: 2.5"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State / National",
                        required: false,
                        options: [],
                        hint: "Select the corresponding state or national version from the dropdown.<br>Ex: 2.5 Virginia<br>Note: Just because a district is located in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "Ex: Unit 7 My Reading & Writing Missing", hint: "Enter a succinct description of the issue.<br>Ex: Unit 7 My Reading & Writing Missing" },
                    { id: "gradesImpacted", type: "text", label: "Grades Impacted", required: true, placeholder: "Ex: Grade K", hint: "Enter the Grade level impacted by the issue.<br>Ex: Grade K" },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will auto-populate based on your submissions. Be sure to review for accuracy.<br>Naming convention: Xcode (indicate if more than one) | VIP or Standard | Program Name • Variation National / State | Specific issue: grades impacted<br>Ex: X97536 | VIP | Advance - c2022 • 2.75 Virginia | Unit 7 My Reading & Writing Missing: Grade K", readOnly: true }
                ]
            },
            {
                id: "summary",
                title: "SUMMARY",
                icon: "fa-file-alt",
                fields: [
                    { id: "summary", type: "richtext", label: "", required: true, hint: "Enter a short summary of the issue as reported by the user.<br>Ex: In Advance -c2022, the Grade K Unit 7 My Reading & Writing is missing from the Resource Library." }
                ]
            },
            {
                id: "details",
                title: "DESCRIPTION",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "issue", type: "richtext", label: "Issue", required: true, hint: "Describe in detail the issue as reported by the user.<br><br>You can insert exactly what the user reports in their submitted ticket if needed for clarification. However, only do so if it is clear and helpful.<br><br>Ex: User reports \"I tried opening Unit 7 workbook for Kindergarten and the link did not work last week or today. Today, I went into open it from the online Benchmark Curriculum and the workbook is not on the site.\"" },
                    { id: "districtName", type: "text", label: "District Name", required: true, hint: "Auto-populates from original ticket." },
                    { id: "schoolName", type: "text", label: "School Name", required: true, hint: "Paste the school name the user is associated to.<br>Ex: Maple Elementary School" },
                    { id: "districtState", type: "text", label: "District State", required: true, placeholder: "Ex: FL", hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located.<br>Ex: FL<br>Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field, be sure to only use the state abbreviation." },
                    { id: "program", type: "text", label: "Program Impacted", required: true, hint: "Auto-populates from the subject details<br>Ex: Advance -c2022 • 2.75 Virginia" },
                    { id: "dateReported", type: "date", label: "Date Issue Reported By User", required: true, placeholder: "Ex: 06/05/2025", hint: "Select the date the user reported the issue.<br>Ex: 06/05/2025" },
                    { id: "subscriptionCodes", type: "richtext", label: "Subscription Codes Customer Is Onboarded With", required: true, hint: "Enter or upload the subscriptions the impacted school/district has.<br>- To upload a file, click on the image icon > click on the file > click open.<br>- Ex: BEC Benchmark Advance 2022 (National Edition) Gr. K Classroom Digital<br>- Note: to upload a file, see step 7." },
                    {
                        id: "impactScope",
                        type: "select",
                        label: "Teacher Vs Student Impact",
                        required: true,
                        options: ["", "Teacher Only", "Student Only", "Both Teacher and Student"],
                        hint: "Select whether the issue impacts a teacher, a student, or both.<br>Ex: Both"
                    },
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP.<br>Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
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
                        placeholder: "Ex: Advance -c2022 > Grade K > Student Books > My Reading and Writing > Show More",
                        hint: "Enter the exact path taken to replicate the issue."
                    },
                    {
                        id: "actualResults",
                        type: "richtext",
                        label: "Actual Results",
                        required: true,
                        hint: "Enter any information that would be helpful to replicate the reported issue.<br><br>- To add screenshots, you can either click the image icon > select the image file > click Open, or paste the screenshot in the box. <br>- Add as many as you see fit to explain the issue (if needed, you can add additional screenshots or video, see Step 9)<br>- To add links, type the word or phrase indicating what you are linking to > click the link icon and paste the URL > click Save.<br>- Ex: The Unit 7 My Reading & Writing missing from the user's account:"
                    },
                    {
                        id: "expectedResults",
                        type: "richtext",
                        label: "Expected Results",
                        required: true,
                        hint: "Enter details of what the user expects once the issue has been resolved.<br><br>Ex: The Grade K Unit 7 My Reading & Writing book should be visible in the user's account."
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
            if (fields.dateReported) description += `Date Issue Reported By User: ${formatDate(fields.dateReported)}<br>`;
            if (fields.subscriptionCodes && fields.subscriptionCodes.trim() !== '<p><br></p>') {
                description += `<div><strong>Subscription Codes Customer Is Onboarded With:</strong></div>`;
                description += `<div>${fields.subscriptionCodes}</div>`;
            }
            if (fields.impactScope) description += `Teacher Vs Student Impact: ${fields.impactScope}<br>`;
            description += `VIP Status: ${fields.isVIP || 'No'}<br>`;

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
                description += `<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">Actual Results</span></div>`;
                description += `<div>${fields.actualResults}</div>`;
                description += '<div style="margin-bottom: 10px;"></div>';
            } else {
                description += `<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">Actual Results</span></div>`;
                description += '<div><em>No actual results provided.</em></div>';
                description += '<div style="margin-bottom: 10px;"></div>';
            }

            // Add expected results
            if (fields.expectedResults && fields.expectedResults.trim() !== '<p><br></p>') {
                description += `<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">Expected Results</span></div>`;
                description += `<div>${fields.expectedResults}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            } else {
                description += `<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">Expected Results</span></div>`;
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

            // Initialize TemplateBase for subject line formatting
            const templateBase = new TemplateBase({
                templateName: 'assembly',
                subjectLineFormat: 'assembly',
                additionalFields: ['hasMultipleXcodes', 'gradesImpacted'],
                requiredFields: ['xcode', 'application', 'specificIssue', 'gradesImpacted']
            });

            // Initialize the template (sets up event listeners and formats subject)
            templateBase.initialize();

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
                        options: ["No", "Yes"],
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP.<br>Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    {
                        id: "districtName",
                        type: "text",
                        label: "District Name",
                        required: true,
                        hint: "Auto-populates from original ticket."
                    },
                    {
                        id: "districtState",
                        type: "text",
                        label: "District State",
                        required: true,
                        placeholder: "Ex: VA",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located.<br>Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field be sure to only use state abbreviation."
                    },
                    {
                        id: "application",
                        type: "text",
                        label: "Program Name",
                        required: true,
                        placeholder: "Ex: Advance -c2022",
                        hint: "Auto-populates from original ticket."
                    },
                    {
                        id: "version",
                        type: "select",
                        label: "Subscription Version",
                        required: false,
                        placeholder: "Ex: 2.75",
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
                        hint: "Select the appropriate subscription version number from the dropdown."
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State / National",
                        required: false,
                        placeholder: "Ex: 2.75 Virginia",
                        options: [],
                        hint: "Select the corresponding state or national version from the dropdown.<br>Note: Just because a district is located in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    {
                        id: "resourceName",
                        type: "select",
                        label: "Resource",
                        required: true,
                        placeholder: "Ex: Bookshelves",
                        options: ["-- Loading from settings --"],
                        needsCustomValues: true,
                        hint: "Select the impacted resource."
                    },
                    {
                        id: "shortDescription",
                        type: "text",
                        label: "Short Description of Issue",
                        required: true,
                        placeholder: "Ex: Option to Select Whole Class to Share Bookshelves",
                        hint: "Enter a short description of the functionality the user is requesting."
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
                        ],
                        hint: "Select the User Role(s) that would be impacted by the new functionality.<br>Ex: Teacher<br>Note: Multiple roles can be selected."
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy.<br>Naming convention: VIP or Standard District Name • District State (Abv) | Program Name • Variation National / State | Resource • Specific issue for user role<br>Ex: VIP | FAIRFAX CO SCHOOL DIST• VA | Advance -c2022 • 2.75 Virginia | Bookshelves: • Option to Select Whole Class to Share Bookshelves",
                        readOnly: true
                    }
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
                        placeholder: "Ex: SIM (Colleen Baker)",
                        options: [
                            "",
                            "Assessments (Marty O'Kane)",
                            "Editorial English (Max Prinz)",
                            "SIM (Colleen Baker)",
                            "TRS (Edgar Fernandez)"
                        ],
                        hint: "Select the team that should manage the request."
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
                        label: "Program Name",
                        required: true,
                        placeholder: "Ex: Advance -c2022 • 2.75 Virginia",
                        hint: "Auto-populates from subject details.",
                        readOnly: true
                    },
                    {
                        id: "shortDescriptionDetails",
                        type: "text",
                        label: "Short Description",
                        required: true,
                        placeholder: "Ex: Option to Select Whole Class to Share Bookshelves",
                        hint: "Auto-populates from subject details.<br>Note: this field can be edited."
                    }
                ]
            },
            {
                id: "additionalDetails",
                title: "ADDITIONAL DETAILS",
                icon: "fa-info-circle",
                fields: [
                    {
                        id: "additionalDetails",
                        type: "richtext",
                        label: "",
                        required: true,
                        hint: "Describe in detail the feature request as reported by the user.<br>You can insert exactly what the user reports in their submitted ticket if needed for clarification. However, only do so if it is clear and helpful.<br>EX: User reports \"It would be extremely helpful if we had the option to select a class to share a bookshelf with, rather than having to select student by student.\""
                    }
                ]
            },
            {
                id: "userInfo",
                title: "USER INFO",
                icon: "fa-user",
                fields: [
                    {
                        id: "username",
                        type: "text",
                        label: "Username",
                        required: true,
                        placeholder: "Ex: amiller3",
                        hint: "Enter the Username of the requestor"
                    },
                    {
                        id: "role",
                        type: "text",
                        label: "Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        hint: "Enter the BU Role of the requestor."
                    },
                    {
                        id: "name",
                        type: "text",
                        label: "Name",
                        required: true,
                        placeholder: "Ex: Abby Miller",
                        hint: "Enter the full Name of the requestor."
                    },
                    {
                        id: "customer_email",
                        type: "email",
                        label: "Email",
                        required: true,
                        placeholder: "Ex: amiller3@alphabetshools.org",
                        hint: "Paste the email of the requestor."
                    },
                    {
                        id: "dateRequested",
                        type: "date",
                        label: "Date Request",
                        required: true,
                        placeholder: "Ex: 06/05/2025",
                        hint: "Select the date the request was made."
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS, VIDEOS & OTHER SUPPORTING FILE ATTACHMENTS",
                icon: "fa-images",
                fields: [
                    {
                        id: "screenshotsDescription",
                        type: "richtext",
                        label: "",
                        required: false,
                        hint: "Click Upload Files to add any additional information that will be helpful."
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">TEAM</span></div>';
            description += `<div>${fields.team || ''}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">FEATURE REQUEST SUMMARY</span></div>';

            // Add Resource field first
            if (fields.resourceName) {
                description += `<div><strong>Resource:</strong></div>`;
                description += `<div>${fields.resourceName}</div>`;
            }

            description += `<div><strong>Program Name:</strong></div>`;

            // Build program name with version and state/national
            let programName = fields.application || fields.applicationDetails || '';
            if (fields.version) {
                programName += ` • ${fields.version}`;
            }
            if (fields.versionState) {
                programName += ` ${fields.versionState}`;
            }
            description += `<div>${programName}</div>`;

            description += `<div><strong>Short Description:</strong></div>`;
            description += `<div>${fields.shortDescriptionDetails || fields.shortDescription || ''}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.additionalDetails && fields.additionalDetails.trim() !== '<p><br></p>') {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ADDITIONAL DETAILS</span></div>';
                description += `<div>${fields.additionalDetails}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">USER INFO</span></div>';
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.role) description += `Role: ${fields.role}<br>`;
            if (fields.name) description += `Name: ${fields.name}<br>`;
            if (fields.customer_email) description += `Email: ${fields.customer_email}<br>`;
            if (fields.dateRequested) description += `Date Request: ${formatDate(fields.dateRequested) || ''}<br>`;

            // Add screenshots section if content is provided
            if (fields.screenshotsDescription && fields.screenshotsDescription.trim() !== '<p><br></p>') {
                description += '<div style="margin-bottom: 20px;"></div>';
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS, VIDEOS & OTHER SUPPORTING FILE ATTACHMENTS</span></div>';
                description += `<div>${fields.screenshotsDescription}</div>`;
            }

            return description;
        },

        // Add onLoad function for dynamic subject line formatting
        onLoad: function () {
            console.log("Feature Request onLoad function executing");

            // Auto-populate district state
            populateDistrictState();

            // Handle custom version input when "Other" is selected
            setupCustomVersionInput();

            // Also setup custom version state input when "Other" is selected
            setupCustomVersionStateInput();

            // First populate Application Name from product info
            populateApplicationName();

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

            // Initialize TemplateBase for subject line formatting
            const templateBase = new TemplateBase({
                templateName: 'feature-request',
                subjectLineFormat: 'sim', // Uses SIM format for subject lines
                additionalFields: ['resourceName', 'shortDescription'],
                checkboxGroups: ['userRole'],
                requiredFields: ['districtName', 'districtState', 'application', 'resourceName', 'shortDescription']
            });

            // Override getFieldValue for fields that need mapping
            const originalGetFieldValue = templateBase.getFieldValue.bind(templateBase);
            templateBase.getFieldValue = function (fieldName) {
                // Map feature-request fields to SIM format fields
                if (fieldName === 'specificIssue') {
                    return originalGetFieldValue('shortDescription');
                }
                if (fieldName === 'resource') {
                    return originalGetFieldValue('resourceName');
                }
                return originalGetFieldValue(fieldName);
            };

            // Override formatting to handle the `: •` separator in resource
            const originalFormatSIMSubjectLine = templateBase.formatSIMSubjectLine.bind(templateBase);
            templateBase.formatSIMSubjectLine = function () {
                const parts = originalFormatSIMSubjectLine();

                // Fix the resource part to use `: •` separator if needed
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (part && part.includes('•') && (part.includes(this.getFieldValue('resourceName')))) {
                        // Check if this is the resource part and fix separator
                        const resourceName = this.getFieldValue('resourceName');
                        const shortDescription = this.getFieldValue('shortDescription');
                        if (resourceName && shortDescription && part.includes(resourceName) && part.includes(shortDescription)) {
                            parts[i] = part.replace(`${resourceName} • ${shortDescription}`, `${resourceName}: • ${shortDescription}`);
                        }
                    }
                }

                return parts;
            };

            // Set default date for Date Requested field to today
            const dateRequestedField = document.getElementById('dateRequested');
            if (dateRequestedField) {
                const today = new Date().toISOString().split('T')[0];
                dateRequestedField.value = today;
                console.log("Set default date for Date Requested:", today);
            }

            // Function to sync fields from Subject to Feature Request Summary
            function syncFeatureRequestFields() {
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const versionStateField = document.getElementById('versionState');
                const shortDescriptionField = document.getElementById('shortDescription');
                const applicationDetailsField = document.getElementById('applicationDetails');
                const shortDescriptionDetailsField = document.getElementById('shortDescriptionDetails');

                // Build Program Name with version for Feature Request Summary
                if (applicationField && applicationDetailsField) {
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

                    applicationDetailsField.value = programValue;
                    console.log("Updated Program Name in Feature Request Summary:", programValue);
                }

                if (shortDescriptionField && shortDescriptionDetailsField) {
                    shortDescriptionDetailsField.value = shortDescriptionField.value;
                    console.log("Updated Short Description in Feature Request Summary:", shortDescriptionField.value);
                }
            }

            // Initialize the template (sets up event listeners and formats subject)
            templateBase.initialize();

            // Set up additional event listeners for field syncing
            document.getElementById('application')?.addEventListener('input', syncFeatureRequestFields);
            document.getElementById('version')?.addEventListener('change', syncFeatureRequestFields);
            document.getElementById('versionState')?.addEventListener('change', syncFeatureRequestFields);
            document.getElementById('shortDescription')?.addEventListener('input', syncFeatureRequestFields);

            // Initial sync of feature request fields
            syncFeatureRequestFields();

            // Schedule another sync after a small delay to ensure fields are populated
            setTimeout(syncFeatureRequestFields, 500);
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
                        hint: "Select the appropriate subscription version number from the dropdown. Ex: 2.5"
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        options: [
                            "",
                            "National",
                            "Alabama",
                            "Alaska",
                            "Arizona",
                            "Arkansas",
                            "California",
                            "Colorado",
                            "Connecticut",
                            "Delaware",
                            "Florida",
                            "Georgia",
                            "Hawaii",
                            "Idaho",
                            "Illinois",
                            "Indiana",
                            "Iowa",
                            "Kansas",
                            "Kentucky",
                            "Louisiana",
                            "Maine",
                            "Maryland",
                            "Massachusetts",
                            "Michigan",
                            "Minnesota",
                            "Mississippi",
                            "Missouri",
                            "Montana",
                            "Nebraska",
                            "Nevada",
                            "New Hampshire",
                            "New Jersey",
                            "New Mexico",
                            "New York",
                            "North Carolina",
                            "North Dakota",
                            "Ohio",
                            "Oklahoma",
                            "Oregon",
                            "Pennsylvania",
                            "Rhode Island",
                            "South Carolina",
                            "South Dakota",
                            "Tennessee",
                            "Texas",
                            "Utah",
                            "Vermont",
                            "Virginia",
                            "Washington",
                            "West Virginia",
                            "Wisconsin",
                            "Wyoming",
                            "Other"
                        ],
                        hint: "Select the corresponding state or national version from the dropdown. Ex: 2.5 Virginia. Note: Just because a district is in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        options: ["-- Loading from settings --"],
                        needsCustomValues: true,
                        hint: "Select the resource type where the issue occurs"
                    },
                    { id: "path", type: "text", label: "Path", required: true, placeholder: "e.g. G5>U1>W2>L12", hint: "Enter the path of clicks taken to recreate issue." },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "e.g. Title Missing", hint: "Enter a succinct description of issue. Note: if the user is requesting a rationale use: Rationale" },
                    { id: "formattedSubject", type: "text", label: "Formatted Subject Line", required: false, hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: Xcode | VIP or Standard | Application Name • Variation National or State if SS | Resource: Path - Short description of issue. EX: X11111 | VIP | Advance • 2.8 Florida | TRS: G5 > U1 > W2 > L12 - Title Missing", readOnly: true }
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

            // Function to sync XCODE, Resource and Path fields
            function syncFields() {
                // Get the source fields from Subject section
                const xcodeField = document.getElementById('xcode');
                const resourceField = document.getElementById('resource');
                const pathField = document.getElementById('path');
                const applicationField = document.getElementById('application');
                const versionField = document.getElementById('version');
                const versionStateField = document.getElementById('versionState');

                // Get the target fields
                const pathFieldTarget = document.getElementById('pathField');
                const xcodeInfoField = document.getElementById('xcodeInfo');
                const productImpactedField = document.getElementById('productImpacted');

                // Sync XCODE to xcodeInfo if both fields exist
                if (xcodeField && xcodeInfoField) {
                    xcodeInfoField.value = xcodeField.value;
                    console.log("Synced XCODE to Xcode field in user info section");
                }

                // Sync applicationName, resource and path to pathField if the fields exist
                if (pathFieldTarget) {
                    // Build the path value from application, resource, and path
                    let pathValue = '';

                    if (applicationField && applicationField.value) {
                        pathValue = applicationField.value;
                    }

                    if (resourceField && resourceField.value && pathField && pathField.value) {
                        if (pathValue) {
                            pathValue += ` > ${resourceField.value}: ${pathField.value}`;
                        } else {
                            pathValue = `${resourceField.value}: ${pathField.value}`;
                        }
                    } else if (resourceField && resourceField.value) {
                        if (pathValue) {
                            pathValue += ` > ${resourceField.value}`;
                        } else {
                            pathValue = resourceField.value;
                        }
                    } else if (pathField && pathField.value) {
                        if (pathValue) {
                            pathValue += ` > ${pathField.value}`;
                        } else {
                            pathValue = pathField.value;
                        }
                    }

                    pathFieldTarget.value = pathValue;
                    console.log("Synced Application Name + Resource + Path to Path field: " + pathValue);
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

            const resourceField = document.getElementById('resource');
            if (resourceField) {
                resourceField.addEventListener('change', syncFields);
                console.log("Added event listener to Resource field");
            }

            const pathField = document.getElementById('path');
            if (pathField) {
                pathField.addEventListener('input', syncFields);
                console.log("Added event listener to Path field");
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

            // Initialize TemplateBase for subject line formatting
            const templateBase = new TemplateBase({
                templateName: 'sedcust',
                subjectLineFormat: 'sedcust',
                additionalFields: ['path'],
                requiredFields: ['xcode', 'application', 'resource', 'path', 'specificIssue']
            });

            // Initialize the template (sets up event listeners and formats subject)
            templateBase.initialize();

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
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP. Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    {
                        id: "districtName",
                        type: "text",
                        label: "District Name",
                        required: true,
                        hint: "Auto-populates from original ticket."
                    },
                    {
                        id: "districtState",
                        type: "text",
                        label: "District State",
                        required: true,
                        placeholder: "Ex: FL",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field be sure to only use state abbreviation."
                    },
                    {
                        id: "application",
                        type: "text",
                        label: "Program Name",
                        required: true,
                        placeholder: "Ex: Advance -c2022",
                        hint: "Auto-populates from the original ticket."
                    },
                    {
                        id: "version",
                        type: "select",
                        label: "Subscription Version",
                        required: false,
                        placeholder: "Ex: 2.5",
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
                        hint: "Select the appropriate subscription version number from the dropdown."
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        placeholder: "Ex: 2.5 Virginia",
                        options: [],
                        hint: "Select the corresponding state or national version from the dropdown. Note: Just because a district is located in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        placeholder: "Ex: Grade View",
                        options: [
                            "",
                            "Assignments",
                            "Assignments: Grade View",
                            "Assignments: Live View",
                            "Bookshelves",
                            "Dashboard",
                            "ePocket Chart",
                            "FSA: History",
                            "FSA: Overview",
                            "FSA: Recommended Placement",
                            "High-Frequency Word Videos",
                            "Interactive Learning Games",
                            "Letter Songs",
                            "ORR: Error Analysis",
                            "ORR: Fluency Analysis",
                            "ORR: Reading Behaviors",
                            "ORR: Reading History",
                            "ORR: Reading Level Progress",
                            "Phonics Songs",
                            "Plan & Teach",
                            "Reading Log",
                            "Reports: Single Test Analysis",
                            "Reports: Standards Performance",
                            "Reports: Summary",
                            "Reports: Test Scores",
                            "Reports: Test Status",
                            "Resource Library: Filters"
                        ],
                        hint: "Select the impacted resource."
                    },
                    {
                        id: "specificIssue",
                        type: "text",
                        label: "Specific Issue",
                        required: true,
                        placeholder: "Ex: AutoGrade Is Not Processing",
                        hint: "Enter a succinct description of the issue."
                    },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ],
                        hint: "Select the User Role that is impacted by the issue. Note: Multiple roles can be selected."
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        placeholder: "Ex: MAPLE SHADE TWP SCHOOL DIST • NJ | Advance c2022 • 2.5 National | Grade View • AutoGrade Not Processing for Teachers",
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: VIP or Standard District Name • District State (Abv) | Program Name • Variation National / State | Resource • Specific issue for user role",
                        readOnly: true
                    }
                ]
            },
            {
                id: "issueDescription",
                title: "ISSUE DESCRIPTION",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueDetails", type: "richtext", label: "Specific details outlining user impact", required: true,
                        hint: "Enter the issue details as reported by the user in a concise and constructive manner.<br>Ex: AutoGrade is not processing for the Unit 5 Assessment, impacting the ability to see students' scores.<br>Note: DO NOT copy and paste what the user has reported."
                    },
                    {
                        id: "resourceXcode", type: "text", label: "Resource Xcode", required: true,
                        placeholder: "Ex: X14569",
                        hint: "Enter the Xcode of the impacted resource. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720168' target='_blank'>How to Find a Resource Xcode</a>"
                    },
                    {
                        id: "resourceTitle", type: "text", label: "Resource Name", required: true,
                        placeholder: "Ex: Unit 5 Assessment (Gr. 2)",
                        hint: "Enter the Name of the impacted Resource"
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
                        placeholder: "EX: Teacher dashboard > Assignments > Unit 5 Assessment (Gr. 2) > Grade View > Click on student > See question 15"
                    }
                ]
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    {
                        id: "username",
                        type: "text",
                        label: "Username",
                        required: true,
                        placeholder: "Ex: amiller3",
                        hint: "Enter the Username of the impacted user."
                    },
                    {
                        id: "studentInternalId",
                        type: "text",
                        label: "Student Internal ID",
                        required: true,
                        placeholder: "Ex: 15665275",
                        hint: "Paste the Student Internal ID of the impacted user. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>Locating a User's Internal ID</a>"
                    },
                    {
                        id: "BURCLink",
                        type: "text",
                        label: "BURC Link",
                        required: true,
                        placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/544931/manage-account/district/teachers/dlulgjuraj@benchmarkeducation.com",
                        hint: "Paste the BURC Link of the impacted user."
                    },
                    {
                        id: "device",
                        type: "text",
                        label: "Device",
                        required: true,
                        placeholder: "Ex: PC",
                        hint: "Enter the impacted user's Device."
                    },
                    {
                        id: "realm",
                        type: "text",
                        label: "Realm",
                        required: true,
                        placeholder: "Ex: msemail",
                        hint: "Enter the district's Realm."
                    },
                    {
                        id: "assignmentId",
                        type: "text",
                        label: "Assignment ID",
                        required: true,
                        placeholder: "Ex: https://msemail.benchmarkuniverse.com/?#assignments/11569615",
                        hint: "Paste the Assignment ID of the impacted assignment. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720821' target='_blank'>Finding assignment ID</a>"
                    },
                    {
                        id: "dateReported",
                        type: "date",
                        label: "Date Issue Reported",
                        required: true,
                        placeholder: "Ex: 06/05/2025",
                        hint: "Select the date the issue was reported."
                    },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR File Attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Choose Yes if a HAR file has been captured, or No if it has not been. Note: All SIM Trackers should have a HAR File unless told otherwise by a lead or manager. If No is chosen from the drop-down, you will need to enter a reason as to why you do not have one in order to create the tracker."
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
                        required: true, hint: "Ex: AutoGrade should be processing students' grades."
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

                // Third part: Resource and specific issue combined with bullet separator
                const resourceField = document.getElementById('resource');
                const resource = resourceField ? resourceField.value || '' : '';

                let resourceIssuePart = '';
                if (resource && resource.trim()) {
                    resourceIssuePart = resource.trim();
                    if (specificIssue) {
                        resourceIssuePart += ` • ${specificIssue}`;
                    }
                } else if (specificIssue) {
                    resourceIssuePart = specificIssue;
                }

                // Add user role to the resource/issue part
                if (userRoleText) {
                    resourceIssuePart += ` for ${userRoleText}`;
                }

                if (resourceIssuePart.trim()) {
                    subjectParts.push(resourceIssuePart);
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
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP. Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    {
                        id: "districtName",
                        type: "text",
                        label: "District Name",
                        required: true,
                        hint: "Auto-populates from original ticket."
                    },
                    {
                        id: "districtState",
                        type: "text",
                        label: "District State",
                        required: true,
                        placeholder: "Ex: FL",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field be sure to only use state abbreviation."
                    },
                    {
                        id: "application",
                        type: "text",
                        label: "Program Name",
                        required: true,
                        placeholder: "Ex: Advance -c2022",
                        hint: "Auto-populates from the original ticket."
                    },
                    {
                        id: "version",
                        type: "select",
                        label: "Subscription Version",
                        required: false,
                        placeholder: "Ex: 2.5",
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
                        hint: "Select the appropriate subscription version number from the dropdown."
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        placeholder: "Ex: 2.5 Virginia",
                        options: [],
                        hint: "Select the corresponding state or national version from the dropdown. Note: Just because a district is located in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        placeholder: "Ex: Grade View",
                        options: [
                            "",
                            "Assignments",
                            "Assignments: Grade View",
                            "Assignments: Live View",
                            "Bookshelves",
                            "Dashboard",
                            "ePocket Chart",
                            "FSA: History",
                            "FSA: Overview",
                            "FSA: Recommended Placement",
                            "High-Frequency Word Videos",
                            "Interactive Learning Games",
                            "Letter Songs",
                            "ORR: Error Analysis",
                            "ORR: Fluency Analysis",
                            "ORR: Reading Behaviors",
                            "ORR: Reading History",
                            "ORR: Reading Level Progress",
                            "Phonics Songs",
                            "Plan & Teach",
                            "Reading Log",
                            "Reports: Single Test Analysis",
                            "Reports: Standards Performance",
                            "Reports: Summary",
                            "Reports: Test Scores",
                            "Reports: Test Status",
                            "Resource Library: Filters"
                        ],
                        hint: "Select the impacted resource."
                    },
                    {
                        id: "specificIssue",
                        type: "text",
                        label: "Specific Issue",
                        required: true,
                        placeholder: "Ex: AutoGrade Is Not Processing",
                        hint: "Enter a succinct description of the issue."
                    },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ],
                        hint: "Select the User Role that is impacted by the issue. Note: Multiple roles can be selected."
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        placeholder: "Ex: MAPLE SHADE TWP SCHOOL DIST • NJ | Advance c2022 • 2.5 National | Grade View • AutoGrade Not Processing for Teachers",
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: VIP or Standard District Name • District State (Abv) | Program Name • Variation National / State | Resource • Specific issue for user role",
                        readOnly: true
                    }
                ]
            },
            {
                id: "issueDescription",
                title: "ISSUE DESCRIPTION",
                icon: "fa-exclamation-circle",
                fields: [
                    { id: "reportName", type: "text", label: "Name of impacted report", required: true, placeholder: "Ex: Test Status", hint: "Enter the name of the Impacted Report." },
                    {
                        id: "issueDetails",
                        type: "richtext",
                        label: "Specific details outlining user impact",
                        required: true,
                        hint: "Ex: A Technical Error is received when in the Test Status report.<br>Enter the issue details as reported by the user in a concise and constructive manner."
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
                        placeholder: "EX:\n1. Log in as Teacher\n2. On Dashboard Click ORR",
                        hint: "Enter the exact steps taken by the user and yourself to recreate the issue.<br>Ex: Log in as Teacher > Click on Reports > Click on Assessments > Click on Test Status"
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
                    {
                        id: "teacherName",
                        type: "text",
                        label: "Teacher/Admin Name",
                        required: true,
                        placeholder: "Ex: Abby Miller",
                        hint: "Enter the Full Name of the impacted user."
                    },
                    {
                        id: "username",
                        type: "text",
                        label: "Username",
                        required: true,
                        placeholder: "Ex: amiller3",
                        hint: "Enter the Username of the impacted user."
                    },
                    {
                        id: "userRole",
                        type: "text",
                        label: "Role",
                        required: true,
                        hint: "Provide the users role at the district. EX: District Admin, School Admin, Teacher, Student"
                    },
                    {
                        id: "BURCLink",
                        type: "text",
                        label: "BURC Link",
                        required: true,
                        placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/544931/manage-account/district/teachers/dlulgjuraj@benchmarkeducation.com",
                        hint: "Paste the BURC Link of the impacted user."
                    },
                    {
                        id: "realm",
                        type: "text",
                        label: "Realm",
                        required: true,
                        placeholder: "Ex: msemail",
                        hint: "Enter the district's Realm."
                    },
                    {
                        id: "browser",
                        type: "text",
                        label: "Browser",
                        required: true,
                        placeholder: "Ex: Google Chrome",
                        hint: "Enter the impacted user's Browser."
                    },
                    {
                        id: "assessmentId",
                        type: "text",
                        label: "Assessment Assignment ID",
                        required: true,
                        placeholder: "Ex: 11569615",
                        hint: "Paste the Assignment ID of the impacted assignment. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720821' target='_blank'>Finding assignment ID</a>"
                    },
                    {
                        id: "assessmentUrl",
                        type: "text",
                        label: "Assessment Assignment URL",
                        required: true,
                        placeholder: "Ex: https://msemail.benchmarkuniverse.com/?#assignments/11569615",
                        hint: "Paste the Assignment ID URL of the impacted assignment."
                    },
                    {
                        id: "dateTaken",
                        type: "date",
                        label: "Date Test Was Taken",
                        required: true,
                        placeholder: "Ex: 05/30/2025",
                        hint: "Select the date the impacted assessment was taken."
                    },
                    {
                        id: "dateGraded",
                        type: "date",
                        label: "Date Test Was Graded",
                        required: true,
                        placeholder: "Ex: 05/30/2025",
                        hint: "Select the date the impacted assessment was graded."
                    },
                    {
                        id: "className",
                        type: "text",
                        label: "Impacted Class Name",
                        required: true,
                        placeholder: "Ex: Tech Support Class 2-Lulgjuraj",
                        hint: "Paste the Impacted Class Name."
                    },
                    {
                        id: "classLink",
                        type: "text",
                        label: "Impacted Class BURC Link",
                        required: true,
                        placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/544931/manage-account/school/545757/classes/7536061/activated/Tech%20Support%20Class%202-Lulgjuraj",
                        hint: "Paste the Impacted Class BURC Link."
                    },
                    {
                        id: "studentIds",
                        type: "text",
                        label: "Impacted Student(s) Internal ID(s)",
                        required: true,
                        placeholder: "Ex: 15665275",
                        hint: "Paste the Student Internal ID of the impacted user(s). <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>How to Locate a User's Internal ID</a>"
                    },
                    {
                        id: "dateReported",
                        type: "date",
                        label: "Date Issue Reported",
                        required: true,
                        placeholder: "Ex: 06/05/2025",
                        hint: "Select the date the issue was reported."
                    },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR File Attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Choose Yes if a HAR file has been captured, or No if it has not been. Note: All SIM Trackers should have a HAR File unless told otherwise by a lead or manager. If No is chosen from the drop-down, you will need to enter a reason why you do not have one in order to create the tracker."
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
                        required: true,
                        hint: "Enter details regarding expected functionality.<br>Ex: Student's Test Status should be available to view."
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

            // Function to auto-populate report name based on resource selection
            function populateReportName() {
                const resourceField = document.getElementById('resource');
                const reportNameField = document.getElementById('reportName');

                if (!resourceField || !reportNameField) {
                    console.log("Resource or Report Name field not found");
                    return;
                }

                const resourceValue = resourceField.value || '';
                console.log("SIM Assessment Reports: Resource value changed to:", resourceValue);

                // Check if resource begins with "ORR" or "Reports"
                if (resourceValue.startsWith('ORR:') || resourceValue.startsWith('Reports:')) {
                    // Extract text after ": "
                    const colonIndex = resourceValue.indexOf(': ');
                    if (colonIndex !== -1 && colonIndex < resourceValue.length - 2) {
                        const reportName = resourceValue.substring(colonIndex + 2);
                        reportNameField.value = reportName;
                        console.log("SIM Assessment Reports: Auto-populated report name with:", reportName);
                    }
                }
                // If resource doesn't begin with "ORR" or "Reports", do nothing (field remains editable)
            }

            // Set up event listener for resource field
            const resourceField = document.getElementById('resource');
            if (resourceField) {
                resourceField.addEventListener('change', populateReportName);
                console.log("Added event listener to resource field for report name population");
            }

            // Initial population in case resource is already selected
            setTimeout(populateReportName, 500);

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
                    resourcePart = resource.trim();
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
                    {
                        id: "districtName",
                        type: "text",
                        label: "District Name",
                        required: true,
                        hint: "Auto-populates from original ticket.",
                        readOnly: true
                    },
                    {
                        id: "districtState",
                        type: "text",
                        label: "District State",
                        required: true,
                        placeholder: "Ex: VA",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field, be sure to only use the state abbreviation."
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
                        id: "summaryContent", type: "richtext", label: "Include name of school district that is requesting customized achievement levels", required: true,
                        hint: "Enter [District Name] is requesting custom achievement levels.<br>Note: Be sure you are including the district name.<br>Ex: Jersey City Public School District is requesting custom achievement levels."
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
                        hint: "Enter the Username of the user requesting the change.",
                        placeholder: "Ex: amiller3"
                    },
                    {
                        id: "userRole", type: "text", label: "Role", required: true,
                        hint: "Enter the User Role that is requesting the change. Remember: they MUST be a DA",
                        placeholder: "Ex: District Admin"
                    },
                    {
                        id: "realm", type: "text", label: "District BURC Link", required: true,
                        hint: "Paste the District BURC Link.",
                        placeholder: "Ex: <a href='https://onboarding-production.benchmarkuniverse.com/85066/dashboard' target='_blank'>https://onboarding-production.benchmarkuniverse.com/85066/dashboard</a>"
                    },
                    {
                        id: "districtName", type: "text", label: "District Name", required: true,
                        hint: "Auto-populates from original ticket and is uneditable.",
                        readOnly: true
                    },
                    {
                        id: "districtState", type: "text", label: "District State", required: true,
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located.<br>Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field, be sure to only use the state abbreviation.",
                        placeholder: "Ex: FL"
                    },
                    {
                        id: "dateRequested", type: "date", label: "Date Issue Reported", required: true,
                        hint: "Select the date the user requested the custom achievement levels.",
                        placeholder: "Ex: 06/05/2025"
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
        },

        // Add onLoad function for field population and subject line updates
        onLoad: function () {
            console.log("SIM Achievement Levels Tracker onLoad function executing");

            // Auto-populate district state
            populateDistrictState();

            // Function to update subject line according to SIM Achievement Levels format
            function updateSubjectLine() {
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const formattedSubjectField = document.getElementById('formattedSubject');

                if (!districtNameField || !districtStateField || !formattedSubjectField) {
                    console.log("SIM Achievement Levels: Missing required fields for subject formatting");
                    return;
                }

                const districtName = districtNameField.value || '';
                const districtState = districtStateField.value || '';

                // Check if this is a VIP district (will be determined from ticket data)
                // For now, we'll use the ticket data if available
                let isVIP = false;
                if (window.trackerApp && window.trackerApp.ticketData && window.trackerApp.ticketData.isVip === true) {
                    isVIP = true;
                }

                // Format: "VIP* District Name • District State | Custom Achievement Levels" or "District Name • District State | Custom Achievement Levels"
                let subject = '';
                if (districtName.trim() && districtState.trim()) {
                    if (isVIP) {
                        subject = `VIP* ${districtName.trim()} • ${districtState.trim()} | Custom Achievement Levels`;
                    } else {
                        subject = `${districtName.trim()} • ${districtState.trim()} | Custom Achievement Levels`;
                    }
                } else if (districtName.trim()) {
                    if (isVIP) {
                        subject = `VIP* ${districtName.trim()} | Custom Achievement Levels`;
                    } else {
                        subject = `${districtName.trim()} | Custom Achievement Levels`;
                    }
                } else {
                    subject = 'Custom Achievement Levels';
                }

                formattedSubjectField.value = subject;
                console.log("SIM Achievement Levels: Updated subject line:", subject);
            }

            // Set up event listeners for subject line formatting
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);

            // Initial subject line update
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);

            // Set up clear formatting button for Quill editors
            setTimeout(setupClearFormattingButton, 500);

            // If the trackerApp is available, call its setupSmartsheetUploader method
            if (window.trackerApp && typeof window.trackerApp.setupSmartsheetUploader === 'function') {
                console.log("Setting up smartsheet uploader through trackerApp");
                window.trackerApp.setupSmartsheetUploader();
            } else {
                console.warn("TrackerApp or setupSmartsheetUploader not available");
            }
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
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP. Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    {
                        id: "districtName",
                        type: "text",
                        label: "District Name",
                        required: true,
                        hint: "Auto-populates from original ticket."
                    },
                    {
                        id: "districtState",
                        type: "text",
                        label: "District State",
                        required: true,
                        placeholder: "Ex: FL",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field be sure to only use state abbreviation."
                    },
                    {
                        id: "application",
                        type: "text",
                        label: "Program Name",
                        required: true,
                        placeholder: "Ex: Advance -c2022",
                        hint: "Auto-populates from the original ticket."
                    },
                    {
                        id: "version",
                        type: "select",
                        label: "Subscription Version",
                        required: false,
                        placeholder: "Ex: 2.5",
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
                        hint: "Select the appropriate subscription version number from the dropdown."
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        placeholder: "Ex: 2.5 Virginia",
                        options: [],
                        hint: "Select the corresponding state or national version from the dropdown. Note: Just because a district is located in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        placeholder: "Ex: Grade View",
                        options: [
                            "",
                            "Assignments",
                            "Assignments: Grade View",
                            "Assignments: Live View",
                            "Bookshelves",
                            "Dashboard",
                            "ePocket Chart",
                            "FSA: History",
                            "FSA: Overview",
                            "FSA: Recommended Placement",
                            "High-Frequency Word Videos",
                            "Interactive Learning Games",
                            "Letter Songs",
                            "ORR: Error Analysis",
                            "ORR: Fluency Analysis",
                            "ORR: Reading Behaviors",
                            "ORR: Reading History",
                            "ORR: Reading Level Progress",
                            "Phonics Songs",
                            "Plan & Teach",
                            "Reading Log",
                            "Reports: Single Test Analysis",
                            "Reports: Standards Performance",
                            "Reports: Summary",
                            "Reports: Test Scores",
                            "Reports: Test Status",
                            "Resource Library: Filters"
                        ],
                        hint: "Select the impacted resource."
                    },
                    {
                        id: "specificIssue",
                        type: "text",
                        label: "Specific Issue",
                        required: true,
                        placeholder: "Ex: AutoGrade Is Not Processing",
                        hint: "Enter a succinct description of the issue."
                    },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ],
                        hint: "Select the User Role that is impacted by the issue. Note: Multiple roles can be selected."
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        placeholder: "Ex: MAPLE SHADE TWP SCHOOL DIST • NJ | Advance c2022 • 2.5 National | Grade View • AutoGrade Not Processing for Teachers",
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy.<br>Naming convention: VIP or Standard District Name • District State (Abv) | Program Name • Variation National / State | Resource • Specific issue for user role",
                        readOnly: true
                    }
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
                        hint: "Enter the issue details as reported by the user in a concise and constructive manner.<br>Ex: A Server Error is received after clicking on FSA from the dashboard."
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true, hint: "Auto-populates from original ticket." },
                    {
                        id: "districtBURCLink", type: "text", label: "District BURC Link", required: true, placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/4545/dashboard", hint: "Paste the District BURC Link"
                    },
                    {
                        id: "schoolName", type: "text", label: "School Name", required: true, placeholder: "Ex: Maple Shade Township School District", hint: "Paste the name of the school the user is associated with."
                    },
                    {
                        id: "schoolBURCLink", type: "text", label: "School BURC Link", required: true, placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/4545/manage-account/school/7314", hint: "Paste the School BURC Link that the user is associated with."
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
                        placeholder: "EX:\n1. Log in as Teacher\n2. On Dashboard Click ORR",
                        hint: "Ex: Log in as Teacher > In the Dashboard click on FSA >"
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
                    { id: "username", type: "text", label: "Username", required: true, placeholder: "Ex: amiller3", hint: "Enter the Username of the impacted user." },
                    { id: "name", type: "text", label: "Name", required: true, placeholder: "Ex: Abby Miller", hint: "Enter the Full Name of the impacted user." },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/544931/manage-account/district/teachers/dlulgjuraj@benchmarkeducation.com", hint: "Paste the BURC Link of the impacted user." },
                    { id: "administrationUrl", type: "text", label: "Administration URL", required: true, placeholder: "Ex: https://bec-micro.benchmarkuniverse.com/?#/teacher-led-assessments/administration/16215085/228564/X89128/7604136", hint: "Paste the administered test URL.<br>Note: When the issue is related to administering the test to a student, provide the administration URL. This should be the URL displayed after the user has selected the administer button." },
                    { id: "device", type: "text", label: "Device", required: true, placeholder: "Ex: PC", hint: "Enter the impacted user's Device." },
                    {
                        id: "studentInternalId", type: "text", label: "Student Internal ID", required: true, placeholder: "Ex: 15665275",
                        hint: "Paste the Student Internal ID of the impacted user(s)."
                    },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: true, placeholder: "Ex: 06/05/2025", hint: "Select the date the issue was reported." },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR File Attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Choose Yes if a HAR file has been captured, or No if it has not been.<br>Note: All SIM Trackers should have a HAR File unless told otherwise by a lead or manager. If No is chosen from the drop-down, you will need to enter a reason why you do not have one in order to create the tracker."
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
                        required: true,
                        hint: "Enter details regarding expected functionality.<br>Ex: FSA should load without receiving any errors."
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
                    resourcePart = resource.trim();
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
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP. Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true, hint: "Auto-populates from original ticket." },
                    {
                        id: "districtState", type: "text", label: "District State", required: true, placeholder: "Ex: FL",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field be sure to only use state abbreviation."
                    },
                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "Ex: Advance -c2022", hint: "Auto-populates from the original ticket." },
                    {
                        id: "version",
                        type: "select",
                        label: "Subscription Version",
                        required: false,
                        placeholder: "Ex: 2.5",
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
                        hint: "Select the appropriate subscription version number from the dropdown."
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        placeholder: "Ex: 2.5 Virginia",
                        options: [],
                        hint: "Select the corresponding state or national version from the dropdown. Note: Just because a district is located in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "Ex: AutoGrade Is Not Processing", hint: "Enter a succinct description of the issue." },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        placeholder: "Ex: Grade View",
                        options: [
                            "",
                            "Assignments",
                            "Assignments: Grade View",
                            "Assignments: Live View",
                            "Bookshelves",
                            "Dashboard",
                            "ePocket Chart",
                            "FSA: History",
                            "FSA: Overview",
                            "FSA: Recommended Placement",
                            "High-Frequency Word Videos",
                            "Interactive Learning Games",
                            "Letter Songs",
                            "ORR: Error Analysis",
                            "ORR: Fluency Analysis",
                            "ORR: Reading Behaviors",
                            "ORR: Reading History",
                            "ORR: Reading Level Progress",
                            "Phonics Songs",
                            "Plan & Teach",
                            "Reading Log",
                            "Reports: Single Test Analysis",
                            "Reports: Standards Performance",
                            "Reports: Summary",
                            "Reports: Test Scores",
                            "Reports: Test Status",
                            "Resource Library: Filters"
                        ],
                        hint: "Select the impacted resource."
                    },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ],
                        hint: "Select the User Role that is impacted by the issue. Note: Multiple roles can be selected."
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        placeholder: "Ex: MAPLE SHADE TWP SCHOOL DIST • NJ | Advance c2022 • 2.5 National | Grade View • AutoGrade Not Processing for Teachers",
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: VIP or Standard District Name • District State (Abv) | Program Name • Variation National / State | Resource • Specific issue for user role",
                        readOnly: true
                    }
                ]
            },
            {
                id: "issueDescription",
                title: "ISSUE DESCRIPTION",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "resourceXcode", type: "text", label: "Resource xcode", required: true, placeholder: "Ex: X14569",
                        hint: "Enter the Xcode of the impacted resource. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720168' target='_blank'>How to Find a Resource Xcode</a>"
                    },
                    { id: "resourceTitle", type: "text", label: "Resource Name", required: true, placeholder: "Ex: My Reading & Writing", hint: "Enter the Name of the impacted Resource" },
                    {
                        id: "pathFilters", type: "text", label: "Path/Filters", required: true, placeholder: "Ex: Teacher Dashboard > Advance -c2022 > Click on Grade 1 filter > Click on Unit 7 filter", hint: "Enter the Path taken to replicate the reported issue."
                    },
                    {
                        id: "issueDetails",
                        type: "richtext",
                        label: "Specific details outlining user impact",
                        required: true,
                        hint: "Enter the issue details as reported by the user in a concise and constructive manner.<br>EX: When using the Grade 1 & Unit 7 filters in Advance -c2022 Resource Library, Grade K, all units displays."
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
                        placeholder: "EX: Teacher dashboard > Assignments > Unit 5 Assessment (Gr. 2) > Grade View > Click on student > See question 15",
                        hint: "Ex: Teacher Dashboard > Advance -c2022 > Click on Grade 1 filter > Click on Unit 7 filter"
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
                    { id: "username", type: "text", label: "Username", required: true, placeholder: "Ex: amiller3", hint: "Enter the Username of the impacted user." },
                    {
                        id: "role", type: "text", label: "Role", required: true,
                        hint: "Provide the users role at the district. EX: District Admin, School Admin, Teacher, Student"
                    },
                    {
                        id: "studentInternalId", type: "text", label: "Student Internal ID", required: true, placeholder: "Ex: 15665275",
                        hint: "Paste the Student Internal ID of the impacted user. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>Locating a User's Internal ID</a>"
                    },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/544931/manage-account/district/teachers/dlulgjuraj@benchmarkeducation.com", hint: "Paste the BURC Link of the impacted user." },
                    { id: "device", type: "text", label: "Device", required: true, placeholder: "Ex: PC", hint: "Enter the impacted user's Device." },
                    {
                        id: "realm", type: "text", label: "Realm", required: true, placeholder: "Ex: msemail",
                        hint: "Enter the district's Realm."
                    },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: true, placeholder: "Ex: 06/05/2025", hint: "Select the date the issue was reported." },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR File Attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Choose Yes if a HAR file has been captured, or No if it has not been. Note: All SIM Trackers should have a HAR File unless told otherwise by a lead or manager. If No is chosen from the drop-down, you will need to enter a reason as to why you do not have one in order to create the tracker."
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
                    resourcePart = resource.trim();
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
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP. Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true, hint: "Auto-populates from original ticket." },
                    {
                        id: "districtState", type: "text", label: "District State", required: true, placeholder: "Ex: FL",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field be sure to only use state abbreviation."
                    },
                    { id: "application", type: "text", label: "Program Name", required: true, placeholder: "Ex: Advance -c2022", hint: "Auto-populates from the original ticket." },
                    {
                        id: "version",
                        type: "select",
                        label: "Subscription Version",
                        required: false,
                        placeholder: "Ex: 2.5",
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
                        hint: "Select the appropriate subscription version number from the dropdown."
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        placeholder: "Ex: 2.5 Virginia",
                        options: [],
                        hint: "Select the corresponding state or national version from the dropdown. Note: Just because a district is located in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true, placeholder: "Ex: Student's Status Not Updating", hint: "Enter a succinct description of the issue." },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        placeholder: "Ex: ORR: Reading History",
                        options: [
                            "",
                            "Assignments",
                            "Assignments: Grade View",
                            "Assignments: Live View",
                            "Bookshelves",
                            "Dashboard",
                            "ePocket Chart",
                            "FSA: History",
                            "FSA: Overview",
                            "FSA: Recommended Placement",
                            "High-Frequency Word Videos",
                            "Interactive Learning Games",
                            "Letter Songs",
                            "ORR: Error Analysis",
                            "ORR: Fluency Analysis",
                            "ORR: Reading Behaviors",
                            "ORR: Reading History",
                            "ORR: Reading Level Progress",
                            "Phonics Songs",
                            "Plan & Teach",
                            "Reading Log",
                            "Reports: Single Test Analysis",
                            "Reports: Standards Performance",
                            "Reports: Summary",
                            "Reports: Test Scores",
                            "Reports: Test Status",
                            "Resource Library: Filters"
                        ],
                        hint: "Select the impacted resource."
                    },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ],
                        hint: "Select the User Role that is impacted by the issue. Note: Multiple roles can be selected."
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        placeholder: "Ex: MAPLE SHADE TWP SCHOOL DIST • NJ | Advance c2022 • 2.5 National | ORR: Reading History • Student's Status Not Updating for Teacher",
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: VIP or Standard District Name • District State (Abv) | Program Name • Variation National / State | Resource • Specific issue for user role",
                        readOnly: true
                    }
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
                        hint: "Enter the issue details as reported by the user in a concise and constructive manner.<br>Ex: A student's status will not update even though they have submitted the ORR.<br>Note: DO NOT copy and paste what the user has reported."
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
                        placeholder: "Ex: Teacher dashboard > ORR > Click on student Jane Doe > Select Passage > Select \"No\" for microphone > Select \"next\" for passage, retell, comprehension, analysis, and summary"
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
                    { id: "username", type: "text", label: "Username", required: true, placeholder: "Ex: amiller3", hint: "Enter the Username of the impacted user." },
                    {
                        id: "role", type: "text", label: "Role", required: true, placeholder: "Ex: Teacher",
                        hint: "Enter the BU user Role that is impacted by the issue. Note: Multiple roles can be selected."
                    },
                    {
                        id: "studentInternalId", type: "text", label: "Student Internal ID", required: true, placeholder: "Ex: 15665275",
                        hint: "Paste the Student Internal ID of the impacted user."
                    },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/544931/manage-account/district/teachers/dlulgjuraj@benchmarkeducation.com", hint: "Paste the BURC Link of the impacted user." },
                    { id: "device", type: "text", label: "Device", required: true, placeholder: "Ex: PC", hint: "Enter the impacted user's Device." },
                    {
                        id: "realm", type: "text", label: "Realm", required: true, placeholder: "Ex: msemail",
                        hint: "Enter the district's Realm."
                    },
                    {
                        id: "assignmentId", type: "text", label: "Assignment ID", required: true,
                        placeholder: "Ex: https://msemail.benchmarkuniverse.com/?#assignments/11569615",
                        hint: "Paste the Assignment ID of the impacted assignment."
                    },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: true, placeholder: "Ex: 06/05/2025", hint: "Select the date the issue was reported." },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR File Attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Choose Yes if a HAR file has been captured, or No if it has not been. Note: All SIM Trackers should have a HAR File unless told otherwise by a lead or manager. If No is chosen from the drop-down, you will need to enter a reason as to why you do not have one in order to create the tracker."
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
                        required: true,
                        hint: "Enter details regarding expected functionality.<br>Ex: After submitting the ORR, the students staus should update."
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
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP. Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    {
                        id: "districtName",
                        type: "text",
                        label: "District Name",
                        required: true,
                        hint: "Auto-populates from original ticket."
                    },
                    {
                        id: "districtState",
                        type: "text",
                        label: "District State",
                        required: true,
                        placeholder: "Ex: VA",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field be sure to only use state abbreviation."
                    },
                    {
                        id: "application",
                        type: "text",
                        label: "Program Name",
                        required: true,
                        placeholder: "Ex: Advance -c2022",
                        hint: "Auto-populates from the original ticket."
                    },
                    {
                        id: "version",
                        type: "select",
                        label: "Subscription Version",
                        required: false,
                        placeholder: "Ex: 2.75",
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
                        hint: "Select the appropriate subscription version number from the dropdown."
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        placeholder: "Ex: 2.75 Virginia",
                        options: [],
                        hint: "Select the corresponding state or national version from the dropdown. Note: Just because a district is in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        placeholder: "Ex: Plan & Teach",
                        options: ["-- Loading from settings --"],
                        needsCustomValues: true,
                        hint: "Select the impacted resource."
                    },
                    {
                        id: "specificIssue",
                        type: "text",
                        label: "Specific Issue",
                        required: true,
                        placeholder: "Ex: Help Button Non-Functional",
                        hint: "Enter a succinct description of the issue."
                    },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ],
                        hint: "Select the User Role that is impacted by the issue. Note: Multiple roles can be selected."
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        placeholder: "Ex: VIP FAIRFAX CO SCHOOL DISTRICT • VA | Advance -c2022 • 2.75 Virginia | Plan & Teach • Help Button Non-Functional",
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: VIP or Standard District Name • District State (Abv) | Program Name • Variation National / State | Resource: • Specific issue for user role",
                        readOnly: true
                    }
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
                        label: "Specific details outlining user impact",
                        required: true,
                        placeholder: "Ex: When clicking the Help button in Plan & Teach, nothing happens. It does not take you to any new tab or page.",
                        hint: "Enter the issue details as reported by the user in a concise and constructive manner. Note: DO NOT copy and paste what the user has reported."
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
                        placeholder: "Ex: Teacher dashboard > Plan & Teach > Click on Benchmark Advance -c2022 > Click on Grade K > Click on View Program > Click on Help"
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
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    {
                        id: "username",
                        type: "text",
                        label: "Username",
                        required: true,
                        placeholder: "Ex: amiller3",
                        hint: "Enter the Username of the impacted user."
                    },
                    {
                        id: "role",
                        type: "text",
                        label: "Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        hint: "Enter the BU user Role that is impacted by the issue. Note: Multiple roles can be selected."
                    },
                    {
                        id: "studentInternalID",
                        type: "text",
                        label: "Student Internal ID",
                        required: true,
                        placeholder: "Ex: 15665275",
                        hint: "Paste the Student Internal ID of the impacted user. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>Locating a User's Internal ID</a>"
                    },
                    {
                        id: "BURCLink",
                        type: "text",
                        label: "BURC Link",
                        required: true,
                        placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/544931/manage-account/district/teachers/dlulgjuraj@benchmarkeducation.com",
                        hint: "Paste the BURC Link of the impacted user."
                    },
                    {
                        id: "device",
                        type: "text",
                        label: "Device",
                        required: true,
                        placeholder: "Ex: PC",
                        hint: "Enter the impacted user's Device."
                    },
                    {
                        id: "realm",
                        type: "text",
                        label: "Realm",
                        required: true,
                        placeholder: "Ex: msemail",
                        hint: "Enter the district's Realm."
                    },
                    {
                        id: "assignmentId",
                        type: "text",
                        label: "Assignment ID",
                        required: true,
                        placeholder: "Ex: https://msemail.benchmarkuniverse.com/?#assignments/11569615",
                        hint: "Paste the Assignment ID of the impacted assignment. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720821' target='_blank'>Finding assignment ID</a>"
                    },
                    {
                        id: "dateReported",
                        type: "date",
                        label: "Date Issue Reported",
                        required: true,
                        placeholder: "Ex: 06/05/2025",
                        hint: "Select the date the issue was reported."
                    },
                    {
                        id: "subscriptions",
                        type: "richtext",
                        label: "List of District Subscriptions",
                        required: true,
                        placeholder: "Ex: BEC Benchmark Advance 2022 (National Edition) Gr. K Classroom Digital",
                        hint: "Paste the relevant subscriptions the district has access to."
                    },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR File Attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Choose Yes if a HAR file has been captured, or No if it has not been. Note: All SIM Trackers should have a HAR File unless told otherwise by a lead or manager. If No is chosen from the drop-down, you will need to enter a reason as to why you do not have one in order to create the tracker."
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
                        required: true,
                        placeholder: "Ex: After clicking the Help button, it should take me to a new page with Help articles.",
                        hint: "Ex: After clicking the Help button, it should take me to a new page with Help articles."
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
            if (fields.screenshotsDescription && fields.screenshotsDescription.trim() !== '<p><br></p>') {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS</span></div>';
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
            if (fields.assignmentId) description += `Assignment ID: ${fields.assignmentId}<br>`;
            if (fields.dateReported) description += `Date Issue Reported: ${formatDate(fields.dateReported) || ''}<br>`;
            if (fields.subscriptions) {
                description += `List of District Subscriptions:<br>`;
                description += `<div style="margin-left: 20px;">${fields.subscriptions}</div>`;
            }
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
            if (fields.expectedResults) {
                description += `<div>${fields.expectedResults}</div>`;
            } else {
                description += '<div><em>No expected results provided.</em></div>';
            }

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

                // Join all parts with " | "
                const subject = subjectParts.join(' | ');

                formattedSubjectField.value = subject;
                console.log("Updated SIM Plan & Teach subject line:", subject);
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
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP. Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    {
                        id: "districtName",
                        type: "text",
                        label: "District Name",
                        required: true,
                        hint: "Auto-populates from original ticket."
                    },
                    {
                        id: "districtState",
                        type: "text",
                        label: "District State",
                        required: true,
                        placeholder: "Ex: FL",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field, be sure to only use the state abbreviation."
                    },
                    {
                        id: "application",
                        type: "text",
                        label: "Program Name",
                        required: true,
                        placeholder: "Ex: Advance -c2022",
                        hint: "Auto-populates from the original ticket."
                    },
                    {
                        id: "version",
                        type: "select",
                        label: "Subscription Version",
                        required: false,
                        placeholder: "Ex: 2.75",
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
                        hint: "Select the appropriate subscription version number from the dropdown."
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        placeholder: "Ex: 2.5 Virginia",
                        options: [],
                        hint: "Select the corresponding state or national version from the dropdown. Note: Just because a district is located in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        placeholder: "Ex: Reading Log",
                        options: ["-- Loading from settings --"],
                        needsCustomValues: true,
                        hint: "Select the impacted resource."
                    },
                    {
                        id: "specificIssue",
                        type: "text",
                        label: "Specific Issue",
                        required: true,
                        placeholder: "Ex: Student Book Reviews Not Visible",
                        hint: "Enter a succinct description of the issue."
                    },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ],
                        hint: "Select the User Role that is impacted by the issue. Note: Multiple roles can be selected."
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        placeholder: "Ex: MAPLE SHADE TWP SCHOOL DIST • NJ | Advance c2022 • 2.5 National | Reading Log • Student's Book Reviews Not Visible for Teacher",
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: VIP or Standard District Name • District State (Abv) | Program Name • Variation National / State | Resource: • Specific issue for user role",
                        readOnly: true
                    }
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
                        label: "Specific details outlining user impact",
                        required: true,
                        placeholder: "Ex: A student has submitted a book review; however, it is not visible in the teacher's account.",
                        hint: "Enter the issue details as reported by the user in a concise and constructive manner. Note: DO NOT copy and paste what the user has reported."
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
                        placeholder: "Ex: Teacher dashboard > Click on the fly-out menu > Click on Reading Log > Change date range to School Year"
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
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    {
                        id: "username",
                        type: "text",
                        label: "Username",
                        required: true,
                        placeholder: "Ex: amiller3",
                        hint: "Enter the Username of the impacted user."
                    },
                    {
                        id: "role",
                        type: "text",
                        label: "Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        hint: "Enter the BU user Role that is impacted by the issue"
                    },
                    {
                        id: "BURCLink",
                        type: "text",
                        label: "BURC Link",
                        required: true,
                        placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/544931/manage-account/district/teachers/dlulgjuraj@benchmarkeducation.com",
                        hint: "Paste the BURC Link of the impacted user(s)."
                    },
                    {
                        id: "className",
                        type: "text",
                        label: "Class Name",
                        required: true,
                        placeholder: "Ex: Tech Support Class 2-Lulgjuraj",
                        hint: "Paste the Impacted Class Name."
                    },
                    {
                        id: "classBURCLink",
                        type: "text",
                        label: "Class BURC Link",
                        required: true,
                        placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/544931/manage-account/school/545757/classes/7536061/activated/Tech%20Support%20Class%202-Lulgjuraj",
                        hint: "Paste the Impacted Class BURC Link."
                    },
                    {
                        id: "studentInternalID",
                        type: "text",
                        label: "Student Internal ID",
                        required: true,
                        placeholder: "Ex: 15665275",
                        hint: "Paste the Student Internal ID of the impacted user(s). <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000739508' target='_blank'>Locating a User's Internal ID</a>"
                    },
                    {
                        id: "device",
                        type: "text",
                        label: "Device",
                        required: true,
                        placeholder: "Ex: PC",
                        hint: "Enter the impacted user's Device."
                    },
                    {
                        id: "realm",
                        type: "text",
                        label: "Realm",
                        required: true,
                        placeholder: "Ex: msemail",
                        hint: "Enter the district's Realm."
                    },
                    {
                        id: "assignmentID",
                        type: "text",
                        label: "Assignment ID",
                        required: true,
                        placeholder: "Ex: https://msemail.benchmarkuniverse.com/?#assignments/11569615",
                        hint: "Paste the Assignment ID of the impacted assignment. <a href='https://techsupport.benchmarkeducation.com/a/solutions/articles/67000720821' target='_blank'>Finding assignment ID</a>"
                    },
                    {
                        id: "dateReported",
                        type: "date",
                        label: "Date Issue Reported",
                        required: true,
                        placeholder: "Ex: 06/05/2025",
                        hint: "Select the date the issue was reported."
                    },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR File Attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Choose Yes if a HAR file has been captured, or No if it has not been. Note: All SIM Trackers should have a HAR File unless told otherwise by a lead or manager. If No is chosen from the drop-down, you will need to enter a reason as to why you do not have one in order to create the tracker."
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
                        required: true,
                        placeholder: "Ex: Student's book reviews should appear for the teacher.",
                        hint: "Enter details regarding expected functionality."
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
            if (fields.screenshotsDescription && fields.screenshotsDescription.trim() !== '<p><br></p>') {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS</span></div>';
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
                description += `BURC Link: <a href="${techLink}" target="_blank">${fields.BURCLink}</a><br>`;
            }

            if (fields.className) description += `Class Name: ${fields.className}<br>`;

            // Handle Class BURC Link as a hyperlink
            if (fields.classBURCLink) {
                let classLink = fields.classBURCLink.trim();
                if (!classLink.startsWith('http://') && !classLink.startsWith('https://')) {
                    classLink = 'https://' + classLink;
                }
                description += `Class BURC Link: <a href="${classLink}" target="_blank">${fields.classBURCLink}</a><br>`;
            }

            if (fields.studentInternalID) description += `Student Internal ID: ${fields.studentInternalID}<br>`;
            if (fields.device) description += `Device: ${fields.device}<br>`;
            if (fields.realm) description += `Realm: ${fields.realm}<br>`;
            if (fields.assignmentID) description += `Assignment ID: ${fields.assignmentID}<br>`;
            if (fields.dateReported) description += `Date Issue Reported: ${formatDate(fields.dateReported) || ''}<br>`;
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
            if (fields.expectedResults) {
                description += `<div>${fields.expectedResults}</div>`;
            } else {
                description += '<div><em>No expected results provided.</em></div>';
            }

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

                // Join all parts with " | "
                const subject = subjectParts.join(' | ');

                formattedSubjectField.value = subject;
                console.log("Updated SIM Reading Log subject line:", subject);
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
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP. Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    {
                        id: "districtName",
                        type: "text",
                        label: "District Name",
                        required: true,
                        hint: "Auto-populates from original ticket."
                    },
                    {
                        id: "districtState",
                        type: "text",
                        label: "District State",
                        required: true,
                        placeholder: "Ex: FL",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field, be sure to only use the state abbreviation."
                    },
                    {
                        id: "application",
                        type: "text",
                        label: "Program Name",
                        required: true,
                        placeholder: "Ex: Advance -c2022",
                        hint: "Auto-populates from the original ticket."
                    },
                    {
                        id: "version",
                        type: "select",
                        label: "Subscription Version",
                        required: false,
                        placeholder: "Ex: 2.75",
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
                        hint: "Select the appropriate subscription version number from the dropdown."
                    },
                    {
                        id: "versionState",
                        type: "select",
                        label: "State/National",
                        required: false,
                        placeholder: "Ex: 2.75 Virginia",
                        options: [],
                        hint: "Select the corresponding state or national version from the dropdown. Note: Just because a district is located in CA does not mean they will have the California version of the product. You must check their subscriptions to verify."
                    },
                    {
                        id: "resource",
                        type: "select",
                        label: "Resource",
                        required: true,
                        placeholder: "Ex: Bookshelves",
                        options: ["-- Loading from settings --"],
                        needsCustomValues: true,
                        hint: "Select the impacted resource."
                    },
                    {
                        id: "specificIssue",
                        type: "text",
                        label: "Specific Issue",
                        required: true,
                        placeholder: "Ex: The School Customization Folder Is Missing",
                        hint: "Enter a succinct description of the issue."
                    },
                    {
                        id: "userRole",
                        type: "checkboxes",
                        label: "User Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        options: [
                            { id: "students", label: "Students" },
                            { id: "teachers", label: "Teachers" },
                            { id: "admin", label: "Admin" },
                            { id: "allUsers", label: "All Users" }
                        ],
                        hint: "Select the User Role that is impacted by the issue. Note: Multiple roles can be selected."
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        placeholder: "Ex: MAPLE SHADE TWP SCHOOL DIST • NJ | Advance c2022 • 2.5 National | Bookshelves: The School Customization Folder Is Missing for Teacher",
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: VIP or Standard District Name • District State (Abv) | Program Name • Variation National / State | Resource: • Specific issue for user role",
                        readOnly: true
                    }
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
                        label: "Specific details outlining user impact",
                        required: true,
                        placeholder: "Ex: In Bookshelves, the school customization folder is no longer visible in the teacher's account.",
                        hint: "Enter the issue details as reported by the user in a concise and constructive manner. Note: DO NOT copy and paste what the user has reported."
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
                        placeholder: "Ex: Teacher dashboard > Click on the fly-out menu > Click on Bookshelves > Click on Shared With Me"
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
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    {
                        id: "username",
                        type: "text",
                        label: "Username",
                        required: true,
                        placeholder: "Ex: amiller3",
                        hint: "Enter the Username of the impacted user."
                    },
                    {
                        id: "role",
                        type: "text",
                        label: "Role",
                        required: true,
                        placeholder: "Ex: Teacher",
                        hint: "Enter the BU user Role that is impacted by the issue. Note: Multiple roles can be selected."
                    },
                    {
                        id: "BURCLink",
                        type: "text",
                        label: "BURC Link",
                        required: true,
                        placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/544931/manage-account/district/teachers/dlulgjuraj@benchmarkeducation.com",
                        hint: "Paste the BURC Link of the impacted user."
                    },
                    {
                        id: "studentInternalId",
                        type: "text",
                        label: "Student Internal ID",
                        required: true,
                        placeholder: "Ex: 15665275",
                        hint: "Paste the Student Internal ID of the impacted user."
                    },
                    {
                        id: "device",
                        type: "text",
                        label: "Device",
                        required: true,
                        placeholder: "Ex: PC",
                        hint: "Enter the impacted user's Device."
                    },
                    {
                        id: "realm",
                        type: "text",
                        label: "Realm",
                        required: true,
                        placeholder: "Ex: msemail",
                        hint: "Enter the district's Realm."
                    },
                    {
                        id: "dateReported",
                        type: "date",
                        label: "Date Issue Reported",
                        required: true,
                        placeholder: "Ex: 06/05/2025",
                        hint: "Select the date the issue was reported."
                    },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR File Attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Choose Yes if a HAR file has been captured, or No if it has not been. Note: All SIM Trackers should have a HAR File unless told otherwise by a lead or manager. If No is chosen from the drop-down, you will need to enter a reason as to why you do not have one in order to create the tracker."
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
                        required: true,
                        hint: "Enter details regarding expected functionality.<br>Ex: The school customization folder should be visible in the teacher's account."
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
            if (fields.screenshotsDescription && fields.screenshotsDescription.trim() !== '<p><br></p>') {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS</span></div>';
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
                description += `BURC Link: <a href="${techLink}" target="_blank">${fields.BURCLink}</a><br>`;
            }

            if (fields.studentInternalId) description += `Student Internal ID: ${fields.studentInternalId}<br>`;
            if (fields.device) description += `Device: ${fields.device}<br>`;
            if (fields.realm) description += `Realm: ${fields.realm}<br>`;
            if (fields.dateReported) description += `Date Issue Reported: ${formatDate(fields.dateReported)}<br>`;
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
                const resourceField = document.getElementById('resource');
                const specificIssueField = document.getElementById('specificIssue');
                const formattedSubjectField = document.getElementById('formattedSubject');

                if (!isVipField || !districtNameField || !districtStateField || !applicationField ||
                    !versionField || !resourceField || !specificIssueField || !formattedSubjectField) {
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
                const resource = resourceField.value || '';
                const specificIssue = specificIssueField.value || '';
                const userRoleText = userRoles.length > 0 ? userRoles.join(' & ') : '';

                // Build the subject line dynamically, only including parts that have values
                const subjectParts = [];

                // First part: VIP status and district info
                let districtPart = '';
                if (isVip) {
                    districtPart = `VIP* ${districtName} • ${districtState}`;
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

                // Third part: Resource and specific issue combined with bullet separator
                let resourceIssuePart = '';
                if (resource && resource !== 'Placeholder') {
                    resourceIssuePart = resource;
                    if (specificIssue) {
                        resourceIssuePart += ` • ${specificIssue}`;
                    }
                } else if (specificIssue) {
                    resourceIssuePart = specificIssue;
                }

                // Add user role to the resource/issue part
                if (userRoleText) {
                    resourceIssuePart += ` for ${userRoleText}`;
                }

                if (resourceIssuePart.trim()) {
                    subjectParts.push(resourceIssuePart);
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
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP. Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true, hint: "Auto-populates from original ticket." },
                    { id: "districtState", type: "text", label: "District State", required: true, placeholder: "VA", hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field be sure to only use state abbreviation." },
                    {
                        id: "userRole",
                        type: "text",
                        label: "Role",
                        required: true,
                        placeholder: "District Admin",
                        hint: "This field auto-populates. Note: Only a district admin can make this request. If the user is a teacher or school admin, direct them to their district admin to request changes to customized eAssessments."
                    },
                    { id: "formattedSubject", type: "text", label: "Subject", required: false, hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: VIP or Standard District Name • District State (Abv) | DPT • Customized eAssessments - District Admin", placeholder: "VIP * FAIRFAX CO SCHOOL DIST• VA | DPT (Customized eAssessments) - District Admin", readOnly: true }
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
                        defaultValue: "This district would like to be added to the District Preference Table for customized eAssessments",
                        hint: "Auto-populates with default text. You can modify as needed."
                    },
                    { id: "districtNameField", type: "text", label: "District name", required: true, hint: "Auto-populates from subject details." },
                    { id: "districtStateSummary", type: "text", label: "District State", required: true, hint: "Auto-populates from subject details." },
                    { id: "districtBUID", type: "text", label: "District BU ID", required: true, hint: "Paste the district's BU ID. Ex: 75896", placeholder: "Ex: 75896" }
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
                        hint: "If known, give a brief explanation as to why the district would like to be added. Ex: The district has multiple eAssessments that have already been taken by students, but they still want access to update those eAssessments."
                    }
                ]
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "username", type: "text", label: "Username", required: true, hint: "Enter the Username of the requestor. Ex: amiller3", placeholder: "Ex: amiller3" },
                    { id: "BURCLink", type: "text", label: "BURC Link", required: true, hint: "Paste the districts admins BURC Link. Ex: https://onboarding-production.benchmarkuniverse.com/3138327/manage-account/district/districtadmins/bgunsalus", placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/..." },
                    { id: "dateRequested", type: "date", label: "Date Requested", required: true, hint: "Select the date the request was made. Ex: 06/05/2025", placeholder: "Ex: 06/05/2025" }
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

            // SUMMARY
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SUMMARY</span></div>';
            if (fields.summaryContent) {
                description += `<div>${fields.summaryContent}</div>`;
            } else {
                description += `${fields.districtNameField || fields.districtName} wants to be added to the District Preference Table for customized eAssessments<br>`;
            }
            description += `District name: ${fields.districtNameField || fields.districtName}<br>`;
            description += `District State: ${fields.districtStateSummary || ''}<br>`;
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

            // Add screenshots section if content is provided
            if (fields.screenshotsDescription && fields.screenshotsDescription.trim() !== '<p><br></p>') {
                description += '<div style="margin-bottom: 20px;"></div>';
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS</span></div>';
                description += `<div>${fields.screenshotsDescription}</div>`;
            }

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

            // Auto-populate summary content with default text
            function populateSummaryDefault(retryCount = 0) {
                console.log(`DPT: Attempting to populate summary content (attempt ${retryCount + 1})`);

                // Method 1: Try to use the Quill instance directly
                let quillInstance = null;
                if (window.trackerApp && window.trackerApp.quillInstances && window.trackerApp.quillInstances.summaryContent) {
                    quillInstance = window.trackerApp.quillInstances.summaryContent;
                    console.log("DPT: Found Quill instance for summaryContent");
                }

                if (quillInstance) {
                    const currentContent = quillInstance.root.innerHTML;
                    console.log("DPT: Current Quill content via instance:", currentContent);

                    // Check if content is empty or just contains default Quill placeholder
                    if (!currentContent ||
                        currentContent.trim() === '' ||
                        currentContent.trim() === '<p><br></p>' ||
                        currentContent.trim() === '<p></p>' ||
                        currentContent.trim() === '<div><br></div>') {

                        quillInstance.root.innerHTML = '<p>This district would like to be added to the District Preference Table for customized eAssessments</p>';
                        console.log("DPT: Populated summary via Quill instance");

                        // Trigger Quill change event
                        quillInstance.emitter.emit('text-change');
                        return;
                    } else {
                        console.log("DPT: Summary already has content via Quill instance, not overwriting");
                        return;
                    }
                }

                // Method 2: Try multiple selectors for the Quill editor
                let summaryEditor = document.querySelector('#summaryContent .ql-editor');
                if (!summaryEditor) {
                    summaryEditor = document.querySelector('[data-field-id="summaryContent"] .ql-editor');
                }
                if (!summaryEditor) {
                    summaryEditor = document.querySelector('.section[data-section-id="summary"] .ql-editor');
                }
                if (!summaryEditor) {
                    // Look for any Quill editor in the summary section
                    const summarySection = document.querySelector('.section[data-section-id="summary"]');
                    if (summarySection) {
                        summaryEditor = summarySection.querySelector('.ql-editor');
                    }
                }
                if (!summaryEditor) {
                    // Try looking for the summaryContent element and find any .ql-editor within it or its siblings
                    const summaryContent = document.getElementById('summaryContent');
                    if (summaryContent) {
                        summaryEditor = summaryContent.querySelector('.ql-editor');
                        if (!summaryEditor && summaryContent.parentElement) {
                            summaryEditor = summaryContent.parentElement.querySelector('.ql-editor');
                        }
                    }
                }

                console.log(`DPT: Summary editor found via DOM:`, !!summaryEditor);

                if (summaryEditor) {
                    const currentContent = summaryEditor.innerHTML;
                    console.log(`DPT: Current content via DOM:`, currentContent);

                    // Check if content is empty or just contains default Quill placeholder
                    if (!currentContent ||
                        currentContent.trim() === '' ||
                        currentContent.trim() === '<p><br></p>' ||
                        currentContent.trim() === '<p></p>' ||
                        currentContent.trim() === '<div><br></div>') {

                        summaryEditor.innerHTML = '<p>This district would like to be added to the District Preference Table for customized eAssessments</p>';
                        console.log("DPT: Populated summary section with default text via DOM");

                        // Try to trigger any change events
                        const event = new Event('input', { bubbles: true });
                        summaryEditor.dispatchEvent(event);
                    } else {
                        console.log("DPT: Summary already has content via DOM, not overwriting");
                    }
                } else if (retryCount < 10) {
                    // Retry if editor not found yet
                    console.log(`DPT: Summary editor not found, retrying in 500ms (attempt ${retryCount + 1}/10)`);
                    setTimeout(() => populateSummaryDefault(retryCount + 1), 500);
                } else {
                    console.warn("DPT: Could not find summary editor after 10 attempts");
                }
            }

            // Try to populate immediately and with delays
            setTimeout(() => populateSummaryDefault(), 100);
            setTimeout(() => populateSummaryDefault(), 500);
            setTimeout(() => populateSummaryDefault(), 1500);
            setTimeout(() => populateSummaryDefault(), 3000);

            // Set up a MutationObserver to watch for when Quill editors are added
            const observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) { // Element node
                                // Check if this node or its children contain a Quill editor
                                if (node.classList && (node.classList.contains('ql-editor') || node.classList.contains('quill-editor') || node.querySelector('.ql-editor'))) {
                                    console.log("DPT: MutationObserver detected Quill editor being added:", node);

                                    // Check if it's related to summary content
                                    const summarySection = document.querySelector('.section[data-section-id="summary"]');
                                    const summaryContent = document.getElementById('summaryContent');

                                    if ((summarySection && (summarySection.contains(node) || node.contains(summarySection))) ||
                                        (summaryContent && (summaryContent.contains(node) || node.contains(summaryContent))) ||
                                        node.id === 'summaryContent' ||
                                        node.classList.contains('ql-editor')) {
                                        console.log("DPT: Detected summary-related Quill editor being added to DOM");
                                        setTimeout(() => populateSummaryDefault(), 100);
                                    }
                                }
                            }
                        });
                    }
                });
            });

            // Start observing
            observer.observe(document.body, { childList: true, subtree: true });

            // Stop observing after 10 seconds to avoid memory leaks
            setTimeout(() => {
                observer.disconnect();
                console.log("DPT: Stopped observing for summary editor");
            }, 10000);

            // Function to update the subject line based on district name, district state and VIP status
            function updateSubjectLine() {
                const isVipField = document.getElementById('isVIP');
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const userRoleField = document.getElementById('userRole');
                const formattedSubjectField = document.getElementById('formattedSubject');

                if (!isVipField || !districtNameField || !districtStateField || !formattedSubjectField) {
                    console.log("Missing required fields for subject formatting");
                    return;
                }

                const isVip = isVipField.value === 'Yes';
                const districtName = districtNameField.value || '';
                const districtState = districtStateField.value || '';
                const userRole = userRoleField ? userRoleField.value || 'District Admin' : 'District Admin';

                // Format: "VIP * District Name • District State | DPT (Customized eAssessments) - User Role"
                let subject = '';
                if (isVip) {
                    subject = `VIP * ${districtName} • ${districtState} | DPT (Customized eAssessments) - ${userRole}`;
                } else {
                    subject = `${districtName} • ${districtState} | DPT (Customized eAssessments) - ${userRole}`;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);

                // Also update the district name in the summary section
                const districtNameSummaryField = document.getElementById('districtNameField');
                if (districtNameSummaryField) {
                    districtNameSummaryField.value = districtName;
                }

                // Also update the district state in the summary section
                const districtStateSummaryField = document.getElementById('districtStateSummary');
                if (districtStateSummaryField && districtState) {
                    districtStateSummaryField.value = districtState;
                }
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', updateSubjectLine);
            document.getElementById('districtState')?.addEventListener('input', function () {
                updateSubjectLine();
                // Also sync to summary section
                const districtStateSummaryField = document.getElementById('districtStateSummary');
                if (districtStateSummaryField) {
                    districtStateSummaryField.value = this.value;
                }
            });
            document.getElementById('userRole')?.addEventListener('input', updateSubjectLine);

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
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Auto-populates from original ticket. If not, choose yes if the District is VIP and No if it is not. You can review the <a href='https://benchmarkeducationcompany.freshdesk.com/a/solutions/articles/67000739842' target='_blank'>VIP list</a> if you are unsure, but the original ticket should indicate if the user's district is VIP.<br>Note: You should only have to update for exceptions such as a Sales Rep submitting a ticket on behalf of a VIP district. If you are unsure, ask. These fields affect reports and need to be accurate. TYIA!"
                    },
                    {
                        id: "districtName",
                        type: "text",
                        label: "District Name",
                        required: true,
                        hint: "Auto-populates from original ticket."
                    },
                    {
                        id: "districtState",
                        type: "text",
                        label: "District State",
                        required: true,
                        placeholder: "Ex: FL",
                        hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located.<br>Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field, be sure to only use the state abbreviation."
                    },
                    {
                        id: "issue",
                        type: "text",
                        label: "Issue",
                        required: true,
                        value: "Timeout Extension",
                        readOnly: true,
                        hint: "This will auto-populate to say Timeout Extension."
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        readOnly: true,
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy.<br><br>Naming convention: VIP or Standard District Name • District State (Abv) | Issue<br><br>Ex: VIP * FAIRFAX CO PUBLIC SCHOOL DIST • VA | Timeout Extension"
                    }
                ]
            },
            {
                id: "details",
                title: "DESCRIPTION",
                icon: "fa-clipboard-list",
                fields: [
                    {
                        id: "username",
                        type: "text",
                        label: "Username",
                        required: true,
                        placeholder: "Ex: amiller3",
                        hint: "Enter the Username of the District Admin that is experiencing the issue."
                    },
                    {
                        id: "role",
                        type: "text",
                        label: "Role",
                        required: true,
                        value: "District Admin",
                        placeholder: "Ex: District Admin",
                        hint: "Enter District Admin.<br>Note: If the user has a different role they do not have access to this feature."
                    },
                    {
                        id: "adminLink",
                        type: "text",
                        label: "BURC Link",
                        required: true,
                        placeholder: "Ex: https://onboarding-production.benchmarkuniverse.com/7630420/manage-account/district/techadmins/heather_tech",
                        hint: "Paste the BURC Link of the user."
                    },
                    {
                        id: "realm",
                        type: "text",
                        label: "Realm",
                        required: true,
                        placeholder: "Ex: msemail",
                        hint: "Enter the district's Realm."
                    },
                    {
                        id: "districtNameDesc",
                        type: "text",
                        label: "District Name",
                        required: true,
                        hint: "Auto-populates from original ticket.",
                        readOnly: true
                    },
                    {
                        id: "timeoutLength",
                        type: "text",
                        label: "New Timeout Length Set Tool",
                        required: true,
                        placeholder: "Ex: 5 hours",
                        hint: "Enter the timeout length the DA has set.<br>Note: The timeout can be between 30 minutes and twelve hours long based on 30 minute increments. If they are choosing outside of these parameters the tool will fail."
                    },
                    {
                        id: "issueDetails",
                        type: "richtext",
                        label: "Details",
                        required: true,
                        hint: "Enter the details of how the timeout tool is failing.<br>Ex: DA has set the timeout feature to 2 hours and 30 minutes but the users are being logged out after only 30 minutes."
                    },
                    {
                        id: "dateReported",
                        type: "date",
                        label: "Date Issue Reported",
                        required: true,
                        placeholder: "Ex: 06/05/2025",
                        hint: "Select the date the issue was reported."
                    },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR File Attached",
                        required: true,
                        options: ["No", "Yes"],
                        hint: "Choose Yes if a HAR file has been captured, or No if it has not been.<br>Note: All SIM Trackers should have a HAR File unless told otherwise by a lead or manager. If No is chosen from the drop-down, you will need to enter a reason why you do not have one in order to create the tracker."
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
                id: "reproduction",
                title: "STEPS/FILTERS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    {
                        id: "stepsToReproduce",
                        type: "richtext",
                        label: "",
                        required: true,
                        hint: "Enter the exact steps taken by the user and yourself to recreate the issue."
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS, VIDEOS & OTHER SUPPORTING FILE ATTACHMENTS",
                icon: "fa-images",
                fields: [
                    {
                        id: "screenshotsDescription",
                        type: "richtext",
                        label: "",
                        required: false,
                        hint: "Click Upload Files to add any additional information that will be helpful."
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
                        required: true,
                        hint: "Enter details regarding expected functionality."
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            // Description section
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">DESCRIPTION</span></div>';
            description += `Username: ${fields.username || ''}<br>`;
            description += `Role: ${fields.role || ''}<br>`;
            description += `BURC Link: ${fields.adminLink || ''}<br>`;
            description += `Realm: ${fields.realm || ''}<br>`;
            description += `District Name: ${fields.districtNameDesc || fields.districtName || ''}<br>`;
            description += `New Timeout Length Set Tool: ${fields.timeoutLength || ''}<br>`;

            if (fields.issueDetails && fields.issueDetails.trim() !== '<p><br></p>') {
                description += `<div style="margin-top: 10px;"><strong>Details:</strong></div>`;
                description += `<div>${fields.issueDetails}</div>`;
            }

            description += `<div style="margin-top: 10px;">Date Issue Reported: ${formatDate(fields.dateReported) || ''}</div>`;
            description += `HAR File Attached: ${fields.harFileAttached || ''}`;
            if (fields.harFileAttached === "No" && fields.harFileReason) {
                description += ` (${fields.harFileReason})`;
            }
            description += '<br>';
            description += '<div style="margin-bottom: 20px;"></div>';

            // Steps to Reproduce section
            if (fields.stepsToReproduce && fields.stepsToReproduce.trim() !== '<p><br></p>') {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">STEPS/FILTERS TO REPRODUCE</span></div>';
                description += `<div>${fields.stepsToReproduce}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Screenshots section
            if (fields.screenshotsDescription && fields.screenshotsDescription.trim() !== '<p><br></p>') {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS, VIDEOS & OTHER SUPPORTING FILE ATTACHMENTS</span></div>';
                description += `<div>${fields.screenshotsDescription}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            // Expected Results section
            if (fields.expectedResults && fields.expectedResults.trim() !== '<p><br></p>') {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">EXPECTED RESULTS</span></div>';
                description += `<div>${fields.expectedResults}</div>`;
            }

            return description;
        },
        onLoad: function () {
            console.log("Timeout Extension Tracker onLoad function executing");

            // Call the helper functions to populate fields
            populateDistrictState();

            // Set the Issue field to "Timeout Extension" and make it readonly
            const issueField = document.getElementById('issue');
            if (issueField) {
                issueField.value = "Timeout Extension";
                issueField.readOnly = true;
                issueField.style.backgroundColor = '#f0f0f0';
                issueField.style.color = '#666';
                issueField.style.border = '1px solid #ddd';
                issueField.style.cursor = 'not-allowed';
            }

            // Set default value for Role field
            const roleField = document.getElementById('role');
            if (roleField && !roleField.value) {
                roleField.value = "District Admin";
            }

            // Function to sync District Name from subject to description section
            function syncDistrictName() {
                const subjectDistrictName = document.getElementById('districtName');
                const descDistrictName = document.getElementById('districtNameDesc');

                if (subjectDistrictName && descDistrictName) {
                    descDistrictName.value = subjectDistrictName.value;
                    console.log("Synced District Name to description section:", subjectDistrictName.value);
                }
            }

            // Format subject line based on district name, state and VIP status
            function updateSubjectLine() {
                const districtNameField = document.getElementById('districtName');
                const districtStateField = document.getElementById('districtState');
                const isVIPField = document.getElementById('isVIP');
                const issueField = document.getElementById('issue');
                const formattedSubjectField = document.getElementById('formattedSubject');

                if (!districtNameField || !districtStateField || !isVIPField || !formattedSubjectField) {
                    console.log("Missing required fields for subject formatting");
                    return;
                }

                const districtName = districtNameField.value || '';
                const districtState = districtStateField.value || '';
                const isVip = isVIPField.value === 'Yes';
                const issue = issueField ? issueField.value || 'Timeout Extension' : 'Timeout Extension';

                // Format: "VIP or Standard District Name • District State (Abv) | Issue"
                let subject = '';
                if (districtName.trim() && districtState.trim()) {
                    if (isVip) {
                        subject = `VIP * ${districtName.trim()} • ${districtState.trim()} | ${issue}`;
                    } else {
                        subject = `Standard ${districtName.trim()} • ${districtState.trim()} | ${issue}`;
                    }
                } else if (districtName.trim()) {
                    if (isVip) {
                        subject = `VIP * ${districtName.trim()} | ${issue}`;
                    } else {
                        subject = `Standard ${districtName.trim()} | ${issue}`;
                    }
                } else {
                    subject = issue;
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listeners
            document.getElementById('isVIP')?.addEventListener('change', updateSubjectLine);
            document.getElementById('districtName')?.addEventListener('input', function () {
                updateSubjectLine();
                syncDistrictName();
            });
            document.getElementById('districtState')?.addEventListener('input', updateSubjectLine);

            // Initial update attempt
            updateSubjectLine();
            syncDistrictName();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(() => {
                updateSubjectLine();
                syncDistrictName();
            }, 500);

            // Handle HAR file reason field visibility
            const harFileField = document.getElementById('harFileAttached');
            const harFileReasonField = document.getElementById('harFileReason');
            const harFileReasonContainer = harFileReasonField?.closest('.form-group');

            function toggleHarFileReason() {
                if (harFileReasonContainer) {
                    if (harFileField?.value === 'No') {
                        harFileReasonContainer.style.display = '';
                        harFileReasonField.required = true;
                    } else {
                        harFileReasonContainer.style.display = 'none';
                        harFileReasonField.required = false;
                        harFileReasonField.value = '';
                    }
                }
            }

            if (harFileField) {
                harFileField.addEventListener('change', toggleHarFileReason);
                // Initial check
                toggleHarFileReason();
            }
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
                    {
                        id: "helpArticleName",
                        type: "text",
                        label: "Help Article Name",
                        required: true,
                        placeholder: "Ex: About Grading eAssessments",
                        hint: "Paste the name of the help article."
                    },
                    {
                        id: "formattedSubject",
                        type: "text",
                        label: "Formatted Subject Line",
                        required: false,
                        placeholder: "Ex: BU Help Article Update | About Grading eAssessments",
                        hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: BU Help Article Update | Help Article Name",
                        readOnly: true
                    }
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
                        label: "",
                        required: true,
                        placeholder: "Ex: The dropdown menu for the Test Filter options no longer reflect the listed items in the article.",
                        hint: "Enter the details that need to be updated in the BU Help Article."
                    }
                ]
            },
            {
                id: "details",
                title: "DESCRIPTION",
                icon: "fa-clipboard-list",
                fields: [
                    {
                        id: "requester",
                        type: "text",
                        label: "Requestor",
                        required: true,
                        placeholder: "Ex: Abby Miller",
                        hint: "Enter the Requestor's name."
                    },
                    {
                        id: "dateRequested",
                        type: "date",
                        label: "Date Request",
                        required: true,
                        placeholder: "Ex: 06/05/2025",
                        hint: "Select the date the request was made."
                    },
                    {
                        id: "articleName",
                        type: "text",
                        label: "Name of BU Help Article",
                        required: true,
                        placeholder: "Ex: About Grading eAssessments",
                        hint: "Paste the name of the BU help article."
                    },
                    {
                        id: "articleUrl",
                        type: "text",
                        label: "URL of BU Help Article",
                        required: false,
                        placeholder: "Ex: https://help.benchmarkuniverse.com/bubateacher/Content/eAssessments/Grading/About%20Grading%20eAssessments.htm",
                        hint: "Paste the URL of the BU help article."
                    },
                    {
                        id: "referenceImages",
                        type: "richtext",
                        label: "Images for Reference",
                        required: false,
                        hint: "Add any screenshots that would be helpful."
                    }
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
            description += `Requestor: ${fields.requester || ''}<br>`;
            if (fields.dateRequested) description += `Date Request: ${formatDate(fields.dateRequested)}<br>`;
            description += `Name of BU Help Article: ${fields.articleName || ''}<br>`;
            if (fields.articleUrl) description += `URL of BU Help Article: ${fields.articleUrl}<br>`;

            // Add reference images if provided
            if (fields.referenceImages && fields.referenceImages.trim() !== '<p><br></p>') {
                description += '<div style="margin-bottom: 10px;"></div>';
                description += `<div><strong>Images for Reference:</strong></div>`;
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

            // Function to update formatted subject line
            function updateSubjectLine() {
                const helpArticleNameField = document.getElementById('helpArticleName');
                const formattedSubjectField = document.getElementById('formattedSubject');

                if (!helpArticleNameField || !formattedSubjectField) {
                    console.log("Missing required fields for subject formatting");
                    return;
                }

                const helpArticleName = helpArticleNameField.value || '';

                // Format: "BU Help Article Update | Help Article Name"
                let subject = '';
                if (helpArticleName.trim()) {
                    subject = `BU Help Article Update | ${helpArticleName.trim()}`;
                } else {
                    subject = 'BU Help Article Update';
                }

                formattedSubjectField.value = subject;
                console.log("Updated subject line:", subject);
            }

            // Set up event listener for Help Article Name field
            document.getElementById('helpArticleName')?.addEventListener('input', updateSubjectLine);

            // Initial subject line update
            updateSubjectLine();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(updateSubjectLine, 500);

            // Sync Help Article Name to the Description section
            function syncArticleName() {
                const helpArticleNameField = document.getElementById('helpArticleName');
                const articleNameField = document.getElementById('articleName');

                if (helpArticleNameField && articleNameField) {
                    articleNameField.value = helpArticleNameField.value;
                    console.log("Synced Help Article Name to Description section:", helpArticleNameField.value);
                }
            }

            // Set up event listener for syncing article names
            document.getElementById('helpArticleName')?.addEventListener('input', syncArticleName);

            // Initial sync
            syncArticleName();

            // Schedule another sync after a small delay
            setTimeout(syncArticleName, 500);
        }
    }
};

// Utility functions are now imported from:
// - app/utils/fieldPopulators.js 
// - app/utils/versionFieldHandlers.js
// - app/utils/quillHelpers.js

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
};

// sim-reading-log
const originalSimReadingLogOnLoad = TRACKER_CONFIGS["sim-reading-log"].onLoad;
TRACKER_CONFIGS["sim-reading-log"].onLoad = function () {
    originalSimReadingLogOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// sim-dashboard
const originalSimDashboardOnLoad = TRACKER_CONFIGS["sim-dashboard"].onLoad;
TRACKER_CONFIGS["sim-dashboard"].onLoad = function () {
    originalSimDashboardOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// Add function to sim-achievement-levels which doesn't have an onLoad function yet
TRACKER_CONFIGS["sim-achievement-levels"].onLoad = function () {
    console.log("SIM Achievement Levels Tracker onLoad function executing");
    setTimeout(setupClearFormattingButton, 500);

    // Auto-populate district state
    populateDistrictState();

    // Function to update subject line according to SIM Achievement Levels format
    function updateSubjectLine() {
        const districtNameField = document.getElementById('districtName');
        const districtStateField = document.getElementById('districtState');
        const formattedSubjectField = document.getElementById('formattedSubject');

        if (!districtNameField || !districtStateField || !formattedSubjectField) {
            console.log("SIM Achievement Levels: Missing required fields for subject formatting");
            return;
        }

        const districtName = districtNameField.value || '';
        const districtState = districtStateField.value || '';

        // Check if this is a VIP district (will be determined from ticket data)
        // For now, we'll use the ticket data if available
        let isVIP = false;
        if (window.trackerApp && window.trackerApp.ticketData && window.trackerApp.ticketData.isVip === true) {
            isVIP = true;
        }

        // Format: "VIP* District Name • District State | Custom Achievement Levels" or "District Name • District State | Custom Achievement Levels"
        let subject = '';
        if (districtName.trim() && districtState.trim()) {
            if (isVIP) {
                subject = `VIP* ${districtName.trim()} • ${districtState.trim()} | Custom Achievement Levels`;
            } else {
                subject = `${districtName.trim()} • ${districtState.trim()} | Custom Achievement Levels`;
            }
        } else if (districtName.trim()) {
            if (isVIP) {
                subject = `VIP* ${districtName.trim()} | Custom Achievement Levels`;
            } else {
                subject = `${districtName.trim()} | Custom Achievement Levels`;
            }
        } else {
            subject = 'Custom Achievement Levels';
        }

        formattedSubjectField.value = subject;
        console.log("SIM Achievement Levels: Updated subject line:", subject);

        // Also call the existing updateAchievementLevelsSubject method if available
        if (window.trackerApp && typeof window.trackerApp.updateAchievementLevelsSubject === 'function') {
            setTimeout(() => {
                window.trackerApp.updateAchievementLevelsSubject();
            }, 100);
        }
    }

    // Function to sync District Name from Subject section to Description section
    function syncDistrictNameFields() {
        const subjectDistrictName = document.querySelector('#section-subject #districtName');
        const descriptionDistrictName = document.querySelector('#section-userDetails #districtName');

        if (subjectDistrictName && descriptionDistrictName) {
            // Copy value from subject to description
            descriptionDistrictName.value = subjectDistrictName.value;

            // Style the description field as read-only
            descriptionDistrictName.readOnly = true;
            descriptionDistrictName.style.backgroundColor = '#f0f0f0';
            descriptionDistrictName.style.color = '#666';
            descriptionDistrictName.style.border = '1px solid #ddd';
            descriptionDistrictName.style.cursor = 'not-allowed';

            console.log("SIM Achievement Levels: Synced District Name to Description section:", subjectDistrictName.value);
        }
    }

    // Set up event listeners for subject line formatting and field synchronization
    setTimeout(() => {
        const subjectDistrictName = document.querySelector('#section-subject #districtName');
        const subjectDistrictState = document.querySelector('#section-subject #districtState');

        // Set up event listeners for subject line updates
        subjectDistrictName?.addEventListener('input', updateSubjectLine);
        subjectDistrictState?.addEventListener('input', updateSubjectLine);

        // Set up event listener for District Name synchronization
        subjectDistrictName?.addEventListener('input', syncDistrictNameFields);

        // Initial synchronization and subject line update
        syncDistrictNameFields();
        updateSubjectLine();

        // Schedule another update after a small delay to ensure fields are populated
        setTimeout(() => {
            syncDistrictNameFields();
            updateSubjectLine();
        }, 500);
    }, 500);

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

// Update all SIM tracker resource fields to use dynamic loading
(function updateSIMResourceFields() {
    const simTrackers = [
        'sim-assignment',
        'sim-assessment-reports',
        'sim-fsa',
        'sim-library-view',
        'sim-orr'
    ];

    simTrackers.forEach(trackerName => {
        if (TRACKER_CONFIGS[trackerName]) {
            // Find the subject section
            const subjectSection = TRACKER_CONFIGS[trackerName].sections.find(s => s.id === 'subject');
            if (subjectSection) {
                // Find the resource field
                const resourceField = subjectSection.fields.find(f => f.id === 'resource');
                if (resourceField) {
                    // Update the resource field to use dynamic loading
                    resourceField.options = ["-- Loading from settings --"];
                    resourceField.needsCustomValues = true;
                    console.log(`Updated ${trackerName} resource field to use dynamic loading`);
                }
            }
        }
    });
})();

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
            } else if (window.trackerApp.trackerType === 'sim-plan-teach' && typeof window.trackerApp.updateSimPlanTeachSubject === 'function') {
                console.log("Triggering SIM Plan & Teach subject update after Resource change");
                window.trackerApp.updateSimPlanTeachSubject();
            } else if (window.trackerApp.trackerType === 'sim-reading-log' && typeof window.trackerApp.updateSimReadingLogSubject === 'function') {
                console.log("Triggering SIM Reading Log subject update after Resource change");
                window.trackerApp.updateSimReadingLogSubject();
            } else if (window.trackerApp.trackerType === 'sim-dashboard' && typeof window.trackerApp.updateSimDashboardSubject === 'function') {
                console.log("Triggering SIM Dashboard subject update after Resource change");
                window.trackerApp.updateSimDashboardSubject();
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

