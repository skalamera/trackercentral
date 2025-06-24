// Import utility functions that will be used in this template
// - DemoDataHelper from app/utils/demoDataHelper.js
// These need to be available globally in the browser environment
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState, populateVIPStatus from app/utils/fieldPopulators.js
// - setupCustomVersionInput, setupCustomVersionStateInput, getVersionValue, getVersionStateValue from app/utils/versionFieldHandlers.js
// - TemplateBase from app/utils/templateBase.js

module.exports = {
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
        populateVIPStatus();

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

        // Initialize TemplateBase for subject line formatting
        const templateBase = new TemplateBase({
            templateName: 'timeout-extension',
            subjectLineFormat: 'timeout-extension',
            requiredFields: ['districtName', 'districtState', 'issue'],
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

        // Schedule additional subject line update after VIP status is populated
        setTimeout(() => {
            templateBase.updateSubjectLine();
            console.log("Timeout Extension: Updating subject line after VIP status population");
        }, 1000);

        // Add manual listener to VIP field for debugging
        const vipField = document.getElementById('isVIP');
        if (vipField) {
            vipField.addEventListener('change', () => {
                console.log("Timeout Extension: VIP field manually detected change to:", vipField.value);
                setTimeout(() => templateBase.updateSubjectLine(), 100);
            });
        }

        // Set up additional event listener for district name syncing
        document.getElementById('districtName')?.addEventListener('input', syncDistrictName);

        // Initial sync
        syncDistrictName();

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

        // Add demo data functionality
        const demoDataHelper = new DemoDataHelper();
        const demoButton = demoDataHelper.addDemoDataButton();
        if (demoButton) {
            // Store reference to this template configuration
            const templateConfig = window.TRACKER_CONFIGS_FROM_TEMPLATES['timeout-extension'] || module.exports;
            demoButton.addEventListener('click', () => {
                console.log('Demo button clicked for timeout-extension template');
                demoDataHelper.fillDemoData(templateConfig);
            });
        }
    }
};