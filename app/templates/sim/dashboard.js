// Import utility functions that will be used in this template
// These need to be available globally in the browser environment
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState from app/utils/fieldPopulators.js
// - setupCustomVersionInput, setupCustomVersionStateInput, getVersionValue, getVersionStateValue from app/utils/versionFieldHandlers.js
// - TemplateBase from app/utils/templateBase.js
// - DemoDataHelper from app/utils/demoDataHelper.js

module.exports = {
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
                    required: false,
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
                    id: "browser",
                    type: "text",
                    label: "Browser",
                    required: true,
                    placeholder: "Ex: Chrome, Firefox, Safari, Edge",
                    hint: "Enter the browser being used by the impacted user."
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
        if (fields.browser) description += `Browser: ${fields.browser}<br>`;
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

        // Use TemplateBase for subject line formatting
        const templateBase = new TemplateBase({
            templateType: 'sim',
            subjectFormat: 'sim-dashboard',
            fields: {
                vip: 'isVIP',
                districtName: 'districtName',
                districtState: 'districtState',
                application: 'application',
                version: 'version',
                versionState: 'versionState',
                resource: 'resource',
                specificIssue: 'specificIssue',
                formattedSubject: 'formattedSubject'
            },
            requiredFields: ['districtName']
        });

        templateBase.initializeSubjectLineFormatting();



        // Schedule another update after a small delay to ensure fields are populated
        setTimeout(() => templateBase.updateSubjectLine(), 500);

        // Add demo data functionality
        const demoDataHelper = new DemoDataHelper();

        // Handle async addDemoDataButton
        (async () => {
            const demoButton = await demoDataHelper.addDemoDataButton();
            if (demoButton) {
                // Store reference to this template configuration
                const templateConfig = window.TRACKER_CONFIGS_FROM_TEMPLATES['sim-dashboard'] || module.exports;
                demoButton.addEventListener('click', () => {
                    console.log('Demo button clicked for sim-dashboard template');
                    demoDataHelper.fillDemoData(templateConfig);
                });
            }
        })();
    }
};