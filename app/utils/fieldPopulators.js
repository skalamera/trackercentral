/**
 * Field Population Utilities
 * Common functions for populating form fields in tracker templates
 */

/**
 * Populate Application Name field based on product type and product rules
 * Implements the comprehensive rules from program_name_rules.txt
 */
function populateApplicationName() {
    console.log("Attempting to populate Application Name field");

    // Check if we have access to the window.trackerApp
    if (!window.trackerApp || !window.trackerApp.ticketData) {
        console.warn("Cannot populate Application Name: trackerApp not available");
        return;
    }

    const { productType, product, productSubsection } = window.trackerApp.ticketData;
    console.log("Source ticket product data:", { productType, product, productSubsection });

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

    // Rule 1: Always remove "Benchmark" from "cf_product" and add the remainder
    // Rule 2: If "cf_product" = "Not Product Specific", then leave Program Name blank
    // NEW RULE: If cf_product_type IS NOT Supplemental AND both cf_product and cf_product_subsection fields are "null", 
    // then set Program Name to the value of cf_product_type and remove "Benchmark" from "cf_product_type" if present

    if (!product || product === "Not Product Specific" || product === "null") {
        // Check if both product and productSubsection are null/empty and productType is not Supplemental and not "Not Product Specific"
        if ((!product || product === "null") && (!productSubsection || productSubsection === "null") && productType && productType !== "Supplemental" && productType !== "Not Product Specific") {
            // Remove "Benchmark" from the beginning of the product type name
            let processedProductType = productType;
            if (processedProductType.startsWith("Benchmark ")) {
                processedProductType = processedProductType.substring("Benchmark ".length);
                console.log(`Removed 'Benchmark' prefix from product type: "${productType}" -> "${processedProductType}"`);
            }
            applicationName = processedProductType;
            console.log(`Using product type as Program Name: "${processedProductType}"`);
        } else {
            applicationName = "";
            console.log("Product is 'Not Product Specific' or empty, leaving Program Name blank");
        }
    } else {
        // Remove "Benchmark" from the beginning of the product name
        let processedProduct = product;
        if (processedProduct.startsWith("Benchmark ")) {
            processedProduct = processedProduct.substring("Benchmark ".length);
            console.log(`Removed 'Benchmark' prefix from product: "${product}" -> "${processedProduct}"`);
        }

        // Check if product is just a copyright number (like "c2023" or "- c2023")
        const isJustCopyright = processedProduct.match(/^[-]?\s*c\d{4}$/);

        if (isJustCopyright) {
            // When product is just a copyright number, combine productType + product, then remove "Benchmark"
            let combinedName = productType + " " + processedProduct;
            // Remove "Benchmark" from the beginning
            if (combinedName.startsWith("Benchmark ")) {
                combinedName = combinedName.substring("Benchmark ".length);
                console.log(`Combined product type + copyright and removed 'Benchmark': "${productType} ${processedProduct}" -> "${combinedName}"`);
            }
            applicationName = combinedName;
            console.log(`Product is just copyright number, using combined name: "${applicationName}"`);
        }
        // Rule 3: If "cf_product_type" = "Benchmark Advance" AND "cf_product" begins with a "-" or a "c" with 4 numbers
        else if (productType === "Benchmark Advance") {
            if (processedProduct.match(/^[-]?\s*c\d{4}/)) {
                // Product starts with "-" or "c" followed by 4 digits (but not just the copyright)
                applicationName = processedProduct;
                console.log(`Benchmark Advance with special format: "${processedProduct}"`);
            } else {
                // Regular Benchmark Advance product
                applicationName = processedProduct;
                console.log(`Regular Benchmark Advance product: "${processedProduct}"`);
            }
        }
        // Rule 4: If "cf_product_type" = "Benchmark Adelante" AND "cf_product" begins with a "-" or a "c" with 4 numbers
        else if (productType === "Benchmark Adelante") {
            if (processedProduct.match(/^[-]?\s*c\d{4}/)) {
                // Product starts with "-" or "c" followed by 4 digits (but not just the copyright)
                applicationName = processedProduct;
                console.log(`Benchmark Adelante with special format: "${processedProduct}"`);
            } else {
                // Regular Benchmark Adelante product
                applicationName = processedProduct;
                console.log(`Regular Benchmark Adelante product: "${processedProduct}"`);
            }
        }
        // Rule 5: If "cf_product_type" = "Listos Y Adelante" AND "cf_product" begins with a "-" or a "c" with 4 numbers
        else if (productType === "Listos Y Adelante") {
            if (processedProduct.match(/^[-]?\s*c\d{4}/)) {
                // Product starts with "-" or "c" followed by 4 digits (but not just the copyright)
                applicationName = processedProduct;
                console.log(`Listos Y Adelante with special format: "${processedProduct}"`);
            } else {
                // Regular Listos Y Adelante product
                applicationName = processedProduct;
                console.log(`Regular Listos Y Adelante product: "${processedProduct}"`);
            }
        }
        // Rule 6: IF the source ticket "cf_product_type" = "Supplemental" AND "cf_product_subsection" IS NOT "null"
        else if (productType === "Supplemental") {
            if (productSubsection && productSubsection !== "null" && productSubsection.trim() !== "") {
                applicationName = productSubsection;
                console.log(`Supplemental product with subsection: "${productSubsection}"`);
            } else {
                // Rule 7: IF the source ticket "cf_product_type" = "Supplemental" AND "cf_product_subsection" IS "null"
                applicationName = processedProduct;
                console.log(`Supplemental product without subsection: "${processedProduct}"`);
            }
        }
        // Handle other product types
        else if (productType === "Assess 360") {
            applicationName = "Assess 360";
        } else if (productType === "Benchmark Workshop") {
            applicationName = "Workshop";
        } else if (productType === "Benchmark Taller") {
            applicationName = "Taller";
        } else if (productType === "Ready To Advance") {
            applicationName = "Ready To Advance";
        } else if (productType === "Plan & Teach") {
            applicationName = "Plan & Teach";
        } else {
            // Default case: use the processed product name
            applicationName = processedProduct;
            console.log(`Default case for product type "${productType}": "${processedProduct}"`);
        }
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
 * Populate Jira custom fields based on rules from jira_fields_rules.txt
 * @param {Object} sourceTicketData - The source ticket data containing custom fields
 * @returns {Object} Object containing cf_jira_copyright and cf_jira_product_name values
 */
function populateJiraFields(sourceTicketData) {
    console.log("Attempting to populate Jira custom fields");

    if (!sourceTicketData || !sourceTicketData.custom_fields) {
        console.warn("Cannot populate Jira fields: source ticket data not available");
        return {
            cf_jira_copyright: "",
            cf_jira_product_name: ""
        };
    }

    const { cf_product_type, cf_product, cf_product_subsection } = sourceTicketData.custom_fields;
    console.log("Source ticket product data for Jira fields:", { cf_product_type, cf_product, cf_product_subsection });

    let cf_jira_copyright = "";
    let cf_jira_product_name = "";

    // RULE 1: Populate cf_jira_copyright
    if (cf_product_type && cf_product_type !== "Supplemental" && cf_product) {
        // Check if product contains a "c" with 4 numbers or "- c" pattern
        const copyrightMatch = cf_product.match(/c\d{4}|-\s*c\d{4}/i);
        if (copyrightMatch) {
            cf_jira_copyright = copyrightMatch[0];
            console.log(`Jira Copyright populated: "${cf_jira_copyright}"`);
        } else {
            console.log("No copyright pattern found in product, leaving cf_jira_copyright blank");
        }
    } else {
        console.log("Product type is Supplemental or missing, leaving cf_jira_copyright blank");
    }

    // RULES 2-5: Populate cf_jira_product_name
    if (cf_product_type && cf_product_type !== "Supplemental" && cf_product) {
        // Check if product contains a "c" with 4 numbers, "- c" pattern, or "Pilots"/"Pilot"
        const hasCopyrightPattern = cf_product.match(/c\d{4}|-\s*c\d{4}/i);
        const hasPilotPattern = cf_product.match(/Pilots?/i);

        if (hasCopyrightPattern || hasPilotPattern) {
            // RULE 2: Use cf_product_type value
            cf_jira_product_name = cf_product_type;
            console.log(`Jira Product Name populated with product type: "${cf_jira_product_name}"`);
        } else {
            // RULE 3: Use cf_product value
            cf_jira_product_name = cf_product;
            console.log(`Jira Product Name populated with product: "${cf_jira_product_name}"`);
        }
    } else if (cf_product_type === "Supplemental") {
        // RULE 4 & 5: Handle Supplemental products
        if (cf_product_subsection && cf_product_subsection !== "null" && cf_product_subsection.trim() !== "") {
            // RULE 4: Use cf_product_subsection
            cf_jira_product_name = cf_product_subsection;
            console.log(`Jira Product Name populated with subsection: "${cf_jira_product_name}"`);
        } else if (cf_product) {
            // RULE 5: Use cf_product
            cf_jira_product_name = cf_product;
            console.log(`Jira Product Name populated with product: "${cf_jira_product_name}"`);
        } else {
            console.log("Supplemental product with no subsection or product, leaving cf_jira_product_name blank");
        }
    } else {
        console.log("No valid product type or product found, leaving cf_jira_product_name blank");
    }

    return {
        cf_jira_copyright,
        cf_jira_product_name
    };
}

/**
 * Populate SEDCUST-specific custom fields based on mapping from sedcust_jia_field_map.txt
 * @param {Object} formData - The form data from the SEDCUST template
 * @returns {Object} Object containing the mapped custom field values
 */
function populateSedcustFields(formData) {
    console.log("Attempting to populate SEDCUST custom fields");

    if (!formData) {
        console.warn("Cannot populate SEDCUST fields: form data not available");
        return {};
    }

    const customFields = {};

    // 1. District State > cf_jira_locale
    if (formData.districtState) {
        customFields.cf_jira_locale = formData.districtState;
        console.log(`SEDCUST: Set cf_jira_locale to "${formData.districtState}"`);
    }

    // 2. Digital and/or Print Impact > cf_jira_print_digital
    // Only populate if the value is either "Digital" or "Print"
    if (formData.impactType && (formData.impactType === "Digital" || formData.impactType === "Print")) {
        customFields.cf_jira_print_digital = formData.impactType;
        console.log(`SEDCUST: Set cf_jira_print_digital to "${formData.impactType}"`);
    } else if (formData.impactType) {
        console.log(`SEDCUST: Skipping cf_jira_print_digital - value "${formData.impactType}" is not "Digital" or "Print"`);
    }

    // 3. Subscription Version > cf_jira_version
    // Only populate if the value is a number (contains digits)
    if (formData.version && formData.version !== "Other" && formData.version.trim() !== "" && /\d/.test(formData.version)) {
        customFields.cf_jira_version = formData.version;
        console.log(`SEDCUST: Set cf_jira_version to "${formData.version}"`);
    } else if (formData.version === "Other") {
        console.log(`SEDCUST: Skipping cf_jira_version - value is "Other"`);
    } else if (formData.version && !/\d/.test(formData.version)) {
        console.log(`SEDCUST: Skipping cf_jira_version - value "${formData.version}" is not a number`);
    }

    // 4. Resource > cf_sedcust_jira_resource
    if (formData.resource) {
        customFields.cf_sedcust_jira_resource = formData.resource;
        console.log(`SEDCUST: Set cf_sedcust_jira_resource to "${formData.resource}"`);
    }

    // 5. State/National > cf_jira_state_district_variation
    // Treat "Other" as blank
    if (formData.versionState && formData.versionState !== "Other" && formData.versionState.trim() !== "") {
        customFields.cf_jira_state_district_variation = formData.versionState;
        console.log(`SEDCUST: Set cf_jira_state_district_variation to "${formData.versionState}"`);
    } else if (formData.versionState === "Other") {
        console.log(`SEDCUST: Skipping cf_jira_state_district_variation - value is "Other"`);
    }

    console.log("SEDCUST custom fields populated:", customFields);
    return customFields;
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

                    // Check if we need to populate from district name
                    const districtNameField = document.getElementById('districtName');
                    if (districtNameField && districtNameField.value) {
                        console.log("Attempting to populate district state from district name pattern");

                        // Try to extract state from district name if it follows common patterns
                        const districtName = districtNameField.value.trim();
                        const stateMatch = districtName.match(/\b([A-Z]{2})\b$/) || districtName.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);

                        if (stateMatch) {
                            const extractedState = stateMatch[1];
                            console.log(`Extracted state from district name: ${extractedState}`);
                            districtStateField.value = extractedState;

                            // Trigger change event
                            const event = new Event('input', { bubbles: true });
                            districtStateField.dispatchEvent(event);
                        } else {
                            console.log("Could not extract state from district name pattern");
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching company data:", error);

                // Fallback: Set a default message or leave empty
                console.log("Using fallback approach for district state");
            }
        } else {
            console.log("No company ID found in ticket data");

            // Try to get district state from the source ticket custom fields
            if (window.trackerApp && window.trackerApp.ticketData && window.trackerApp.ticketData.districtState) {
                const stateValue = window.trackerApp.ticketData.districtState;
                console.log(`Using district state from ticket data: ${stateValue}`);
                districtStateField.value = stateValue;

                // Trigger change event
                const event = new Event('input', { bubbles: true });
                districtStateField.dispatchEvent(event);
            }
        }
    } catch (error) {
        console.error("Error in populateDistrictState:", error);

        // Log the error but don't clear the field
        console.log("Error in populateDistrictState, field value will remain unchanged");
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
        populateVIPStatus,
        populateJiraFields,
        populateSedcustFields
    };
}

// Make functions available globally for browser environment
if (typeof window !== 'undefined') {
    window.populateApplicationName = populateApplicationName;
    window.populateDistrictState = populateDistrictState;
    window.populateVIPStatus = populateVIPStatus;
    window.populateJiraFields = populateJiraFields;
    window.populateSedcustFields = populateSedcustFields;
} 