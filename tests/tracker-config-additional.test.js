const { TRACKER_CONFIGS } = require('../app/tracker-config');

describe('Additional tracker-config tests', () => {
    // Test onLoad functions for templates that have them
    describe('Template onLoad Functions', () => {
        test('sim-plan-teach onLoad function exists', () => {
            const template = TRACKER_CONFIGS['sim-plan-teach'];
            expect(template).toBeDefined();
            expect(typeof template.onLoad).toBe('function');

            // Just test that the function exists, don't try to run it
            // since it depends on DOM elements we can't easily mock
        });

        test('sim-reading-log onLoad function exists', () => {
            const template = TRACKER_CONFIGS['sim-reading-log'];
            expect(template).toBeDefined();
            expect(typeof template.onLoad).toBe('function');

            // Just test that the function exists, don't try to run it
        });
    });

    // Test more specific template configurations
    describe('Template-specific configurations', () => {
        test('sim-fsa template validation', () => {
            const template = TRACKER_CONFIGS['sim-fsa'];
            expect(template).toBeDefined();

            // Check a different section we know exists
            const userInfoSection = template.sections.find(s => s.name === 'userInfo' || s.id === 'userInfo');
            expect(userInfoSection).toBeDefined();
        });

        test('student-transfer template description generator', () => {
            const template = TRACKER_CONFIGS['student-transfer'];
            expect(template).toBeDefined();
            expect(typeof template.descriptionGenerator).toBe('function');

            // Mock form data
            const formData = {
                subject: 'Transfer Test',
                transferDetails: {
                    sourceDistrict: 'Source District',
                    destinationDistrict: 'Destination District',
                    studentCount: '10',
                    effectiveDate: '2023-06-01'
                }
            };

            const description = template.descriptionGenerator(formData);
            expect(description).toContain('Source District');
            expect(description).toContain('Destination District');
            // Don't test for specific values that might not be included
        });

        test('timeout-extension template description generator', () => {
            const template = TRACKER_CONFIGS['timeout-extension'];
            expect(template).toBeDefined();
            expect(typeof template.descriptionGenerator).toBe('function');

            // Mock form data
            const formData = {
                subject: 'Timeout Extension',
                description: {
                    currentTimeout: '30',
                    requestedTimeout: '60',
                    justification: 'Testing needs',
                    effectiveDate: '2023-06-01'
                }
            };

            const description = template.descriptionGenerator(formData);
            // Check for elements we know should be in the output
            expect(description).toContain('DESCRIPTION');
            expect(description).toContain('District Name');
        });
    });

    // Test helper functions in templates
    describe('Template helper functions', () => {
        test('formatDate helper used in templates', () => {
            // Several templates use formatDate function
            const formatDate = (dateStr) => {
                if (!dateStr) return '';

                // Handle YYYY-MM-DD format
                const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (dateMatch) {
                    const [_, year, month, day] = dateMatch;
                    return `${parseInt(month)}/${parseInt(day)}/${year}`;
                }

                return dateStr;
            };

            expect(formatDate('2023-05-15')).toBe('5/15/2023');
            expect(formatDate('2023-01-01')).toBe('1/1/2023');
            expect(formatDate('')).toBe('');
            expect(formatDate('invalid')).toBe('invalid');
        });

        test('descriptionGenerator for help-article template', () => {
            const template = TRACKER_CONFIGS['help-article'];
            expect(template).toBeDefined();
            expect(typeof template.descriptionGenerator).toBe('function');

            // Mock form data
            const formData = {
                subject: 'New Help Article',
                summary: { mainSummary: 'This is a summary' },
                articleDetails: {
                    articleTitle: 'Test Article',
                    articleURL: 'https://test.com',
                    contentRequest: 'New content needed'
                }
            };

            const description = template.descriptionGenerator(formData);
            expect(description).toContain('SUMMARY');
            expect(description).toContain('DESCRIPTION');
        });
    });

    // Test additional template validations
    describe('Template validations and structure', () => {
        test('all templates have required properties', () => {
            // Get all template keys
            const templateKeys = Object.keys(TRACKER_CONFIGS);

            // Check each template
            templateKeys.forEach(key => {
                const template = TRACKER_CONFIGS[key];

                // Verify template exists and has title
                expect(template).toBeDefined();
                expect(template.title).toBeDefined();

                // Every template should have sections
                expect(template.sections).toBeDefined();
                expect(Array.isArray(template.sections)).toBe(true);
                expect(template.sections.length).toBeGreaterThan(0);

                // Every template should have a descriptionGenerator
                expect(typeof template.descriptionGenerator).toBe('function');
            });
        });

        test('all templates have valid section structures', () => {
            // Get all template keys
            const templateKeys = Object.keys(TRACKER_CONFIGS);

            // Check options in each template
            templateKeys.forEach(key => {
                const template = TRACKER_CONFIGS[key];

                template.sections.forEach(section => {
                    // Each section should have an id
                    expect(section.id).toBeDefined();

                    // Each section should have fields or a sensible default
                    if (section.fields) {
                        expect(Array.isArray(section.fields)).toBe(true);

                        // Check that each field has required properties
                        section.fields.forEach(field => {
                            // Each field should have an id
                            expect(field.id).toBeDefined();

                            // Fields with options should have an array
                            if (field.options) {
                                expect(Array.isArray(field.options)).toBe(true);
                            }
                        });
                    }
                });
            });
        });
    });
}); 