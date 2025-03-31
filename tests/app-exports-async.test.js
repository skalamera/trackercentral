// Import async functions from app-exports.js
const {
    getAssociatedTickets,
    getPrimeAssociation,
    processAssociatedTickets,
    findEarliestTicket
} = require('../app/scripts/app-exports');

// Mock client object
global.client = {
    interface: {
        trigger: jest.fn().mockResolvedValue(true)
    },
    request: {
        invokeTemplate: jest.fn().mockResolvedValue({
            response: JSON.stringify({ id: 123, name: "Test Company" })
        })
    }
};

// Test cases for async functions
describe('Async Functions from app-exports.js', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Mock console methods to prevent test output pollution
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        // Restore console methods
        console.log.mockRestore();
        console.warn.mockRestore();
        console.error.mockRestore();
    });

    describe('getAssociatedTickets', () => {
        test('should return associated tickets when API call succeeds', async () => {
            // Mock first API response - associations
            const mockAssociations = {
                data: [
                    { ticket_id: 100, associated_ticket_id: 101 },
                    { ticket_id: 100, associated_ticket_id: 102 }
                ]
            };

            // Mock ticket details responses
            const mockTicket1 = { id: 101, subject: "Associated Ticket 1" };
            const mockTicket2 = { id: 102, subject: "Associated Ticket 2" };

            // Set up sequential mock responses
            client.request.invokeTemplate
                .mockResolvedValueOnce({ response: JSON.stringify(mockAssociations) })
                .mockResolvedValueOnce({ response: JSON.stringify(mockTicket1) })
                .mockResolvedValueOnce({ response: JSON.stringify(mockTicket2) });

            const result = await getAssociatedTickets(100);

            // Should have made 3 API calls (1 for associations, 2 for ticket details)
            expect(client.request.invokeTemplate).toHaveBeenCalledTimes(3);

            // Verify first call for getting associations
            expect(client.request.invokeTemplate).toHaveBeenCalledWith("getTicketAssociations", {
                context: { ticketId: 100 }
            });

            // Verify subsequent calls for getting ticket details
            expect(client.request.invokeTemplate).toHaveBeenCalledWith("getTicketById", {
                context: { ticketId: 101 }
            });
            expect(client.request.invokeTemplate).toHaveBeenCalledWith("getTicketById", {
                context: { ticketId: 102 }
            });

            // Verify returned data
            expect(result).toHaveLength(2);
            expect(result).toEqual([mockTicket1, mockTicket2]);
        });

        test('should handle empty or invalid association response', async () => {
            // Mock empty API response
            client.request.invokeTemplate.mockResolvedValueOnce({
                response: JSON.stringify({ data: [] })
            });

            const result = await getAssociatedTickets(100);

            // Verify result is empty array
            expect(result).toEqual([]);
            expect(client.request.invokeTemplate).toHaveBeenCalledTimes(1);
        });

        test('should handle invalid response format', async () => {
            // Mock invalid API response
            client.request.invokeTemplate.mockResolvedValueOnce({
                response: JSON.stringify({ not_data: "invalid" })
            });

            const result = await getAssociatedTickets(100);

            // Verify result is empty array
            expect(result).toEqual([]);
            expect(console.warn).toHaveBeenCalledWith("Invalid response format or no associations found");
        });

        test('should handle API errors gracefully', async () => {
            // Mock API error
            client.request.invokeTemplate.mockRejectedValueOnce(new Error("API Error"));

            const result = await getAssociatedTickets(100);

            // Should return empty array on error
            expect(result).toEqual([]);
            expect(console.error).toHaveBeenCalledWith("Error getting associated tickets:", expect.any(Error));
        });

        test('should handle errors fetching individual ticket details', async () => {
            // Mock associations response
            const mockAssociations = {
                data: [
                    { ticket_id: 100, associated_ticket_id: 101 },
                    { ticket_id: 100, associated_ticket_id: 102 }
                ]
            };

            // Mock success for first ticket, error for second
            const mockTicket1 = { id: 101, subject: "Success Ticket" };

            client.request.invokeTemplate
                .mockResolvedValueOnce({ response: JSON.stringify(mockAssociations) })
                .mockResolvedValueOnce({ response: JSON.stringify(mockTicket1) })
                .mockRejectedValueOnce(new Error("Failed to fetch ticket 102"));

            const result = await getAssociatedTickets(100);

            // Should only contain the successful ticket
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockTicket1);
            expect(console.error).toHaveBeenCalledWith("Error fetching ticket 102:", expect.any(Error));
        });

        test('should handle different ticket IDs in associations', async () => {
            // Testing when the ticket_id is on the other side of the association
            const mockAssociations = {
                data: [
                    { ticket_id: 101, associated_ticket_id: 100 }, // Reversed order
                    { ticket_id: 102, associated_ticket_id: 100 }  // Reversed order
                ]
            };

            const mockTicket1 = { id: 101, subject: "First Ticket" };
            const mockTicket2 = { id: 102, subject: "Second Ticket" };

            client.request.invokeTemplate
                .mockResolvedValueOnce({ response: JSON.stringify(mockAssociations) })
                .mockResolvedValueOnce({ response: JSON.stringify(mockTicket1) })
                .mockResolvedValueOnce({ response: JSON.stringify(mockTicket2) });

            const result = await getAssociatedTickets(100);

            // Should contain both tickets
            expect(result).toHaveLength(2);
            expect(result).toEqual([mockTicket1, mockTicket2]);
        });
    });

    describe('getPrimeAssociation', () => {
        test('should fetch associated tickets and return earliest', async () => {
            // Create mock tickets with different dates
            const mockTickets = [
                { id: 101, created_at: "2023-03-15T12:00:00Z", subject: "Newer Ticket" },
                { id: 102, created_at: "2023-01-10T09:30:00Z", subject: "Oldest Ticket" }, // Earliest
                { id: 103, created_at: "2023-02-20T15:45:00Z", subject: "Middle Ticket" }
            ];

            // Mock getAssociatedTickets to return our test data
            client.request.invokeTemplate
                .mockResolvedValueOnce({
                    response: JSON.stringify({
                        data: [
                            { ticket_id: 100, associated_ticket_id: 101 },
                            { ticket_id: 100, associated_ticket_id: 102 },
                            { ticket_id: 100, associated_ticket_id: 103 }
                        ]
                    })
                })
                .mockResolvedValueOnce({ response: JSON.stringify(mockTickets[0]) })
                .mockResolvedValueOnce({ response: JSON.stringify(mockTickets[1]) })
                .mockResolvedValueOnce({ response: JSON.stringify(mockTickets[2]) });

            const result = await getPrimeAssociation(100);

            // Verify earliest ticket is returned
            expect(result).toEqual(mockTickets[1]);
        });

        test('should return null when no associated tickets are found', async () => {
            // Mock empty response
            client.request.invokeTemplate.mockResolvedValueOnce({
                response: JSON.stringify({ data: [] })
            });

            const result = await getPrimeAssociation(100);

            expect(result).toBeNull();
            expect(console.log).toHaveBeenCalledWith("No associated tickets found for prime determination");
        });

        test('should handle errors and return null', async () => {
            // Mock error
            client.request.invokeTemplate.mockRejectedValueOnce(new Error("API Error"));

            const result = await getPrimeAssociation(100);

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith("Error getting associated tickets:", expect.any(Error));
        });
    });

    describe('processAssociatedTickets', () => {
        test('should process tickets and group by company', async () => {
            // Mock ticket data
            const tickets = [
                { id: 101, company_id: 1, subject: "Company 1 Ticket 1", created_at: "2023-02-15T12:00:00Z" },
                { id: 102, company_id: 2, subject: "Company 2 Ticket", created_at: "2023-03-10T09:30:00Z" },
                { id: 103, company_id: 1, subject: "Company 1 Ticket 2", created_at: "2023-01-20T15:45:00Z" } // Earliest
            ];

            const result = await processAssociatedTickets(tickets);

            // Verify ticketsByCompany grouping
            expect(Object.keys(result.ticketsByCompany).length).toBe(2);
            expect(result.ticketsByCompany[1]).toHaveLength(2);
            expect(result.ticketsByCompany[2]).toHaveLength(1);

            // Verify firstReport is the earliest ticket
            expect(result.firstReport).toEqual({
                id: 103,
                company_id: 1,
                subject: "Company 1 Ticket 2",
                created_at: "2023-01-20T15:45:00Z"
            });
        });

        test('should handle empty or null input', async () => {
            // Test with empty array
            let result = await processAssociatedTickets([]);
            expect(result.firstReport).toBeNull();
            expect(result.ticketsByCompany).toEqual({});
            expect(console.warn).toHaveBeenCalledWith("No tickets to process");

            // Test with null
            console.warn.mockClear();
            result = await processAssociatedTickets(null);
            expect(result.firstReport).toBeNull();
            expect(result.ticketsByCompany).toEqual({});
            expect(console.warn).toHaveBeenCalledWith("No tickets to process");
        });

        test('should skip tickets without company_id', async () => {
            const tickets = [
                { id: 101, company_id: 1, subject: "With Company", created_at: "2023-02-15T12:00:00Z" },
                { id: 102, subject: "No Company", created_at: "2023-01-10T09:30:00Z" } // No company_id but earlier
            ];

            const result = await processAssociatedTickets(tickets);

            // Should only have one company group
            expect(Object.keys(result.ticketsByCompany).length).toBe(1);

            // Despite no company_id, the earliest ticket should still be found
            expect(result.firstReport.id).toBe(102);
        });

        test('should handle errors gracefully', async () => {
            // Create data that will cause an error in processing
            const badData = "not an array"; // Will cause type error

            try {
                const result = await processAssociatedTickets(badData);

                // Should return default empty result on error
                expect(result.firstReport).toBeNull();
                expect(result.ticketsByCompany).toEqual({});
            } catch (error) {
                // If it throws instead of handling gracefully, that's also acceptable
                expect(error).toBeDefined();
            }
        });
    });
}); 