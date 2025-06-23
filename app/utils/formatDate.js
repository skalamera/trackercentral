/**
 * Formats a date string from YYYY-MM-DD to MM/DD/YYYY
 * @param {string} dateString - The date string in YYYY-MM-DD format
 * @returns {string} - The formatted date string in MM/DD/YYYY format, or original string if invalid
 */
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = formatDate;
} 