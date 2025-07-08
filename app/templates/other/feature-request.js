// Import utility functions that will be used in this template
// These need to be available globally in the browser environment
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState, populateVIPStatus from app/utils/fieldPopulators.js
// - setupCustomVersionInput, setupCustomVersionStateInput, getVersionValue, getVersionStateValue from app/utils/versionFieldHandlers.js
// - TemplateBase from app/utils/templateBase.js
// - DemoDataHelper from app/utils/demoDataHelper.js

module.exports = {
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
                    hint: "This will auto-populate based on your submissions. Be sure to review for accuracy.<br>Naming convention: VIP or Standard District Name • District State (Abv) | Program Name • Variation National / State | Resource • Specific issue for user role<br>Ex: VIP * FAIRFAX CO SCHOOL DIST • VA | Advance -c2022 • 2.75 Virginia | Bookshelves • Option to Select Whole Class to Share Bookshelves for Teachers",
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

        // Auto-populate VIP status
        populateVIPStatus();

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
            requiredFields: ['districtName', 'districtState', 'application', 'resourceName', 'shortDescription'],
            fields: {
                isVIP: 'isVIP',
                districtName: 'districtName',
                districtState: 'districtState',
                application: 'application',
                version: 'version',
                versionState: 'versionState',
                resource: 'resourceName',
                specificIssue: 'shortDescription',
                userRole: 'userRole',
                formattedSubject: 'formattedSubject'
            }
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
        templateBase.initializeSubjectLineFormatting();

        // Set up conditional validation for District State field
        setTimeout(() => {
            templateBase.setupConditionalValidation();
        }, 100);

        // Schedule initial subject line update after fields are populated
        setTimeout(() => templateBase.updateSubjectLine(), 500);

        // Set up additional event listeners for field syncing
        document.getElementById('application')?.addEventListener('input', syncFeatureRequestFields);
        document.getElementById('version')?.addEventListener('change', syncFeatureRequestFields);
        document.getElementById('versionState')?.addEventListener('change', syncFeatureRequestFields);
        document.getElementById('shortDescription')?.addEventListener('input', syncFeatureRequestFields);

        // Initial sync of feature request fields
        syncFeatureRequestFields();

        // Schedule another sync after a small delay to ensure fields are populated
        setTimeout(syncFeatureRequestFields, 500);

        // Add demo data functionality
        const demoDataHelper = new DemoDataHelper();

        // Handle async addDemoDataButton
        (async () => {
            const demoButton = await demoDataHelper.addDemoDataButton();
            if (demoButton) {
                // Store reference to this template configuration
                const templateConfig = window.TRACKER_CONFIGS_FROM_TEMPLATES['feature-request'] || module.exports;
                demoButton.addEventListener('click', () => {
                    console.log('Demo button clicked for feature-request template');
                    demoDataHelper.fillDemoData(templateConfig);
                });
            }
        })();
    }
};