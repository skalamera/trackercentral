/**
 * Tests for TemplateBase class
 */

// Mock DOM environment for testing
const { JSDOM } = require('jsdom');
const dom = new JSDOM();
global.document = dom.window.document;

// Import the TemplateBase class
const TemplateBase = require('../app/utils/templateBase');

describe('TemplateBase - Assembly Rollover Template', () => {
    let templateBase;

    beforeEach(() => {
        // Create DOM elements
        document.body.innerHTML = `
            <input id="isVIP" value="No" />
            <input id="districtName" value="" />
            <input id="districtState" value="" />
            <input id="issue" value="Assembly Rollover" />
            <input id="formattedSubject" value="" readonly />
        `;

        // Initialize template base
        templateBase = new TemplateBase({
            templateName: 'assembly-rollover',
            subjectLineFormat: 'assembly-rollover',
            additionalFields: ['issue'],
            requiredFields: ['districtName', 'districtState']
        });
    });

    afterEach(() => {
        if (templateBase) {
            templateBase.cleanup();
        }
    });

    test('should format subject line without VIP status', () => {
        document.getElementById('districtName').value = 'Maple School District';
        document.getElementById('districtState').value = 'CA';

        templateBase.initialize();

        const formattedSubject = document.getElementById('formattedSubject').value;
        expect(formattedSubject).toBe('Maple School District • CA | Assembly Rollover');
    });

    test('should format subject line with VIP status', () => {
        document.getElementById('isVIP').value = 'Yes';
        document.getElementById('districtName').value = 'Fairfax County';
        document.getElementById('districtState').value = 'VA';

        templateBase.initialize();

        const formattedSubject = document.getElementById('formattedSubject').value;
        expect(formattedSubject).toBe('VIP | Fairfax County • VA | Assembly Rollover');
    });

    test('should handle missing district state', () => {
        document.getElementById('districtName').value = 'Test District';
        document.getElementById('districtState').value = '';

        templateBase.initialize();

        const formattedSubject = document.getElementById('formattedSubject').value;
        expect(formattedSubject).toBe('Test District | Assembly Rollover');
    });

    test('should handle missing district name', () => {
        document.getElementById('districtName').value = '';
        document.getElementById('districtState').value = 'TX';

        templateBase.initialize();

        const formattedSubject = document.getElementById('formattedSubject').value;
        expect(formattedSubject).toBe('TX | Assembly Rollover');
    });

    test('should update subject line when fields change', (done) => {
        templateBase.initialize();

        // Initial state
        expect(document.getElementById('formattedSubject').value).toBe('Assembly Rollover');

        // Change district name
        const districtNameField = document.getElementById('districtName');
        districtNameField.value = 'New District';
        const event = dom.window.document.createEvent('Event');
        event.initEvent('input', true, true);
        districtNameField.dispatchEvent(event);

        // Wait for update
        setTimeout(() => {
            expect(document.getElementById('formattedSubject').value).toBe('New District | Assembly Rollover');
            done();
        }, 100);
    });

    test('should validate required fields', () => {
        templateBase.initialize();

        const validation = templateBase.validateFields();
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toHaveLength(2);
        expect(validation.errors[0].field).toBe('districtName');
        expect(validation.errors[1].field).toBe('districtState');
    });
}); 