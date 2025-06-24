# Demo Data Implementation

This document outlines the implementation of the demo data functionality for Tracker Central templates.

## Overview

The demo data functionality allows authorized users to quickly populate form fields with sample data for testing purposes. This feature is restricted to specific authorized users for security reasons.

## User Authorization

The demo button is only visible to authorized users. Currently authorized:
- **Name:** Steve Skalamera
- **User ID:** 67036373043

The authorization check is performed using the Freshworks API to get the logged-in user's information.

## Components

## Implementation Details

### Core Component
- **File**: `app/utils/demoDataHelper.js`
- **Class**: `DemoDataHelper`
- **Purpose**: Provides demo data generation and form population functionality

### Key Features

#### 1. Demo Data Button
- A floating "Fill Demo Data" button is added to each template
- Positioned in the top-right corner with Flask icon
- Styled with hover effects and proper z-index

#### 2. Field Type Support
The system supports all field types used across templates:
- **Text fields**: Auto-populated with realistic sample data
- **Select/Dropdown fields**: Selects first valid option
- **Checkboxes**: Checks the first option in checkbox groups
- **Rich text/Quill editors**: Populated with formatted HTML content
- **Date fields**: Set to current date
- **Email fields**: Populated with sample email addresses
- **Hidden fields**: Skipped appropriately

#### 3. Smart Demo Data
The helper includes template-specific demo data for common fields:
- District names (e.g., "Fairfax County Public Schools")
- User information (names, usernames, emails)
- Technical details (xcodes, realms, BU IDs)
- Issue descriptions with realistic content
- Rich text content with proper HTML formatting

#### 4. Field Relationships
- Respects read-only fields and skips them
- Triggers proper change events to update dependent fields
- Integrates with existing field synchronization logic
- Updates subject lines automatically after population

## Templates Updated

### SIM Templates (9 total)
1. `sim/achievement-levels.js`
2. `sim/assessment-reports.js`
3. `sim/assignment.js`
4. `sim/dashboard.js`
5. `sim/fsa.js`
6. `sim/library-view.js`
7. `sim/orr.js`
8. `sim/plan-teach.js`
9. `sim/reading-log.js`

### Other Templates (4 total)
1. `other/dpt.js`
2. `other/feature-request.js`
3. `other/help-article.js`
4. `other/timeout-extension.js`

### Assembly Templates (2 total)
1. `assembly/assembly.js`
2. `assembly/assembly-rollover.js`

### SEDCUST Templates (1 total)
1. `sedcust/sedcust.js`

## Usage

### For Users
1. Open any template in the application
2. Look for the "Fill Demo Data" button in the top-right corner
3. Click the button to instantly populate all fields with sample data
4. Review and modify the populated data as needed for testing

### For Developers
The demo data helper can be extended by:
1. Adding new field-specific demo data to the `demoData` object
2. Implementing custom field population logic in the `populateField` method
3. Adding new field type support as needed

## Technical Implementation

### Integration Pattern
Each template's `onLoad` function includes:
```javascript
// Add demo data functionality
const demoDataHelper = new DemoDataHelper();

// Handle async addDemoDataButton
(async () => {
    const demoButton = await demoDataHelper.addDemoDataButton();
    if (demoButton) {
        // Store reference to this template configuration
        const templateConfig = window.TRACKER_CONFIGS_FROM_TEMPLATES['template-name'] || module.exports;
        demoButton.addEventListener('click', () => {
            console.log('Demo button clicked for template-name template');
            demoDataHelper.fillDemoData(templateConfig);
        });
    }
})();
```

### Event Handling
- Triggers appropriate input/change events after population
- Integrates with existing template validation and update logic
- Maintains compatibility with subject line formatting systems

## Benefits

1. **Faster Testing**: Eliminates manual data entry for testing purposes
2. **Consistent Data**: Provides realistic, consistent test data across all templates
3. **Quality Assurance**: Enables easier validation of form functionality
4. **Developer Productivity**: Speeds up development and debugging workflows
5. **Training**: Useful for training purposes to show examples of properly filled forms

## Maintenance

The demo data helper is designed to be:
- **Extensible**: Easy to add new demo data or field types
- **Maintainable**: Clear separation of concerns with dedicated utility class
- **Compatible**: Works with existing template architecture without conflicts
- **Reliable**: Includes error handling and fallback mechanisms

## Future Enhancements

Potential improvements could include:
1. Template-specific demo data variations
2. Multiple demo data sets (e.g., VIP vs Standard districts)
3. Demo data export/import functionality
4. Integration with actual test data sources