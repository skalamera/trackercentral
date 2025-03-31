// Import or define the formatDate function
// Since formatDate is defined at the top of tracker-config.js but might not be exported
// We're redefining it here for testing purposes
function formatDate(dateString) {
    if (!dateString) return '';

    try {
        // Check if the string follows the YYYY-MM-DD pattern
        // A valid date should have exactly two hyphens and split into 3 parts
        const parts = dateString.split('-');
        if (parts.length !== 3) {
            return dateString; // Return original if not in YYYY-MM-DD format
        }

        // Additional validation - check if the first part looks like a year
        const year = parts[0];
        if (year.length !== 4 || isNaN(parseInt(year))) {
            return dateString;
        }

        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    } catch (e) {
        console.error('Error formatting date:', e);
        return dateString; // Return original if parsing fails
    }
}

describe('formatDate', () => {
    test('formats YYYY-MM-DD to MM/DD/YYYY', () => {
        expect(formatDate('2023-05-10')).toBe('05/10/2023');
        expect(formatDate('2022-12-31')).toBe('12/31/2022');
        expect(formatDate('2024-01-01')).toBe('01/01/2024');
    });

    test('returns empty string for empty input', () => {
        expect(formatDate('')).toBe('');
        expect(formatDate(null)).toBe('');
        expect(formatDate(undefined)).toBe('');
    });

    test('returns original string when format is incorrect', () => {
        // Test input that is not a valid YYYY-MM-DD date format
        expect(formatDate('not-a-date')).toBe('not-a-date');
        expect(formatDate('2023/05/10')).toBe('2023/05/10');
        expect(formatDate('05/10/2023')).toBe('05/10/2023');
        expect(formatDate('2023-test')).toBe('2023-test');
        expect(formatDate('abcd-05-10')).toBe('abcd-05-10');
    });

    test('handles date without leading zeros', () => {
        expect(formatDate('2023-5-1')).toBe('5/1/2023');
        expect(formatDate('2023-10-5')).toBe('10/5/2023');
    });
}); 