// This file exports functions from app.js for testing purposes

// Basic UI functions
function showNotification(type, message) {
    return client.interface.trigger("showNotify", {
        type: type,
        message: message
    });
}

function showBanner(text) {
    document.getElementById("newTicketBanner").value = text;
}

// Ticket creation functions
async function createfdTicket(agentName) {
    const ticketDetails = JSON.stringify({
        email: 'puppycat@email.com',
        subject: 'Hello',
        priority: 1,
        description: `Hey ${agentName} 👋, First HELLO always inspires!`,
        status: 2
    });
    // Send request
    await client.request.invokeTemplate("createfdTicket", {
        body: ticketDetails
    });
}

async function createfsTicket() {
    return await client.request.invokeTemplate("createfsTicket", {});
}

async function sayHello(agentName, isFreshDesk) {
    try {
        // Try creating a ticket
        if (isFreshDesk) {
            await createfdTicket(agentName);
        }
        else {
            await createfsTicket();
        }

        // If successful...
        console.info("Successfully created ticket in Freshdesk");
        showNotification("success", "Successfully created a ticket to say hello");
        showBanner("Freshdesk talks in tickets, check for new ticket.");
    } catch (error) {
        // If failed...
        console.error("Error: Failed to create a ticket");
        console.error(error);
        showNotification("danger", "Failed to create a ticket.");
    }
}

// Data processing functions
async function getCompanyDetails(companyId) {
    try {
        const response = await client.request.invokeTemplate("getCompanyDetails", {
            context: {
                companyId: companyId
            }
        });

        const companyData = JSON.parse(response.response);
        return companyData;
    } catch (error) {
        console.error("Error getting company details:", error);
        return null;
    }
}

function filterUniqueTickets(tickets) {
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
        return [];
    }

    const processedTicketIds = new Set();
    return tickets.filter(ticket => {
        if (!processedTicketIds.has(ticket.id)) {
            processedTicketIds.add(ticket.id);
            return true;
        }
        return false;
    });
}

function findEarliestTicket(tickets) {
    return tickets.reduce((earliest, ticket) => {
        const ticketDate = new Date(ticket.created_at);
        if (!earliest || ticketDate < new Date(earliest.created_at)) {
            return ticket;
        }
        return earliest;
    }, null);
}

function groupTicketsByCompany(tickets) {
    const ticketsByCompany = {};

    for (const ticket of tickets) {
        const companyId = ticket.company_id;
        if (!companyId) continue;

        if (!ticketsByCompany[companyId]) {
            ticketsByCompany[companyId] = [];
        }
        ticketsByCompany[companyId].push(ticket);
    }

    return ticketsByCompany;
}

// DOM-related functions
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
        openTicket(ticket.id);
    });

    // For testing purposes - expose event listeners
    if (typeof jest !== 'undefined') {
        ticketItem._eventListeners = {
            click: [function () {
                openTicket(ticket.id);
            }]
        };

        // Add dispatchEvent method for tests
        ticketItem.dispatchEvent = function (eventType) {
            if (this._eventListeners && this._eventListeners[eventType]) {
                this._eventListeners[eventType].forEach(listener => listener());
            }
            return null;
        };
    }

    return ticketItem;
}

function createCompanySection(companyData, companyId, tickets) {
    const companySection = document.createElement('div');
    companySection.className = 'company-section';

    // Create company header
    const companyHeader = document.createElement('div');
    companyHeader.className = 'company-header-clickable';

    // Use company name from data or fallback to company ID
    const companyName = companyData ? companyData.name : `Company ID: ${companyId}`;

    // Create expandable header with icon
    const expandIcon = document.createElement('div');
    expandIcon.className = 'expand-icon';
    expandIcon.textContent = '▶';

    // Create heading and add ticket count
    const heading = document.createElement('h3');
    heading.title = companyName;
    heading.textContent = companyName;
    
    // Create ticket count span
    const ticketCount = document.createElement('span');
    ticketCount.className = 'ticket-count';
    ticketCount.textContent = tickets.length;

    // Add all elements to the header
    companyHeader.appendChild(expandIcon);
    companyHeader.appendChild(heading);
    companyHeader.appendChild(ticketCount);

    // Add click handler to expand/collapse tickets
    companyHeader.addEventListener('click', function() {
        const content = this.nextElementSibling;
        const expandIcon = this.querySelector('.expand-icon');
        
        if (content && expandIcon) {
            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                expandIcon.textContent = '▼';
            } else {
                content.classList.add('collapsed');
                expandIcon.textContent = '▶';
            }
        }
    });

    companySection.appendChild(companyHeader);

    // Create tickets list container
    const ticketsList = document.createElement('div');
    ticketsList.className = 'tickets-list collapsed';

    // Add tickets to the list
    if (tickets && tickets.length) {
        // Create a table for tickets
        const ticketsTable = document.createElement('table');
        ticketsTable.className = 'tickets-table';

        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            
            row.innerHTML = `
                <td class="ticket-id">#${ticket.id}</td>
                <td class="ticket-subject">${ticket.subject || 'No subject'}</td>
                <td class="ticket-status">${ticket.status || ''}</td>
            `;
            
            // Add click handler to open the ticket
            row.addEventListener('click', function() {
                client.interface.trigger('click', { 
                    id: 'openTicket', 
                    value: ticket.id 
                });
            });
            
            ticketsTable.appendChild(row);
        });
        
        ticketsList.appendChild(ticketsTable);
    } else {
        ticketsList.innerHTML = '<p class="no-tickets">No tickets found for this company</p>';
    }

    companySection.appendChild(ticketsList);
    return companySection;
}

function updateFirstReportInfo(firstReport) {
    const infoContainer = document.getElementById("firstReportInfo");

    if (!firstReport) {
        if (infoContainer) {
            infoContainer.style.display = 'none';
        }
        return;
    }

    // Ensure container is visible first
    if (infoContainer) {
        infoContainer.style.display = 'flex';
    }

    // Get ticket ID and date elements
    const ticketIdElement = document.getElementById("firstReportTicketId");
    const dateTimeElement = document.getElementById("firstReportDateTime");

    if (ticketIdElement) {
        ticketIdElement.textContent = `#${firstReport.id}`;
        ticketIdElement.href = '#';
        // Add click event
        ticketIdElement.onclick = function (e) {
            e.preventDefault();
            client.interface.trigger("click", { id: "openTicket", value: firstReport.id });
        };
    }

    if (dateTimeElement && firstReport.created_at) {
        const firstReportDate = new Date(firstReport.created_at);
        dateTimeElement.textContent = firstReportDate.toLocaleString();
    }

    return infoContainer;
}

// Navigation and URL functions
function openTicket(ticketId) {
    client.interface.trigger("click", { id: "openTicket", value: ticketId });
    client.iparams.get("freshdesk_subdomain").then(iparams => {
        window.open(`https://${iparams.freshdesk_subdomain}.freshdesk.com/a/tickets/${ticketId}`, "_blank");
    }).catch(error => {
        console.error("Error getting freshdesk subdomain:", error);
        window.open(`https://freshdesk.com/a/tickets/${ticketId}`, "_blank");
    });
}

function sanitizeSubdomain(subdomain) {
    return subdomain.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
}

// API service functions
async function getAssociatedTickets(ticketId) {
    try {
        // Make API request to get associated tickets
        const result = await client.request.invokeTemplate("getTicketAssociations", {
            context: {
                ticketId: ticketId
            }
        });

        // Parse the result
        const response = JSON.parse(result.response);

        // Check if response has data
        if (!response || !response.data || !Array.isArray(response.data)) {
            console.warn("Invalid response format or no associations found");
            return [];
        }

        // Get the associated ticket IDs
        const associatedTicketIds = response.data.map(association => {
            return association.ticket_id === parseInt(ticketId)
                ? association.associated_ticket_id
                : association.ticket_id;
        });

        // If no associated tickets were found, return empty array
        if (associatedTicketIds.length === 0) {
            return [];
        }

        // Get details for each associated ticket
        const ticketDetails = await Promise.all(
            associatedTicketIds.map(async ticketId => {
                try {
                    const ticketResult = await client.request.invokeTemplate("getTicketById", {
                        context: {
                            ticketId: ticketId
                        }
                    });
                    return JSON.parse(ticketResult.response);
                } catch (error) {
                    console.error(`Error fetching ticket ${ticketId}:`, error);
                    return null;
                }
            })
        );

        // Filter out any failed requests
        return ticketDetails.filter(ticket => ticket !== null);
    } catch (error) {
        console.error("Error getting associated tickets:", error);
        return [];
    }
}

async function getPrimeAssociation(ticketId) {
    try {
        // Get all associated tickets
        const associatedTickets = await getAssociatedTickets(ticketId);

        if (!associatedTickets || associatedTickets.length === 0) {
            console.log("No associated tickets found for prime determination");
            return null;
        }

        // Find the earliest created ticket as prime
        const primeTicket = findEarliestTicket(associatedTickets);

        if (primeTicket) {
            console.log(`Prime ticket identified: #${primeTicket.id} created at ${primeTicket.created_at}`);
        }

        return primeTicket;
    } catch (error) {
        console.error("Error determining prime ticket:", error);
        return null;
    }
}

function processAssociatedTickets(data) {
    try {
        // Initialize result container
        const result = {
            ticketsByCompany: {},
            firstReport: null
        };

        // Check if we have valid data
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn("No tickets to process");
            return result;
        }

        // Find the earliest ticket
        result.firstReport = findEarliestTicket(data);

        // Group tickets by company
        for (const ticket of data) {
            const companyId = ticket.company_id;
            if (!companyId) continue;

            if (!result.ticketsByCompany[companyId]) {
                result.ticketsByCompany[companyId] = [];
            }
            result.ticketsByCompany[companyId].push(ticket);
        }

        return result;
    } catch (error) {
        console.error("Error processing associated tickets:", error);
        return {
            ticketsByCompany: {},
            firstReport: null
        };
    }
}

// Debug functions
function debugDistrictSubmission(ticketData) {
    console.group('District Field Submission Debug');
    console.log('Final ticket data for submission:', ticketData);

    // Check custom fields specifically
    if (ticketData.custom_fields) {
        console.log('Custom fields being submitted:');
        Object.keys(ticketData.custom_fields).forEach(key => {
            console.log(`${key}: ${ticketData.custom_fields[key]} (${typeof ticketData.custom_fields[key]})`);
        });

        // Only check for cf_district509811 field
        console.log('District dropdown field (cf_district509811):',
            ticketData.custom_fields.cf_district509811 || 'NOT SET');
    } else {
        console.warn('No custom fields found in ticket data!');
    }

    console.groupEnd();
}

// Export all functions for testing
module.exports = {
    showNotification,
    showBanner,
    createfdTicket,
    createfsTicket,
    sayHello,
    getCompanyDetails,
    filterUniqueTickets,
    findEarliestTicket,
    groupTicketsByCompany,
    createTicketElement,
    createCompanySection,
    updateFirstReportInfo,
    openTicket,
    sanitizeSubdomain,
    getAssociatedTickets,
    getPrimeAssociation,
    processAssociatedTickets,
    debugDistrictSubmission
}; 