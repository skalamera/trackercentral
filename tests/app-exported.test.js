// Import functions directly from the app-exports.js file
const {
    showNotification,
    showBanner,
    createfdTicket,
    sayHello,
    getCompanyDetails,
    filterUniqueTickets,
    findEarliestTicket,
    groupTicketsByCompany,
    openTicket,
    sanitizeSubdomain
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

// Mock window.open
global.window = {
    ...global.window,
    open: jest.fn()
};

// Test cases
describe('App Exported Functions', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Reset document.getElementById mock implementation
        document.getElementById.mockImplementation((id) => {
            if (id === "newTicketBanner") {
                return { value: "" };
            }
            return null;
        });
    });

    describe('showNotification', () => {
        test('should trigger showNotify interface with correct parameters', async () => {
            await showNotification("success", "Test message");
            expect(client.interface.trigger).toHaveBeenCalledWith("showNotify", {
                type: "success",
                message: "Test message"
            });
        });

        test('should trigger showNotify with error type', async () => {
            await showNotification("error", "Error message");
            expect(client.interface.trigger).toHaveBeenCalledWith("showNotify", {
                type: "error",
                message: "Error message"
            });
        });
    });

    describe('showBanner', () => {
        test('should set banner text value', () => {
            const bannerElement = { value: "" };
            document.getElementById.mockReturnValue(bannerElement);

            showBanner("Test banner text");
            expect(bannerElement.value).toBe("Test banner text");
        });
    });

    describe('createfdTicket', () => {
        test('should invoke template with correct ticket details', async () => {
            await createfdTicket("Test Agent");

            expect(client.request.invokeTemplate).toHaveBeenCalledWith("createfdTicket", {
                body: expect.any(String)
            });

            // Verify ticket details content
            const callArgs = client.request.invokeTemplate.mock.calls[0][1];
            const ticketDetails = JSON.parse(callArgs.body);

            expect(ticketDetails).toEqual({
                email: 'puppycat@email.com',
                subject: 'Hello',
                priority: 1,
                description: expect.stringContaining("Test Agent"),
                status: 2
            });
        });
    });

    describe('sayHello', () => {
        test('should create Freshdesk ticket and show success notification when isFreshDesk is true', async () => {
            await sayHello("Test Agent", true);

            // Should call createfdTicket via invokeTemplate
            expect(client.request.invokeTemplate).toHaveBeenCalledWith("createfdTicket", expect.any(Object));

            // Should show success notification
            expect(client.interface.trigger).toHaveBeenCalledWith("showNotify", {
                type: "success",
                message: expect.any(String)
            });
        });

        test('should create Freshservice ticket when isFreshDesk is false', async () => {
            await sayHello("Test Agent", false);

            // Should call createfsTicket template
            expect(client.request.invokeTemplate).toHaveBeenCalledWith("createfsTicket", expect.any(Object));
        });

        test('should show error notification when ticket creation fails', async () => {
            // Mock failure
            client.request.invokeTemplate.mockRejectedValueOnce(new Error("API Error"));

            await sayHello("Test Agent", true);

            // Should show danger notification
            expect(client.interface.trigger).toHaveBeenCalledWith("showNotify", {
                type: "danger",
                message: expect.any(String)
            });
        });
    });

    describe('getCompanyDetails', () => {
        test('should return company data when request is successful', async () => {
            const mockResponse = { name: "Test Company", id: 123 };
            client.request.invokeTemplate.mockResolvedValueOnce({
                response: JSON.stringify(mockResponse)
            });

            const result = await getCompanyDetails(123);

            expect(client.request.invokeTemplate).toHaveBeenCalledWith("getCompanyDetails", {
                context: { companyId: 123 }
            });
            expect(result).toEqual(mockResponse);
        });

        test('should return null when request fails', async () => {
            client.request.invokeTemplate.mockRejectedValueOnce(new Error("API Error"));

            const result = await getCompanyDetails(123);

            expect(result).toBeNull();
        });
    });

    describe('filterUniqueTickets', () => {
        test('should filter out duplicate tickets based on id', () => {
            const tickets = [
                { id: 1, subject: "Ticket 1" },
                { id: 2, subject: "Ticket 2" },
                { id: 1, subject: "Duplicate Ticket" },
                { id: 3, subject: "Ticket 3" }
            ];

            const result = filterUniqueTickets(tickets);

            expect(result).toHaveLength(3);
            expect(result.map(t => t.id)).toEqual([1, 2, 3]);
        });

        test('should return empty array for null or empty input', () => {
            expect(filterUniqueTickets(null)).toEqual([]);
            expect(filterUniqueTickets([])).toEqual([]);
            expect(filterUniqueTickets(undefined)).toEqual([]);
            expect(filterUniqueTickets("not an array")).toEqual([]);
        });
    });

    describe('findEarliestTicket', () => {
        test('should find the ticket with earliest created_at date', () => {
            const tickets = [
                { id: 1, subject: "Ticket 1", created_at: "2023-03-15T12:00:00Z" },
                { id: 2, subject: "Ticket 2", created_at: "2023-01-10T09:30:00Z" }, // Earliest
                { id: 3, subject: "Ticket 3", created_at: "2023-02-20T15:45:00Z" }
            ];

            const result = findEarliestTicket(tickets);

            expect(result).toEqual({
                id: 2,
                subject: "Ticket 2",
                created_at: "2023-01-10T09:30:00Z"
            });
        });

        test('should return null for empty array', () => {
            expect(findEarliestTicket([])).toBeNull();
        });
    });

    describe('groupTicketsByCompany', () => {
        test('should group tickets by company_id', () => {
            const tickets = [
                { id: 1, company_id: 100, subject: "Company A Ticket 1" },
                { id: 2, company_id: 200, subject: "Company B Ticket 1" },
                { id: 3, company_id: 100, subject: "Company A Ticket 2" },
                { id: 4, company_id: 300, subject: "Company C Ticket 1" },
                { id: 5, company_id: null, subject: "No Company Ticket" }
            ];

            const result = groupTicketsByCompany(tickets);

            expect(Object.keys(result).length).toBe(3);
            expect(result[100]).toHaveLength(2);
            expect(result[200]).toHaveLength(1);
            expect(result[300]).toHaveLength(1);
            // Ticket with no company should be skipped
            expect(result[null]).toBeUndefined();
        });

        test('should return empty object when no tickets have companies', () => {
            const tickets = [
                { id: 1, subject: "Ticket 1" },
                { id: 2, subject: "Ticket 2", company_id: null }
            ];

            const result = groupTicketsByCompany(tickets);

            expect(result).toEqual({});
        });
    });

    describe('openTicket', () => {
        test('should trigger click event and open ticket in new window', async () => {
            await openTicket(12345);

            // Should trigger click event
            expect(client.interface.trigger).toHaveBeenCalledWith("click", {
                id: "openTicket",
                value: 12345
            });

            // Should get iparams
            expect(client.iparams.get).toHaveBeenCalledWith("freshdesk_subdomain");

            // Should open window with correct URL
            expect(window.open).toHaveBeenCalledWith(
                "https://testdomain.freshdesk.com/a/tickets/12345",
                "_blank"
            );
        });

        test('should handle error getting subdomain', async () => {
            // Mock a rejected promise for client.iparams.get
            client.iparams.get = jest.fn().mockRejectedValue(new Error("Failed to get iparams"));

            // Mock console.error to prevent pollution of test output
            const originalConsoleError = console.error;
            console.error = jest.fn();

            try {
                // Call the function
                await openTicket(12345);

                // Add a small delay to ensure all promises have resolved
                await new Promise(resolve => setTimeout(resolve, 10));

                // Verify click was triggered
                expect(client.interface.trigger).toHaveBeenCalledWith("click", {
                    id: "openTicket",
                    value: 12345
                });

                // Verify error was logged
                expect(console.error).toHaveBeenCalledWith(
                    "Error getting freshdesk subdomain:",
                    expect.any(Error)
                );

                // Verify fallback URL was opened
                expect(window.open).toHaveBeenCalledWith(
                    "https://freshdesk.com/a/tickets/12345",
                    "_blank"
                );
            } finally {
                // Restore original console.error
                console.error = originalConsoleError;
            }
        });
    });

    describe('sanitizeSubdomain', () => {
        test('should remove special characters from subdomain', () => {
            expect(sanitizeSubdomain("my-domain")).toBe("my-domain");
            expect(sanitizeSubdomain("My_Domain!")).toBe("mydomain");
            expect(sanitizeSubdomain("test.123@example")).toBe("test123example");
            expect(sanitizeSubdomain("UPPER-case")).toBe("upper-case");
        });
    });
}); 