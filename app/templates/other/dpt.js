// Import utility functions that will be used in this template
// These need to be available globally in the browser environment
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState, populateVIPStatus from app/utils/fieldPopulators.js
// - setupCustomVersionInput, setupCustomVersionStateInput, getVersionValue, getVersionStateValue from app/utils/versionFieldHandlers.js
// - TemplateBase from app/utils/templateBase.js

module.exports = {
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
                { id: "formattedSubject", type: "text", label: "Subject", required: false, hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: VIP or Standard District Name • District State (Abv) | DPT • Customized eAssessments - District Admin", placeholder: "VIP * FAIRFAX CO SCHOOL DIST • VA | DPT • Customized eAssessments - District Admin", readOnly: true }
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

        // Call helper functions to populate fields
        populateDistrictState();
        populateVIPStatus();

        // Schedule subject line update after VIP status is populated
        setTimeout(() => {
            templateBase.updateSubjectLine();
            console.log("DPT: Updating subject line after VIP status population");
        }, 1000);

        // Add manual listener to VIP field for debugging
        const vipField = document.getElementById('isVIP');
        if (vipField) {
            vipField.addEventListener('change', () => {
                console.log("DPT: VIP field manually detected change to:", vipField.value);
                setTimeout(() => templateBase.updateSubjectLine(), 100);
            });
        }

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

        // Initialize TemplateBase for subject line formatting
        const templateBase = new TemplateBase({
            templateName: 'dpt',
            subjectLineFormat: 'dpt',
            requiredFields: ['districtName', 'districtState', 'userRole'],
            fields: {
                isVIP: 'isVIP',
                districtName: 'districtName',
                districtState: 'districtState',
                userRole: 'userRole',
                formattedSubject: 'formattedSubject'
            }
        });

        // Initialize the template (sets up event listeners and formats subject)
        templateBase.initializeSubjectLineFormatting();

        // Schedule initial subject line update after fields are populated
        setTimeout(() => templateBase.updateSubjectLine(), 500);

        // Set up additional event listeners for field syncing
        document.getElementById('districtName')?.addEventListener('input', function () {
            // Update the district name in the summary section
            const districtNameSummaryField = document.getElementById('districtNameField');
            if (districtNameSummaryField) {
                districtNameSummaryField.value = this.value;
            }
        });

        document.getElementById('districtState')?.addEventListener('input', function () {
            // Sync to summary section
            const districtStateSummaryField = document.getElementById('districtStateSummary');
            if (districtStateSummaryField) {
                districtStateSummaryField.value = this.value;
            }
        });
    }
};