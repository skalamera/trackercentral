function selectTemplate(templateType) {
    console.log(`Selected template: ${templateType}`);

    // Get stored ticket data
    const ticketData = localStorage.getItem('ticketData');

    if (ticketData) {
        try {
            const parsedData = JSON.parse(ticketData);
            console.log(`Processing ticket data for ${templateType}:`, parsedData);

            // Prepare data to pass to the modal
            const dataToPass = {
                currentTicketId: parsedData.id,
                isVip: false,
                districtName: '',
                requesterEmail: parsedData.requester?.email || '',
                priority: parsedData.priority || 2 // Default to Medium (2) if not available
            };

            // Try to get VIP status from custom fields
            if (parsedData.custom_fields) {
                const vipFields = ['cf_vip', 'vip', 'cf_vip_status', 'vip_customer', 'cf_vip_client', 'cf_is_vip'];
                for (const field of vipFields) {
                    if (parsedData.custom_fields[field] !== undefined) {
                        const value = parsedData.custom_fields[field];
                        dataToPass.isVip = (typeof value === 'boolean') ? value :
                            (typeof value === 'string') ? (value.toLowerCase() === 'yes' || value.toLowerCase() === 'true') :
                                (typeof value === 'number') ? (value !== 0) : false;
                        break;
                    }
                }
            }

            // Try to get district name from custom fields
            if (parsedData.custom_fields) {
                const districtFields = ['cf_district509811', 'cf_district', 'district', 'cf_school_district', 'cf_district_name'];
                for (const field of districtFields) {
                    if (parsedData.custom_fields[field]) {
                        dataToPass.districtName = parsedData.custom_fields[field];
                        break;
                    }
                }
            }

            // Store the processed data in localStorage for the dynamic template to retrieve
            localStorage.setItem(`${templateType}Data`, JSON.stringify(dataToPass));
            console.log(`Stored ${templateType} data in localStorage:`, dataToPass);
        } catch (error) {
            console.error("Error processing ticket data:", error);
        }
    }

    // Navigate to the dynamic template with the type parameter
    window.location.href = `dynamic-tracker.html?type=${templateType}`;
    return;
} 