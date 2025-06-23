/**
 * Field Population Utilities
 * Common functions for populating form fields in tracker templates
 */

/**
 * Populate Application Name field based on product type and product rules
 */
function populateApplicationName() {
    console.log("Attempting to populate Application Name field");

    // Check if we have access to the window.trackerApp
    if (!window.trackerApp || !window.trackerApp.ticketData) {
        console.warn("Cannot populate Application Name: trackerApp not available");
        return;
    }

    const { productType, product } = window.trackerApp.ticketData;
    console.log("Source ticket product data:", { productType, product });

    // Find the application field
    const applicationField = document.getElementById('application');
    if (!applicationField) {
        console.warn("Cannot populate Application Name: application field not found");
        return;
    }

    // Only populate if the field is empty
    if (applicationField.value) {
        console.log("Application field already has a value, not overwriting");
        return;
    }

    let applicationName = "";

    // Apply the rules
    if (!productType || productType === "Not Product Specific") {
        // Leave the Application Name blank
        applicationName = "";
    } else if (productType === "Assess 360") {
        applicationName = "Assess 360";
    } else if (productType === "Benchmark Workshop") {
        applicationName = "Workshop";
    } else if (productType === "Benchmark Taller") {
        applicationName = "Taller";
    } else if (productType === "Ready To Advance") {
        applicationName = "Ready To Advance";
    } else if (productType === "Benchmark Advance") {
        // Rule: If Product type = "Benchmark Advance" AND Product = "Benchmark Advance", then Application Name = "Advance"
        if (product === "Benchmark Advance") {
            applicationName = "Advance";
        } else {
            // Combine with product value and use "Advance" shortening
            applicationName = "Advance";
            if (product) {
                applicationName += ` ${product}`;
            }
        }
    } else if (productType === "Benchmark Adelante") {
        // Rule: If Product type = "Benchmark Adelante" AND Product = "Adelante", then Application Name = "Adelante"
        if (product === "Adelante") {
            applicationName = "Adelante";
        } else {
            // Combine with product value and use "Adelante" shortening
            applicationName = "Adelante";
            if (product) {
                applicationName += ` ${product}`;
            }
        }
    } else if (productType === "Listos Y Adelante") {
        applicationName = "Listos Y Adelante";
        if (product) {
            applicationName += ` ${product}`;
        }
    } else if (productType === "Supplemental") {
        // Just use the product value
        applicationName = product || "";
    } else if (productType === "Plan & Teach") {
        applicationName = "Plan & Teach";
    }

    // Set the application field value
    if (applicationName) {
        applicationField.value = applicationName;
        console.log(`Application Name field populated with: "${applicationName}"`);

        // Trigger any listeners on the application field (like subject line formatters)
        const event = new Event('input', { bubbles: true });
        applicationField.dispatchEvent(event);
    } else {
        console.log("No Application Name to populate based on the rules");
    }
}

/**
 * Fetch and populate district state from company data
 */
async function populateDistrictState() {
    try {
        console.log("Attempting to fetch and populate district state");

        // Access client through the global trackerApp instance
        if (!window.trackerApp || !window.trackerApp.client) {
            console.error("TrackerApp or client not available");
            return;
        }

        // Get the district state field
        const districtStateField = document.getElementById('districtState');
        if (!districtStateField) {
            console.log("District state field not found");
            return;
        }

        // Skip if the field already has a value
        if (districtStateField.value) {
            console.log("District state already has a value:", districtStateField.value);
            return;
        }

        // Try to get ticket data
        const ticketData = await window.trackerApp.client.data.get("ticket");
        if (ticketData && ticketData.ticket && ticketData.ticket.company_id) {
            const companyId = ticketData.ticket.company_id;
            console.log("Found company ID:", companyId);

            // Fetch company data to get state
            try {
                const response = await window.trackerApp.client.request.invokeTemplate("getCompanyDetails", {
                    context: { companyId: companyId }
                });

                const companyData = JSON.parse(response.response);
                console.log("Company data:", companyData);

                // Extract state from custom fields
                if (companyData && companyData.custom_fields && companyData.custom_fields.state) {
                    const stateValue = companyData.custom_fields.state;
                    console.log(`Found company state: ${stateValue}`);

                    // Set the district state field with the retrieved state
                    districtStateField.value = stateValue;
                    console.log(`Set district state field to: ${stateValue}`);

                    // Trigger change event to update subject line
                    const event = new Event('input', { bubbles: true });
                    districtStateField.dispatchEvent(event);
                } else {
                    console.log("Company data doesn't contain state custom field");
                }
            } catch (error) {
                console.error("Error fetching company data:", error);
            }
        } else {
            console.log("No company ID found in ticket data");
        }
    } catch (error) {
        console.error("Error in populateDistrictState:", error);
    }
}

/**
 * Populate VIP Status field based on ticket data
 */
function populateVIPStatus() {
    console.log("Attempting to populate VIP Status field");

    // Check if we have access to the window.trackerApp
    if (!window.trackerApp || !window.trackerApp.ticketData) {
        console.warn("Cannot populate VIP Status: trackerApp not available");
        return;
    }

    const { isVip } = window.trackerApp.ticketData;
    console.log("Source ticket VIP status:", isVip);

    // Find the isVIP field
    const isVIPField = document.getElementById('isVIP');
    if (!isVIPField) {
        console.warn("Cannot populate VIP Status: isVIP field not found");
        return;
    }

    // Always set the VIP status based on ticket data
    const previousValue = isVIPField.value;

    // Set the VIP status
    if (isVip === true) {
        isVIPField.value = "Yes";
        console.log(`VIP Status field set to: Yes (previous value was: ${previousValue})`);
    } else {
        isVIPField.value = "No";
        console.log(`VIP Status field set to: No (previous value was: ${previousValue})`);
    }

    // Trigger change event to update subject line
    // Add a small delay to ensure the value is properly set
    setTimeout(() => {
        const event = new Event('change', { bubbles: true });
        isVIPField.dispatchEvent(event);
        console.log("VIP Status change event dispatched");
    }, 100);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        populateApplicationName,
        populateDistrictState,
        populateVIPStatus
    };
} 