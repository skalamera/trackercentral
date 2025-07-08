/**
 * Base class for all tracker templates
 * Provides common functionality for subject line formatting, event listeners, and field validation
 */
class TemplateBase {
    constructor(config) {
        this.config = config || {};
        this.fields = config.fields || {};
        this.eventListeners = [];
        this.templateType = config.templateType || 'default';
        this.subjectFormat = config.subjectFormat || 'default';
        this.subjectLineFormat = config.subjectLineFormat || config.templateName || 'default';
        this.templateName = config.templateName || 'unknown';
        this.requiredFields = config.requiredFields || [];

        // Add unique instance ID for debugging
        this.instanceId = `${this.templateName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`[TemplateBase] Created instance: ${this.instanceId} for template: ${this.templateName} with format: ${this.subjectLineFormat}`);
    }

    /**
     * Initialize subject line formatting for the new configuration format
     */
    initializeSubjectLineFormatting() {
        this.setupEventListeners();
        this.updateSubjectLine();
    }

    /**
     * Initialize the template - should be called after DOM is ready
     * @deprecated Use initializeSubjectLineFormatting() instead
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
     * @deprecated Fields are now passed in config.fields
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
        // Special handling for userRole - always check for checkboxes first
        if (fieldName === 'userRole') {
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="userRole"]');
            if (checkboxes.length > 0) {
                const checkedValues = [];
                checkboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        if (checkbox.id === 'allUsers') {
                            checkedValues.push('All Users');
                        } else {
                            const label = checkbox.parentElement.textContent.trim();
                            checkedValues.push(label || checkbox.value);
                        }
                    }
                });
                return checkedValues;
            }
        }

        // First check if we have a field ID mapping
        const fieldId = this.fields[fieldName] || fieldName;
        const field = document.getElementById(fieldId);

        if (!field) {
            // Try checkbox groups
            const checkboxes = document.querySelectorAll(`input[type="checkbox"][name^="${fieldName}"]`);
            if (checkboxes.length > 0) {
                const checkedValues = [];
                checkboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        if (checkbox.id === 'allUsers') {
                            checkedValues.push('All Users');
                        } else {
                            const label = checkbox.parentElement.textContent.trim();
                            checkedValues.push(label || checkbox.value);
                        }
                    }
                });
                return checkedValues;
            }
            return '';
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
        // Use global getVersionValue if available (from versionFieldHandlers.js)
        if (typeof getVersionValue === 'function') {
            const versionField = document.getElementById(this.fields.version || 'version');
            return getVersionValue(versionField);
        }

        // Fallback to local implementation
        const versionField = document.getElementById(this.fields.version || 'version');
        const customInput = document.getElementById('customVersionInput');
        if (customInput && versionField?.value === 'Other') {
            return customInput.value || 'Other';
        }
        return versionField?.value || '';
    }

    /**
     * Get custom version state value when "Other" is selected
     */
    getCustomVersionStateValue() {
        // Use global getVersionStateValue if available (from versionFieldHandlers.js)
        if (typeof getVersionStateValue === 'function') {
            const versionStateField = document.getElementById(this.fields.versionState || 'versionState');
            return getVersionStateValue(versionStateField);
        }

        // Fallback to local implementation
        const versionStateField = document.getElementById(this.fields.versionState || 'versionState');
        const customInput = document.getElementById('customVersionStateInput');
        if (customInput && versionStateField?.value === 'Other') {
            return customInput.value || 'Other';
        }
        return versionStateField?.value || '';
    }

    /**
     * Get all field values as an object
     */
    getFieldValues() {
        const values = {};

        // Get values from all defined fields
        if (this.fields && Object.keys(this.fields).length > 0) {
            Object.entries(this.fields).forEach(([fieldName]) => {
                values[fieldName] = this.getFieldValue(fieldName);
            });
        }

        // Also get common field values that might not be in this.fields
        const commonFields = [
            'isVIP', 'vip', 'districtName', 'districtState', 'application',
            'version', 'versionState', 'resource', 'specificIssue', 'issue',
            'xcode', 'hasMultipleXcodes', 'gradesImpacted', 'path',
            'userRole', 'helpArticleName'
        ];

        commonFields.forEach(fieldName => {
            if (!values[fieldName]) {
                const value = this.getFieldValue(fieldName);
                if (value) {
                    values[fieldName] = value;
                }
            }
        });

        return values;
    }

    /**
     * Common subject line formatting logic
     */
    formatSubjectLine() {
        const parts = [];

        // Debug logging
        const formatType = this.subjectLineFormat || this.config.subjectLineFormat;
        console.log(`[${this.instanceId}] formatSubjectLine - templateName: ${this.templateName}, subjectLineFormat: ${formatType}, templateType: ${this.templateType}, subjectFormat: ${this.subjectFormat}`);

        // Handle new format configurations
        if (this.templateType === 'sim') {
            console.log('Using SIM format (new configuration)');
            parts.push(...this.formatSIMSubjectLine());
        } else if (this.templateType === 'other') {
            // Handle other template types
            console.log(`Using other format with subjectFormat: ${this.subjectFormat}`);
            switch (this.subjectFormat) {
                case 'dpt':
                    parts.push(...this.formatDPTSubjectLine());
                    break;
                case 'timeout-extension':
                    parts.push(...this.formatTimeoutExtensionSubjectLine());
                    break;
                case 'help-article':
                    parts.push(...this.formatHelpArticleSubjectLine());
                    break;
                default:
                    parts.push(...this.formatDefaultSubjectLine());
            }
        } else {
            // Handle legacy format configurations
            console.log(`Using legacy format with subjectLineFormat: ${formatType}`);
            switch (formatType) {
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
                case 'sim-achievement-levels':
                    parts.push(...this.formatSIMAchievementLevelsSubjectLine());
                    break;
                case 'dpt':
                    parts.push(...this.formatDPTSubjectLine());
                    break;
                case 'timeout-extension':
                    parts.push(...this.formatTimeoutExtensionSubjectLine());
                    break;
                case 'help-article':
                    parts.push(...this.formatHelpArticleSubjectLine());
                    break;
                case 'feature-request':
                    // Feature request uses SIM format
                    parts.push(...this.formatSIMSubjectLine());
                    break;
                default:
                    console.log(`Unknown format type: ${formatType}, using default`);
                    parts.push(...this.formatDefaultSubjectLine());
            }
        }

        const result = parts.filter(part => part && part.trim()).join(' | ');
        console.log(`Formatted subject line: ${result}`);
        return result;
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

        // Special handling for SIM Dashboard
        if (this.subjectFormat === 'sim-dashboard') {
            if (resource && resource !== 'Placeholder' && specificIssue) {
                resourceIssuePart = `${resource} • ${specificIssue}`;
            } else if (resource && resource !== 'Placeholder') {
                resourceIssuePart = resource;
            } else if (specificIssue) {
                resourceIssuePart = specificIssue;
            }
        } else {
            // Other SIM templates
            if (resource && specificIssue) {
                resourceIssuePart = `${resource} • ${specificIssue}`;
            } else if (resource) {
                resourceIssuePart = resource;
            } else if (specificIssue) {
                resourceIssuePart = specificIssue;
            }
        }

        // Add user roles
        if (resourceIssuePart && userRoles && userRoles.length > 0) {
            const roleText = userRoles.join(' & ');
            resourceIssuePart += ` for ${roleText}`;
        }

        if (resourceIssuePart) parts.push(resourceIssuePart);

        return parts;
    }

    /**
     * Format DPT subject line
     * Pattern: VIP * District Name • District State | DPT • Customized eAssessments - District Admin
     */
    formatDPTSubjectLine() {
        const isVIP = this.getFieldValue('isVIP') === 'Yes';
        const districtName = this.getFieldValue('districtName');
        const districtState = this.getFieldValue('districtState');

        // Debug logging
        console.log(`DPT formatSubjectLine - isVIP field value: "${this.getFieldValue('isVIP')}", isVIP boolean: ${isVIP}`);

        // Build the subject line
        let subject = '';
        if (districtName && districtState) {
            if (isVIP) {
                subject = `VIP * ${districtName} • ${districtState} | DPT • Customized eAssessments - District Admin`;
            } else {
                subject = `${districtName} • ${districtState} | DPT • Customized eAssessments - District Admin`;
            }
        } else if (districtName) {
            if (isVIP) {
                subject = `VIP * ${districtName} | DPT • Customized eAssessments - District Admin`;
            } else {
                subject = `${districtName} | DPT • Customized eAssessments - District Admin`;
            }
        } else {
            subject = 'DPT • Customized eAssessments - District Admin';
        }

        return [subject];
    }

    /**
     * Format Timeout Extension subject line
     * Pattern: VIP * District Name • District State | Issue or Standard District Name • District State | Issue
     */
    formatTimeoutExtensionSubjectLine() {
        const isVIP = this.getFieldValue('isVIP') === 'Yes';
        const districtName = this.getFieldValue('districtName');
        const districtState = this.getFieldValue('districtState');
        const issue = this.getFieldValue('issue') || 'Timeout Extension';

        // Debug logging
        console.log(`Timeout Extension formatSubjectLine - isVIP field value: "${this.getFieldValue('isVIP')}", isVIP boolean: ${isVIP}`);

        let subject = '';
        if (districtName && districtName.trim() && districtState && districtState.trim()) {
            if (isVIP) {
                subject = `VIP * ${districtName.trim()} • ${districtState.trim()} | ${issue}`;
            } else {
                subject = `Standard ${districtName.trim()} • ${districtState.trim()} | ${issue}`;
            }
        } else if (districtName && districtName.trim()) {
            if (isVIP) {
                subject = `VIP * ${districtName.trim()} | ${issue}`;
            } else {
                subject = `Standard ${districtName.trim()} | ${issue}`;
            }
        } else {
            subject = issue;
        }

        return [subject];
    }

    /**
     * Format Help Article subject line
     * Pattern: BU Help Article Update | Help Article Name
     */
    formatHelpArticleSubjectLine() {
        const helpArticleName = this.getFieldValue('helpArticleName');

        let subject = '';
        if (helpArticleName.trim()) {
            subject = `BU Help Article Update | ${helpArticleName.trim()}`;
        } else {
            subject = 'BU Help Article Update';
        }

        return [subject];
    }

    /**
     * Format SEDCUST subject line
     * Pattern: VIP|Standard District Name • District State | SEDCUST: Application Version State | xcode specific issue
     */
    formatSEDCUSTSubjectLine() {
        const parts = [];
        const isVIP = this.getFieldValue('isVIP') === 'Yes';
        const districtName = this.getFieldValue('districtName');
        const districtState = this.getFieldValue('districtState');
        const application = this.getFieldValue('application');
        const version = this.getFieldValue('version');
        const versionState = this.getFieldValue('versionState');
        const xcode = this.getFieldValue('xcode');
        const specificIssue = this.getFieldValue('specificIssue');

        // First part: VIP/Standard District Name • District State
        let districtPart = '';
        if (districtName && districtState) {
            districtPart = isVIP ? `VIP ${districtName} • ${districtState}` : `Standard ${districtName} • ${districtState}`;
        } else if (districtName) {
            districtPart = isVIP ? `VIP ${districtName}` : `Standard ${districtName}`;
        }
        if (districtPart) parts.push(districtPart);

        // Second part: SEDCUST: Application Version State
        let sedcustPart = 'SEDCUST';
        if (application || version || versionState) {
            sedcustPart += ':';
            const appParts = [];
            if (application) appParts.push(application);
            if (version) appParts.push(version);
            if (versionState) appParts.push(versionState);
            sedcustPart += ' ' + appParts.join(' ');
        }
        parts.push(sedcustPart);

        // Third part: xcode specific issue
        const issueParts = [];
        if (xcode) issueParts.push(xcode);
        if (specificIssue) issueParts.push(specificIssue);
        if (issueParts.length > 0) {
            parts.push(issueParts.join(' '));
        }

        return parts;
    }

    /**
     * Format Assembly subject line
     * Pattern: Xcode (indicate if more than one) | [VIP if applicable] | Program Name • Variation National / State | Specific issue: grades impacted
     */
    formatAssemblySubjectLine() {
        const parts = [];
        const xcode = this.getFieldValue('xcode');
        const hasMultipleXcodes = this.getFieldValue('hasMultipleXcodes') === 'Yes';
        const isVIP = this.getFieldValue('isVIP') === 'Yes';
        const application = this.getFieldValue('application');
        const version = this.getFieldValue('version');
        const versionState = this.getFieldValue('versionState');
        const specificIssue = this.getFieldValue('specificIssue');
        const gradesImpacted = this.getFieldValue('gradesImpacted');

        // First part: Xcode (with multiple indicator if needed)
        let xcodePart = xcode || '';
        if (hasMultipleXcodes && xcodePart) {
            xcodePart += ' (Multiple Xcodes)';
        }
        if (xcodePart) parts.push(xcodePart);

        // Second part: Only add VIP if it's true, omit entirely if not VIP
        if (isVIP) {
            parts.push('VIP');
        }

        // Third part: Program Name • Version State/National
        let programPart = application || '';
        if (programPart && (version || versionState)) {
            const versionParts = [];
            if (version) versionParts.push(version);
            if (versionState) versionParts.push(versionState);
            programPart += ` • ${versionParts.join(' ')}`;
        }
        if (programPart) parts.push(programPart);

        // Fourth part: Specific issue: grades impacted
        let issuePart = specificIssue || '';
        if (issuePart && gradesImpacted) {
            issuePart += `: ${gradesImpacted}`;
        }
        if (issuePart) parts.push(issuePart);

        return parts;
    }

    /**
     * Format Assembly Rollover subject line
     * Pattern: [VIP] District Name • District State | Assembly Rollover
     */
    formatAssemblyRolloverSubjectLine() {
        const parts = [];
        const isVIP = this.getFieldValue('isVIP') === 'Yes';
        const districtName = this.getFieldValue('districtName');
        const districtState = this.getFieldValue('districtState');

        // Build district part with VIP prefix only if VIP is true
        let districtPart = '';
        if (districtName && districtState) {
            districtPart = isVIP ? `VIP ${districtName} • ${districtState}` : `${districtName} • ${districtState}`;
        } else if (districtName) {
            districtPart = isVIP ? `VIP ${districtName}` : districtName;
        } else if (districtState) {
            districtPart = isVIP ? `VIP ${districtState}` : districtState;
        }

        if (districtPart) parts.push(districtPart);

        // Always add "Assembly Rollover" as the last part
        parts.push('Assembly Rollover');

        return parts;
    }

    /**
     * Format default subject line
     * Pattern: District Name • District State | Issue/Other fields
     */
    formatDefaultSubjectLine() {
        const parts = [];
        const districtName = this.getFieldValue('districtName');
        const districtState = this.getFieldValue('districtState');
        const issue = this.getFieldValue('issue');

        // Build district part
        const districtParts = [];
        if (districtName) districtParts.push(districtName);
        if (districtState) districtParts.push(districtState);

        if (districtParts.length > 0) {
            parts.push(districtParts.join(' • '));
        }

        // Add issue or any other relevant field
        if (issue) {
            parts.push(issue);
        }

        return parts;
    }

    /**
     * Format SIM Achievement Levels subject line
     * Pattern: VIP* District Name • District State | Custom Achievement Levels or District Name • District State | Custom Achievement Levels
     */
    formatSIMAchievementLevelsSubjectLine() {
        const districtName = this.getFieldValue('districtName');
        const districtState = this.getFieldValue('districtState');

        // Check if this is a VIP district - Achievement levels doesn't have isVIP field,
        // so check from ticket data if available
        let isVIP = false;
        if (typeof window !== 'undefined' && window.trackerApp && window.trackerApp.ticketData && window.trackerApp.ticketData.isVip === true) {
            isVIP = true;
        }

        // Format: "VIP* District Name • District State | Custom Achievement Levels"
        let subject = '';
        if (districtName && districtState) {
            const prefix = isVIP ? 'VIP* ' : '';
            subject = `${prefix}${districtName} • ${districtState} | Custom Achievement Levels`;
        } else if (districtName) {
            const prefix = isVIP ? 'VIP* ' : '';
            subject = `${prefix}${districtName} | Custom Achievement Levels`;
        } else {
            subject = 'Custom Achievement Levels';
        }

        return [subject];
    }

    /**
     * Update the subject line in the form
     */
    updateSubjectLine() {
        const formattedSubjectId = this.fields.formattedSubject || 'formattedSubject';
        const formattedSubjectField = document.getElementById(formattedSubjectId);

        if (!formattedSubjectField) {
            console.log(`${this.config.templateName || 'Template'}: Missing formatted subject field`);
            return;
        }

        const subject = this.formatSubjectLine();
        formattedSubjectField.value = subject;
        console.log(`[${this.config.templateName || 'Unknown'}] Subject line updated to: "${subject}" (format: ${this.subjectLineFormat || this.config.subjectLineFormat || 'default'})`);
    }

    /**
     * Set up event listeners for all relevant fields
     */
    setupEventListeners() {
        // For new configuration format, iterate through field mappings
        if (this.fields && Object.keys(this.fields).length > 0) {
            console.log(`[${this.templateName}] Setting up event listeners for fields:`, Object.keys(this.fields));

            Object.entries(this.fields).forEach(([fieldName, fieldId]) => {
                const field = document.getElementById(fieldId);
                if (field) {
                    const eventType = field.tagName === 'SELECT' ? 'change' : 'input';
                    const handler = () => {
                        console.log(`[${this.templateName}] Field '${fieldName}' (${fieldId}) changed to: ${field.value}`);
                        this.updateSubjectLine();
                    };
                    field.addEventListener(eventType, handler);
                    this.eventListeners.push({ element: field, type: eventType, handler });
                    console.log(`[${this.templateName}] Added ${eventType} listener to field '${fieldName}' (${fieldId})`);
                } else {
                    console.warn(`[${this.templateName}] Field element not found for '${fieldName}' (${fieldId})`);
                }
            });

            // Handle checkbox groups
            const checkboxGroups = ['userRole'];
            checkboxGroups.forEach(groupName => {
                const checkboxes = document.querySelectorAll(`input[type="checkbox"][name^="${groupName}"]`);
                checkboxes.forEach(checkbox => {
                    const handler = () => this.updateSubjectLine();
                    checkbox.addEventListener('change', handler);
                    this.eventListeners.push({ element: checkbox, type: 'change', handler });
                });
            });
        } else {
            // Legacy configuration format
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
     * Validate required fields with conditional validation support
     */
    validateFields() {
        const errors = [];

        this.requiredFields.forEach(fieldName => {
            // Check if this field has conditional validation
            if (this.shouldSkipFieldValidation(fieldName)) {
                return; // Skip validation for this field
            }

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
     * Check if field validation should be skipped based on conditions
     */
    shouldSkipFieldValidation(fieldName) {
        // Special case for District State field when District Name is "Benchmark Education Company"
        if (fieldName === 'districtState') {
            const districtName = this.getFieldValue('districtName');
            console.log(`TemplateBase: Checking districtState validation skip for districtName: "${districtName}"`);

            if (districtName === 'Benchmark Education Company') {
                console.log('TemplateBase: Skipping districtState validation for Benchmark Education Company');
                return true; // Skip validation for District State
            }
        }
        return false;
    }

    /**
     * Set up conditional validation for District State field
     */
    setupConditionalValidation() {
        const districtNameField = document.getElementById('districtName');
        const districtStateField = document.getElementById('districtState');

        if (!districtNameField || !districtStateField) {
            console.warn('District Name or District State field not found for conditional validation');
            return;
        }

        // Function to update the required attribute based on District Name value
        const updateDistrictStateRequired = () => {
            const districtName = districtNameField.value ? districtNameField.value.trim() : '';
            const isRequired = districtName !== 'Benchmark Education Company';

            // Update the required attribute (with defensive programming for tests)
            if (isRequired) {
                if (typeof districtStateField.setAttribute === 'function') {
                    districtStateField.setAttribute('required', 'required');
                }
                if (districtStateField.required !== undefined) {
                    districtStateField.required = true;
                }
            } else {
                if (typeof districtStateField.removeAttribute === 'function') {
                    districtStateField.removeAttribute('required');
                }
                if (districtStateField.required !== undefined) {
                    districtStateField.required = false;
                }
            }

            // Update visual indicators (asterisk in label) using CSS class
            const label = document.querySelector('label[for="districtState"]');
            if (label && typeof label.classList !== 'undefined') {
                if (isRequired) {
                    label.classList.add('required-field');
                } else {
                    label.classList.remove('required-field');
                }
            }

            console.log(`District State field ${isRequired ? 'required' : 'optional'} based on District Name: "${districtName}"`);
        };

        // Set up event listener for District Name field
        if (typeof districtNameField.addEventListener === 'function') {
            districtNameField.addEventListener('input', updateDistrictStateRequired);
            districtNameField.addEventListener('change', updateDistrictStateRequired);

            // Store reference for cleanup
            this.eventListeners.push(
                { element: districtNameField, type: 'input', handler: updateDistrictStateRequired },
                { element: districtNameField, type: 'change', handler: updateDistrictStateRequired }
            );
        }

        // Run initial check
        updateDistrictStateRequired();
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

// Make TemplateBase available globally in browser environment
if (typeof window !== 'undefined') {
    window.TemplateBase = TemplateBase;
} 