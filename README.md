# Associated Tickets Viewer

## Overview
This Freshdesk app displays associated tickets for tracker tickets, making it easier to see related tickets across multiple companies or districts. The app provides a clean, structured view that groups tickets by company with collapsible sections for better organization.

## Features

### Tracker Tickets
For tickets with association type "tracker" (type 3), the app displays:
- Total number of associated tickets
- Number of unique districts (companies)
- First report information (earliest ticket created)
- Collapsible list of companies with their associated tickets
- Each company section shows the company name and ticket count

### Related Tickets
For tickets with association type "related" (type 4), the app displays:
- Link to the tracker ticket
- Button to view all associated tickets for the tracker

### For All Tickets
- Clickable ticket IDs that open the ticket in a new tab
- Refresh button to update the displayed information
- Clean, compact UI that fits well in the Freshdesk sidebar

## Installation

### Prerequisites
- Freshdesk account
- API key with adequate permissions

### Setup
1. Install the app through the Freshworks Marketplace or upload it manually
2. Configure the app with:
   - Freshdesk subdomain
   - Freshdesk API key

## Configuration

The app requires two configuration parameters:
- **Freshdesk Subdomain**: Your Freshdesk subdomain (e.g., for "company.freshdesk.com", enter "company")
- **Freshdesk API key**: Your Freshdesk API key for accessing ticket and company data

## Development

### Files Structure
- `app/scripts/app.js`: Main application logic
- `app/index.html`: Main view template
- `app/styles/style.css`: Styling for the app
- `config/iparams.json`: Configuration parameters definition
- `config/requests.json`: API request templates
- `manifest.json`: App manifest file

### API Endpoints Used
- GET `/api/v2/tickets/{ticketId}/associated_tickets`: Retrieves associated tickets for a given ticket
- GET `/api/v2/companies/{companyId}`: Retrieves company details
- GET `/api/v2/tickets/{ticketId}/prime_association`: Retrieves tracker ticket for a related ticket

### Local Development
Use the Freshworks CLI to develop and test the app:
```bash
fdk run
```

## Usage
1. Navigate to a ticket in Freshdesk
2. The app will automatically load in the sidebar
3. For tracker tickets, it will show all associated tickets grouped by company
4. For related tickets, it will show a link to the tracker ticket
5. Click the Refresh button at any time to reload the data

## Troubleshooting
- If no tickets appear, verify the ticket has associations
- If company information doesn't appear, check API key permissions
- For any API errors, check the console for detailed error messages
