// Import test setup from setup.js
const { mockTrackerConfig } = require('./setup');

// Mock client object
global.client = {
    interface: {
        trigger: jest.fn().mockResolvedValue(true)
    },
    request: {
        invokeTemplate: jest.fn().mockResolvedValue({
            response: JSON.stringify({ id: 123, name: "Test Company" })
        })
    },
    iparams: {
        get: jest.fn().mockResolvedValue({ freshdesk_subdomain: 'testdomain' })
    }
};

// Mock window.open
global.window = {
    ...global.window,
    open: jest.fn()
};

// Mock DOM elements
class MockElement {
    constructor(tag) {
        this.tagName = tag;
        this.className = '';
        this.innerHTML = '';
        this.style = {};
        this.dataset = {};
        this.children = [];
        this.value = '';
        this.nextElementSibling = null;
        this.eventListeners = {};
        this.classList = {
            contains: jest.fn().mockReturnValue(true),
            remove: jest.fn(),
            add: jest.fn()
        };
    }

    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
        return this;
    }

    appendChild(child) {
        this.children.push(child);
        return child;
    }

    querySelector(selector) {
        return new MockElement('div');
    }

    querySelectorAll(selector) {
        return [new MockElement('div')];
    }

    triggerEvent(event) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback.call(this));
        }
    }
}

// Mock document.createElement
document.createElement = jest.fn(tag => new MockElement(tag));

// Functions under test
function createTicketElement(ticket) {
    const ticketItem = document.createElement("div");
    ticketItem.className = "ticket-item";
    ticketItem.dataset.ticketId = ticket.id;
    ticketItem.innerHTML = `
    <div class="ticket-id">#${ticket.id}</div>
    <div class="ticket-subject">${ticket.subject || 'No subject'}</div>
  `;

    // Make the ticket clickable to open in Freshdesk
    ticketItem.addEventListener("click", function () {
        client.interface.trigger("click", { id: "openTicket", value: ticket.id });
        // Instead of using a template, directly open the ticket in Freshdesk
        client.iparams.get("freshdesk_subdomain").then(iparams => {
            window.open(`https://${iparams.freshdesk_subdomain}.freshdesk.com/a/tickets/${ticket.id}`, "_blank");
        }).catch(error => {
            console.error("Error getting freshdesk subdomain:", error);
            // Fallback to a generic domain if iparams fails
            window.open(`https://freshdesk.com/a/tickets/${ticket.id}`, "_blank");
        });
    });

    return ticketItem;
}

function createCompanySection(companyData, companyId, tickets) {
    // Create collapsible company section
    const companySection = document.createElement("div");
    companySection.className = "company-section";

    // Create company header (clickable to expand)
    const companyHeader = document.createElement("div");
    companyHeader.className = "company-header-clickable";
    const companyName = companyData ? companyData.name : `Company ID: ${companyId}`;

    companyHeader.innerHTML = `
    <div class="expand-icon">▶</div>
    <h3 title="${companyName}">${companyName}</h3>
    <span class="ticket-count">${tickets.length}</span>
  `;
    companySection.appendChild(companyHeader);

    // Create collapsible content - use table for better formatting
    const ticketsList = document.createElement("div");
    ticketsList.className = "tickets-list collapsed";

    // Create table for tickets
    const table = document.createElement("table");
    table.className = "tickets-table";

    tickets.forEach(ticket => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td class="ticket-id-cell">#${ticket.id}</td>
      <td class="ticket-subject-cell">${ticket.subject || 'No subject'}</td>
    `;

        // Make the row clickable
        row.style.cursor = "pointer";
        row.addEventListener("click", function () {
            openTicket(ticket.id);
        });

        table.appendChild(row);
    });

    ticketsList.appendChild(table);
    companySection.appendChild(ticketsList);

    // Toggle expand/collapse when clicking on the header
    companyHeader.addEventListener("click", function () {
        const icon = this.querySelector(".expand-icon");
        const content = this.nextElementSibling;

        if (content.classList.contains("collapsed")) {
            content.classList.remove("collapsed");
            icon.textContent = "▼";
        } else {
            content.classList.add("collapsed");
            icon.textContent = "▶";
        }
    });

    return companySection;
}

// Mocked function for tests
function openTicket(ticketId) {
    client.interface.trigger("click", { id: "openTicket", value: ticketId });
}

function updateFirstReportInfo(firstReport) {
    if (!firstReport) {
        return;
    }

    const infoContainer = document.createElement("div");
    infoContainer.className = "first-report-info";

    // Format and display created date
    const createDate = new Date(firstReport.created_at);
    const formattedDate = createDate.toLocaleDateString();
    const formattedTime = createDate.toLocaleTimeString();

    infoContainer.innerHTML = `
    <div class="info-heading">First Report</div>
    <div class="info-detail">
      <span class="info-label">Created:</span> 
      <span class="info-value">${formattedDate} at ${formattedTime}</span>
    </div>
    <div class="info-detail">
      <span class="info-label">Ticket:</span> 
      <span class="info-value ticket-link" data-ticket-id="${firstReport.id}">#${firstReport.id} - ${firstReport.subject || 'No subject'}</span>
    </div>
  `;

    // Add click event to the ticket link
    const ticketLink = infoContainer.querySelector(".ticket-link");
    if (ticketLink) {
        ticketLink.addEventListener("click", function () {
            const ticketId = this.dataset.ticketId;
            openTicket(ticketId);
        });
    }

    // Find or create the container where this information will be displayed
    const container = document.getElementById("firstReportInfoContainer") || document.createElement("div");
    container.id = "firstReportInfoContainer";
    container.innerHTML = "";
    container.appendChild(infoContainer);

    return container;
}

// Test cases
describe('Complex App.js DOM Functions', () => {
    beforeEach(() => {
        // Clear mocks before each test
        jest.clearAllMocks();
    });

    describe('createTicketElement', () => {
        test('should create ticket element with correct classes and data attributes', () => {
            const ticket = { id: 12345, subject: "Test Ticket" };

            const element = createTicketElement(ticket);

            // Check element properties
            expect(element.className).toBe("ticket-item");
            expect(element.dataset.ticketId).toBe(12345);
            expect(element.innerHTML).toContain("#12345");
            expect(element.innerHTML).toContain("Test Ticket");
        });

        test('should handle tickets without subjects', () => {
            const ticket = { id: 12345 };

            const element = createTicketElement(ticket);

            expect(element.innerHTML).toContain("No subject");
        });

        test('should add click event listener to the ticket', () => {
            const ticket = { id: 12345, subject: "Test Ticket" };

            const element = createTicketElement(ticket);

            // Verify event listener was added
            expect(element.eventListeners.click).toBeDefined();
            expect(element.eventListeners.click.length).toBe(1);

            // Trigger the click event
            element.triggerEvent('click');

            // Verify click triggers the right interface action
            expect(client.interface.trigger).toHaveBeenCalledWith("click", {
                id: "openTicket",
                value: 12345
            });
        });
    });

    describe('createCompanySection', () => {
        test('should create a collapsible company section with correct structure', () => {
            const companyData = { id: 100, name: "Acme Corp" };
            const companyId = 100;
            const tickets = [
                { id: 1, subject: "Ticket 1" },
                { id: 2, subject: "Ticket 2" }
            ];

            const section = createCompanySection(companyData, companyId, tickets);

            // Check main container
            expect(section.className).toBe("company-section");

            // Check header
            const header = section.children[0];
            expect(header.className).toBe("company-header-clickable");
            expect(header.innerHTML).toContain("Acme Corp");
            expect(header.innerHTML).toContain("<span class=\"ticket-count\">2</span>");

            // Check tickets list
            const ticketsList = section.children[1];
            expect(ticketsList.className).toContain("tickets-list");
            expect(ticketsList.className).toContain("collapsed");

            // Check table
            const table = ticketsList.children[0];
            expect(table.className).toBe("tickets-table");
            expect(table.children.length).toBe(2); // Two ticket rows

            // Check ticket rows
            expect(table.children[0].innerHTML).toContain("#1");
            expect(table.children[0].innerHTML).toContain("Ticket 1");
            expect(table.children[1].innerHTML).toContain("#2");
            expect(table.children[1].innerHTML).toContain("Ticket 2");
        });

        test('should use company ID when company data is not available', () => {
            const companyData = null;
            const companyId = 100;
            const tickets = [{ id: 1, subject: "Ticket 1" }];

            const section = createCompanySection(companyData, companyId, tickets);
            const header = section.children[0];

            expect(header.innerHTML).toContain("Company ID: 100");
        });

        test('should add click event listeners to header and ticket rows', () => {
            const companyData = { id: 100, name: "Acme Corp" };
            const companyId = 100;
            const tickets = [{ id: 1, subject: "Ticket 1" }];

            const section = createCompanySection(companyData, companyId, tickets);

            // Check header click listener
            const header = section.children[0];
            expect(header.eventListeners.click).toBeDefined();
            expect(header.eventListeners.click.length).toBe(1);

            // Check row click listener
            const ticketsList = section.children[1];
            const table = ticketsList.children[0];
            const row = table.children[0];

            expect(row.eventListeners.click).toBeDefined();
            expect(row.style.cursor).toBe("pointer");
        });
    });

    describe('updateFirstReportInfo', () => {
        test('should create info container with correct ticket information', () => {
            const firstReport = {
                id: 12345,
                subject: "First Issue Report",
                created_at: "2023-05-15T09:30:00Z"
            };

            const container = updateFirstReportInfo(firstReport);

            // Check container structure
            expect(container.id).toBe("firstReportInfoContainer");

            // Check info content
            const infoContainer = container.children[0];
            expect(infoContainer.className).toBe("first-report-info");
            expect(infoContainer.innerHTML).toContain("First Report");
            expect(infoContainer.innerHTML).toContain("#12345");
            expect(infoContainer.innerHTML).toContain("First Issue Report");

            // Check date formatting - allow flexibility in testing since date formatting may vary by locale
            expect(infoContainer.innerHTML).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date format
            expect(infoContainer.innerHTML).toMatch(/\d{1,2}:\d{2}:\d{2}/); // Time format
        });

        test('should handle null input by returning early', () => {
            const result = updateFirstReportInfo(null);
            expect(result).toBeUndefined();
        });

        test('should include ticket ID in the output', () => {
            const firstReport = {
                id: 12345,
                subject: "First Issue Report",
                created_at: "2023-05-15T09:30:00Z"
            };

            const container = updateFirstReportInfo(firstReport);
            const infoContainer = container.children[0];

            // Verify that the ticket ID is included in the HTML output
            expect(infoContainer.innerHTML).toContain(`data-ticket-id="${firstReport.id}"`);
            expect(infoContainer.innerHTML).toContain(`#${firstReport.id}`);
        });
    });
}); 