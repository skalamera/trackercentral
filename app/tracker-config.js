// Import utility functions
// Note: In browser environment, these functions will be loaded from utils/*.js files
// - formatDate from app/utils/formatDate.js
// - populateApplicationName, populateDistrictState from app/utils/fieldPopulators.js
// - setupCustomVersionInput, setupCustomVersionStateInput, getVersionValue, getVersionStateValue from app/utils/versionFieldHandlers.js
// - setupClearFormattingButton, addFormatButtonToQuillDefaults from app/utils/quillHelpers.js

// Import all template configurations
// In browser environment, this will be loaded from templates/index.js
const TRACKER_CONFIGS = (typeof require !== 'undefined' && typeof module !== 'undefined' && module.exports)
    ? require('./templates/index')
    : window.TRACKER_CONFIGS_FROM_TEMPLATES || {};

// NOTE: The actual template definitions have been moved to individual files in app/templates/
// This section previously contained inline definitions for all templates from lines 9-5991
// Templates are now organized as follows:
// - Assembly templates: app/templates/assembly/
// - SEDCUST templates: app/templates/sedcust/
// - SIM templates: app/templates/sim/
// - Other templates: app/templates/other/
// See app/templates/index.js for the complete list

// ========== ADDITIONAL CONFIGURATIONS AND FUNCTIONS START HERE ==========

// NOTE: The SIM Achievement Levels specific code has been moved to the template's onLoad function
// This prevents it from running globally for all templates

// Moved SIM Achievement Levels specific functions to avoid global execution
// These functions are now part of the achievement-levels template's onLoad

// If the trackerApp is available, call its setupSmartsheetUploader method
if (window.trackerApp && typeof window.trackerApp.setupSmartsheetUploader === 'function') {
    console.log("Setting up smartsheet uploader through trackerApp");
    window.trackerApp.setupSmartsheetUploader();
} else {
    console.warn("TrackerApp or setupSmartsheetUploader not available");
}

// dpt
const originalDptOnLoad = TRACKER_CONFIGS["dpt"].onLoad;
TRACKER_CONFIGS["dpt"].onLoad = function () {
    originalDptOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// timeout-extension
const originalTimeoutExtensionOnLoad = TRACKER_CONFIGS["timeout-extension"].onLoad;
TRACKER_CONFIGS["timeout-extension"].onLoad = function () {
    originalTimeoutExtensionOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// help-article
const originalHelpArticleOnLoad = TRACKER_CONFIGS["help-article"].onLoad;
TRACKER_CONFIGS["help-article"].onLoad = function () {
    originalHelpArticleOnLoad.apply(this, arguments);
    setTimeout(setupClearFormattingButton, 500);
};

// Update all SIM tracker resource fields to use dynamic loading
(function updateSIMResourceFields() {
    const simTrackers = [
        'sim-assignment',
        'sim-assessment-reports',
        'sim-fsa',
        'sim-library-view',
        'sim-orr'
    ];

    simTrackers.forEach(trackerName => {
        if (TRACKER_CONFIGS[trackerName]) {
            // Find the subject section
            const subjectSection = TRACKER_CONFIGS[trackerName].sections.find(s => s.id === 'subject');
            if (subjectSection) {
                // Find the resource field
                const resourceField = subjectSection.fields.find(f => f.id === 'resource');
                if (resourceField) {
                    // Update the resource field to use dynamic loading
                    resourceField.options = ["-- Loading from settings --"];
                    resourceField.needsCustomValues = true;
                    console.log(`Updated ${trackerName} resource field to use dynamic loading`);
                }
            }
        }
    });
})();

// Export the tracker configurations for use in tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TRACKER_CONFIGS };
}

// Helper function to setup conditional field display for Resource/Report Type
function setupResourceReportTypeCondition(retryCount = 0) {
    console.log(`Setting up Resource/Report Type conditional display (attempt ${retryCount + 1})`);

    const resourceField = document.getElementById('resource');
    const reportTypeField = document.getElementById('reportType');

    // If fields aren't found, retry up to 5 times
    if (!resourceField || !reportTypeField) {
        if (retryCount < 5) {
            console.log(`Fields not found yet, retrying in 500ms...`);
            setTimeout(() => setupResourceReportTypeCondition(retryCount + 1), 500);
            return;
        } else {
            console.error("Could not find Resource or Report Type fields after 5 attempts");
            return;
        }
    }

    // Find the form-group container for the Report Type field
    const reportTypeContainer = reportTypeField.closest('.form-group');

    if (!reportTypeContainer) {
        console.error("Report Type container (.form-group) not found");
        return;
    }

    // Function to trigger subject line update
    function triggerSubjectUpdate() {
        // Check if we have the tracker app instance with the appropriate update method
        if (window.trackerApp) {
            if (window.trackerApp.trackerType === 'sim-assignment' && typeof window.trackerApp.updateSimAssignmentSubject === 'function') {
                console.log("Triggering SIM Assignment subject update after Resource/Report Type change");
                window.trackerApp.updateSimAssignmentSubject();
            } else if (window.trackerApp.trackerType === 'sim-assessment-reports' && typeof window.trackerApp.updateSIMAssessmentReportsSubject === 'function') {
                console.log("Triggering SIM Assessment Reports subject update after Resource/Report Type change");
                window.trackerApp.updateSIMAssessmentReportsSubject();
            } else if (window.trackerApp.trackerType === 'sim-plan-teach' && typeof window.trackerApp.updateSimPlanTeachSubject === 'function') {
                console.log("Triggering SIM Plan & Teach subject update after Resource change");
                window.trackerApp.updateSimPlanTeachSubject();
            } else if (window.trackerApp.trackerType === 'sim-reading-log' && typeof window.trackerApp.updateSimReadingLogSubject === 'function') {
                console.log("Triggering SIM Reading Log subject update after Resource change");
                window.trackerApp.updateSimReadingLogSubject();
            } else if (window.trackerApp.trackerType === 'sim-dashboard' && typeof window.trackerApp.updateSimDashboardSubject === 'function') {
                console.log("Triggering SIM Dashboard subject update after Resource change");
                window.trackerApp.updateSimDashboardSubject();
            }
            // Add other SIM tracker types here if they use Resource/Report Type fields
        }
    }

    // Function to toggle report type visibility
    function toggleReportType() {
        const selectedValue = resourceField.value;
        console.log(`Resource field value changed to: ${selectedValue}`);

        if (selectedValue === 'Reports') {
            reportTypeContainer.style.display = '';
            // Make the field required when shown
            reportTypeField.required = true;

            // Re-attach event listeners to Report Type field when shown
            reportTypeField.removeEventListener('change', triggerSubjectUpdate);
            reportTypeField.removeEventListener('input', triggerSubjectUpdate);
            reportTypeField.addEventListener('change', triggerSubjectUpdate);
            reportTypeField.addEventListener('input', triggerSubjectUpdate);
        } else {
            reportTypeContainer.style.display = 'none';
            // Clear the value and make it not required when hidden
            reportTypeField.value = '';
            reportTypeField.required = false;
        }

        // Always trigger subject update when Resource changes
        triggerSubjectUpdate();
    }

    // Ensure the Resource field has a default value if none is set
    if (!resourceField.value || resourceField.value === '') {
        // Check if there's an empty option and if so, select "Placeholder" instead
        const placeholderOption = Array.from(resourceField.options).find(opt => opt.value === 'Placeholder');
        if (placeholderOption) {
            resourceField.value = 'Placeholder';
            console.log('Set Resource field default value to "Placeholder"');
        }
    }

    // Force hide the Report Type field initially unless "Reports" is selected
    if (resourceField.value !== 'Reports') {
        reportTypeContainer.style.display = 'none';
        reportTypeField.value = '';
        reportTypeField.required = false;
        console.log('Initially hiding Report Type field');
    } else {
        // If Reports is initially selected, attach event listeners to Report Type
        reportTypeField.removeEventListener('change', triggerSubjectUpdate);
        reportTypeField.removeEventListener('input', triggerSubjectUpdate);
        reportTypeField.addEventListener('change', triggerSubjectUpdate);
        reportTypeField.addEventListener('input', triggerSubjectUpdate);
    }

    // Add event listener to Resource field
    resourceField.removeEventListener('change', toggleReportType);
    resourceField.addEventListener('change', toggleReportType);

    // Also ensure the Resource field triggers subject updates
    resourceField.removeEventListener('change', triggerSubjectUpdate);
    resourceField.removeEventListener('input', triggerSubjectUpdate);
    resourceField.addEventListener('change', triggerSubjectUpdate);
    resourceField.addEventListener('input', triggerSubjectUpdate);

    console.log("Resource/Report Type conditional display setup complete");

    // Trigger initial subject update in case fields are pre-populated
    setTimeout(triggerSubjectUpdate, 100);
}

// Draft Management System
class DraftManager {
    constructor() {
        this.storageKey = 'trackerDrafts';
    }

    // Generate a unique draft ID
    generateDraftId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Save a draft
    saveDraft(draftName, templateType, formData, options = {}) {
        try {
            const drafts = this.getAllDrafts();
            const draftId = options.draftId || this.generateDraftId();

            const draft = {
                id: draftId,
                name: draftName,
                templateType: templateType,
                formData: formData,
                createdAt: options.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: '1.0'
            };

            drafts[draftId] = draft;
            localStorage.setItem(this.storageKey, JSON.stringify(drafts));

            console.log(`Draft "${draftName}" saved successfully`);
            return draftId;
        } catch (error) {
            console.error('Error saving draft:', error);
            throw new Error('Failed to save draft');
        }
    }

    // Get all drafts
    getAllDrafts() {
        try {
            const drafts = localStorage.getItem(this.storageKey);
            return drafts ? JSON.parse(drafts) : {};
        } catch (error) {
            console.error('Error loading drafts:', error);
            return {};
        }
    }

    // Get a specific draft
    getDraft(draftId) {
        const drafts = this.getAllDrafts();
        return drafts[draftId] || null;
    }

    // Delete a draft
    deleteDraft(draftId) {
        try {
            const drafts = this.getAllDrafts();
            if (drafts[draftId]) {
                delete drafts[draftId];
                localStorage.setItem(this.storageKey, JSON.stringify(drafts));
                console.log(`Draft ${draftId} deleted successfully`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting draft:', error);
            throw new Error('Failed to delete draft');
        }
    }

    // Get drafts as an array sorted by last updated
    getDraftsArray() {
        const drafts = this.getAllDrafts();
        return Object.values(drafts).sort((a, b) =>
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
    }

    // Update an existing draft
    updateDraft(draftId, draftName, formData) {
        const draft = this.getDraft(draftId);
        if (!draft) {
            throw new Error('Draft not found');
        }

        return this.saveDraft(draftName, draft.templateType, formData, {
            draftId: draftId,
            createdAt: draft.createdAt
        });
    }

    // Clean up old drafts (optional - keep last 20 drafts)
    cleanupOldDrafts(maxDrafts = 20) {
        try {
            const draftsArray = this.getDraftsArray();
            if (draftsArray.length > maxDrafts) {
                const drafts = this.getAllDrafts();
                const toDelete = draftsArray.slice(maxDrafts);

                toDelete.forEach(draft => {
                    delete drafts[draft.id];
                });

                localStorage.setItem(this.storageKey, JSON.stringify(drafts));
                console.log(`Cleaned up ${toDelete.length} old drafts`);
            }
        } catch (error) {
            console.error('Error cleaning up old drafts:', error);
        }
    }

    // Get template configuration for a draft
    getTemplateConfig(templateType) {
        return TRACKER_CONFIGS[templateType] || null;
    }

    // Extract form data from the current form
    extractFormData() {
        const formData = {};

        // Get all form inputs
        const form = document.getElementById('tracker-form');
        if (!form) return formData;

        // Regular form fields
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.name && input.name.startsWith('userRole')) {
                    // Handle checkbox groups
                    if (!formData[input.name]) {
                        formData[input.name] = [];
                    }
                    if (input.checked) {
                        formData[input.name].push(input.value || input.id);
                    }
                } else {
                    formData[input.id] = input.checked;
                }
            } else {
                formData[input.id] = input.value;
            }
        });

        // Quill editors (rich text)
        const quillEditors = document.querySelectorAll('.ql-editor');
        quillEditors.forEach(editor => {
            const container = editor.closest('[id]');
            if (container) {
                formData[container.id] = editor.innerHTML;
            }
        });

        return formData;
    }

    // Populate form with draft data
    populateForm(formData) {
        if (!formData) return;

        // Populate regular form fields
        Object.keys(formData).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            if (field.type === 'checkbox') {
                field.checked = formData[fieldId];
            } else if (field.name && field.name.startsWith('userRole') && Array.isArray(formData[fieldId])) {
                // Handle checkbox groups
                formData[fieldId].forEach(value => {
                    const checkbox = document.getElementById(value) ||
                        document.querySelector(`input[value="${value}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            } else {
                field.value = formData[fieldId];
            }
        });

        // Populate Quill editors
        setTimeout(() => {
            Object.keys(formData).forEach(fieldId => {
                const container = document.getElementById(fieldId);
                if (container && container.classList.contains('ql-container')) {
                    const editor = container.querySelector('.ql-editor');
                    if (editor && typeof formData[fieldId] === 'string' && formData[fieldId].includes('<')) {
                        editor.innerHTML = formData[fieldId];
                    }
                }
            });
        }, 500);
    }
}

// Global draft manager instance
window.draftManager = new DraftManager();

// Helper functions for form integration
window.saveDraftFromForm = function (draftName) {
    if (!window.trackerApp || !window.trackerApp.selectedTemplate) {
        console.error('No template selected');
        if (window.trackerApp && typeof window.trackerApp.showNotification === 'function') {
            window.trackerApp.showNotification('No template selected', 'error');
        }
        return;
    }

    try {
        const formData = window.draftManager.extractFormData();
        const draftId = window.draftManager.saveDraft(
            draftName,
            window.trackerApp.selectedTemplate,
            formData
        );

        console.log(`Draft "${draftName}" saved successfully!`);
        if (window.trackerApp && typeof window.trackerApp.showNotification === 'function') {
            window.trackerApp.showNotification(`Draft "${draftName}" saved successfully!`, 'success');
        }
        return draftId;
    } catch (error) {
        console.error('Error saving draft from form:', error);
        if (window.trackerApp && typeof window.trackerApp.showNotification === 'function') {
            window.trackerApp.showNotification('Failed to save draft. Please try again.', 'error');
        }
    }
};

window.loadDraftToForm = function (draftId) {
    try {
        const draft = window.draftManager.getDraft(draftId);
        if (!draft) {
            console.error('Draft not found');
            if (window.trackerApp && typeof window.trackerApp.showNotification === 'function') {
                window.trackerApp.showNotification('Draft not found', 'error');
            }
            return;
        }

        // Store the draft info for later use
        localStorage.setItem('loadingDraft', JSON.stringify({
            draftId: draftId,
            formData: draft.formData
        }));

        // Navigate to the tracker form
        localStorage.setItem('selectedTemplate', draft.templateType);
        window.location.href = 'dynamic-tracker.html';
    } catch (error) {
        console.error('Error loading draft:', error);
        if (window.trackerApp && typeof window.trackerApp.showNotification === 'function') {
            window.trackerApp.showNotification('Failed to load draft. Please try again.', 'error');
        }
    }
}; 