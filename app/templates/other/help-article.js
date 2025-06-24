// Import utility functions that will be used in this template
// - DemoDataHelper from app/utils/demoDataHelper.js
// These need to be available globally in the browser environment
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState from app/utils/fieldPopulators.js
// - setupCustomVersionInput, setupCustomVersionStateInput, getVersionValue, getVersionStateValue from app/utils/versionFieldHandlers.js
// - TemplateBase from app/utils/templateBase.js

module.exports = {
    title: "Help Article Tracker",
    icon: "fa-question-circle",
    description: "For requests to create or update a BU Help article",
    sections: [
        {
            id: "subject",
            title: "SUBJECT",
            icon: "fa-pencil-alt",
            fields: [
                {
                    id: "helpArticleName",
                    type: "text",
                    label: "Help Article Name",
                    required: true,
                    placeholder: "Ex: About Grading eAssessments",
                    hint: "Paste the name of the help article."
                },
                {
                    id: "formattedSubject",
                    type: "text",
                    label: "Formatted Subject Line",
                    required: false,
                    placeholder: "Ex: BU Help Article Update | About Grading eAssessments",
                    hint: "This will auto-populate based on your submissions. Be sure to review for accuracy. Naming convention: BU Help Article Update | Help Article Name",
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
                    placeholder: "Ex: The dropdown menu for the Test Filter options no longer reflect the listed items in the article.",
                    hint: "Enter the details that need to be updated in the BU Help Article."
                }
            ]
        },
        {
            id: "details",
            title: "DESCRIPTION",
            icon: "fa-clipboard-list",
            fields: [
                {
                    id: "requester",
                    type: "text",
                    label: "Requestor",
                    required: true,
                    placeholder: "Ex: Abby Miller",
                    hint: "Enter the Requestor's name."
                },
                {
                    id: "dateRequested",
                    type: "date",
                    label: "Date Request",
                    required: true,
                    placeholder: "Ex: 06/05/2025",
                    hint: "Select the date the request was made."
                },
                {
                    id: "articleName",
                    type: "text",
                    label: "Name of BU Help Article",
                    required: true,
                    placeholder: "Ex: About Grading eAssessments",
                    hint: "Paste the name of the BU help article."
                },
                {
                    id: "articleUrl",
                    type: "text",
                    label: "URL of BU Help Article",
                    required: false,
                    placeholder: "Ex: https://help.benchmarkuniverse.com/bubateacher/Content/eAssessments/Grading/About%20Grading%20eAssessments.htm",
                    hint: "Paste the URL of the BU help article."
                },
                {
                    id: "referenceImages",
                    type: "richtext",
                    label: "Images for Reference",
                    required: false,
                    hint: "Add any screenshots that would be helpful."
                }
            ]
        }
    ],
    descriptionGenerator: function (fields) {
        let description = '';

        // Add summary section if provided
        if (fields.summaryContent && fields.summaryContent.trim() !== '<p><br></p>') {
            description += '<div style="color: #000000"><span style="text-decoration: underline; background-color: #c1e9d9;">SUMMARY</span></div>';
            description += `<div>${fields.summaryContent || ''}</div>`;
            description += '<div style="margin-bottom: 20px;"></div>';
        }

        // Add description with all fields
        description += '<div style="color: #000000;"><span style="text-decoration: underline; background-color: #c1e9d9;">DESCRIPTION</span></div>';
        description += `Requestor: ${fields.requester || ''}<br>`;
        if (fields.dateRequested) description += `Date Request: ${formatDate(fields.dateRequested)}<br>`;
        description += `Name of BU Help Article: ${fields.articleName || ''}<br>`;
        if (fields.articleUrl) description += `URL of BU Help Article: ${fields.articleUrl}<br>`;

        // Add reference images if provided
        if (fields.referenceImages && fields.referenceImages.trim() !== '<p><br></p>') {
            description += '<div style="margin-bottom: 10px;"></div>';
            description += `<div><strong>Images for Reference:</strong></div>`;
            description += `<div>${fields.referenceImages}</div>`;
        }

        return description;
    },
    onLoad: function () {
        console.log("Help Article Tracker onLoad function executing");

        // Set default date for Date Requested field to today
        const dateRequestedField = document.getElementById('dateRequested');
        if (dateRequestedField) {
            const today = new Date().toISOString().split('T')[0];
            dateRequestedField.value = today;
            console.log("Set default date for Date Requested:", today);
        }

        // Use TemplateBase for subject line formatting
        const templateBase = new TemplateBase({
            templateType: 'other',
            subjectFormat: 'help-article',
            fields: {
                helpArticleName: 'helpArticleName',
                formattedSubject: 'formattedSubject'
            }
        });

        templateBase.initializeSubjectLineFormatting();

        // Schedule another update after a small delay to ensure fields are populated
        setTimeout(() => templateBase.updateSubjectLine(), 500);

        // Sync Help Article Name to the Description section
        function syncArticleName() {
            const helpArticleNameField = document.getElementById('helpArticleName');
            const articleNameField = document.getElementById('articleName');

            if (helpArticleNameField && articleNameField) {
                articleNameField.value = helpArticleNameField.value;
                console.log("Synced Help Article Name to Description section:", helpArticleNameField.value);
            }
        }

        // Set up event listener for syncing article names
        document.getElementById('helpArticleName')?.addEventListener('input', syncArticleName);

        // Initial sync
        syncArticleName();

        // Schedule another sync after a small delay
        setTimeout(syncArticleName, 500);

        // Add demo data functionality
        const demoDataHelper = new DemoDataHelper();
        const demoButton = demoDataHelper.addDemoDataButton();
        if (demoButton) {
            // Store reference to this template configuration
            const templateConfig = window.TRACKER_CONFIGS_FROM_TEMPLATES['help-article'] || module.exports;
            demoButton.addEventListener('click', () => {
                console.log('Demo button clicked for help-article template');
                demoDataHelper.fillDemoData(templateConfig);
            });
        }
    }
};