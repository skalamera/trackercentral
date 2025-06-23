/**
 * Base class for all tracker templates
 * Provides common functionality for subject line formatting, event listeners, and field validation
 */
class TemplateBase {
    constructor(config) {
        this.config = config || {};
        this.fields = {};
        this.eventListeners = [];
        this.subjectLineFormat = config.subjectLineFormat || 'default';
        this.requiredFields = config.requiredFields || [];
    }

    /**
     * Initialize the template - should be called after DOM is ready
     */
    initialize() {
        this.collectFields();
        this.setupEventListeners();
        this.updateSubjectLine();

        // Schedule another update after a delay to ensure fields are populated
        setTimeout(() => this.updateSubjectLine(), 500);
    }

    /**
     * Collect all field references from the DOM
     */
    collectFields() {
        // Common fields across most templates
        const commonFieldIds = [
            'isVIP', 'districtName', 'districtState', 'application',
            'version', 'versionState', 'formattedSubject', 'xcode',
            'specificIssue', 'resource', 'issue', 'hasMultipleXcodes',
            'gradesImpacted', 'path'
        ];

        // Collect common fields
        commonFieldIds.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                this.fields[fieldId] = element;
            }
        });

        // Collect any template-specific fields
        if (this.config.additionalFields) {
            this.config.additionalFields.forEach(fieldId => {
                const element = document.getElementById(fieldId);
                if (element) {
                    this.fields[fieldId] = element;
                }
            });
        }

        // Handle checkbox groups (like userRole)
        if (this.config.checkboxGroups) {
            this.config.checkboxGroups.forEach(groupName => {
                this.fields[groupName] = document.querySelectorAll(`input[type="checkbox"][name^="${groupName}"]`);
            });
        }
    }

    /**
     * Get field value with proper handling for custom inputs
     */
    getFieldValue(fieldName) {
        const field = this.fields[fieldName];
        if (!field) return '';

        // Handle NodeList (checkbox groups)
        if (field && field.length !== undefined && typeof field.forEach === 'function') {
            const checkedValues = [];
            field.forEach(checkbox => {
                if (checkbox.checked) {
                    const label = checkbox.parentElement.textContent.trim();
                    checkedValues.push(label || checkbox.value);
                }
            });
            return checkedValues;
        }

        // Handle custom version input
        if (fieldName === 'version' && field.value === 'Other') {
            return this.getCustomVersionValue();
        }

        // Handle custom version state input
        if (fieldName === 'versionState' && field.value === 'Other') {
            return this.getCustomVersionStateValue();
        }

        return field.value || '';
    }

    /**
     * Get custom version value when "Other" is selected
     */
    getCustomVersionValue() {
        const customInput = document.getElementById('customVersionInput');
        if (customInput && this.fields.version?.value === 'Other') {
            return customInput.value || 'Other';
        }
        return this.fields.version?.value || '';
    }

    /**
     * Get custom version state value when "Other" is selected
     */
    getCustomVersionStateValue() {
        const customInput = document.getElementById('customVersionStateInput');
        if (customInput && this.fields.versionState?.value === 'Other') {
            return customInput.value || 'Other';
        }
        return this.fields.versionState?.value || '';
    }

    /**
     * Common subject line formatting logic
     */
    formatSubjectLine() {
        const parts = [];

        switch (this.subjectLineFormat) {
            case 'sim':
                parts.push(...this.formatSIMSubjectLine());
                break;
            case 'sedcust':
                parts.push(...this.formatSEDCUSTSubjectLine());
                break;
            case 'assembly':
                parts.push(...this.formatAssemblySubjectLine());
                break;
            case 'assembly-rollover':
                parts.push(...this.formatAssemblyRolloverSubjectLine());
                break;
            default:
                parts.push(...this.formatDefaultSubjectLine());
        }

        return parts.filter(part => part && part.trim()).join(' | ');
    }

    /**
     * Format SIM subject line
     * Pattern: VIP or Standard District Name • District State (Abv) | Program Name • Variation National / State | Resource • Specific issue for user role
     */
    formatSIMSubjectLine() {
        const parts = [];
        const isVIP = this.getFieldValue('isVIP') === 'Yes';
        const districtName = this.getFieldValue('districtName');
        const districtState = this.getFieldValue('districtState');
        const application = this.getFieldValue('application');
        const version = this.getFieldValue('version');
        const versionState = this.getFieldValue('versionState');
        const resource = this.getFieldValue('resource');
        const specificIssue = this.getFieldValue('specificIssue');
        const userRoles = this.getFieldValue('userRole');

        // First part: VIP or Standard District Name • District State
        let districtPart = '';
        if (districtName && districtState) {
            districtPart = isVIP ? `VIP * ${districtName} • ${districtState}` : `${districtName} • ${districtState}`;
        } else if (districtName) {
            districtPart = isVIP ? `VIP * ${districtName}` : districtName;
        } else if (districtState) {
            districtPart = isVIP ? `VIP * ${districtState}` : districtState;
        }
        if (districtPart) parts.push(districtPart);

        // Second part: Application • Version State/National
        let applicationPart = application;
        if (applicationPart && (version || versionState)) {
            const versionParts = [];
            if (version) versionParts.push(version);
            if (versionState) versionParts.push(versionState);
            applicationPart += ` • ${versionParts.join(' ')}`;
        }
        if (applicationPart) parts.push(applicationPart);

        // Third part: Resource • Specific issue for user role
        let resourceIssuePart = '';
        if (resource && specificIssue) {
            resourceIssuePart = `${resource} • ${specificIssue}`;
        } else if (resource) {
            resourceIssuePart = resource;
        } else if (specificIssue) {
            resourceIssuePart = specificIssue;
        }

        // Add user roles
        if (resourceIssuePart && userRoles.length > 0) {
            const roleText = userRoles.join(' & ');
            resourceIssuePart += ` for ${roleText}`;
        }

        if (resourceIssuePart) parts.push(resourceIssuePart);

        return parts;
    }

    /**
     * Format SEDCUST subject line
     * Pattern: Xcode | VIP or Standard | Program Name • Variation National / State | Resource: Grade > Unit > Week > Day > Lesson - Short description of issue
     */
    formatSEDCUSTSubjectLine() {
        const parts = [];
        const xcode = this.getFieldValue('xcode');
        const isVIP = this.getFieldValue('isVIP') === 'Yes';
        const application = this.getFieldValue('application');
        const version = this.getFieldValue('version');
        const versionState = this.getFieldValue('versionState');
        const resource = this.getFieldValue('resource');
        const path = this.getFieldValue('path');
        const specificIssue = this.getFieldValue('specificIssue');

        // First part: Xcode
        if (xcode) parts.push(xcode);

        // Second part: VIP (only if VIP)
        if (isVIP) parts.push('VIP');

        // Third part: Application • Version State/National
        let applicationPart = application;
        if (applicationPart && (version || versionState)) {
            const versionParts = [];
            if (version) versionParts.push(version);
            if (versionState) versionParts.push(versionState);
            applicationPart += ` • ${versionParts.join(' ')}`;
        }
        if (applicationPart) parts.push(applicationPart);

        // Fourth part: Resource: Path - Specific Issue
        let resourceIssuePart = '';
        if (resource && path && specificIssue) {
            resourceIssuePart = `${resource}: ${path} - ${specificIssue}`;
        } else if (resource && path) {
            resourceIssuePart = `${resource}: ${path}`;
        } else if (resource && specificIssue) {
            resourceIssuePart = `${resource} - ${specificIssue}`;
        } else if (path && specificIssue) {
            resourceIssuePart = `${path} - ${specificIssue}`;
        } else if (resource) {
            resourceIssuePart = resource;
        } else if (path) {
            resourceIssuePart = path;
        } else if (specificIssue) {
            resourceIssuePart = specificIssue;
        }

        if (resourceIssuePart) parts.push(resourceIssuePart);

        return parts;
    }

    /**
     * Format Assembly subject line
     * Pattern: Xcode (indicate if more than one) | VIP or Standard | Program Name • Variation National / State | Specific issue: grades impacted
     */
    formatAssemblySubjectLine() {
        const parts = [];
        const xcode = this.getFieldValue('xcode');
        const hasMultiple = this.getFieldValue('hasMultipleXcodes') === 'Yes';
        const isVIP = this.getFieldValue('isVIP') === 'Yes';
        const application = this.getFieldValue('application');
        const version = this.getFieldValue('version');
        const versionState = this.getFieldValue('versionState');
        const specificIssue = this.getFieldValue('specificIssue');
        const gradesImpacted = this.getFieldValue('gradesImpacted');

        // First part: Xcode (with multiple indicator)
        if (xcode) {
            parts.push(hasMultiple ? `${xcode} (multiple)` : xcode);
        }

        // Second part: VIP or Standard
        parts.push(isVIP ? 'VIP' : 'Standard');

        // Third part: Application • Version State/National
        let applicationPart = application;
        if (applicationPart && (version || versionState)) {
            const versionParts = [];
            if (version) versionParts.push(version);
            if (versionState) versionParts.push(versionState);
            applicationPart += ` • ${versionParts.join(' ')}`;
        }
        if (applicationPart) parts.push(applicationPart);

        // Fourth part: Specific issue: grades impacted
        let issuePart = specificIssue;
        if (issuePart && gradesImpacted) {
            issuePart += `: ${gradesImpacted}`;
        }
        if (issuePart) parts.push(issuePart);

        return parts;
    }

    /**
     * Format Assembly Rollover subject line
     * Pattern: | VIP | District Name • District State | Assembly Rollover
     */
    formatAssemblyRolloverSubjectLine() {
        const parts = [];
        const isVIP = this.getFieldValue('isVIP') === 'Yes';
        const districtName = this.getFieldValue('districtName');
        const districtState = this.getFieldValue('districtState');
        const issue = this.getFieldValue('issue') || 'Assembly Rollover';

        // First part: VIP (only if VIP)
        if (isVIP) parts.push('VIP');

        // Second part: District Name • District State
        let districtPart = '';
        if (districtName && districtState) {
            districtPart = `${districtName} • ${districtState}`;
        } else if (districtName) {
            districtPart = districtName;
        } else if (districtState) {
            districtPart = districtState;
        }
        if (districtPart) parts.push(districtPart);

        // Third part: Issue
        if (issue) parts.push(issue);

        return parts;
    }

    /**
     * Default subject line format (fallback)
     */
    formatDefaultSubjectLine() {
        const parts = [];

        // Try to build a reasonable subject from available fields
        const primaryFields = ['xcode', 'districtName', 'application', 'specificIssue', 'issue'];

        primaryFields.forEach(fieldName => {
            const value = this.getFieldValue(fieldName);
            if (value && value.toString().trim()) {
                parts.push(value.toString().trim());
            }
        });

        return parts;
    }

    /**
     * Update the subject line in the form
     */
    updateSubjectLine() {
        if (!this.fields.formattedSubject) {
            console.log(`${this.config.templateName || 'Template'}: Missing formatted subject field`);
            return;
        }

        const subject = this.formatSubjectLine();
        this.fields.formattedSubject.value = subject;
        console.log(`${this.config.templateName || 'Template'}: Updated subject line:`, subject);
    }

    /**
     * Set up event listeners for all relevant fields
     */
    setupEventListeners() {
        // Define which fields should trigger subject line updates
        const subjectLineTriggers = [
            'isVIP', 'districtName', 'districtState', 'application',
            'version', 'versionState', 'xcode', 'specificIssue',
            'resource', 'issue', 'hasMultipleXcodes', 'gradesImpacted',
            'path'
        ];

        // Add event listeners for text/select fields
        subjectLineTriggers.forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field && !(field && field.length !== undefined && typeof field.forEach === 'function')) {
                const eventType = field.tagName === 'SELECT' ? 'change' : 'input';
                field.addEventListener(eventType, () => this.updateSubjectLine());
                this.eventListeners.push({ element: field, type: eventType, handler: () => this.updateSubjectLine() });
            }
        });

        // Add event listeners for checkbox groups
        if (this.config.checkboxGroups) {
            this.config.checkboxGroups.forEach(groupName => {
                const checkboxes = this.fields[groupName];
                if (checkboxes) {
                    checkboxes.forEach(checkbox => {
                        checkbox.addEventListener('change', () => this.updateSubjectLine());
                        this.eventListeners.push({ element: checkbox, type: 'change', handler: () => this.updateSubjectLine() });
                    });
                }
            });
        }

        // Set up any custom event listeners defined in config
        if (this.config.customEventListeners) {
            this.config.customEventListeners.forEach(listener => {
                const element = document.getElementById(listener.elementId) || document.querySelector(listener.selector);
                if (element) {
                    element.addEventListener(listener.event, listener.handler);
                    this.eventListeners.push({ element, type: listener.event, handler: listener.handler });
                }
            });
        }
    }

    /**
     * Validate required fields
     */
    validateFields() {
        const errors = [];

        this.requiredFields.forEach(fieldName => {
            const value = this.getFieldValue(fieldName);

            if (!value || (Array.isArray(value) && value.length === 0) || value.toString().trim() === '') {
                errors.push({
                    field: fieldName,
                    message: `${fieldName} is required`
                });
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Clean up event listeners (useful when switching templates)
     */
    cleanup() {
        this.eventListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.eventListeners = [];
    }

    /**
     * Helper method to populate field value
     */
    setFieldValue(fieldName, value) {
        const field = this.fields[fieldName];
        if (!field) return;

        if (field && field.length !== undefined && typeof field.forEach === 'function') {
            // Handle checkbox groups
            field.forEach(checkbox => {
                checkbox.checked = value.includes(checkbox.value) || value.includes(checkbox.id);
            });
        } else {
            field.value = value;
        }

        // Trigger change event to update dependent fields
        const event = new Event(field.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true });
        field.dispatchEvent(event);
    }
}

// Export for use in tracker-config.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateBase;
} 