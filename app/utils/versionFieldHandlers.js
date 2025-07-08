/**
 * Version Field Handler Utilities
 * Functions for handling custom version inputs in tracker templates
 */

/**
 * Set up custom version input when "Other" is selected
 */
function setupCustomVersionInput() {
    console.log("Setting up custom version input handler");

    // Find the version dropdown
    const versionSelect = document.getElementById('version');
    if (!versionSelect) {
        console.warn("Version dropdown not found");
        return;
    }

    // Function to handle change in version dropdown
    const handleVersionChange = function () {
        // Check if current container already has a custom input field
        let customInputContainer = document.getElementById('customVersionContainer');

        // If "Other" is selected, create a custom input field if it doesn't exist
        if (versionSelect.value === "Other") {
            console.log("Other selected, handling custom input field");

            // If the container doesn't exist yet, create it
            if (!customInputContainer) {
                console.log("Creating new custom input field");

                // Create container for custom input
                customInputContainer = document.createElement('div');
                customInputContainer.id = 'customVersionContainer';
                customInputContainer.className = 'form-group';
                customInputContainer.style.marginTop = '10px';

                // Create label for custom input
                const label = document.createElement('label');
                label.textContent = 'Custom Version';
                label.className = 'control-label';

                // Create input field
                const customInput = document.createElement('input');
                customInput.type = 'text';
                customInput.id = 'customVersion';
                customInput.className = 'form-control';
                customInput.placeholder = 'Enter custom version';

                // Retrieve any previous custom value if available
                if (versionSelect.hasAttribute('data-custom-value')) {
                    customInput.value = versionSelect.getAttribute('data-custom-value');
                }

                // Add event listener to update version value
                customInput.addEventListener('input', function () {
                    // Always store the current value, even if empty
                    versionSelect.setAttribute('data-custom-value', customInput.value);

                    // Trigger change event for subject line update
                    const event = new Event('change', { bubbles: true });
                    versionSelect.dispatchEvent(event);
                });

                // Append elements to container
                customInputContainer.appendChild(label);
                customInputContainer.appendChild(customInput);

                // Insert container after version select
                versionSelect.parentNode.insertBefore(customInputContainer, versionSelect.nextSibling);

                // Focus the input field to make it immediately usable
                setTimeout(() => {
                    customInput.focus();
                }, 50);
            }
        } else {
            // If not "Other", remove the custom input container if it exists
            if (customInputContainer) {
                customInputContainer.remove();
            }
        }
    };

    // Add event listener to version dropdown
    versionSelect.addEventListener('change', handleVersionChange);

    // Run once on load in case "Other" is already selected
    handleVersionChange();
}

/**
 * Set up custom version state input when "Other" is selected
 */
function setupCustomVersionStateInput() {
    console.log("Setting up custom version state input handler");

    // Find the version state dropdown
    const versionStateSelect = document.getElementById('versionState');
    if (!versionStateSelect) {
        console.warn("Version state dropdown not found");
        return;
    }

    // Function to handle change in version state dropdown
    const handleVersionStateChange = function () {
        // Check if current container already has a custom input field
        let customInputContainer = document.getElementById('customVersionStateContainer');

        // If "Other" is selected, create a custom input field if it doesn't exist
        if (versionStateSelect.value === "Other") {
            console.log("Other selected for version state, handling custom input field");

            // If the container doesn't exist yet, create it
            if (!customInputContainer) {
                console.log("Creating new custom version state input field");

                // Create container for custom input
                customInputContainer = document.createElement('div');
                customInputContainer.id = 'customVersionStateContainer';
                customInputContainer.className = 'form-group';
                customInputContainer.style.marginTop = '10px';

                // Create label for custom input
                const label = document.createElement('label');
                label.textContent = 'Custom State/Location';
                label.className = 'control-label';

                // Create input field
                const customInput = document.createElement('input');
                customInput.type = 'text';
                customInput.id = 'customVersionState';
                customInput.className = 'form-control';
                customInput.placeholder = 'Enter custom state/location';

                // Retrieve any previous custom value if available
                if (versionStateSelect.hasAttribute('data-custom-value')) {
                    customInput.value = versionStateSelect.getAttribute('data-custom-value');
                }

                // Add event listener to update version state value
                customInput.addEventListener('input', function () {
                    // Always store the current value, even if empty
                    versionStateSelect.setAttribute('data-custom-value', customInput.value);

                    // Trigger change event for subject line update
                    const event = new Event('change', { bubbles: true });
                    versionStateSelect.dispatchEvent(event);

                    // Also trigger input event for any listeners that might be listening for that
                    const inputEvent = new Event('input', { bubbles: true });
                    versionStateSelect.dispatchEvent(inputEvent);
                });

                // Append elements to container
                customInputContainer.appendChild(label);
                customInputContainer.appendChild(customInput);

                // Insert container after version state select
                versionStateSelect.parentNode.insertBefore(customInputContainer, versionStateSelect.nextSibling);

                // Focus the input field to make it immediately usable
                setTimeout(() => {
                    customInput.focus();
                }, 50);
            }
        } else {
            // If not "Other", remove the custom input container if it exists
            if (customInputContainer) {
                customInputContainer.remove();
            }
        }
    };

    // Add event listener to version state dropdown
    versionStateSelect.addEventListener('change', handleVersionStateChange);

    // Run once on load in case "Other" is already selected
    handleVersionStateChange();
}

/**
 * Get version value (custom or selected)
 * @param {HTMLElement} versionField - The version select element
 * @returns {string} - The version value
 */
function getVersionValue(versionField) {
    if (versionField.value === "Other" && versionField.hasAttribute('data-custom-value')) {
        return versionField.getAttribute('data-custom-value');
    }
    return versionField.value;
}

/**
 * Get version state value (custom or selected)
 * @param {HTMLElement} versionStateField - The version state select element
 * @returns {string} - The version state value
 */
function getVersionStateValue(versionStateField) {
    if (versionStateField.value === "Other" && versionStateField.hasAttribute('data-custom-value')) {
        return versionStateField.getAttribute('data-custom-value');
    }
    return versionStateField.value;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupCustomVersionInput,
        setupCustomVersionStateInput,
        getVersionValue,
        getVersionStateValue
    };
}

// Also make functions available globally in browser environment
if (typeof window !== 'undefined') {
    window.setupCustomVersionInput = setupCustomVersionInput;
    window.setupCustomVersionStateInput = setupCustomVersionStateInput;
    window.getVersionValue = getVersionValue;
    window.getVersionStateValue = getVersionStateValue;
} 