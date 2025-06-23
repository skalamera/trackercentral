// Create a mock DOM environment for testing
class MockEvent {
    constructor(type) {
        this.type = type;
    }
}

// Polyfill global Event if it doesn't exist
global.Event = MockEvent;

// Mock browser objects that our code expects
global.document = {
    getElementById: jest.fn(),
    querySelectorAll: jest.fn(),
    querySelector: jest.fn(),
    createElement: jest.fn(),
    head: { appendChild: jest.fn() },
    addEventListener: jest.fn()
};

// Mock console methods to prevent test output clutter
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Mock formatDate function if it's not exported from the module
global.formatDate = function (dateString) {
    if (!dateString) return '';

    try {
        const [year, month, day] = dateString.split('-');
        return `${month}/${day}/${year}`;
    } catch (e) {
        return dateString; // Return original if parsing fails
    }
};

// Mock window object
global.window = {
    addEventListener: jest.fn()
};

// Mock setTimeout and setInterval
global.setTimeout = jest.fn(fn => fn());
global.setInterval = jest.fn();

// Mock utility functions from fieldPopulators.js
global.populateApplicationName = jest.fn();
global.populateDistrictState = jest.fn();

// Mock utility functions from versionFieldHandlers.js
global.setupCustomVersionInput = jest.fn();
global.setupCustomVersionStateInput = jest.fn();
global.getVersionValue = jest.fn().mockReturnValue('');
global.getVersionStateValue = jest.fn().mockReturnValue('');

// Mock utility functions from quillHelpers.js
global.setupClearFormattingButton = jest.fn();
global.addFormatButtonToQuillDefaults = jest.fn();

// Load TemplateBase class
const TemplateBase = require('../app/utils/templateBase');
global.TemplateBase = TemplateBase;

// Export the TRACKER_CONFIGS mock for tests that need to mock it
module.exports = {
    mockTrackerConfig: () => ({
        title: 'Mock Template',
        icon: 'fa-mock',
        description: 'Mock Description',
        sections: [
            {
                id: 'mock-section',
                title: 'MOCK SECTION',
                icon: 'fa-mock-section',
                fields: [
                    { id: 'mockField', type: 'text', label: 'Mock Field', required: true }
                ]
            }
        ],
        descriptionGenerator: (fields) => {
            return '<div>Mock description</div>';
        }
    })
}; 