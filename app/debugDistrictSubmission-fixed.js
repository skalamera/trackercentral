// Fixed debugDistrictSubmission method
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