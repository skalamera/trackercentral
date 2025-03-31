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