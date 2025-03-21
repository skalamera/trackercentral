function formatDate(dateString) {
    if (!dateString) return '';

    try {
        const [year, month, day] = dateString.split('-');
        return `${month}/${day}/${year}`;
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
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true, hint: "BL Xcode removal request" }
                ]
            },
            {
                id: "details",
                title: "DESCRIPTION",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "realm", type: "text", label: "Realm (Tech Admin Link)", required: true },
                    { id: "effectiveDate", type: "date", label: "Effective Return Date", required: true },
                    { id: "assemblyCodes", type: "textarea", label: "Assembly Codes To Be Removed", required: true }
                ]
            }
        ],
        // Function to generate description HTML for this tracker type
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div>Please see the BL Xcode removal request below.</div>';
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">DESCRIPTION</span></div>';
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `Realm (Tech Admin Link): ${fields.realm || ''}<br>`;
            description += `Effective Return Date: ${formatDate(fields.effectiveDate) || ''}<br>`;
            description += `Assembly Codes To Be Removed:<br>${fields.assemblyCodes || ''}`;

            return description;
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
                icon: "fa-pen-fancy",
                fields: [
                    { id: "xcode", type: "text", label: "XCODE", required: true, hint: "Indicate if more than one", placeholder: "e.g. X56723" },
                    { id: "application", type: "text", label: "Application Name", required: true, placeholder: "e.g. BAdvance c2022" },
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
                    { id: "summary", type: "richtext", label: "", required: false }
                ]
            },
            {
                id: "details",
                title: "DESCRIPTION",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "issue", type: "richtext", label: "Issue", required: true },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "schoolName", type: "text", label: "School Name", required: false },
                    { id: "districtState", type: "text", label: "District State", required: false },
                    { id: "program", type: "text", label: "Program/Product Impacted", required: true },
                    { id: "programVariation", type: "text", label: "Program Variation (if known)", required: false },
                    { id: "dateReported", type: "date", label: "Date issue reported by user", required: false },
                    { id: "subscriptionCodes", type: "richtext", label: "Subscription codes customer is onboarded with", required: false },
                    {
                        id: "impactScope",
                        type: "select",
                        label: "Teacher vs Student impact",
                        required: false,
                        options: ["", "Teacher Only", "Student Only", "Both Teacher and Student"]
                    },
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Customer",
                        required: true,
                        options: ["No", "Yes"]
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

            return description;
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
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "team",
                title: "TEAM",
                icon: "fa-users",
                fields: [
                    {
                        id: "team", type: "select", label: "Team", required: true,
                        options: ["Content", "Engineering", "Product", "QA", "UX/Design"]
                    }
                ]
            },
            {
                id: "featureDetails",
                title: "FEATURE REQUEST SUMMARY",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "application", type: "text", label: "Application", required: true },
                    { id: "shortDescription", type: "textarea", label: "Short description", required: true }
                ]
            },
            {
                id: "additionalDetails",
                title: "ADDITIONAL DETAILS",
                icon: "fa-info-circle",
                fields: [
                    { id: "additionalDetails", type: "richtext", label: "", required: false }
                ]
            },
            {
                id: "userInfo",
                title: "USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "isVIP", type: "select", label: "VIP", required: true, options: ["No", "Yes"] },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "username", type: "text", label: "Username", required: false },
                    { id: "role", type: "text", label: "Role", required: false },
                    { id: "name", type: "text", label: "Name", required: false },
                    { id: "email", type: "email", label: "Email", required: false },
                    { id: "dateRequested", type: "date", label: "Date Requested", required: false }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">TEAM</span></div>';
            description += `<div>${fields.team || ''}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">FEATURE REQUEST SUMMARY</span></div>';
            description += `Application: ${fields.application || ''}<br>`;
            description += `Short description: ${fields.shortDescription || ''}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.additionalDetails) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ADDITIONAL DETAILS</span></div>';
                description += `<div>${fields.additionalDetails}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">USER INFO</span></div>';
            description += `VIP: (${fields.isVIP || 'No'})<br>`;
            description += `District Name: ${fields.districtName || ''}<br>`;
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.role) description += `Role: ${fields.role}<br>`;
            if (fields.name) description += `Name: ${fields.name}<br>`;
            if (fields.email) description += `Email: ${fields.email}<br>`;
            if (fields.dateRequested) description += `Date Requested: ${formatDate(fields.dateRequested) || ''}<br>`;

            return description;
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
                icon: "fa-pen-fancy",
                fields: [
                    { id: "xcode", type: "text", label: "XCODE", required: true, placeholder: "e.g. X56723" },
                    { id: "application", type: "text", label: "Application Name", required: true, placeholder: "e.g. BAdvance -c2022" },
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
                    { id: "issueSummary", type: "richtext", label: "", required: false }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "issueDetails", type: "richtext", label: "", required: false }
                ]
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "isVIP", type: "select", label: "VIP Customer", required: false, options: ["No", "Yes"] },
                    { id: "username", type: "text", label: "Username", required: false },
                    { id: "userEmail", type: "email", label: "Email", required: false },
                    {
                        id: "userRole", type: "select", label: "Role", required: false,
                        options: ["", "Teacher", "Student", "Admin", "Other"]
                    },
                    { id: "productImpacted", type: "text", label: "Application/Program Impacted", required: false },
                    { id: "xcodeInfo", type: "text", label: "Xcode", required: false },
                    { id: "districtState", type: "text", label: "District state", required: false },
                    {
                        id: "impactType", type: "select", label: "Digital and/or Print Impact", required: false,
                        options: ["", "Digital Only", "Print Only", "Both Digital and Print"]
                    },
                    { id: "dateReported", type: "date", label: "Date Issue reported by user", required: false },
                    {
                        id: "impactScope", type: "select", label: "Teacher and/or Student impact", required: false,
                        options: ["", "Teacher Only", "Student Only", "Both Teacher and Student"]
                    }
                ]
            },
            {
                id: "components",
                title: "PROGRAM COMPONENTS",
                icon: "fa-puzzle-piece",
                fields: [
                    { id: "components", type: "richtext", label: "", required: false }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    { id: "pathField", type: "text", label: "Path", required: false },
                    {
                        id: "actualResults", type: "richtext", label: "Actual results", required: false,
                        hint: "(screenshots and/or videos should include the URL in screen capture)"
                    },
                    { id: "expectedResults", type: "richtext", label: "Expected results", required: false }
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

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">USER INFO</span></div>';
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

                if (fields.actualResults) {
                    description += `<div><strong>Actual Results:</strong></div>`;
                    description += `<div>${fields.actualResults}</div>`;
                }

                if (fields.expectedResults) {
                    description += `<div><strong>Expected Results:</strong></div>`;
                    description += `<div>${fields.expectedResults}</div>`;
                }
            }

            return description;
        }
    },

    // SIM Assignment
    "sim-assignment": {
        title: "SIM Assignment Tracker",
        icon: "fa-tasks",
        description: "For issues regarding assignment and eAssessment functionality",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pen-fancy",
                fields: [
                    {
                        id: "isVIP",
                        type: "select",
                        label: "VIP Status",
                        required: true,
                        options: ["No", "Yes"]
                    },
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "application", type: "text", label: "Application", required: true },
                    { id: "specificIssue", type: "text", label: "Specific Issue", required: true },
                    {
                        id: "userRole",
                        type: "select",
                        label: "User Role",
                        required: true,
                        options: ["Teacher", "Student", "Admin", "Other"]
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
                        id: "resourceXcode", type: "text", label: "Resource Xcode", required: false,
                        hint: "How to Find a Resource Xcode"
                    },
                    {
                        id: "resourceTitle", type: "text", label: "Resource Title", required: false,
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
                        id: "stepsToReproduce", type: "richtext", label: "The exact path taken by the user and yourself to get to the reported issue",
                        required: true, hint: "EX: Teacher dashboard > Assignments > Unit 3 Assessment (Gr. 2)"
                    }
                ]
            },
            {
                id: "screenshots",
                title: "SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS",
                icon: "fa-images",
                fields: []
            },
            {
                id: "userInfo",
                title: "IMPACTED USER INFO",
                icon: "fa-user",
                fields: [
                    { id: "username", type: "text", label: "Username", required: false },
                    { id: "studentInternalId", type: "text", label: "Student Internal ID", required: false },
                    { id: "techAdminLink", type: "text", label: "Tech Admin link", required: false },
                    { id: "device", type: "text", label: "Device", required: false },
                    { id: "realm", type: "text", label: "Realm", required: false },
                    { id: "assignmentId", type: "text", label: "Assignment ID", required: false },
                    { id: "dateReported", type: "date", label: "Date Issue Reported", required: false },
                    {
                        id: "harFileAttached",
                        type: "select",
                        label: "HAR file attached",
                        required: false,
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
                        id: "expectedResults", type: "richtext", label: "Explain/Show how the system should be functioning if working correctly",
                        required: true, hint: "EX: All student's should appear in teacher list as completed and graded."
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DESCRIPTION</span></div>';
            if (fields.issueDetails) {
                description += `<div>${fields.issueDetails}</div>`;
            }
            if (fields.resourceXcode) description += `Resource Xcode: ${fields.resourceXcode}<br>`;
            if (fields.resourceTitle) description += `Resource Title: ${fields.resourceTitle}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">IMPACTED USER INFO</span></div>';
            if (fields.username) description += `Username: ${fields.username}<br>`;
            if (fields.userRole) description += `Role: ${fields.userRole}<br>`;
            if (fields.studentInternalId) description += `Student Internal ID: ${fields.studentInternalId}<br>`;

            // Handle Tech Admin link as a hyperlink
            if (fields.techAdminLink) {
                let techLink = fields.techAdminLink.trim();
                // If the link doesn't start with http:// or https://, add https://
                if (!techLink.startsWith('http://') && !techLink.startsWith('https://')) {
                    techLink = 'https://' + techLink;
                }
                description += `Tech Admin link: <a href="${techLink}" target="_blank">${fields.techAdminLink}</a><br>`;
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

            if (fields.expectedResults) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">EXPECTED RESULTS</span></div>';
                description += `<div>${fields.expectedResults}</div>`;
            }

            return description;
        }
    },

    // Help Article
    "help-article": {
        title: "Help Article Tracker",
        icon: "fa-question-circle",
        description: "For requests regarding new or updated help articles",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "articleDetails",
                title: "ARTICLE DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    {
                        id: "requestType",
                        type: "select",
                        label: "Request Type",
                        required: true,
                        options: ["New Article", "Update Existing Article", "Article Removal"]
                    },
                    { id: "articleTitle", type: "text", label: "Article Title", required: true },
                    { id: "articleURL", type: "text", label: "Existing Article URL (for updates)", required: false },
                    { id: "articleContent", type: "richtext", label: "Proposed Content", required: false }
                ]
            },
            {
                id: "justification",
                title: "JUSTIFICATION",
                icon: "fa-comment-alt",
                fields: [
                    { id: "justification", type: "richtext", label: "Justification for the request", required: true }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">HELP ARTICLE REQUEST</span></div>';
            description += `<div>${fields.subject || ''}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ARTICLE DETAILS</span></div>';
            description += `Request Type: ${fields.requestType || ''}<br>`;
            description += `Article Title: ${fields.articleTitle || ''}<br>`;
            if (fields.articleURL) description += `Existing Article URL: ${fields.articleURL}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.articleContent) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">PROPOSED CONTENT</span></div>';
                description += `<div>${fields.articleContent}</div>`;
                description += '<div style="margin-bottom: 20px;"></div>';
            }

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">JUSTIFICATION</span></div>';
            description += `<div>${fields.justification || ''}</div>`;

            return description;
        }
    },

    // Student Transfer
    "student-transfer": {
        title: "Student Transfer Tracker",
        icon: "fa-exchange-alt",
        description: "For issues regarding transferring student data and accounts",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "transferDetails",
                title: "TRANSFER DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "sourceDistrict", type: "text", label: "Source District", required: true },
                    { id: "destinationDistrict", type: "text", label: "Destination District", required: true },
                    { id: "studentName", type: "text", label: "Student Name", required: true },
                    { id: "studentUsername", type: "text", label: "Student Username", required: true },
                    { id: "requestorName", type: "text", label: "Requestor Name", required: true },
                    { id: "requestorEmail", type: "email", label: "Requestor Email", required: true },
                    { id: "dataToTransfer", type: "richtext", label: "Data to Transfer (Scores, Assignments, etc.)", required: true }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">STUDENT TRANSFER REQUEST</span></div>';
            description += `<div>${fields.subject || ''}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">TRANSFER DETAILS</span></div>';
            description += `Source District: ${fields.sourceDistrict || ''}<br>`;
            description += `Destination District: ${fields.destinationDistrict || ''}<br>`;
            description += `Student Name: ${fields.studentName || ''}<br>`;
            description += `Student Username: ${fields.studentUsername || ''}<br>`;
            description += `Requestor Name: ${fields.requestorName || ''}<br>`;
            description += `Requestor Email: ${fields.requestorEmail || ''}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">DATA TO TRANSFER</span></div>';
            description += `<div>${fields.dataToTransfer || ''}</div>`;

            return description;
        }
    },

    // Timeout Extension
    "timeout-extension": {
        title: "Timeout Extension Tracker",
        icon: "fa-hourglass-half",
        description: "For requests to extend session timeout periods",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "extensionDetails",
                title: "EXTENSION DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "realm", type: "text", label: "Realm (Tech Admin Link)", required: true },
                    { id: "currentTimeout", type: "text", label: "Current Timeout (minutes)", required: false },
                    { id: "requestedTimeout", type: "text", label: "Requested Timeout (minutes)", required: true },
                    { id: "justification", type: "textarea", label: "Justification for Extension", required: true },
                    { id: "requestedBy", type: "text", label: "Requested By", required: true },
                    { id: "requestorEmail", type: "email", label: "Requestor Email", required: true },
                    { id: "effectiveDate", type: "date", label: "Requested Effective Date", required: true }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">TIMEOUT EXTENSION REQUEST</span></div>';
            description += `<div>${fields.subject || ''}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">EXTENSION DETAILS</span></div>';
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `Realm: ${fields.realm || ''}<br>`;
            if (fields.currentTimeout) description += `Current Timeout: ${fields.currentTimeout} minutes<br>`;
            description += `Requested Timeout: ${fields.requestedTimeout || ''} minutes<br>`;
            description += `Requested By: ${fields.requestedBy || ''}<br>`;
            description += `Requestor Email: ${fields.requestorEmail || ''}<br>`;
            description += `Requested Effective Date: ${formatDate(fields.effectiveDate) || ''}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">JUSTIFICATION</span></div>';
            description += `<div>${fields.justification || ''}</div>`;

            return description;
        }
    },

    // Blank Tracker - Minimalist default template
    "blank": {
        title: "Blank Tracker Template",
        icon: "fa-file-alt",
        description: "A general-purpose tracker template with universal ticket properties",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "details",
                title: "DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "description", type: "richtext", label: "Description", required: true }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">TRACKER DETAILS</span></div>';
            description += `<div>${fields.description || ''}</div>`;

            return description;
        }
    },

    // 2. SIM Assessment Reports
    "sim-assessment-reports": {
        title: "SIM Assessment Reports Tracker",
        icon: "fa-chart-bar",
        description: "For issues regarding SIM assessment reports and data",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "reportDetails",
                title: "REPORT DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "teacherName", type: "text", label: "Teacher Name", required: true },
                    { id: "teacherEmail", type: "email", label: "Teacher Email", required: true },
                    { id: "programName", type: "text", label: "Program Name", required: true },
                    {
                        id: "reportType", type: "select", label: "Report Type", required: true,
                        options: ["Class Overview", "Student Progress", "Benchmark Assessment", "Progress Monitoring", "Other"]
                    }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DETAILS",
                icon: "fa-exclamation-circle",
                fields: [
                    { id: "issueDescription", type: "richtext", label: "Issue Description", required: true },
                    { id: "dateOccurred", type: "date", label: "Date Issue Occurred", required: true },
                    { id: "affectedStudents", type: "textarea", label: "Affected Students (if applicable)", required: false }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    { id: "stepsToReproduce", type: "richtext", label: "Steps to Reproduce", required: false },
                    { id: "expectedBehavior", type: "textarea", label: "Expected Behavior", required: false }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SIM ASSESSMENT REPORTS ISSUE</span></div>';
            description += `<div>${fields.subject || 'SIM Assessment Reports Issue'}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">REPORT DETAILS</span></div>';
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `Teacher Name: ${fields.teacherName || ''}<br>`;
            description += `Teacher Email: ${fields.teacherEmail || ''}<br>`;
            description += `Program Name: ${fields.programName || ''}<br>`;
            description += `Report Type: ${fields.reportType || ''}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DETAILS</span></div>';
            description += `Date Occurred: ${formatDate(fields.dateOccurred) || ''}<br>`;
            if (fields.issueDescription) {
                description += `<div><strong>Description:</strong></div>`;
                description += `<div>${fields.issueDescription}</div>`;
            }
            if (fields.affectedStudents) {
                description += `<div><strong>Affected Students:</strong></div>`;
                description += `<div>${fields.affectedStudents}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.stepsToReproduce || fields.expectedBehavior) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">REPRODUCTION</span></div>';
                if (fields.stepsToReproduce) {
                    description += `<div><strong>Steps to Reproduce:</strong></div>`;
                    description += `<div>${fields.stepsToReproduce}</div>`;
                }
                if (fields.expectedBehavior) {
                    description += `<div><strong>Expected Behavior:</strong></div>`;
                    description += `<div>${fields.expectedBehavior}</div>`;
                }
            }

            return description;
        }
    },

    // 3. SIM Achievement Levels
    "sim-achievement-levels": {
        title: "SIM Achievement Levels Tracker",
        icon: "fa-trophy",
        description: "For issues regarding SIM achievement levels and benchmarks",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "achievementDetails",
                title: "ACHIEVEMENT DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "schoolName", type: "text", label: "School Name", required: false },
                    { id: "teacherName", type: "text", label: "Teacher Name", required: false },
                    { id: "program", type: "text", label: "Program", required: true },
                    { id: "gradeLevel", type: "text", label: "Grade Level", required: true },
                    {
                        id: "achievementType", type: "select", label: "Achievement Type", required: true,
                        options: ["Benchmarks", "Growth Targets", "Proficiency Levels", "Custom Goals", "Other"]
                    }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DETAILS",
                icon: "fa-exclamation-circle",
                fields: [
                    { id: "issueDescription", type: "richtext", label: "Issue Description", required: true },
                    { id: "studentImpact", type: "textarea", label: "Student Impact", required: false },
                    { id: "dateOccurred", type: "date", label: "Date Issue Occurred", required: true }
                ]
            },
            {
                id: "reproduction",
                title: "REPRODUCTION STEPS",
                icon: "fa-list-ol",
                fields: [
                    { id: "stepsToReproduce", type: "richtext", label: "Steps to Reproduce", required: false }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SIM ACHIEVEMENT LEVELS ISSUE</span></div>';
            description += `<div>${fields.subject || 'SIM Achievement Levels Issue'}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ACHIEVEMENT DETAILS</span></div>';
            description += `District Name: ${fields.districtName || ''}<br>`;
            if (fields.schoolName) description += `School Name: ${fields.schoolName}<br>`;
            if (fields.teacherName) description += `Teacher Name: ${fields.teacherName}<br>`;
            description += `Program: ${fields.program || ''}<br>`;
            description += `Grade Level: ${fields.gradeLevel || ''}<br>`;
            description += `Achievement Type: ${fields.achievementType || ''}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DETAILS</span></div>';
            description += `Date Occurred: ${formatDate(fields.dateOccurred) || ''}<br>`;
            if (fields.issueDescription) {
                description += `<div><strong>Description:</strong></div>`;
                description += `<div>${fields.issueDescription}</div>`;
            }
            if (fields.studentImpact) {
                description += `<div><strong>Student Impact:</strong></div>`;
                description += `<div>${fields.studentImpact}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.stepsToReproduce) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">REPRODUCTION STEPS</span></div>';
                description += `<div>${fields.stepsToReproduce}</div>`;
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
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "assessmentDetails",
                title: "ASSESSMENT DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "teacherName", type: "text", label: "Teacher Name", required: true },
                    { id: "teacherEmail", type: "email", label: "Teacher Email", required: true },
                    { id: "programName", type: "text", label: "Program Name", required: true },
                    { id: "assessmentName", type: "text", label: "Assessment Name", required: true },
                    {
                        id: "assessmentType", type: "select", label: "Assessment Type", required: true,
                        options: ["Benchmark", "Progress Monitor", "Unit Test", "Running Record", "Other"]
                    }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DETAILS",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueType", type: "select", label: "Issue Type", required: true,
                        options: ["Administration", "Scoring", "Data Export", "Reporting", "Other"]
                    },
                    { id: "issueDescription", type: "richtext", label: "Issue Description", required: true },
                    { id: "dateOccurred", type: "date", label: "Date Issue Occurred", required: true },
                    { id: "affectedStudents", type: "textarea", label: "Affected Students (if applicable)", required: false }
                ]
            },
            {
                id: "browserInfo",
                title: "ENVIRONMENT",
                icon: "fa-desktop",
                fields: [
                    { id: "browserInfo", type: "text", label: "Browser/OS Information", required: false },
                    {
                        id: "deviceType", type: "select", label: "Device Type", required: false,
                        options: ["", "Desktop", "Laptop", "Tablet", "Smartphone", "Other"]
                    }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SIM FSA ISSUE</span></div>';
            description += `<div>${fields.subject || 'SIM FSA Issue'}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ASSESSMENT DETAILS</span></div>';
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `Teacher Name: ${fields.teacherName || ''}<br>`;
            description += `Teacher Email: ${fields.teacherEmail || ''}<br>`;
            description += `Program Name: ${fields.programName || ''}<br>`;
            description += `Assessment Name: ${fields.assessmentName || ''}<br>`;
            description += `Assessment Type: ${fields.assessmentType || ''}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DETAILS</span></div>';
            description += `Issue Type: ${fields.issueType || ''}<br>`;
            description += `Date Occurred: ${formatDate(fields.dateOccurred) || ''}<br>`;
            if (fields.issueDescription) {
                description += `<div><strong>Description:</strong></div>`;
                description += `<div>${fields.issueDescription}</div>`;
            }
            if (fields.affectedStudents) {
                description += `<div><strong>Affected Students:</strong></div>`;
                description += `<div>${fields.affectedStudents}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.browserInfo || fields.deviceType) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ENVIRONMENT</span></div>';
                if (fields.browserInfo) description += `Browser/OS Information: ${fields.browserInfo}<br>`;
                if (fields.deviceType) description += `Device Type: ${fields.deviceType}<br>`;
            }

            return description;
        }
    },

    // 5. SIM Library View
    "sim-library-view": {
        title: "SIM Library View Tracker",
        icon: "fa-book-open",
        description: "For issues regarding the SIM library view and content browsing",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "libraryDetails",
                title: "LIBRARY DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    {
                        id: "userRole", type: "select", label: "User Role", required: true,
                        options: ["Teacher", "Student", "Admin", "Other"]
                    },
                    { id: "username", type: "text", label: "Username", required: false },
                    { id: "programName", type: "text", label: "Program Name", required: true },
                    {
                        id: "contentType", type: "select", label: "Content Type", required: false,
                        options: ["", "Books", "Assessments", "Resources", "Lesson Plans", "Other"]
                    }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DETAILS",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueType", type: "select", label: "Issue Type", required: true,
                        options: ["Content Missing", "Navigation Problem", "Search Not Working", "Display Issue", "Loading Error", "Other"]
                    },
                    { id: "issueDescription", type: "richtext", label: "Issue Description", required: true },
                    { id: "dateOccurred", type: "date", label: "Date Issue Occurred", required: true }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    { id: "stepsToReproduce", type: "richtext", label: "Steps to Reproduce", required: false },
                    { id: "browserInfo", type: "text", label: "Browser/Device Info", required: false }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SIM LIBRARY VIEW ISSUE</span></div>';
            description += `<div>${fields.subject || 'SIM Library View Issue'}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">LIBRARY DETAILS</span></div>';
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `User Role: ${fields.userRole || ''}<br>`;
            if (fields.username) description += `Username: ${fields.username}<br>`;
            description += `Program Name: ${fields.programName || ''}<br>`;
            if (fields.contentType) description += `Content Type: ${fields.contentType}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DETAILS</span></div>';
            description += `Issue Type: ${fields.issueType || ''}<br>`;
            description += `Date Occurred: ${formatDate(fields.dateOccurred) || ''}<br>`;
            if (fields.issueDescription) {
                description += `<div><strong>Description:</strong></div>`;
                description += `<div>${fields.issueDescription}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.stepsToReproduce || fields.browserInfo) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">REPRODUCTION</span></div>';
                if (fields.stepsToReproduce) {
                    description += `<div><strong>Steps to Reproduce:</strong></div>`;
                    description += `<div>${fields.stepsToReproduce}</div>`;
                }
                if (fields.browserInfo) description += `<br>Browser/Device: ${fields.browserInfo}<br>`;
            }

            return description;
        }
    },

    // 6. SIM ORR
    "sim-orr": {
        title: "SIM ORR Tracker",
        icon: "fa-file-signature",
        description: "For issues regarding Online Reading Records functionality",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "orrDetails",
                title: "ORR DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "teacherName", type: "text", label: "Teacher Name", required: true },
                    { id: "teacherEmail", type: "email", label: "Teacher Email", required: true },
                    { id: "programName", type: "text", label: "Program Name", required: true },
                    { id: "bookTitle", type: "text", label: "Book Title", required: false },
                    { id: "studentName", type: "text", label: "Student Name (if applicable)", required: false }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DETAILS",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueType", type: "select", label: "Issue Type", required: true,
                        options: ["Recording Issue", "Scoring Issue", "Book Loading Problem", "Student Assignment", "Data Export", "Other"]
                    },
                    { id: "issueDescription", type: "richtext", label: "Issue Description", required: true },
                    { id: "dateOccurred", type: "date", label: "Date Issue Occurred", required: true }
                ]
            },
            {
                id: "environment",
                title: "ENVIRONMENT",
                icon: "fa-desktop",
                fields: [
                    { id: "browserInfo", type: "text", label: "Browser/OS Information", required: false },
                    {
                        id: "deviceType", type: "select", label: "Device Type", required: false,
                        options: ["", "Desktop", "Laptop", "Tablet", "Smartphone", "Other"]
                    },
                    { id: "microphone", type: "text", label: "Microphone Used", required: false }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SIM ORR ISSUE</span></div>';
            description += `<div>${fields.subject || 'SIM ORR Issue'}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ORR DETAILS</span></div>';
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `Teacher Name: ${fields.teacherName || ''}<br>`;
            description += `Teacher Email: ${fields.teacherEmail || ''}<br>`;
            description += `Program Name: ${fields.programName || ''}<br>`;
            if (fields.bookTitle) description += `Book Title: ${fields.bookTitle}<br>`;
            if (fields.studentName) description += `Student Name: ${fields.studentName}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DETAILS</span></div>';
            description += `Issue Type: ${fields.issueType || ''}<br>`;
            description += `Date Occurred: ${formatDate(fields.dateOccurred) || ''}<br>`;
            if (fields.issueDescription) {
                description += `<div><strong>Description:</strong></div>`;
                description += `<div>${fields.issueDescription}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.browserInfo || fields.deviceType || fields.microphone) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ENVIRONMENT</span></div>';
                if (fields.browserInfo) description += `Browser/OS Information: ${fields.browserInfo}<br>`;
                if (fields.deviceType) description += `Device Type: ${fields.deviceType}<br>`;
                if (fields.microphone) description += `Microphone Used: ${fields.microphone}<br>`;
            }

            return description;
        }
    },

    // 7. SIM Plan & Teach
    "sim-plan-teach": {
        title: "SIM Plan & Teach Tracker",
        icon: "fa-chalkboard-teacher",
        description: "For issues regarding Plan & Teach functionality",
        sections: [
            {
                id: "subject",
                title: "SUBJECT",
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "planTeachDetails",
                title: "PLAN & TEACH DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "teacherName", type: "text", label: "Teacher Name", required: true },
                    { id: "teacherEmail", type: "email", label: "Teacher Email", required: true },
                    { id: "programName", type: "text", label: "Program Name", required: true },
                    { id: "lessonInfo", type: "text", label: "Lesson/Unit Information", required: false },
                    {
                        id: "feature", type: "select", label: "Feature", required: true,
                        options: ["Calendar", "Planner", "Resources", "Lesson Navigator", "Standards", "Other"]
                    }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DETAILS",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueType", type: "select", label: "Issue Type", required: true,
                        options: ["Content Missing", "Planning Issue", "Navigation Problem", "Resource Access", "Calendar Issue", "Other"]
                    },
                    { id: "issueDescription", type: "richtext", label: "Issue Description", required: true },
                    { id: "dateOccurred", type: "date", label: "Date Issue Occurred", required: true }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    { id: "stepsToReproduce", type: "richtext", label: "Steps to Reproduce", required: false },
                    { id: "browserInfo", type: "text", label: "Browser/Device Info", required: false }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SIM PLAN & TEACH ISSUE</span></div>';
            description += `<div>${fields.subject || 'SIM Plan & Teach Issue'}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">PLAN & TEACH DETAILS</span></div>';
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `Teacher Name: ${fields.teacherName || ''}<br>`;
            description += `Teacher Email: ${fields.teacherEmail || ''}<br>`;
            description += `Program Name: ${fields.programName || ''}<br>`;
            if (fields.lessonInfo) description += `Lesson/Unit Information: ${fields.lessonInfo}<br>`;
            description += `Feature: ${fields.feature || ''}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DETAILS</span></div>';
            description += `Issue Type: ${fields.issueType || ''}<br>`;
            description += `Date Occurred: ${formatDate(fields.dateOccurred) || ''}<br>`;
            if (fields.issueDescription) {
                description += `<div><strong>Description:</strong></div>`;
                description += `<div>${fields.issueDescription}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.stepsToReproduce || fields.browserInfo) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">REPRODUCTION</span></div>';
                if (fields.stepsToReproduce) {
                    description += `<div><strong>Steps to Reproduce:</strong></div>`;
                    description += `<div>${fields.stepsToReproduce}</div>`;
                }
                if (fields.browserInfo) description += `<br>Browser/Device: ${fields.browserInfo}<br>`;
            }

            return description;
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
                icon: "fa-pen-fancy",
                fields: [
                    { id: "subject", type: "text", label: "Subject", required: true }
                ]
            },
            {
                id: "readingLogDetails",
                title: "READING LOG DETAILS",
                icon: "fa-clipboard-list",
                fields: [
                    { id: "districtName", type: "text", label: "District Name", required: true },
                    { id: "teacherName", type: "text", label: "Teacher Name", required: true },
                    { id: "teacherEmail", type: "email", label: "Teacher Email", required: true },
                    { id: "programName", type: "text", label: "Program Name", required: true },
                    { id: "studentName", type: "text", label: "Student Name (if applicable)", required: false },
                    { id: "bookTitle", type: "text", label: "Book Title (if applicable)", required: false }
                ]
            },
            {
                id: "issueDetails",
                title: "ISSUE DETAILS",
                icon: "fa-exclamation-circle",
                fields: [
                    {
                        id: "issueType", type: "select", label: "Issue Type", required: true,
                        options: ["Log Entry", "Data Missing", "Reporting Issue", "Assignment Problem", "Book Search", "Other"]
                    },
                    { id: "issueDescription", type: "richtext", label: "Issue Description", required: true },
                    { id: "dateOccurred", type: "date", label: "Date Issue Occurred", required: true },
                    {
                        id: "userRole", type: "select", label: "User Experiencing Issue", required: true,
                        options: ["Teacher", "Student", "Both", "Admin", "Other"]
                    }
                ]
            },
            {
                id: "reproduction",
                title: "STEPS TO REPRODUCE",
                icon: "fa-list-ol",
                fields: [
                    { id: "stepsToReproduce", type: "richtext", label: "Steps to Reproduce", required: false },
                    { id: "browserInfo", type: "text", label: "Browser/Device Info", required: false }
                ]
            }
        ],
        descriptionGenerator: function (fields) {
            let description = '';
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SIM READING LOG ISSUE</span></div>';
            description += `<div>${fields.subject || 'SIM Reading Log Issue'}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">READING LOG DETAILS</span></div>';
            description += `District Name: ${fields.districtName || ''}<br>`;
            description += `Teacher Name: ${fields.teacherName || ''}<br>`;
            description += `Teacher Email: ${fields.teacherEmail || ''}<br>`;
            description += `Program Name: ${fields.programName || ''}<br>`;
            if (fields.studentName) description += `Student Name: ${fields.studentName}<br>`;
            if (fields.bookTitle) description += `Book Title: ${fields.bookTitle}<br>`;
            description += '<div style="margin-bottom: 20px;"></div>';

            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">ISSUE DETAILS</span></div>';
            description += `Issue Type: ${fields.issueType || ''}<br>`;
            description += `Date Occurred: ${formatDate(fields.dateOccurred) || ''}<br>`;
            description += `User Experiencing Issue: ${fields.userRole || ''}<br>`;
            if (fields.issueDescription) {
                description += `<div><strong>Description:</strong></div>`;
                description += `<div>${fields.issueDescription}</div>`;
            }
            description += '<div style="margin-bottom: 20px;"></div>';

            if (fields.stepsToReproduce || fields.browserInfo) {
                description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">REPRODUCTION</span></div>';
                if (fields.stepsToReproduce) {
                    description += `<div><strong>Steps to Reproduce:</strong></div>`;
                    description += `<div>${fields.stepsToReproduce}</div>`;
                }
                if (fields.browserInfo) description += `<br>Browser/Device: ${fields.browserInfo}<br>`;
            }

            return description;
        }
    }
}; 