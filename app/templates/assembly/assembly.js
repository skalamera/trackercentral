// Import utility functions that will be used in this template
// These need to be available globally in the browser environment
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState, populateVIPStatus from app/utils/fieldPopulators.js
// - setupCustomVersionInput, setupCustomVersionStateInput, getVersionValue, getVersionStateValue from app/utils/versionFieldHandlers.js
// - TemplateBase from app/utils/templateBase.js
// - DemoDataHelper from app/utils/demoDataHelper.js

module.exports = {
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
                { id: "xcodeUnknown", type: "checkbox", label: "Xcode Unknown", required: false, hint: "Check this if the Xcode is unknown. When checked, 'Xcode Unknown' will be used in the subject line." },
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
                { id: "districtState", type: "text", label: "District State", required: false, placeholder: "Ex: FL", hint: "Auto-populates from the original ticket. If not, enter the state abbreviation for the state where the district is located.<br>Ex: FL<br>Note: If the state does not auto-populate, you should verify the company details of the district in FD. Additionally, if you are populating this field, be sure to only use the state abbreviation." },
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

        // Auto-populate district state and VIP status
        populateDistrictState();
        populateVIPStatus();

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
            requiredFields: ['xcode', 'application', 'specificIssue', 'gradesImpacted', 'districtName', 'districtState'],
            fields: {
                xcode: 'xcode',
                xcodeUnknown: 'xcodeUnknown',
                hasMultipleXcodes: 'hasMultipleXcodes',
                isVIP: 'isVIP',
                application: 'application',
                version: 'version',
                versionState: 'versionState',
                specificIssue: 'specificIssue',
                gradesImpacted: 'gradesImpacted',
                districtName: 'districtName',
                districtState: 'districtState',
                formattedSubject: 'formattedSubject'
            }
        });

        // Initialize the template (sets up event listeners and formats subject)
        templateBase.initializeSubjectLineFormatting();

        // Handle Xcode Unknown checkbox functionality
        const xcodeField = document.getElementById('xcode');
        const xcodeUnknownCheckbox = document.getElementById('xcodeUnknown');

        if (xcodeField && xcodeUnknownCheckbox) {
            // Function to toggle xcode field state based on checkbox
            function toggleXcodeField() {
                if (xcodeUnknownCheckbox.checked) {
                    xcodeField.disabled = true;
                    xcodeField.style.backgroundColor = '#f5f5f5';
                    xcodeField.style.color = '#999';
                    xcodeField.style.cursor = 'not-allowed';
                    console.log("ASSEMBLY: Xcode field disabled - using 'Xcode Unknown'");
                } else {
                    xcodeField.disabled = false;
                    xcodeField.style.backgroundColor = '';
                    xcodeField.style.color = '';
                    xcodeField.style.cursor = '';
                    console.log("ASSEMBLY: Xcode field enabled");
                }
                // Trigger subject line update
                templateBase.updateSubjectLine();
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
                        <button id="confirmXcodeUnknownAssembly" style="
                            background: #4caf50;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                        ">Yes, I'm sure</button>
                        <button id="cancelXcodeUnknownAssembly" style="
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
                document.getElementById('confirmXcodeUnknownAssembly').addEventListener('click', () => {
                    closeModal(true);
                });

                document.getElementById('cancelXcodeUnknownAssembly').addEventListener('click', () => {
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
                            console.log("ASSEMBLY: User cancelled Xcode Unknown confirmation");
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

            console.log("ASSEMBLY: Added Xcode Unknown checkbox functionality with custom confirmation modal");
        }

        // Schedule initial subject line update after fields are populated
        setTimeout(() => templateBase.updateSubjectLine(), 500);

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

        // Add demo data functionality
        const demoDataHelper = new DemoDataHelper();

        // Handle async addDemoDataButton
        (async () => {
            const demoButton = await demoDataHelper.addDemoDataButton();
            if (demoButton) {
                // Store reference to this template configuration
                const templateConfig = window.TRACKER_CONFIGS_FROM_TEMPLATES['assembly'] || module.exports;
                demoButton.addEventListener('click', () => {
                    console.log('Demo button clicked for assembly template');
                    demoDataHelper.fillDemoData(templateConfig);
                });
            }
        })();
    }
}; 