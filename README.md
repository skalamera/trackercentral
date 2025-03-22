
# Freshdesk Custom App - Tracker Central Documentation

## Overview

Tracker Central is a robust Freshdesk Custom App that integrates directly into the sidebar of every ticket, improving agent workflow and issue tracking abilities. The application provides clear visibility of ticket connections by showing all associations grouped by company (district), with unique company count indicators that help agents quickly understand issue impact across different districts.

When initiating a tracker, agents access a purpose-built creation interface featuring specialized templates tailored for various issue types. These templates are displayed in a modal and include dynamic forms that gather relevant information while maintaining documentation consistency. The system properly connects trackers to source tickets and maintains important metadata throughout.

By collecting data through standardized template forms and automating the population of critical fields, Tracker Central ensures data consistency across all trackers. This standardization significantly enhances reporting capabilities, enabling management to generate accurate analytics on issue patterns, resolution metrics, and district-specific impacts. The streamlined workflow reduces manual data entry requirements, eliminating any potential of human error, and allowing agents to dedicate more time to resolution activities rather than administrative tasks, while simultaneously providing reliable data.


### Sidebar Functionality ###

## Ticket Association Visualization

### District Organization
- Each company (district) associated with the ticket is displayed in a collapsible section
- The company name and ticket count are shown in the header
- Expanding a section reveals all tickets from that district

### Statistics and Metrics
- **Total Associated Tickets**: Shows the total count of tickets linked to the tracker
- **Districts Count**: Displays how many unique districts/companies have reported the issue
- **First Report Identification**: Highlights the earliest ticket with timestamp
- **Ticket Prevalence**: Helps identify which districts have multiple reports of the same issue

### Buttons
- The "View Associated Tickets" button (displayed in Related Tickets) shows all other tickets associated with the tracker.
- The Refresh button updates the view with any newly associated tickets
- The Create Tracker button launches the custom tracker creation modal

### When Viewing within a Tracker Ticket (Association Type 3)
- **Associated Tickets List**: Displays all tickets linked to the current tracker
- **District Grouping**: Organizes related tickets by company/district
- **District Count**: Shows a summary of how many unique districts are reporting the issue
- **Collapsible Sections**: Each district can be expanded/collapsed to view associated tickets
- **First Report Information**: Highlights the earliest reported ticket with date and time
- **Ticket Navigation**: Quick links to open any associated ticket in a new tab

### When Viewing within a Related Ticket (Association Type 4)
- **Tracker Link**: Displays a prominent link to the parent tracker ticket
- **Ticket Summary**: Shows basic information about the associated tracker
- **One-Click Navigation**: Easily open the tracker ticket with a single click
- **View Other Associated Tickets**: Easily view a list of other associated tickets, grouped by District, with quick links to open each in a new tab.


## Custom Tracker Creation Features

- **Multiple Specialized Templates**: After launching the modal from the sidebar, choose from 16 different templates tailored to specific issue categories
- **Dynamic Forms**: Fields change based on selections and template requirements
- **Rich Text Editing**: Embedded image support and formatting options
- **File Attachments**: Upload multiple files (screenshots, videos, HAR files) with 20MB size limit validation
- **Auto-populated Fields**: Key fields are pre-filled from source tickets
- **Related Ticket Linking**: Created trackers are automatically linked to source tickets
- **Custom Metadata Preservation**: Category, priority, and custom fields are maintained
- **Conditional Fields**: Fields appear/disappear based on form selections
- **Mobile-Responsive Design**: Works on various screen sizes


## Available Templates

### Assembly Templates
1. **Assembly**
   - For component assembly issues
   - Includes XCODE, application name, and issue details
   - Structured format for grades and products impacted

2. **Assembly Rollover**
   - For removing legacy assembly codes
   - Captures district name, realm, effective date, and assembly codes

### SIM (Student Information Manager) Templates
3. **SIM Assignment**
   - For assignment and eAssessment functionality issues
   - Includes HAR file upload functionality
   - Detailed steps to reproduce and expected results

4. **SIM Assessment Reports**
   - For issues with assessment reports and data
   - Custom subject line formatting
   - Assessment-specific fields (dates, URLs, IDs)
   - HAR file support

5. **SIM Achievement Levels**
   - For issues with benchmarks and achievement levels
   - Fields for program, grade level, and achievement type

6. **SIM FSA (Formative Student Assessment)**
   - For FSA functionality issues
   - Environment/browser information fields

7. **SIM Library View**
   - For content browsing and library issues
   - Content type classification

8. **SIM ORR (Online Reading Records)**
   - For online reading records functionality
   - Book-specific information fields
   - Microphone/recording fields

9. **SIM Plan & Teach**
   - For planning and teaching functionality issues
   - Lesson/unit information fields

10. **SIM Reading Log**
    - For reading log functionality issues
    - Fields for student impacts and book titles

### Other Specialized Templates
11. **Feature Request**
    - For new functionality requests
    - Team assignment fields
    - User information and justification sections

12. **Help Article**
    - For help article creation/modification
    - Article title, URL, and content fields
    - Justification field for the request

13. **Student Transfer**
    - For student data transfer issues
    - Source/destination district information
    - Data specification fields

14. **Timeout Extension**
    - For session timeout extension requests
    - Current and requested timeout durations
    - Justification and effective date fields

15. **Content/Editorial (SEDCUST)**
    - For content errors, broken links, and editorial issues
    - Structured format with XCODE and resource path
    - Impact type classification (digital/print)

16. **Blank Tracker**
    - Basic template with minimal required fields
    - For general-purpose tracker creation

## Template-Specific Features

### Dynamic Subject Line Generation
Several templates auto-generate standardized subject lines:

- **SIM Assignment**: `[VIP*] District Name | Application - Specific Issue: User Role`
- **SIM Assessment Reports**: `[VIP*] District Name | Application - Specific Issue for User Role`
- **Assembly**: `XCODE | Application | Specific Issue : Grades Impacted`
- **SEDCUST (Content/Editorial)**: `XCODE | Application | Resource Path - Specific Issue`

### Conditional Fields
- **HAR File Attachment**: "Yes" reveals file uploader, "No" requires reason
- **VIP Status**: Modifies subject line format and priority
- **Issue Type**: Controls display of subsequent fields in some templates

### Rich Text Editors
- Available in description, steps to reproduce, and expected results sections
- Image upload/embedding support
- Basic formatting (bold, italic, links)
- Paste image functionality

## File Upload Functionality

### Screenshots and Supporting Files
- Available in relevant templates (SIM Assignment, SIM Assessment Reports, etc.)
- Multiple file upload support
- Preview thumbnails with delete option
- 20MB total size limit validation
- Immediate size validation when files are selected

### HAR File Upload
- Specialized uploader for HAR network trace files
- Available in SIM Assignment and SIM Assessment Reports templates
- Size limit validation
- Conditional display based on "HAR file attached" selection

## Auto-Populated Fields

The following fields are automatically populated when creating a tracker:

### Custom Fields Preserved

- **Categorization**: Maintained in the new tracker
- **Subcategory**: Preserved from source ticket
- **Issue Detail**: Kept consistent in the tracker
- **Account Manager**: Preserved association
- **RVP (Regional VP)**: Maintained in the tracker
- **Product Type**: Maintained in the tracker
- **Product**: Maintained in the tracker
- **Product Sub-Section**: Maintained in the 
tracker
- **District Name**: Copied from source ticket custom fields
- **VIP Status**: Preserved from source ticket

### System Fields

- **Source**: Set to 101 (internal app)
- **Tags**: Template-specific tags added automatically
- **Status**: Defaults to Open (2)
- **Association Type**: Set as tracker (type 3)
- **Priority**: Maintains the same priority level
- **Related Ticket IDs**: The source ticket ID is automatically added

## Usage Instructions to Create a Tracker

### Creating a New Tracker
1. From a source ticket, open the Tracker Central App from the sidebar.
2. Click "Create New Tracker"
3. Select the appropriate template type
4. Fill in required fields (marked with *)
5. Add any attachments (keeping under 20MB total)
6. Click "Create Tracker"


### Error Handling
- Form validation prevents submission with missing required fields
- File size validation prevents oversized attachments
- API errors are displayed with helpful messages
- Network connectivity issues show appropriate error states

## Technical Notes

- **File Size Limits**: 20MB maximum total per ticket for attachments
- **Image Embedding**: Uses ImgBB for hosting embedded images in rich text fields
- **Multipart Form Data**: Used for file uploads
- **HTTP Basic Auth**: Used for API authentication
- **LocalStorage**: Used for temporary data storage during ticket creation

## Benefits of the Tracker System

### For Support Agents
- **Standardized Information**: Templates ensure all necessary information is collected
- **Quick Issue Identification**: District grouping shows issue patterns across customers
- **Time Savings**: Auto-populated fields reduce manual entry
- **Consistency**: All trackers follow the same structured format

### For Support Management
- **Issue Scope**: District count provides immediate visibility into issue impact
- **Chronological Tracking**: First report identification aids in issue timeline understanding
- **Reporting Clarity**: Standardized formats make reporting and filtering more effective
- **Team Coordination**: Consistent tracker format helps development and QA teams
---

This README serves as a comprehensive reference for the Freshdesk Custom App (Tracker Central). For technical support or feature requests, please contact sskalamera@benchmarkeducation.com
