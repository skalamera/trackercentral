// Import utility functions that will be used in this template
// These need to be available globally in the browser environment
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState from app/utils/fieldPopulators.js
// - setupCustomVersionInput, setupCustomVersionStateInput, getVersionValue, getVersionStateValue from app/utils/versionFieldHandlers.js
// - TemplateBase from app/utils/templateBase.js
// - DemoDataHelper from app/utils/demoDataHelper.js

module.exports = {
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

        // Initialize TemplateBase for subject line formatting
        const templateBase = new TemplateBase({
            templateName: 'sim-achievement-levels',
            subjectLineFormat: 'sim-achievement-levels',
            requiredFields: ['districtName', 'districtState']
        });

        // Initialize the template (sets up event listeners and formats subject)
        templateBase.initialize();

        // Set up clear formatting button for Quill editors
        setTimeout(setupClearFormattingButton, 500);

        // If the trackerApp is available, call its setupSmartsheetUploader method
        if (window.trackerApp && typeof window.trackerApp.setupSmartsheetUploader === 'function') {
            console.log("Setting up smartsheet uploader through trackerApp");
            window.trackerApp.setupSmartsheetUploader();
        } else {
            console.warn("TrackerApp or setupSmartsheetUploader not available");
        }

        // Add demo data functionality
        const demoDataHelper = new DemoDataHelper();
        const demoButton = demoDataHelper.addDemoDataButton();
        if (demoButton) {
            demoButton.addEventListener('click', () => {
                demoDataHelper.fillDemoData(module.exports);
            });
        }
    }
};