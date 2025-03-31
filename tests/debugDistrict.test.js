// Import the function to test
// Since the function is defined in a file without exports, we'll define it again
function debugDistrictSubmission(ticketData) {
    console.group('District Field Submission Debug');
    console.log('Final ticket data for submission:', ticketData);

    // Check custom fields specifically
    if (ticketData.custom_fields) {
        console.log('Custom fields being submitted:');
        Object.keys(ticketData.custom_fields).forEach(key => {
            console.log(`${key}: ${ticketData.custom_fields[key]} (${typeof ticketData.custom_fields[key]})`);
        });

        // Only check for cf_district509811 field
        console.log('District dropdown field (cf_district509811):',
            ticketData.custom_fields.cf_district509811 || 'NOT SET');
    } else {
        console.warn('No custom fields found in ticket data!');
    }

    console.groupEnd();
}

describe('debugDistrictSubmission', () => {
    // Save original console methods
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleGroup = console.group;
    const originalConsoleGroupEnd = console.groupEnd;

    beforeEach(() => {
        // Mock console methods before each test
        console.log = jest.fn();
        console.warn = jest.fn();
        console.group = jest.fn();
        console.groupEnd = jest.fn();
    });

    afterEach(() => {
        // Restore original console methods after each test
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
        console.group = originalConsoleGroup;
        console.groupEnd = originalConsoleGroupEnd;
    });

    test('should output ticket data correctly', () => {
        const ticketData = {
            id: 123,
            subject: 'Test Ticket',
            custom_fields: {
                cf_district509811: 'District A',
                cf_other_field: 'Other Value'
            }
        };

        debugDistrictSubmission(ticketData);

        // Verify console.group was called
        expect(console.group).toHaveBeenCalledWith('District Field Submission Debug');

        // Verify ticket data was logged
        expect(console.log).toHaveBeenCalledWith('Final ticket data for submission:', ticketData);

        // Verify custom fields message was logged
        expect(console.log).toHaveBeenCalledWith('Custom fields being submitted:');

        // Verify each custom field was logged
        expect(console.log).toHaveBeenCalledWith('cf_district509811: District A (string)');
        expect(console.log).toHaveBeenCalledWith('cf_other_field: Other Value (string)');

        // Verify district field was specifically logged
        expect(console.log).toHaveBeenCalledWith(
            'District dropdown field (cf_district509811):',
            'District A'
        );

        // Verify console.groupEnd was called
        expect(console.groupEnd).toHaveBeenCalled();
    });

    test('should handle missing district field', () => {
        const ticketData = {
            id: 123,
            subject: 'Test Ticket',
            custom_fields: {
                cf_other_field: 'Other Value'
            }
        };

        debugDistrictSubmission(ticketData);

        // Verify district field was logged as NOT SET
        expect(console.log).toHaveBeenCalledWith(
            'District dropdown field (cf_district509811):',
            'NOT SET'
        );
    });

    test('should handle missing custom_fields', () => {
        const ticketData = {
            id: 123,
            subject: 'Test Ticket'
        };

        debugDistrictSubmission(ticketData);

        // Verify warning about missing custom fields
        expect(console.warn).toHaveBeenCalledWith('No custom fields found in ticket data!');
    });

    test('should handle empty custom_fields object', () => {
        const ticketData = {
            id: 123,
            subject: 'Test Ticket',
            custom_fields: {}
        };

        debugDistrictSubmission(ticketData);

        // No fields should be logged
        expect(console.log).toHaveBeenCalledWith('Custom fields being submitted:');

        // District field should be NOT SET
        expect(console.log).toHaveBeenCalledWith(
            'District dropdown field (cf_district509811):',
            'NOT SET'
        );
    });

    test('should handle null ticketData', () => {
        // This should throw an error since we're trying to access properties of null
        expect(() => {
            debugDistrictSubmission(null);
        }).toThrow();
    });

    test('should handle different data types in custom fields', () => {
        const ticketData = {
            id: 123,
            subject: 'Test Ticket',
            custom_fields: {
                cf_district509811: 'District A',
                cf_number_field: 42,
                cf_boolean_field: true,
                cf_null_field: null
            }
        };

        debugDistrictSubmission(ticketData);

        // Verify each custom field was logged with correct type
        expect(console.log).toHaveBeenCalledWith('cf_district509811: District A (string)');
        expect(console.log).toHaveBeenCalledWith('cf_number_field: 42 (number)');
        expect(console.log).toHaveBeenCalledWith('cf_boolean_field: true (boolean)');
        expect(console.log).toHaveBeenCalledWith('cf_null_field: null (object)');
    });
}); 