// Add this at the very top of app.js
console.log("app.js loading started");

/**
 * Show a notification toast with the given type and message
 *
 * @param {String} type - type of the notification
 * @param {String} message - content to be shown in the notification
 **/
function showNotification(type, message) {
  return client.interface.trigger("showNotify", {
    type: type,
    message: message
  });
}

/**
 * Show a banner with the given text within the app
 *
 * @param {String} text - Text to be shown in the banner
 */
function showBanner(text) {
  document.getElementById("newTicketBanner").value = text;
}


/**
 * Create a Freshdesk ticket to say hello
 *
 * @param {String} agentName - The name of the logged in agent
 */
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

/**
 * To let Freshdesk say hello through ticket
 *
 * @param {String} agentName - The name of the logged in agent
 * @param {Boolean} isFreshDesk - Whether the platform is Freshdesk or not
 */
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

/**
 * Get company details by ID
 * 
 * @param {Number} companyId - ID of the company
 * @returns {Object} - Company details
 */
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

/**
 * Process a ticket item and create a clickable element
 * 
 * @param {Object} ticket - Ticket data
 * @returns {HTMLElement} - Ticket list item element
 */
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

/**
 * Create a collapsible company section with its tickets
 * 
 * @param {Object} companyData - Company information
 * @param {String} companyId - Company ID
 * @param {Array} tickets - Tickets associated with the company
 * @returns {HTMLElement} - Company section element
 */
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

/**
 * Filter tickets to remove duplicates
 * 
 * @param {Array} tickets - Array of ticket objects
 * @returns {Array} - Filtered array of unique tickets
 */
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

/**
 * Find the earliest created ticket from a list
 * 
 * @param {Array} tickets - Array of ticket objects
 * @returns {Object|null} - The earliest ticket or null
 */
function findEarliestTicket(tickets) {
  return tickets.reduce((earliest, ticket) => {
    const ticketDate = new Date(ticket.created_at);
    if (!earliest || ticketDate < new Date(earliest.created_at)) {
      return ticket;
    }
    return earliest;
  }, null);
}

/**
 * Group tickets by company ID
 * 
 * @param {Array} tickets - Array of ticket objects
 * @returns {Object} - Object with company IDs as keys and arrays of tickets as values
 */
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

/**
 * Process the associated tickets data and group by company
 * 
 * @param {Object} data - The parsed API response
 * @returns {Promise<boolean>} - True if processing was successful
 */
async function processAssociatedTickets(data) {
  // Handle empty or invalid data
  if (!data || !data.tickets || !Array.isArray(data.tickets) || data.tickets.length === 0) {
    document.getElementById("companyIds").textContent = "No associated tickets found";
    document.getElementById("companySummary").innerHTML = "<div class='no-data-message'>No associated tickets found</div>";
    document.getElementById("districtsCount").textContent = "0";
    document.getElementById("firstReportInfo").style.display = "none";
    return false;
  }

  // Filter to unique tickets
  const uniqueTickets = filterUniqueTickets(data.tickets);
  document.getElementById("companyIds").textContent = `${uniqueTickets.length} tickets found`;

  // Find earliest ticket and display first report info
  const firstReport = findEarliestTicket(uniqueTickets);
  updateFirstReportInfo(firstReport);

  // Group tickets by company
  const ticketsByCompany = groupTicketsByCompany(uniqueTickets);
  return await renderCompanySections(ticketsByCompany);
}

/**
 * Update the first report information in the UI
 * 
 * @param {Object|null} firstReport - The earliest ticket or null
 */
function updateFirstReportInfo(firstReport) {
  if (firstReport) {
    const firstReportDate = new Date(firstReport.created_at);
    document.getElementById("firstReportInfo").style.display = "flex";
    document.getElementById("firstReportTicketId").textContent = `#${firstReport.id}`;
    document.getElementById("firstReportTicketId").href = "#";
    document.getElementById("firstReportTicketId").onclick = function (e) {
      e.preventDefault();
      openTicket(firstReport.id);
    };
    document.getElementById("firstReportDateTime").textContent = firstReportDate.toLocaleString();
  } else {
    document.getElementById("firstReportInfo").style.display = "none";
  }
}

/**
 * Render company sections with their tickets
 * 
 * @param {Object} ticketsByCompany - Object with company IDs as keys and arrays of tickets as values
 * @returns {Promise<boolean>} - True if rendering was successful
 */
async function renderCompanySections(ticketsByCompany) {
  const companySummaryDiv = document.getElementById("companySummary");
  companySummaryDiv.innerHTML = "<div class='loading-spinner'>Loading company details...</div>";

  // Process each company
  const companyIds = Object.keys(ticketsByCompany);
  if (companyIds.length === 0) {
    companySummaryDiv.innerHTML = "<div class='no-data-message'>No companies found in associated tickets</div>";
    document.getElementById("districtsCount").textContent = "0";
    return true;
  }

  // Update districts count
  document.getElementById("districtsCount").textContent = companyIds.length.toString();

  try {
    // Clear any existing company sections to prevent duplication
    companySummaryDiv.innerHTML = "<div class='loading-spinner'>Loading company details...</div>";

    // Process companies sequentially to maintain order
    for (const companyId of companyIds) {
      try {
        const companyData = await getCompanyDetails(companyId);
        const tickets = ticketsByCompany[companyId];
        const companySection = createCompanySection(companyData, companyId, tickets);
        companySummaryDiv.appendChild(companySection);
      } catch (companyError) {
        console.error(`Error processing company ${companyId}:`, companyError);

        const errorSection = document.createElement("div");
        errorSection.className = "error-card";
        errorSection.textContent = `Could not load data for company ID: ${companyId}`;
        companySummaryDiv.appendChild(errorSection);
      }
    }

    // Remove loading spinner
    const spinner = companySummaryDiv.querySelector('.loading-spinner');
    if (spinner) {
      companySummaryDiv.removeChild(spinner);
    }

    return true;
  } catch (processingError) {
    console.error("Error processing companies:", processingError);

    // Remove loading spinner
    const spinner = companySummaryDiv.querySelector('.loading-spinner');
    if (spinner) {
      companySummaryDiv.removeChild(spinner);
    }

    companySummaryDiv.innerHTML += "<div class='error-card'>Error processing company data</div>";
    return false;
  }
}

/**
 * Get associated tickets for the current ticket
 * 
 * @param {Number} ticketId - ID of the current ticket
 */
async function getAssociatedTickets(ticketId) {
  try {
    // Make sure container is visible
    const container = document.getElementById("companyIdsContainer");
    if (container) {
      container.style.display = "block";
    }

    document.getElementById("companyIds").textContent = "Loading...";
    document.getElementById("companySummary").innerHTML = "<div class='loading-spinner'>Loading associated tickets...</div>";
    document.getElementById("firstReportInfo").style.display = "none";

    // Show districts count when viewing associated tickets (might have been hidden for related tickets)
    document.querySelector(".districts-count").style.display = "block";

    // Make API call to get associated tickets
    const response = await client.request.invokeTemplate("getAssociatedTickets", {
      context: {
        ticketId: ticketId
      }
    });

    // Parse response
    let data;
    try {
      data = JSON.parse(response.response);
    } catch (parseError) {
      console.error("Failed to parse API response:", parseError);
      document.getElementById("companyIds").textContent = "Error parsing response data";
      return null;
    }

    // Process and display the ticket information
    await processAssociatedTickets(data);
    return data;

  } catch (error) {
    console.error("Error getting associated tickets:", error);

    document.getElementById("companySummary").innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i> Failed to get associated tickets: ${error.message || "Unknown error"}
      </div>
    `;
    return null;
  }
}

// Add a helper function to open tickets
function openTicket(ticketId) {
  client.interface.trigger("click", { id: "openTicket", value: ticketId });
  client.iparams.get("freshdesk_subdomain").then(iparams => {
    if (!iparams || !iparams.freshdesk_subdomain) {
      console.warn("Missing Freshdesk subdomain, using default URL");
      window.open(`https://freshdesk.com/a/tickets/${ticketId}`, "_blank");
      return;
    }

    const subdomain = sanitizeSubdomain(iparams.freshdesk_subdomain);
    window.open(`https://${subdomain}.freshdesk.com/a/tickets/${ticketId}`, "_blank");
  }).catch(error => {
    console.error("Error getting Freshdesk subdomain:", error);
    // Use a more informative error message
    showNotification("warning", "Could not get Freshdesk domain, using default URL");
    window.open(`https://freshdesk.com/a/tickets/${ticketId}`, "_blank");
  });
}

/**
 * Get tracker ticket for a related ticket
 * 
 * @param {Number} ticketId - ID of the current ticket
 * @returns {Promise<Object|null>} - Tracker ticket data or null
 */
async function getPrimeAssociation(ticketId) {
  try {
    const response = await client.request.invokeTemplate("getPrimeAssociation", {
      context: {
        ticketId: ticketId
      }
    });

    const trackerData = JSON.parse(response.response);
    return trackerData;
  } catch (error) {
    console.error("Error getting prime association:", error);
    return null;
  }
}

/**
 * Display related ticket information with a link to the tracker
 * 
 * @param {Object} trackerTicket - Tracker ticket information
 */
function displayRelatedTicketInfo(trackerTicket) {
  // Show container
  document.getElementById("companyIds").textContent = "1 tracker found";
  // Remove setting the districts count since the element is hidden
  // document.getElementById("districtsCount").textContent = "1";

  // Create a styled tracker link message
  const infoDiv = document.createElement("div");
  infoDiv.style.padding = "10px 15px";
  infoDiv.style.borderBottom = "1px solid #eee";

  infoDiv.innerHTML = `
    <div style="margin-bottom: 8px;">
      <strong>Related to tracker:</strong>
      <a href="#" class="ticket-link" id="trackerLink">
        #${trackerTicket.id}: ${trackerTicket.subject}
      </a>
    </div>
    <fw-button id="viewAssociatedBtn" color="secondary" size="small" style="--fw-button-font-size: 12px; --fw-button-padding: 5px 10px; --fw-button-min-width: auto;">
      View Associated Tickets
    </fw-button>
  `;

  document.getElementById("companySummary").appendChild(infoDiv);

  // Add event listener to tracker link
  document.getElementById("trackerLink").addEventListener("click", function (e) {
    e.preventDefault();
    openTicket(trackerTicket.id);
  });

  // Add event listener to view associated button
  document.getElementById("viewAssociatedBtn").addEventListener("click", function () {
    getAssociatedTickets(trackerTicket.id);
  });
}

/**
 * Opens the tracker creation modal
 */
function openTrackerModal() {
  client.interface.trigger("showModal", {
    title: "Tracker Central",
    template: "template-selector.html"
  });
}

/**
 * Opens modal with only ticket data if agent data can't be fetched
 * (Helper function for openTrackerModal)
 */
function openModalWithTicketDataOnly() {
  client.data.get("ticket").then(function (ticketData) {
    if (ticketData && ticketData.ticket) {
      // Store ticket data for templates to use
      localStorage.setItem('ticketData', JSON.stringify(ticketData.ticket));

      // Open the modal
      client.interface.trigger("showModal", {
        title: "Tracker Central",
        template: "template-selector.html"
      });
    } else {
      showNotification("danger", "Could not retrieve ticket data");
    }
  }).catch(function (error) {
    console.error("Error getting ticket data:", error);
    showNotification("danger", "Failed to get ticket data");
  });
}

function onAppActivate() {
  // Only load data once when the app first activates
  if (!window.dataLoaded) {
    loadAssociatedTickets();
    window.dataLoaded = true;
  }

  // Setup event listener for the button - use standard DOM event for better compatibility
  const refreshButton = document.getElementById("btnGetAssociated");

  // Remove any existing event listeners to prevent duplication
  const newRefreshButton = refreshButton.cloneNode(true);
  refreshButton.parentNode.replaceChild(newRefreshButton, refreshButton);

  // Add the event listener to the new button
  newRefreshButton.addEventListener("click", function () {
    window.dataLoaded = false; // Reset the flag so we can reload
    loadAssociatedTickets();
  });

  // Add event listener for Create Tracker link
  const createTrackerLink = document.getElementById("createTrackerLink");
  if (createTrackerLink) {
    // Remove any existing listeners first
    const newButton = createTrackerLink.cloneNode(true);
    createTrackerLink.parentNode.replaceChild(newButton, createTrackerLink);

    // Add click handler
    newButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Create tracker clicked");

      // Clear localStorage data
      console.log("🧹 Purging all district data from localStorage before opening tracker");
      const keysToCheck = ['sourceTicketData', 'sedcustData', 'assemblyData', 'districtCache'];

      keysToCheck.forEach(key => {
        try {
          if (localStorage.getItem(key)) {
            console.log(`Removing cached data from ${key}`);
            localStorage.removeItem(key);
          }
        } catch (e) {
          console.error(`Error removing ${key}:`, e);
        }
      });

      openTrackerModal();
    });

    // Make sure the button is styled properly
    newButton.style.cursor = "pointer";
  }

  // Listen for modal events
  client.events.on('modal.close', function (data) {
    // Check if we need to refresh tickets based on data from modal
    if (data && data.refreshTickets) {
      loadAssociatedTickets();
    }
  });

  // Hide elements we don't need anymore
  const elementsToHide = ["agentName", "fd-product", "btnSayHello"];
  for (const id of elementsToHide) {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = "none";
    }
  }
}

// Make loadAssociatedTickets globally accessible for the modal
window.loadAssociatedTickets = loadAssociatedTickets;

/**
 * Sanitize the Freshdesk subdomain to ensure it doesn't include .freshdesk.com
 * @param {string} subdomain - The subdomain from configuration
 * @return {string} - The sanitized subdomain
 */
function sanitizeSubdomain(subdomain) {
  if (!subdomain) return '';
  // Remove any .freshdesk.com suffix if present
  return subdomain.replace(/\.freshdesk\.com$/i, '');
}

/**
 * Function stub for Freshservice ticket creation
 * Not needed if your app only uses Freshdesk
 */
function createfsTicket() {
  // Since you're using Freshdesk, this is just a stub implementation
  console.warn("createfsTicket called but not implemented");
  return Promise.reject(new Error("Freshservice ticket creation not implemented"));
}

// Set up MutationObserver for the company summary section
document.addEventListener('DOMContentLoaded', function () {
  const targetNode = document.getElementById("companySummary");
  if (targetNode) {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Content has been added to the company summary
          console.log("Company data loaded");
          // Additional actions if needed when company data loads
        }
      }
    });
    observer.observe(targetNode, { childList: true, subtree: true });
  }
});

document.onreadystatechange = function () {
  if (document.readyState === 'complete') renderApp();

  function renderApp() {
    const onInit = app.initialized();

    onInit.then(function (_client) {
      window.client = _client;

      // Check if Freshdesk subdomain is configured
      client.iparams.get("freshdesk_subdomain").then(function (iparams) {
        console.log("App initialization - iparams retrieved:", iparams);

        // Sanitize the subdomain and store it for future use
        if (iparams && iparams.freshdesk_subdomain) {
          iparams.freshdesk_subdomain = sanitizeSubdomain(iparams.freshdesk_subdomain);
          console.log("Sanitized subdomain:", iparams.freshdesk_subdomain);
        }

        if (!iparams || !iparams.freshdesk_subdomain || !iparams.freshdesk_subdomain.trim()) {
          console.error("Missing or empty Freshdesk subdomain in configuration");
          document.body.innerHTML = `
            <div style="padding: 20px; background-color: #ffebee; color: #c62828; border-radius: 4px; margin: 10px;">
              <h3>Configuration Error</h3>
              <p>The Freshdesk subdomain is missing or invalid in the app configuration.</p>
              <p>Please contact your administrator to reconfigure this app with a valid subdomain.</p>
            </div>
          `;
          return;
        }

        // Continue with normal app initialization
        client.events.on("app.activated", onAppActivate);
      }).catch(function (error) {
        console.error("Failed to get installation parameters:", error);
        document.body.innerHTML = `
          <div style="padding: 20px; background-color: #ffebee; color: #c62828; border-radius: 4px; margin: 10px;">
            <h3>Configuration Error</h3>
            <p>Failed to retrieve app configuration parameters.</p>
            <p>Error: ${error.message || "Unknown error"}</p>
          </div>
        `;
      });
    }).catch(function (error) {
      console.error('Error: Failed to initialise the app');
      console.error(error);
    });
  }
};

/**
 * Load associated tickets for the current ticket
 */
function loadAssociatedTickets() {
  // Clear any previous results to prevent duplication
  document.getElementById("companyIds").textContent = "Loading...";
  document.getElementById("companySummary").innerHTML = "";
  document.getElementById("districtsCount").textContent = "0";
  document.getElementById("firstReportInfo").style.display = "none";

  // Make sure container is visible
  const container = document.getElementById("companyIdsContainer");
  if (container) {
    container.style.display = "block";
  }

  // Get current ticket ID
  client.data.get("ticket").then(async function (ticketData) {
    if (!ticketData || !ticketData.ticket || !ticketData.ticket.id) {
      console.error("Ticket data missing required properties");
      showNotification("danger", "Failed to get ticket ID from context");
      document.getElementById("companyIdsContainer").style.display = "block";
      document.getElementById("companyIds").textContent = "Error: Cannot determine current ticket ID";
      return;
    }

    const ticketId = ticketData.ticket.id;
    const associationType = ticketData.ticket.association_type;

    // Handle different association types
    if (associationType === 3) {
      // Tracker ticket (type 3) - show associated tickets directly
      getAssociatedTickets(ticketId);
    }
    else if (associationType === 4) {  // Changed from 2 to 4 for related tickets
      // Related ticket (type 4) - get the tracker and show link
      try {
        const trackerTicket = await getPrimeAssociation(ticketId);

        if (trackerTicket && trackerTicket.id) {
          document.getElementById("companyIds").textContent = "Related to Tracker #" + trackerTicket.id;
          // Hide districts count for related tickets
          document.querySelector(".districts-count").style.display = "none";
          displayRelatedTicketInfo(trackerTicket);
        } else {
          document.getElementById("companyIds").textContent = "No tracker ticket found";
          document.getElementById("companySummary").innerHTML = "<div class='no-data-message'>Could not find tracker ticket for this related ticket</div>";
        }
      } catch (error) {
        console.error("Error processing related ticket:", error);
        document.getElementById("companyIds").textContent = "Error finding tracker ticket";
        document.getElementById("companySummary").innerHTML = "<div class='error-card'>Failed to retrieve tracker ticket information</div>";
      }
    }
    else {
      // Not associated with anything - hide districts count
      document.getElementById("companyIdsContainer").style.display = "block";
      document.querySelector(".districts-count").style.display = "none"; // Hide districts count
      document.getElementById("firstReportInfo").style.display = "none"; // Hide first report
      document.getElementById("companyIds").textContent = "This ticket is not associated with other tickets";
      document.getElementById("companySummary").innerHTML = "<div class='no-data-message'>This ticket doesn't have any ticket associations</div>";
    }
  }).catch(function (error) {
    console.error("Error getting ticket data:", error);
    document.getElementById("companyIdsContainer").style.display = "block";
    document.getElementById("companyIds").textContent = "Error getting ticket data: " + (error.message || "Unknown error");
    document.getElementById("firstReportInfo").style.display = "none";
    showNotification("danger", "Failed to get ticket data");
  });
}

