/**
 * Subject Line Formatter utility
 * Provides template-specific subject line formatting with customization hooks
 */

class SubjectLineFormatter {
    constructor(templateBase) {
        this.templateBase = templateBase;
        this.customFormatters = {};
    }

    /**
     * Register a custom formatter for a specific template
     */
    registerCustomFormatter(templateName, formatter) {
        this.customFormatters[templateName] = formatter;
    }

    /**
     * Get formatted subject line based on template configuration
     */
    format(overrides = {}) {
        const templateName = this.templateBase.config.templateName;

        // Check for custom formatter first
        if (this.customFormatters[templateName]) {
            return this.customFormatters[templateName](this.templateBase, overrides);
        }

        // Otherwise use base class formatting
        return this.templateBase.formatSubjectLine();
    }

    /**
     * Helper to build VIP prefix based on template style
     */
    getVIPPrefix(isVIP, style = 'standard') {
        if (!isVIP) return '';

        switch (style) {
            case 'star': // For SIM templates
                return 'VIP *';
            case 'prefix': // For Assembly/SEDCUST
                return 'VIP';
            case 'word': // For templates that use "VIP" or "Standard"
                return 'VIP';
            default:
                return 'VIP';
        }
    }

    /**
     * Helper to format district info
     */
    formatDistrictInfo(districtName, districtState, isVIP, style = 'standard') {
        const parts = [];

        if (districtName && districtState) {
            parts.push(`${districtName} • ${districtState}`);
        } else if (districtName) {
            parts.push(districtName);
        } else if (districtState) {
            parts.push(districtState);
        }

        if (parts.length === 0) return '';

        // Add VIP prefix based on style
        if (isVIP && style === 'star') {
            return `VIP * ${parts[0]}`;
        }

        return parts[0];
    }

    /**
     * Helper to format program/application info
     */
    formatProgramInfo(application, version, versionState) {
        if (!application) return '';

        let programPart = application.trim();
        const versionParts = [];

        if (version && version.trim()) {
            versionParts.push(version.trim());
        }
        if (versionState && versionState.trim()) {
            versionParts.push(versionState.trim());
        }

        if (versionParts.length > 0) {
            programPart += ` • ${versionParts.join(' ')}`;
        }

        return programPart;
    }

    /**
     * Helper to format resource/issue info
     */
    formatResourceIssue(resource, specificIssue, userRoles = []) {
        let result = '';

        if (resource && specificIssue) {
            result = `${resource} • ${specificIssue}`;
        } else if (resource) {
            result = resource;
        } else if (specificIssue) {
            result = specificIssue;
        }

        // Add user roles if available
        if (result && userRoles.length > 0) {
            const roleText = userRoles.join(' & ');
            result += ` for ${roleText}`;
        }

        return result;
    }

    /**
     * Helper to format path-based resource info (for SEDCUST)
     */
    formatPathBasedResource(resource, path, specificIssue) {
        if (resource && path && specificIssue) {
            return `${resource}: ${path} - ${specificIssue}`;
        } else if (resource && path) {
            return `${resource}: ${path}`;
        } else if (resource && specificIssue) {
            return `${resource} - ${specificIssue}`;
        } else if (path && specificIssue) {
            return `${path} - ${specificIssue}`;
        } else if (resource) {
            return resource;
        } else if (path) {
            return path;
        } else if (specificIssue) {
            return specificIssue;
        }

        return '';
    }

    /**
     * Helper to join subject line parts with proper separator
     */
    joinParts(parts, separator = ' | ') {
        return parts.filter(part => part && part.trim()).join(separator);
    }

    /**
     * Validate subject line meets requirements
     */
    validate(subjectLine, requirements = {}) {
        const errors = [];

        // Check minimum length
        if (requirements.minLength && subjectLine.length < requirements.minLength) {
            errors.push(`Subject line must be at least ${requirements.minLength} characters`);
        }

        // Check maximum length
        if (requirements.maxLength && subjectLine.length > requirements.maxLength) {
            errors.push(`Subject line must not exceed ${requirements.maxLength} characters`);
        }

        // Check required parts
        if (requirements.requiredParts) {
            requirements.requiredParts.forEach(part => {
                if (!subjectLine.includes(part)) {
                    errors.push(`Subject line must contain "${part}"`);
                }
            });
        }

        // Check separator consistency
        if (requirements.separator && !subjectLine.includes(requirements.separator)) {
            errors.push(`Subject line must use "${requirements.separator}" as separator`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Apply template-specific rules
     */
    applyTemplateRules(subjectLine, templateName) {
        const rules = {
            'sim-assignment': {
                maxLength: 200,
                separator: ' | ',
                requiredParts: []
            },
            'sedcust': {
                maxLength: 200,
                separator: ' | ',
                requiredParts: ['Xcode']
            },
            'assembly': {
                maxLength: 200,
                separator: ' | ',
                requiredParts: ['Xcode']
            },
            'assembly-rollover': {
                maxLength: 150,
                separator: ' | ',
                requiredParts: []
            }
        };

        const templateRules = rules[templateName] || {};
        return this.validate(subjectLine, templateRules);
    }
}

// Export for use in tracker-config.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubjectLineFormatter;
} 