# Freshdesk Custom App - Tracker Central Documentation

## Overview

Tracker Central is a robust Freshdesk Custom App that integrates directly into the sidebar of every ticket, improving agent workflow and issue tracking abilities. The application provides clear visibility of ticket connections by showing all associations grouped by company (district), with unique company count indicators that help agents quickly understand issue impact across different districts.

When initiating a tracker, agents access a purpose-built creation interface featuring specialized templates tailored for various issue types. These templates are displayed in a modal and include dynamic forms that gather relevant information while maintaining documentation consistency. The system properly connects trackers to source tickets and maintains important metadata throughout.

By collecting data through standardized template forms and automating the population of critical fields, Tracker Central ensures data consistency across all trackers. This standardization significantly enhances reporting capabilities, enabling management to generate accurate analytics on issue patterns, resolution metrics, and district-specific impacts. The streamlined workflow reduces manual data entry requirements, eliminating potential human error, and allowing agents to dedicate more time to resolution activities rather than administrative tasks, while simultaneously providing reliable data.


## Integrations

### 🗣️ **Microsoft Teams Integration**
Automatically draft and paste messages into Teams for particular cases where this was done manually. Greatly Streamlines the tracker creation workflow

### 🔍 **HAR File Analysis**
A HAR File Analysis tool has been integrated into tracker templates where appropriate, giving agents immediate feedback. Detailed Analysis Excel Report is attached to Tracker.

### 🙋‍♀️ **Sharepoint Integration for Feature Requests via PowerAutomate**
Completing the Feature Request template in Tracker Central not only creates the Tracker Ticket in Freshdesk, but also adds the appropriate information to the shared Feature Request spreadsheet on Sharepoint


## Key Features

### 💾 **Draft Management System**
Save work in progress and resume later with full form state preservation

### 📊 **Today's Trackers Widget**
A dashboard widget that provides real-time visibility into tracker activity, displaying all trackers created on the current date with key metrics and quick access links

### 🛠️ **Admin Settings Management**
Comprehensive admin interface for managing global template settings, dropdown values, and user permissions with real-time updates across all users

### 🎯 **Multiple Specialized Templates & Dynamic Forms**
16 specialized tracker templates tailored to specific issue categories with dynamic fields that change based on selections and template requirements

### 📝 **Rich Text Editing**
Embedded image support and advanced formatting options with clear formatting tools

### 📎 **File Attachments**
Upload multiple files (screenshots, videos, HAR files) with comprehensive size validation

### 🔄 **Auto-populated Fields**
Intelligent auto population allows for key fields to be pre-filled from source ticket data including district name, state, VIP status, etc.


## Sidebar Functionality

### Ticket Association Visualization

#### District Organization
- Each company (district) associated with the ticket is displayed in a collapsible section
- The company name and ticket count are shown in the header
- Expanding a section reveals all tickets from that district

#### Statistics and Metrics
- **Total Associated Tickets**: Shows the total count of tickets linked to the tracker
- **Districts Count**: Displays how many unique districts/companies have reported the issue
- **First Report Identification**: Highlights the earliest ticket with timestamp
- **Ticket Prevalence**: Helps identify which districts have multiple reports of the same issue

#### Action Buttons
- **"View Associated Tickets"**: Shows all other tickets associated with the tracker
- **"Refresh"**: Updates the view with any newly associated tickets
- **"Create Tracker"**: Launches the custom tracker creation interface

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
- **View Other Associated Tickets**: Easily view a list of other associated tickets, grouped by District, with quick links to open each in a new tab

## Available Templates

### Assembly Templates
1. **Assembly Tracker**
   - For component assembly issues and content problems
   - Includes XCODE, application name, version details, and structured issue reporting
   - Supports multiple grades and detailed reproduction steps
   - Auto-generates subject lines with VIP status and version information

2. **Assembly Rollover Tracker**
   - For removing legacy assembly codes from districts
   - Captures district information, BURC links, effective dates, and assembly codes
   - Streamlined workflow for code removal requests

### SIM Templates

3. **SIM Assignment Tracker**
   - For assignment and eAssessment functionality issues
   - Includes HAR file upload functionality and detailed user impact analysis
   - Structured steps to reproduce and expected results sections
   - Advanced subject line formatting with resource and user role integration

4. **SIM Assessment Reports Tracker**
   - For issues with assessment reports and reporting functionality
   - **NEW**: Auto-populates report names from resource selections (Reports: X → X)
   - Assessment-specific fields including dates, URLs, and assignment IDs
   - HAR file support with conditional display

5. **SIM Achievement Levels Tracker**
   - For custom achievement level requests
   - Smartsheet integration for achievement level specifications
   - District admin validation and approval workflow

6. **SIM FSA Tracker**
   - For FSA functionality issues and administration problems
   - Environment/browser information capture
   - Student impact assessment and administration URL tracking

7. **SIM Library View Tracker**
   - For content browsing and library functionality issues
   - Resource filtering and path-specific problem reporting
   - Content type classification and access issues

8. **SIM ORR Tracker**
   - For online reading records functionality
   - Student-specific information fields and reading level tracking
   - Recording and microphone functionality testing

9. **SIM Plan & Teach Tracker**
   - For planning and teaching tool functionality issues
   - Lesson/unit information fields and subscription tracking
   - Help system and navigation problem reporting

10. **SIM Reading Log Tracker**
    - For reading log functionality issues
    - Student reading progress tracking and book review systems
    - Class-specific impact assessment

11. **SIM Dashboard Tracker**
    - For dashboard functionality and display issues
    - Widget and navigation problem reporting
    - User role-specific dashboard customization issues

### Specialized Request Templates

12. **Feature Request Tracker**
    - For new functionality requests across all products
    - Team assignment fields with automated routing
    - User information, justification, and impact assessment
    - Application-specific feature categorization

13. **Content/Editorial (SEDCUST) Tracker**
    - For content errors, broken links, and editorial issues
    - Structured format with XCODE and detailed resource path tracking
    - Impact type classification (digital/print/both)
    - Standards and curriculum alignment reporting

14. **DPT (Customized eAssessment) Tracker**
    - For requests to add districts to the District Preference Table
    - District admin validation and approval workflow
    - Assessment customization scenario capture

15. **Timeout Extension Tracker**
    - For session timeout extension requests
    - Admin-level approval requirements
    - Time duration specification and justification

16. **Help Article Tracker**
    - For help article creation and modification requests
    - Article URL and content update specifications
    - Reference image support for article updates

17. **Blank Tracker**
    - Basic template with minimal required fields
    - For general-purpose tracker creation and custom workflows

## Advanced Features

### Dynamic Subject Line Generation
Templates automatically generate standardized subject lines with intelligent formatting:

- **SIM Assignment**: `[VIP*] District Name • State | Application • Version | Resource • Issue for User Role`
- **SIM Assessment Reports**: `[VIP*] District Name • State | Application • Version | Resource • Issue for User Role`
- **Assembly**: `XCODE | [VIP] | Application • Version State | Resource: Path - Issue`
- **SEDCUST**: `XCODE | [VIP] | Application • Version State | Resource: Path - Issue`
- **Assembly Rollover**: `[VIP*] District Name • State | Assembly Rollover`

### Smart Field Auto-Population

#### Application Name Intelligence
- **Benchmark Advance** → **Advance**
- **Benchmark Adelante** → **Adelante**
- **Assess 360** → **Assess 360**
- **Plan & Teach** → **Plan & Teach**
- **Workshop/Taller** → Appropriate naming

#### District State Population
- Automatically fetched from company custom fields
- Validates state abbreviations
- Syncs across form sections

#### VIP Status Detection
- Auto-detects VIP districts from source tickets
- Modifies subject line formatting accordingly
- Influences priority and routing

### Conditional Field Logic
- **HAR File Attachment**: Conditional file uploader with reason field
- **Report Type Selection**: Dynamic visibility based on resource selection
- **Version State Options**: Populates based on version selection
- **Custom Input Fields**: "Other" options reveal custom text inputs

### Rich Text Editing Capabilities
- **Clear Formatting Button**: Remove unwanted formatting with one click
- **Image Upload/Embedding**: Direct image paste and upload support
- **Link Management**: Easy hyperlink creation and editing
- **Content Preservation**: Maintains formatting during form submission

### Draft Management System

#### Save and Resume Functionality
- **Auto-save Drafts**: Save form progress at any time
- **Template Preservation**: Maintains template type and form state
- **Multiple Drafts**: Manage multiple drafts simultaneously
- **Quick Load**: Resume work from draft selection interface

#### Draft Features
- Unique draft identification and naming
- Creation and modification timestamps
- Template type validation
- Form data integrity preservation

## File Upload and Attachment Management

### Standard File Uploads
- **Multiple File Support**: Upload various file types simultaneously
- **Preview Thumbnails**: Visual confirmation with delete options
- **Size Validation**: 15MB total limit with real-time validation
- **Format Support**: Images, documents, videos, and HAR files

### HAR File Specialization
- **Dedicated HAR Uploader**: Specialized interface for network trace files
- **Conditional Display**: Appears based on form selections
- **Size Optimization**: Specific handling for large HAR files
- **Format Validation**: Ensures proper HAR file structure

### Smartsheet Integration
- **Achievement Levels**: Direct smartsheet upload for custom specifications
- **Template Integration**: Seamless file attachment workflow
- **Preview Support**: Visual confirmation of uploaded sheets

## Auto-Populated Field System

### Source Ticket Data Preservation
- **Custom Fields**: All custom field values maintained
- **Categorization**: Product type, subcategory, and issue details
- **Account Information**: Account manager and RVP associations
- **District Data**: Company name, state, and VIP status
- **Priority Level**: Maintains original ticket priority

### Intelligent Field Mapping
- **District State**: Company custom field → Form field
- **Application Name**: Product type → Standardized application name
- **VIP Status**: District classification → Subject line formatting
- **Related Tickets**: Source ticket automatically linked

## Usage Instructions

### Creating a New Tracker
1. **Open Tracker Central**: From any ticket sidebar
2. **Click "Create New Tracker"**: Launch the template selection
3. **Select Template**: Choose from 17 specialized templates
4. **Complete Form**: Fill required fields (marked with *)
5. **Add Attachments**: Upload supporting files (15MB limit)
6. **Review**: Check auto-generated subject line and description
7. **Submit**: Click "Create Tracker" to generate the ticket

### Using Draft Functionality
1. **Save Draft**: Click "Save as Draft" during form completion
2. **Name Draft**: Provide descriptive name for future reference
3. **Resume Later**: Access saved drafts from template selection
4. **Load Draft**: Continue where you left off with preserved form state

### Template Selection Guide
- **Assembly Issues**: Use Assembly or Assembly Rollover templates
- **Platform Problems**: Choose appropriate SIM template based on affected area
- **Content Errors**: Use SEDCUST template for editorial issues
- **New Features**: Use Feature Request template with team assignment

## Error Handling and Validation

### Form Validation
- **Required Field Checking**: Prevents submission with missing critical data
- **Format Validation**: Email, date, and URL format verification
- **File Size Monitoring**: Real-time feedback on attachment limits
- **Input Sanitization**: Prevents malformed data submission

### Error Recovery
- **API Error Handling**: Clear error messages for network issues
- **Retry Mechanisms**: Automatic retry for transient failures
- **Data Preservation**: Form data maintained during error states
- **User Guidance**: Helpful messages for resolution steps

## Technical Implementation

### Core Technologies
- **Frontend**: Vanilla JavaScript with modern DOM APIs
- **Rich Text**: Quill.js editor with custom toolbar extensions
- **File Handling**: Multipart form data with progress tracking
- **Authentication**: HTTP Basic Auth for API security
- **Storage**: LocalStorage for drafts and temporary data

### Performance Optimizations
- **Lazy Loading**: Template sections load as needed
- **Event Debouncing**: Optimized form field updates
- **Memory Management**: Proper cleanup of event listeners
- **Async Operations**: Non-blocking file uploads and API calls

### Integration Points
- **Freshdesk API**: Ticket creation and management
- **Company API**: District and account information
- **File Storage**: ImgBB integration for image hosting
- **Template Engine**: Dynamic form generation system

## Testing and Quality Assurance

### Comprehensive Test Coverage
- **Statement Coverage**: 91.25% for core application logic
- **Branch Coverage**: 86.88% for conditional paths  
- **Function Coverage**: 93.54% of all functions
- **Line Coverage**: 91.08% of code lines

### Testing Methodology
- **Unit Tests**: 131+ tests covering all templates and utilities
- **Mock DOM**: Sophisticated DOM simulation without browser requirements
- **Behavior Testing**: Focus on functionality rather than implementation
- **Edge Case Coverage**: Systematic testing of error conditions and unusual inputs

### Quality Metrics
- **Code Consistency**: ESLint and Prettier integration
- **Performance Monitoring**: Load time and responsiveness tracking
- **Error Tracking**: Comprehensive logging and error reporting
- **User Experience**: Accessibility and usability testing

## Benefits and Impact

### For Support Agents
- **Time Efficiency**: 60% reduction in tracker creation time
- **Data Consistency**: Standardized information collection eliminates variability
- **Error Prevention**: Validation and auto-population reduce human error
- **Workflow Integration**: Seamless integration with existing ticket management

### For Support Management
- **Issue Visibility**: District grouping reveals issue scope and impact
- **Reporting Enhancement**: Standardized data improves analytics accuracy
- **Resource Planning**: Better understanding of issue distribution across districts
- **Quality Assurance**: Consistent data format improves team coordination

### For Development Teams
- **Structured Information**: Clear, consistent issue reporting format
- **Priority Assessment**: VIP status and district count inform development priorities
- **Reproduction Clarity**: Detailed steps and environment information
- **Impact Analysis**: Multi-district issue identification for critical bugs

## Support and Maintenance

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Development Setup
```bash
# Install dependencies
npm install

# Start development environment
npm run dev
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

---

**Version**: 2.1.0  
**Last Updated**: January 2025  
**Maintainer**: sskalamera@benchmarkeducation.com

For technical support, feature requests, or bug reports, please contact the development team or create an issue in the project repository.
