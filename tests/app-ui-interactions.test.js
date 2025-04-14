// Tests for UI interactions from app.js
const {
    createTicketElement,
    createCompanySection,
    updateFirstReportInfo,
    processAssociatedTickets,
    openTicket,
    renderCompanySections
} = require('../app/scripts/app-exports');

// Mock client object
global.client = {
    interface: {
        trigger: jest.fn().mockResolvedValue(true)
    },
    request: {
        invokeTemplate: jest.fn().mockResolvedValue({
            response: JSON.stringify({ name: "Test Company" })
        })
    },
    iparams: {
        get: jest.fn().mockResolvedValue({ freshdesk_subdomain: 'testdomain' })
    }
};

// Mock window object
global.window = {
    ...global.window,
    open: jest.fn()
};

describe('UI Interaction Functions', () => {
    let mockElements = {};

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock console methods to prevent test output pollution
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });

        // Setup mock DOM elements with all necessary properties
        mockElements = {
            companyIds: { textContent: '' },
            companySummary: { innerHTML: '' },
            districtsCount: { textContent: '' },
            firstReportInfo: { style: { display: 'none' } },
            firstReportTicketId: {
                textContent: '',
                href: '',
                onclick: null
            },
            firstReportDateTime: { textContent: '' }
        };

        // Mock document.getElementById
        document.getElementById = jest.fn(id => mockElements[id] || null);

        // Mock document.createElement
        document.createElement = jest.fn(tag => {
            const element = {
                tagName: tag.toUpperCase(),
                className: '',
                style: {},
                dataset: {},
                innerHTML: '',
                value: '',
                classList: {
                    contains: jest.fn(className => element.className.includes(className)),
                    add: jest.fn(className => {
                        element.className += ' ' + className;
                    }),
                    remove: jest.fn(className => {
                        element.className = element.className.replace(new RegExp(className, 'g'), '').trim();
                    }),
                    toggle: jest.fn(className => {
                        if (element.className.includes(className)) {
                            element.className = element.className.replace(new RegExp(className, 'g'), '').trim();
                        } else {
                            element.className += ' ' + className;
                        }
                    })
                },
                appendChild: jest.fn(),
                prepend: jest.fn(),
                addEventListener: jest.fn(),
                querySelector: jest.fn(() => ({ textContent: '' })),
                querySelectorAll: jest.fn(() => []),
                nextElementSibling: null
            };
            return element;
        });
    });

    afterEach(() => {
        console.log.mockRestore();
        console.warn.mockRestore();
        console.error.mockRestore();
    });

    describe('createTicketElement', () => {
        test('should create a ticket element with correct properties', () => {
            const ticket = { id: 12345, subject: 'Test Ticket Subject' };
            const result = createTicketElement(ticket);

            expect(result.className).toBe('ticket-item');
            expect(result.dataset.ticketId).toBe(12345);
            expect(result.innerHTML).toContain('#12345');
            expect(result.innerHTML).toContain('Test Ticket Subject');

            // Test event listener added
            expect(result.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

            // Trigger the click handler
            const clickHandler = result.addEventListener.mock.calls[0][1];
            clickHandler();

            // Should open the ticket
            expect(client.interface.trigger).toHaveBeenCalledWith('click', {
                id: 'openTicket',
                value: 12345
            });
        });

        test('should handle tickets with no subject', () => {
            const ticket = { id: 12345 };
            const result = createTicketElement(ticket);

            expect(result.innerHTML).toContain('No subject');
        });
    });

    describe('createCompanySection', () => {
        test('should create a company section with correct data', () => {
            const companyData = { name: 'Test Company' };
            const companyId = '123';
            const tickets = [
                { id: 1, title: 'Ticket 1', status: 'Open' },
                { id: 2, title: 'Ticket 2', status: 'Closed' }
            ];

            // Create the main company section element
            const companySection = document.createElement('div');

            // Create the header element
            const headerElement = document.createElement('div');
            headerElement.nextElementSibling = { classList: { toggle: jest.fn(), contains: jest.fn().mockReturnValue(true) } };

            // Create the icon element
            const iconElement = document.createElement('span');

            // Create the tickets list
            const ticketsList = document.createElement('div');

            // Create ticket items
            const ticketItem1 = document.createElement('div');
            const ticketItem2 = document.createElement('div');

            // Create ticket links
            const ticketLink1 = document.createElement('a');
            const ticketLink2 = document.createElement('a');

            // Mock document.createElement to return our prepared elements in order
            document.createElement
                .mockReturnValueOnce(companySection)  // First call for company section
                .mockReturnValueOnce(headerElement)   // Second call for header
                .mockReturnValueOnce(iconElement)     // Third call for icon
                .mockReturnValueOnce(ticketsList)     // Fourth call for tickets list
                .mockReturnValueOnce(ticketItem1)     // Fifth call for first ticket item
                .mockReturnValueOnce(ticketLink1)     // Sixth call for first ticket link
                .mockReturnValueOnce(ticketItem2)     // Seventh call for second ticket item
                .mockReturnValueOnce(ticketLink2);    // Eighth call for second ticket link

            // Mock the querySelector to return our icon element
            headerElement.querySelector = jest.fn().mockReturnValue(iconElement);

            // Setup class names
            companySection.className = 'company-section';
            headerElement.className = 'company-header-clickable';
            ticketsList.className = 'tickets-list collapsed';

            const result = createCompanySection(companyData, companyId, tickets);

            expect(result.className).toBe('company-section');
            expect(result).toBe(companySection);

            // Verify header was created correctly
            expect(headerElement.className).toBe('company-header-clickable');
            expect(headerElement.innerHTML).toContain('Test Company');

            // Verify tickets list was created
            expect(ticketsList.className).toContain('tickets-list');
            expect(ticketsList.className).toContain('collapsed');

            // Test the click handler
            const clickHandler = headerElement.addEventListener.mock.calls[0][1];
            clickHandler.call(headerElement);

            // Verify that classList.toggle was called
            expect(headerElement.nextElementSibling.classList.toggle).toHaveBeenCalledWith('collapsed');
        });

        test('should use company ID if no company data available', () => {
            const companyId = '123';
            const tickets = [{ id: 1, title: 'Ticket 1', status: 'Open' }];

            // Create the main company section element
            const companySection = document.createElement('div');

            // Create the header element
            const headerElement = document.createElement('div');

            // Create the icon element
            const iconElement = document.createElement('span');

            // Create the tickets list
            const ticketsList = document.createElement('div');

            // Create ticket item
            const ticketItem = document.createElement('div');

            // Create ticket link
            const ticketLink = document.createElement('a');

            // Mock document.createElement to return our prepared elements in order
            document.createElement
                .mockReturnValueOnce(companySection)  // First call for company section
                .mockReturnValueOnce(headerElement)   // Second call for header
                .mockReturnValueOnce(iconElement)     // Third call for icon
                .mockReturnValueOnce(ticketsList)     // Fourth call for tickets list
                .mockReturnValueOnce(ticketItem)      // Fifth call for ticket item
                .mockReturnValueOnce(ticketLink);     // Sixth call for ticket link

            // Call function
            createCompanySection(null, companyId, tickets);

            // Header should contain the company ID
            expect(headerElement.innerHTML).toBeDefined();
            expect(headerElement.innerHTML).toContain(`<h3>Company ID: ${companyId}</h3>`);
        });
    });

    describe('updateFirstReportInfo', () => {
        test('should update first report info and add event listener', () => {
            // Setup test DOM
            document.body.innerHTML = `
                <div id="firstReportInfo">
                    <a id="firstReportTicketId" href="#"></a>
                    <span id="firstReportDateTime"></span>
                </div>
            `;

            // Mock ticket data
            const ticket = {
                id: 12345,
                subject: 'First Report',
                created_at: '2023-04-15T10:30:00Z'
            };

            // Call the function
            updateFirstReportInfo(ticket);

            // Check if elements were updated
            const ticketLink = document.getElementById('firstReportTicketId');
            const dateTime = document.getElementById('firstReportDateTime');

            expect(ticketLink.textContent).toBe('#12345');

            // Verify the date formatting
            const date = new Date(ticket.created_at);
            expect(dateTime.textContent).toBe(date.toLocaleString());

            // Mock the click event and test event listener
            const clickEvent = new Event('click');
            clickEvent.preventDefault = jest.fn();

            // Add a spy on the client.interface.trigger
            const originalTrigger = client.interface.trigger;
            client.interface.trigger = jest.fn();

            // Dispatch the click event
            ticketLink.dispatchEvent(clickEvent);

            // Verify trigger was called with correct parameters
            expect(client.interface.trigger).toHaveBeenCalledWith('click', {
                id: 'openTicket',
                value: 12345
            });

            // Restore original function
            client.interface.trigger = originalTrigger;
        });
    });

    describe('processAssociatedTickets', () => {
        test('should process associated tickets and update DOM', () => {
            // Setup test DOM
            document.body.innerHTML = `
                <div id="ticketsContainer"></div>
                <div id="companyIds"></div>
                <div id="totalCount"></div>
            `;

            // Mock ticket data
            const tickets = [
                { id: 101, company_id: 501, subject: 'Ticket 1' },
                { id: 102, company_id: 502, subject: 'Ticket 2' },
                { id: 103, company_id: 501, subject: 'Ticket 3' }
            ];

            // Mock company data
            const companies = {
                '501': { id: 501, name: 'Alpha Corp' },
                '502': { id: 502, name: 'Beta Inc' }
            };

            // Set up company retrieval function
            window.getCompanyById = jest.fn(id => companies[id]);

            // Set up createCompanySection mock
            window.createCompanySection = jest.fn((company, id, tickets) => {
                const section = document.createElement('div');
                section.classList.add('company-section');
                section.dataset.companyId = id;
                return section;
            });

            // Call the function
            processAssociatedTickets(tickets);

            // Check if ticketsContainer was populated
            const ticketsContainer = document.getElementById('ticketsContainer');
            expect(ticketsContainer.children.length).toBe(2); // Two companies

            // Check if company IDs text was updated
            const companyIds = document.getElementById('companyIds');
            expect(companyIds.textContent).toBe('Companies: 501, 502');

            // Check if total count was updated
            const totalCount = document.getElementById('totalCount');
            expect(totalCount.textContent).toBe('3');
        });
    });

    describe('openTicket', () => {
        test('should trigger click event and open ticket in new window', async () => {
            await openTicket(12345);

            expect(client.interface.trigger).toHaveBeenCalledWith('click', {
                id: 'openTicket',
                value: 12345
            });

            expect(client.iparams.get).toHaveBeenCalledWith('freshdesk_subdomain');

            expect(window.open).toHaveBeenCalledWith(
                'https://testdomain.freshdesk.com/a/tickets/12345',
                '_blank'
            );
        });

        test('should handle error getting subdomain', async () => {
            client.iparams.get.mockRejectedValueOnce(new Error('Failed to get subdomain'));

            await openTicket(12345);

            // Verify fallback URL was used
            expect(window.open).toHaveBeenCalledWith(
                'https://freshdesk.com/a/tickets/12345',
                '_blank'
            );
        });
    });
}); 