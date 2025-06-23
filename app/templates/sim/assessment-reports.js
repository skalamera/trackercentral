// Import utility functions that will be used in this template
// These need to be available globally in the browser environment
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState from app/utils/fieldPopulators.js
// - setupCustomVersionInput, setupCustomVersionStateInput, getVersionValue, getVersionStateValue from app/utils/versionFieldHandlers.js
// - TemplateBase from app/utils/templateBase.js

module.exports = {
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

            // Use TemplateBase for subject line formatting
            const templateBase = new TemplateBase({
                templateType: 'sim',
                subjectFormat: 'sim-assessment-reports',
                fields: {
                    vip: 'isVIP',
                    districtName: 'districtName',
                    districtState: 'districtState',
                    application: 'application',
                    version: 'version',
                    versionState: 'versionState',
                    resource: 'resource',
                    specificIssue: 'specificIssue',
                    userRole: 'userRole',
                    formattedSubject: 'formattedSubject'
                }
            });

            templateBase.initializeSubjectLineFormatting();

            // Schedule another update after a small delay to ensure fields are populated
            setTimeout(() => templateBase.updateSubjectLine(), 500);

            // Additional delayed update to ensure checkboxes are properly initialized
            setTimeout(() => {
                templateBase.updateSubjectLine();
                console.log("SIM Assessment Reports: Triggered delayed subject line update for checkboxes");

                // Debug: Check if checkboxes are found
                const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
                console.log("SIM Assessment Reports: Found userRole checkboxes:", checkboxes.length);
                checkboxes.forEach((cb, index) => {
                    console.log(`Checkbox ${index}: id=${cb.id}, checked=${cb.checked}, label=${cb.parentElement.textContent.trim()}`);
                });
            }, 1000);

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
        }
    };