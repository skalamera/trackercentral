const { TRACKER_CONFIGS } = require('../app/tracker-config');

describe('Advanced tracker config tests', () => {
    describe('Section Dependency Tests', () => {
        test('fields are properly configured for dynamic display', () => {
            // Find templates with dependsOn fields which control visibility
            Object.entries(TRACKER_CONFIGS).forEach(([templateKey, template]) => {
                template.sections.forEach(section => {
                    if (section.fields) {
                        section.fields.forEach(field => {
                            if (field.dependsOn) {
                                // Verify the dependsOn field has a proper structure
                                expect(field.dependsOn.field).toBeDefined();
                                if (field.dependsOn.value) {
                                    // If there's a dependency value, it should be defined
                                    expect(field.dependsOn.value).toBeDefined();
                                }
                            }
                        });
                    }
                });
            });
        });
    });

    describe('Template Initialization Tests', () => {
        // Test that fields have the right initialization configs
        test('fields have proper initialization settings', () => {
            Object.values(TRACKER_CONFIGS).forEach(template => {
                template.sections.forEach(section => {
                    if (section.fields) {
                        section.fields.forEach(field => {
                            // If field has a defaultValue, verify it's of right type
                            if (field.defaultValue !== undefined) {
                                if (field.type === 'text' || field.type === 'textarea') {
                                    expect(typeof field.defaultValue === 'string' || field.defaultValue === null).toBe(true);
                                } else if (field.type === 'select') {
                                    // Default value for select should match an option value or be empty
                                    if (field.options && field.options.length > 0 && field.defaultValue) {
                                        const optionValues = field.options.map(o =>
                                            typeof o === 'object' ? o.value || o.id : o);
                                        // Default value should be in the options or be empty
                                        expect(
                                            optionValues.includes(field.defaultValue) ||
                                            field.defaultValue === '' ||
                                            field.defaultValue === null
                                        ).toBe(true);
                                    }
                                }
                            }
                        });
                    }
                });
            });
        });
    });

    describe('Dynamic Subject Line Tests', () => {
        // Test the templates that modify subject lines
        test('subject line generation functions', () => {
            // Test the SIM-ORR template if it has the right functions
            const orrTemplate = TRACKER_CONFIGS['sim-orr'];
            expect(orrTemplate).toBeDefined();

            // Test specific templates that are known to use VIP status
            const simOrrOnLoad = orrTemplate.onLoad;
            expect(typeof simOrrOnLoad).toBe('function');

            // Look for sim-assignment template
            const simAssignment = TRACKER_CONFIGS['sim-assignment'];
            expect(simAssignment).toBeDefined();
        });
    });

    describe('Template Icon Tests', () => {
        // Verify template icons are properly configured
        test('templates have valid icons', () => {
            Object.values(TRACKER_CONFIGS).forEach(template => {
                // Every template should have an icon
                expect(template.icon).toBeDefined();

                // Icon should be a string starting with fa-
                expect(typeof template.icon).toBe('string');
                expect(template.icon.startsWith('fa-')).toBe(true);

                // Section icons should also be properly formatted
                template.sections.forEach(section => {
                    if (section.icon) {
                        expect(typeof section.icon).toBe('string');
                        expect(section.icon.startsWith('fa-')).toBe(true);
                    }
                });
            });
        });
    });

    describe('Field Type Tests', () => {
        // Test that field types are properly configured
        test('fields have valid types', () => {
            const validFieldTypes = [
                'text', 'textarea', 'select', 'multiselect',
                'checkbox', 'checkboxes', 'date', 'file', 'radio', 'richtext', 'email', 'info', 'hidden'
            ];

            Object.values(TRACKER_CONFIGS).forEach(template => {
                template.sections.forEach(section => {
                    if (section.fields) {
                        section.fields.forEach(field => {
                            // Field type should be one of the valid types
                            expect(validFieldTypes).toContain(field.type);

                            // If it's a select or multiselect, it should have options
                            if (field.type === 'select' || field.type === 'multiselect') {
                                expect(field.options).toBeDefined();
                                expect(Array.isArray(field.options)).toBe(true);
                            }
                        });
                    }
                });
            });
        });
    });
}); 