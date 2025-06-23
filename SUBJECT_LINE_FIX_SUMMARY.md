# Subject Line Fix Summary

## Issues Fixed

### 1. Feature Request, Timeout Extension, and Assembly Rollover Templates
**Problem**: Formatted subject lines were blank and didn't dynamically update.

**Root Cause**: The TemplateBase class was missing the `fields` configuration mapping, which tells it which DOM element IDs correspond to which fields. Additionally, the templates were calling the legacy `initialize()` method which overwrites the field mappings.

**Fix**: 
- Added `fields` configuration to each template's TemplateBase initialization
- Changed from `initialize()` to `initializeSubjectLineFormatting()` to use the new field mapping system
- Added delayed subject line update after initialization
- Added `formattedSubject` to all field mappings

### 2. Assembly Template 
**Problem**: Subject line didn't include subscription version, state/national value, xcode, or apply correct formatting when "Multiple Xcodes" is set to yes.

**Solution**: 
- Added `fields` configuration to properly map all required fields
- Updated TemplateBase to use global version field handler functions
- Changed from `initialize()` to `initializeSubjectLineFormatting()`

### 3. DPT Template
**Problem**: 
- Subject line showed incorrect district
- Subject line format used parentheses instead of bullet points
- VIP status was not showing in subject line

**Solution**:
- Added `fields` configuration mapping
- Updated format to use "DPT • Customized eAssessments - District Admin" (with bullet points)
- Added cases for 'dpt' format type in formatSubjectLine switch statement

### 4. Timeout Extension Template
**Problem**: VIP status was not showing in subject line

**Solution**:
- Added case for 'timeout-extension' format type in formatSubjectLine switch statement
- Fixed null check issues in formatTimeoutExtensionSubjectLine when district fields might be empty

### 5. VIP Status Auto-Population
**Problem**: VIP status wasn't being populated from ticket data

**Solution**:
- Created `populateVIPStatus()` function in fieldPopulators.js that reads VIP status from ticket data
- Added calls to this function in all templates that have VIP fields (DPT, Timeout Extension, Feature Request, Assembly, Assembly Rollover)
- Updated the function to always set the value based on ticket data (not skip if field has a value)

## Technical Changes

### TemplateBase.js
- Added cases in formatSubjectLine for: 'dpt', 'timeout-extension', 'help-article', 'feature-request'
- Added detailed logging for debugging field changes and subject line formatting
- Fixed null handling in formatTimeoutExtensionSubjectLine

### Template Files
All affected templates now:
- Use `initializeSubjectLineFormatting()` instead of `initialize()`
- Have proper `fields` configuration mapping
- Include delayed subject line updates (500ms and 1000ms)
- Call `populateVIPStatus()` in their onLoad functions

### Key Patterns
1. Field mappings must include all fields that affect subject line
2. Subject line formatters must be accessible through the switch statement in formatSubjectLine
3. VIP status must be populated from ticket data, not just left at default values
4. Multiple delayed updates ensure subject line is correct even if fields are populated asynchronously

## SEDCUST VIP Priority Feature

### New Functionality Added
When creating a SEDCUST tracker ticket:
- If VIP status is "Yes", the ticket priority is automatically set to 4 (Urgent)
- VIP status is auto-populated from the source ticket data
- Priority updates dynamically when VIP status changes

### Technical Implementation
1. **In dynamic-tracker.js**: Added VIP check in the `createTicket` method that overrides the priority to 4 when:
   - Template type is 'sedcust'
   - isVIP field value is 'Yes'

2. **In sedcust.js**: 
   - Added `populateVIPStatus()` call to auto-populate VIP status from ticket data
   - Added event listener to isVIP field that updates priority to 4 when VIP is selected
   - Added initial check on template load to set priority if VIP

### Issue Resolution
The original issue was that priority was being loaded from stored data (priority 3) and not being overridden for VIP SEDCUST tickets. The fix ensures that:
- Priority is set to Urgent (4) immediately when the template loads if VIP is "Yes"
- Priority updates dynamically if VIP status is changed
- The VIP priority override happens both in the template and during ticket creation

This ensures that VIP districts get proper priority treatment when content/editorial issues are escalated.

## Technical Details

### New Function: populateVIPStatus()
Added to `app/utils/fieldPopulators.js`:
- Reads VIP status from `window.trackerApp.ticketData.isVip`
- Automatically sets the isVIP field to "Yes" or "No"
- Triggers change event to update subject line

### TemplateBase Changes
The TemplateBase class now:
1. Has two initialization methods:
   - `initialize()` - Legacy method that uses DOM element collection (deprecated)
   - `initializeSubjectLineFormatting()` - New method that uses field mappings
2. Includes debug logging for VIP status in DPT and Timeout Extension formatters
3. Uses field mappings to properly retrieve values

### Template Configuration Format
All affected templates now:
1. Include a `fields` object in their TemplateBase configuration
2. Call `populateVIPStatus()` in their onLoad functions
3. Use `initializeSubjectLineFormatting()` instead of `initialize()`

## Testing Notes
To test these fixes:
1. Navigate to http://127.0.0.1:3001/template-selector.html
2. Test each template with a VIP ticket:
   - **DPT**: Should show `VIP * DISTRICT • STATE | DPT • Customized eAssessments - District Admin`
   - **Timeout Extension**: Should show `VIP * DISTRICT • STATE | Timeout Extension`
   - **Feature Request**: Should show `VIP * DISTRICT • STATE | Program • Version | Resource: • Short Description`
   - **Assembly Rollover**: Should show `VIP DISTRICT • STATE | Assembly Rollover`
   - **Assembly**: Should show all parts including Xcode

## Files Modified
- `app/templates/other/feature-request.js` - Added populateVIPStatus call
- `app/templates/other/timeout-extension.js` - Added populateVIPStatus call
- `app/templates/assembly/assembly-rollover.js` - Added populateVIPStatus call
- `app/templates/assembly/assembly.js` - Added populateDistrictState and populateVIPStatus calls
- `app/templates/other/dpt.js` - Added populateVIPStatus call, fixed format function
- `app/utils/templateBase.js` - Fixed DPT format function, added debug logging
- `app/utils/fieldPopulators.js` - Added populateVIPStatus function 