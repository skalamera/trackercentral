// Import utility functions that will be used in this template
// These need to be available globally in the browser environment
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState, populateVIPStatus from app/utils/fieldPopulators.js
// - setupCustomVersionInput, setupCustomVersionStateInput, getVersionValue, getVersionStateValue from app/utils/versionFieldHandlers.js
// - TemplateBase from app/utils/templateBase.js
// - DemoDataHelper from app/utils/demoDataHelper.js

module.exports = {
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
                { id: "xcodeUnknown", type: "checkbox", label: "Xcode Unknown", required: false, hint: "Check this if the Xcode is unknown. When checked, 'Xcode Unknown' will be used in the subject line." },
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
                    id: "userRole", type: "select", label: "Role", required: true,
                    options: ["", "District Admin", "School Admin", "Teacher", "Student"],
                    hint: "Select the role of the user that the issue is affecting."
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
                    id: "districtName", type: "text", label: "District Name", required: true,
                    hint: "Auto-populates from original ticket."
                },
                {
                    id: "districtState", type: "text", label: "District State", required: false, placeholder: "e.g. FL",
                    hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located. Note: If the state does not auto-populate you should verify the company details of the district in FD."
                },
                {
                    id: "impactType", type: "select", label: "Digital and/or Print Impact", required: true,
                    options: ["", "Digital", "Print", "Both Digital and Print"],
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

        // Add screenshots section if content is provided
        if (fields.screenshotsDescription && fields.screenshotsDescription.trim() !== '<p><br></p>') {
            description += '<div style="margin-bottom: 20px;"></div>';
            description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">SCREENSHOTS, VIDEOS, & OTHER SUPPORTING FILE ATTACHMENTS</span></div>';
            description += `<div>${fields.screenshotsDescription}</div>`;
        }

        return description;
    },
    // Add new onLoad function for SEDCUST to sync fields
    onLoad: function () {
        console.log("SEDCUST onLoad function executing");

        // First populate Application Name from product info
        populateApplicationName();

        // Auto-populate district state and VIP status
        populateDistrictState();
        populateVIPStatus();

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
                // Check if xcodeUnknown checkbox is checked
                const xcodeUnknownCheckbox = document.getElementById('xcodeUnknown');
                if (xcodeUnknownCheckbox && xcodeUnknownCheckbox.checked) {
                    xcodeInfoField.value = 'Xcode Unknown';
                    console.log("Synced 'Xcode Unknown' to Xcode field in user info section");
                } else {
                    xcodeInfoField.value = xcodeField.value;
                    console.log("Synced XCODE to Xcode field in user info section");
                }
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
            requiredFields: ['xcode', 'application', 'resource', 'path', 'specificIssue', 'districtName'],
            fields: {
                xcode: 'xcode',
                xcodeUnknown: 'xcodeUnknown',
                application: 'application',
                version: 'version',
                versionState: 'versionState',
                resource: 'resource',
                path: 'path',
                specificIssue: 'specificIssue',
                districtName: 'districtName',
                districtState: 'districtState',
                isVIP: 'isVIP',
                formattedSubject: 'formattedSubject'
            }
        });

        // Initialize the template (sets up event listeners and formats subject)
        templateBase.initializeSubjectLineFormatting();

        // Schedule initial subject line update after fields are populated
        setTimeout(() => templateBase.updateSubjectLine(), 500);

        // Handle Xcode Unknown checkbox functionality
        const xcodeUnknownCheckbox = document.getElementById('xcodeUnknown');

        if (xcodeField && xcodeUnknownCheckbox) {
            // Function to toggle xcode field state based on checkbox
            function toggleXcodeField() {
                const xcodeLabel = document.querySelector('label[for="xcode"]');

                if (xcodeUnknownCheckbox.checked) {
                    // Disable field and make it not required
                    xcodeField.disabled = true;
                    xcodeField.removeAttribute('required');
                    xcodeField.style.backgroundColor = '#f5f5f5';
                    xcodeField.style.color = '#999';
                    xcodeField.style.cursor = 'not-allowed';

                    // Remove required styling from label
                    if (xcodeLabel) {
                        xcodeLabel.classList.remove('required-field');
                    }

                    console.log("SEDCUST: Xcode field disabled - using 'Xcode Unknown'");
                } else {
                    // Enable field and make it required again
                    xcodeField.disabled = false;
                    xcodeField.setAttribute('required', 'required');
                    xcodeField.style.backgroundColor = '';
                    xcodeField.style.color = '';
                    xcodeField.style.cursor = '';

                    // Add required styling back to label
                    if (xcodeLabel) {
                        xcodeLabel.classList.add('required-field');
                    }

                    console.log("SEDCUST: Xcode field enabled");
                }

                // Trigger subject line update and field syncing
                templateBase.updateSubjectLine();
                syncFields();
            }

            // Function to show custom confirmation modal
            function showXcodeUnknownConfirmation(callback) {
                // Prevent body scrolling
                document.body.style.overflow = 'hidden';

                // Create modal backdrop
                const backdrop = document.createElement('div');
                backdrop.className = 'xcode-unknown-modal-backdrop';
                backdrop.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    box-sizing: border-box;
                `;

                // Create modal content
                const modal = document.createElement('div');
                modal.className = 'xcode-unknown-confirmation-modal';
                modal.style.cssText = `
                    background: white;
                    border-radius: 8px;
                    max-width: 450px;
                    width: 100%;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    font-family: Arial, sans-serif;
                    overflow: hidden;
                `;

                // Create modal content
                const modalContent = document.createElement('div');
                modalContent.style.cssText = `
                    padding: 30px;
                    text-align: center;
                `;

                modalContent.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <i class="fas fa-question-circle" style="font-size: 48px; color: #f39c12; margin-bottom: 15px;"></i>
                        <h3 style="color: #2c3e50; margin: 0; font-size: 20px;">Confirm Xcode Unknown</h3>
                    </div>
                    
                    <p style="color: #555; margin-bottom: 25px; line-height: 1.5;">
                        Are you sure the Xcode is unknown?
                    </p>
                    
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button id="confirmXcodeUnknown" style="
                            background: #4caf50;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                        ">Yes, I'm sure</button>
                        <button id="cancelXcodeUnknown" style="
                            background: #e74c3c;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                        ">Cancel</button>
                    </div>
                `;

                modal.appendChild(modalContent);
                backdrop.appendChild(modal);
                document.body.appendChild(backdrop);

                // Function to close modal and restore body scrolling
                const closeModal = (confirmed) => {
                    document.body.style.overflow = ''; // Restore body scrolling
                    document.body.removeChild(backdrop);
                    callback(confirmed);
                };

                // Add event listeners
                document.getElementById('confirmXcodeUnknown').addEventListener('click', () => {
                    closeModal(true);
                });

                document.getElementById('cancelXcodeUnknown').addEventListener('click', () => {
                    closeModal(false);
                });

                // Allow clicking backdrop to cancel
                backdrop.addEventListener('click', (e) => {
                    if (e.target === backdrop) {
                        closeModal(false);
                    }
                });
            }

            // Function to handle checkbox change with confirmation
            function handleXcodeUnknownChange(event) {
                // If checkbox is being checked (not unchecked), show confirmation
                if (event.target.checked) {
                    showXcodeUnknownConfirmation((confirmed) => {
                        if (confirmed) {
                            // User confirmed, proceed with toggling
                            toggleXcodeField();
                        } else {
                            // User cancelled, uncheck the checkbox
                            event.target.checked = false;
                            console.log("SEDCUST: User cancelled Xcode Unknown confirmation");
                        }
                    });
                } else {
                    // Checkbox is being unchecked, no confirmation needed
                    toggleXcodeField();
                }
            }

            // Add event listener to checkbox with confirmation
            xcodeUnknownCheckbox.addEventListener('change', handleXcodeUnknownChange);

            // Initial state check
            toggleXcodeField();

            console.log("SEDCUST: Added Xcode Unknown checkbox functionality with custom confirmation modal");
        }

        // Ensure email field is populated before form submission
        function ensureEmailField() {
            const emailField = document.getElementById('email');
            if (!emailField) {
                console.warn("SEDCUST: Email field not found");
                return;
            }

            // If email field is empty, try to populate it
            if (!emailField.value || !emailField.value.trim()) {
                console.log("SEDCUST: Email field is empty, attempting to populate");

                // Try to get email from logged-in user
                if (window.trackerApp && window.trackerApp.client) {
                    window.trackerApp.client.data.get("loggedInUser").then(userData => {
                        if (userData && userData.loggedInUser && userData.loggedInUser.email) {
                            emailField.value = userData.loggedInUser.email;
                            console.log("SEDCUST: Populated email field from logged-in user:", userData.loggedInUser.email);
                        }
                    }).catch(err => {
                        console.error("SEDCUST: Error getting logged-in user email:", err);
                    });
                }

                // Also try to get from ticket data
                if (window.trackerApp && window.trackerApp.ticketData && window.trackerApp.ticketData.requesterEmail) {
                    emailField.value = window.trackerApp.ticketData.requesterEmail;
                    console.log("SEDCUST: Populated email field from ticket data:", window.trackerApp.ticketData.requesterEmail);
                }
            }
        }

        // Call email field population
        ensureEmailField();

        // Also ensure email field is populated when form is about to be submitted
        setTimeout(() => {
            ensureEmailField();
        }, 500);

        // Add enhanced validation function for SEDCUST template
        window.validateSedcustFields = function () {
            console.log("SEDCUST: Starting enhanced field validation");
            const errors = [];

            // Check each required field individually
            const requiredFields = ['xcode', 'application', 'resource', 'path', 'specificIssue', 'districtName'];

            requiredFields.forEach(fieldName => {
                // Special case: skip xcode validation if xcodeUnknown is checked
                if (fieldName === 'xcode') {
                    const xcodeUnknownCheckbox = document.getElementById('xcodeUnknown');
                    if (xcodeUnknownCheckbox && xcodeUnknownCheckbox.checked) {
                        console.log(`SEDCUST: Skipping xcode validation - 'Xcode Unknown' is checked`);
                        return;
                    }
                }

                const field = document.getElementById(fieldName);
                if (!field) {
                    errors.push(`Field element '${fieldName}' not found in DOM`);
                    return;
                }

                const value = field.value ? field.value.trim() : '';
                console.log(`SEDCUST: Validating field '${fieldName}' with value: "${value}"`);

                if (!value) {
                    errors.push(`Required field '${fieldName}' is empty`);
                }
            });

            // Check for email field (required for ticket creation)
            const emailField = document.getElementById('email');
            if (!emailField || !emailField.value || !emailField.value.trim()) {
                errors.push('Email field is required but missing or empty');
            }

            // Check for related tickets field
            const relatedTicketsField = document.getElementById('relatedTickets');
            if (!relatedTicketsField || !relatedTicketsField.value || !relatedTicketsField.value.trim()) {
                errors.push('Related tickets field is required but missing or empty');
            }

            if (errors.length > 0) {
                console.error("SEDCUST: Validation errors found:", errors);
                return { isValid: false, errors: errors };
            }

            console.log("SEDCUST: All field validation passed");
            return { isValid: true, errors: [] };
        };

        // Add a pre-submit validation hook
        const originalSubmitHandler = document.getElementById('createTracker');
        if (originalSubmitHandler) {
            originalSubmitHandler.addEventListener('click', function (event) {
                console.log("SEDCUST: Pre-submit validation triggered");

                // Run our enhanced validation
                const validation = window.validateSedcustFields();
                if (!validation.isValid) {
                    event.preventDefault();
                    event.stopPropagation();

                    const errorMessage = "SEDCUST validation failed:\n" + validation.errors.join('\n');
                    console.error(errorMessage);

                    // Use Freshworks notification if available, otherwise show in console
                    if (window.client && window.client.interface && window.client.interface.trigger) {
                        window.client.interface.trigger("showNotify", {
                            type: "danger",
                            message: "Validation failed: " + validation.errors.join(', ')
                        }).catch(function (error) {
                            console.error("Failed to show notification:", error);
                        });
                    }

                    // Also try to show inline error message
                    const errorContainer = document.getElementById('error-container');
                    if (errorContainer) {
                        errorContainer.innerHTML = `<div class="alert alert-danger">${errorMessage.replace(/\n/g, '<br>')}</div>`;
                        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }

                    return false;
                }

                console.log("SEDCUST: Pre-submit validation passed");
            }, true); // Use capture phase to run before other handlers
        }

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

        // Set up VIP priority handling for SEDCUST
        const isVIPField = document.getElementById('isVIP');
        const priorityField = document.getElementById('priority');

        if (isVIPField && priorityField) {
            // Function to update priority based on VIP status
            const updatePriorityForVIP = () => {
                if (isVIPField.value === 'Yes') {
                    priorityField.value = '4'; // Urgent
                    console.log('SEDCUST: VIP detected - setting priority to Urgent (4)');
                }
            };

            // Set initial priority if VIP
            updatePriorityForVIP();

            // Update priority when VIP status changes
            isVIPField.addEventListener('change', updatePriorityForVIP);
        }

        // Add demo data functionality
        const demoDataHelper = new DemoDataHelper();

        // Handle async addDemoDataButton
        (async () => {
            const demoButton = await demoDataHelper.addDemoDataButton();
            if (demoButton) {
                // Store reference to this template configuration
                const templateConfig = window.TRACKER_CONFIGS_FROM_TEMPLATES['sedcust'] || module.exports;
                demoButton.addEventListener('click', () => {
                    console.log('Demo button clicked for sedcust template');
                    demoDataHelper.fillDemoData(templateConfig);
                });
            }
        })();
    }
};