const { TRACKER_CONFIGS } = require('../app/tracker-config');

describe('Tracker config template tests', () => {
    describe('Template Section Field Tests', () => {
        // Test all field types across all templates
        test('template field types are correctly configured', () => {
            Object.values(TRACKER_CONFIGS).forEach(template => {
                template.sections.forEach(section => {
                    if (section.fields) {
                        section.fields.forEach(field => {
                            // Check field type exists
                            expect(field.type).toBeDefined();

                            // Field should have id
                            expect(field.id).toBeDefined();

                            // If field is required, it should be boolean
                            if (field.required !== undefined) {
                                expect(typeof field.required).toBe('boolean');
                            }

                            // Test options if present
                            if (field.options) {
                                expect(Array.isArray(field.options)).toBe(true);
                                if (field.options.length > 0) {
                                    // At least the first option should have required fields
                                    const firstOption = field.options[0];
                                    if (typeof firstOption === 'object') {
                                        // Check either label or id or value exists
                                        expect(firstOption.label || firstOption.id || firstOption.value).toBeDefined();
                                    }
                                }
                            }
                        });
                    }
                });
            });
        });

        // Test specific templates have the right number of sections
        test('templates have the correct number of sections', () => {
            // Check the number of sections in a few key templates
            expect(TRACKER_CONFIGS['feature-request'].sections.length).toBeGreaterThanOrEqual(4);
            expect(TRACKER_CONFIGS['sim-orr'].sections.length).toBeGreaterThanOrEqual(5);
            expect(TRACKER_CONFIGS['assembly'].sections.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Template Field Validation', () => {
        // Test field validation in various templates

        test('templates have properly structured sections', () => {
            // Test a few templates for proper section configuration
            ['feature-request', 'sim-orr', 'assembly', 'timeout-extension'].forEach(templateName => {
                const template = TRACKER_CONFIGS[templateName];
                expect(template).toBeDefined();

                // Each template should have at least a subject section
                const subjectSection = template.sections.find(section => section.id === 'subject');
                expect(subjectSection).toBeDefined();

                // Each template should have at least 2 sections
                expect(template.sections.length).toBeGreaterThanOrEqual(2);
            });
        });

        test('options arrays are properly structured', () => {
            // Test that options arrays have the expected format
            Object.values(TRACKER_CONFIGS).forEach(template => {
                template.sections.forEach(section => {
                    if (section.fields) {
                        section.fields.forEach(field => {
                            if (field.options && field.options.length > 0) {
                                // If options exist, check they have a consistent structure
                                if (typeof field.options[0] === 'object') {
                                    // Make sure all options have the same properties
                                    const firstOptionProps = Object.keys(field.options[0]);

                                    if (firstOptionProps.length > 0) {
                                        // At least one property should exist in all options
                                        const someKey = firstOptionProps[0];
                                        field.options.forEach(option => {
                                            expect(option).toHaveProperty(someKey);
                                        });
                                    }
                                }
                            }
                        });
                    }
                });
            });
        });
    });

    describe('Template Description Generators', () => {
        test('sim-orr template description generator formats correctly', () => {
            const template = TRACKER_CONFIGS['sim-orr'];

            // Create simpler form data
            const formData = {
                subject: 'ORR Issue',
                issueDescription: {
                    issueType: 'functionality'
                }
            };

            const description = template.descriptionGenerator(formData);

            // Check for the presence of template-specific headings
            expect(description).toContain('ISSUE DESCRIPTION');
            expect(description).toContain('IMPACTED USER INFO');
            expect(description).toContain('EXPECTED RESULTS');
        });
    });
}); 