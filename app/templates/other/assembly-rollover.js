// Import utility functions that will be used in this template
// - DemoDataHelper from app/utils/demoDataHelper.js
// These need to be available globally in the browser environment
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState, populateVIPStatus from app/utils/fieldPopulators.js
// - TemplateBase from app/utils/templateBase.js

module.exports = {
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
                    required: false,
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
    onLoad: function () {
        console.log("Assembly Rollover onLoad function executing");

        // First populate Application Name from product info
        populateApplicationName();

        // Auto-populate district state for assembly rollover
        populateDistrictState();

        // Auto-populate VIP status
        populateVIPStatus();

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
            requiredFields: ['districtName'],
            fields: {
                isVIP: 'isVIP',
                districtName: 'districtName',
                districtState: 'districtState',
                issue: 'issue',
                formattedSubject: 'formattedSubject'
            }
        });

        // Initialize the template (sets up event listeners and formats subject)
        templateBase.initializeSubjectLineFormatting();



        // Schedule initial subject line update after fields are populated
        setTimeout(() => templateBase.updateSubjectLine(), 500);

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



        // Add demo data functionality
        const demoDataHelper = new DemoDataHelper();

        // Handle async addDemoDataButton
        (async () => {
            const demoButton = await demoDataHelper.addDemoDataButton();
            if (demoButton) {
                // Store reference to this template configuration
                const templateConfig = window.TRACKER_CONFIGS_FROM_TEMPLATES['assembly-rollover'] || module.exports;
                demoButton.addEventListener('click', () => {
                    console.log('Demo button clicked for assembly-rollover template');
                    demoDataHelper.fillDemoData(templateConfig);
                });
            }
        })();
    }
}; 