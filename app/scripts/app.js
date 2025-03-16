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
      await createfsTicket(agentName);
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
      client.interface.trigger("click", { id: "openTicket", value: ticket.id });
      client.iparams.get("freshdesk_subdomain").then(iparams => {
        window.open(`https://${iparams.freshdesk_subdomain}.freshdesk.com/a/tickets/${ticket.id}`, "_blank");
      }).catch(() => {
        window.open(`https://freshdesk.com/a/tickets/${ticket.id}`, "_blank");
      });
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
 * Process the associated tickets data and group by company
 * 
 * @param {Object} data - The parsed API response
 * @returns {Promise<boolean>} - True if processing was successful
 */
async function processAssociatedTickets(data) {
  if (!data || !data.tickets || !Array.isArray(data.tickets) || data.tickets.length === 0) {
    document.getElementById("companyIds").textContent = "No associated tickets found";
    document.getElementById("companySummary").innerHTML = "<div class='no-data-message'>No associated tickets found</div>";
    document.getElementById("districtsCount").textContent = "0";
    document.getElementById("firstReportInfo").style.display = "none";
    return false;
  }

  // Create a Set to track unique ticket IDs to prevent duplicates
  const processedTicketIds = new Set();
  const uniqueTickets = data.tickets.filter(ticket => {
    if (!processedTicketIds.has(ticket.id)) {
      processedTicketIds.add(ticket.id);
      return true;
    }
    return false;
  });

  document.getElementById("companyIds").textContent = `${uniqueTickets.length} tickets found`;

  // Find the earliest created ticket (first report)
  let firstReport = uniqueTickets.reduce((earliest, ticket) => {
    const ticketDate = new Date(ticket.created_at);
    if (!earliest || ticketDate < new Date(earliest.created_at)) {
      return ticket;
    }
    return earliest;
  }, null);

  // Display first report information if available
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

  // Group tickets by company_id
  const ticketsByCompany = {};

  for (const ticket of uniqueTickets) {
    const companyId = ticket.company_id;
    if (!companyId) continue;

    if (!ticketsByCompany[companyId]) {
      ticketsByCompany[companyId] = [];
    }
    ticketsByCompany[companyId].push(ticket);
  }

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
    document.getElementById("companyIdsContainer").style.display = "block";
    document.getElementById("companyIds").textContent = "Loading...";
    document.getElementById("companySummary").innerHTML = "";
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

    document.getElementById("companyIds").textContent = `Error: ${error.message || "Unknown error"}`;
    document.getElementById("companySummary").innerHTML = "";
    document.getElementById("firstReportInfo").style.display = "none";
    showNotification("danger", "Failed to get associated tickets");
    return null;
  }
}

// Add a helper function to open tickets
function openTicket(ticketId) {
  client.interface.trigger("click", { id: "openTicket", value: ticketId });
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
  document.getElementById("companyIdsContainer").style.display = "block";

  // Hide districts count for related tickets
  document.querySelector(".districts-count").style.display = "none";
  document.getElementById("firstReportInfo").style.display = "none";

  // Create info message
  const infoDiv = document.createElement("div");
  infoDiv.className = "tracker-link-message";
  infoDiv.innerHTML = `
    <div class="tracker-info">
      This ticket is related to tracker ticket:
      <a href="#" class="tracker-link" id="trackerLink">
        #${trackerTicket.id}: ${trackerTicket.subject}
      </a>
    </div>
    <fw-button id="viewAssociatedBtn" color="secondary" size="small">
      View Associated Tickets
    </fw-button>
  `;

  document.getElementById("companySummary").appendChild(infoDiv);

  // Add event listener to tracker link
  document.getElementById("trackerLink").addEventListener("click", function (e) {
    e.preventDefault();
    client.iparams.get("freshdesk_subdomain").then(iparams => {
      window.open(`https://${iparams.freshdesk_subdomain}.freshdesk.com/a/tickets/${trackerTicket.id}`, "_blank");
    }).catch(() => {
      window.open(`https://freshdesk.com/a/tickets/${trackerTicket.id}`, "_blank");
    });
  });

  // Add event listener to view associated button
  document.getElementById("viewAssociatedBtn").addEventListener("click", function () {
    getAssociatedTickets(trackerTicket.id);
  });
}

/**
 * Load associated tickets for the current ticket
 */
function loadAssociatedTickets() {
  // Clear any previous results to prevent duplication
  document.getElementById("companyIds").textContent = "Loading...";
  document.getElementById("companySummary").innerHTML = "";
  document.getElementById("districtsCount").textContent = "0";
  document.getElementById("firstReportInfo").style.display = "none";

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

/**
 * Opens the tracker creation modal
 */
function openTrackerModal() {
  client.interface.trigger("showModal", {
    title: "Select Tracker Template",
    template: "template-selector.html"
  });
}

/**
 * Opens modal with only ticket data if agent data can't be fetched
 * (Helper function for openTrackerModal)
 */
function openModalWithTicketDataOnly() {
  // ...existing code...
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

  // Add event listener for Create Tracker link - FIX THE EVENT LISTENER
  const createTrackerLink = document.getElementById("createTrackerLink");
  if (createTrackerLink) {
    // Remove any existing listeners first
    createTrackerLink.removeEventListener("click", openTrackerModal);

    // Add the click event listener directly to the existing element
    createTrackerLink.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Create tracker clicked");
      openTrackerModal();
    });

    // Make sure the link is visible and styled properly
    createTrackerLink.style.display = "inline-block";
    createTrackerLink.style.cursor = "pointer";
  } else {
    console.error("Create Tracker link element not found");
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

// Replace deprecated listener with MutationObserver and ensure the target element exists
const targetNode = document.getElementById("targetElement"); // choose the element to watch
if (targetNode) {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      // Your callback logic goes here
      console.log("DOM change detected:", mutation);
    }
  });
  observer.observe(targetNode, { childList: true, subtree: true });
} else {
  console.warn("targetElement not found, skipping MutationObserver setup");
}

document.onreadystatechange = function () {
  if (document.readyState === 'complete') renderApp();

  function renderApp() {
    const onInit = app.initialized();

    onInit.then(function (_client) {
      window.client = _client;

      // Check if Freshdesk subdomain is configured
      client.iparams.get("freshdesk_subdomain").then(function (iparams) {
        console.log("App initialization - iparams retrieved:", iparams);

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