# My Trackers Widget and Modal Replication Guide

## Overview

This document provides detailed instructions for replicating the "My Trackers" widget and modal functionality from the Tracker Central application. The implementation consists of a carousel-based widget system that displays tracker counts and a detailed modal for viewing and managing tracker tickets.

## Architecture Components

### 1. Widget Structure
- **Carousel-based widget system** with 3 widgets: Today's Trackers, My Trackers, and Backlogged
- **Simple widget mode** for users who prefer the classic view
- **Modal system** for displaying detailed tracker information
- **Real-time data loading** from Freshdesk API
- **Local storage** for user preferences and caching

### 2. Core Technologies
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API Integration**: Freshdesk API via client SDK
- **Storage**: LocalStorage for preferences, Freshdesk DB for data persistence
- **Styling**: CSS Custom Properties for theming

---

## HTML Structure

### 1. Main Widget Container

```html
<!-- TRACKER WIDGETS CAROUSEL -->
<div id="trackerWidgetsCarousel" class="tracker-widgets-carousel">
    <div class="carousel-container">
        <div class="carousel-track">
            <!-- Today's Trackers Widget -->
            <div class="carousel-slide active" data-widget="today">
                <div class="tracker-counts-dashboard">
                    <div class="dashboard-header">
                        <div class="dashboard-title-row">
                            <h3><i class="fas fa-chart-bar"></i> Today's Trackers 
                                <span id="trackerTotalCount" class="dashboard-count"></span>
                            </h3>
                            <div class="dashboard-actions">
                                <button class="view-all-btn" id="viewAllTrackersBtn" title="View all trackers">
                                    <i class="fas fa-list"></i> View All
                                </button>
                            </div>
                        </div>
                        <span id="dashboardDate" class="dashboard-date"></span>
                    </div>
                </div>
            </div>

            <!-- My Trackers Widget -->
            <div class="carousel-slide" data-widget="my">
                <div class="tracker-counts-dashboard">
                    <div class="dashboard-header">
                        <div class="dashboard-title-row">
                            <h3><i class="fas fa-user-tag"></i> My Trackers 
                                <span id="myTrackerCount" class="dashboard-count"></span>
                            </h3>
                            <div class="dashboard-actions">
                                <button class="view-all-btn" id="viewMyTrackersBtn" title="View my trackers">
                                    <i class="fas fa-list"></i> View All
                                </button>
                            </div>
                        </div>
                        <span class="dashboard-date">Unresolved trackers assigned to you</span>
                    </div>
                </div>
            </div>

            <!-- Backlogged Widget -->
            <div class="carousel-slide" data-widget="backlog">
                <div class="tracker-counts-dashboard">
                    <div class="dashboard-header">
                        <div class="dashboard-title-row">
                            <h3><i class="fas fa-clock"></i> Backlogged 
                                <span id="backlogTrackerCount" class="dashboard-count"></span>
                            </h3>
                            <div class="dashboard-actions">
                                <button class="view-all-btn" id="viewBacklogTrackersBtn" title="View backlogged trackers">
                                    <i class="fas fa-list"></i> View All
                                </button>
                            </div>
                        </div>
                        <span class="dashboard-date">Trackers in backlog status</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Navigation controls -->
    <div class="carousel-nav-container">
        <button class="carousel-nav carousel-prev" id="carouselPrev" aria-label="Previous widget">
            <i class="fas fa-chevron-left"></i>
        </button>
        <button class="carousel-nav carousel-next" id="carouselNext" aria-label="Next widget">
            <i class="fas fa-chevron-right"></i>
        </button>
    </div>

    <!-- Carousel indicators -->
    <div class="carousel-indicators">
        <button class="carousel-dot active" data-slide="0" aria-label="Go to Today's Trackers"></button>
        <button class="carousel-dot" data-slide="1" aria-label="Go to My Trackers"></button>
        <button class="carousel-dot" data-slide="2" aria-label="Go to Backlogged"></button>
    </div>
</div>
```

### 2. Modal Structure

```html
<!-- TRACKER DETAILS MODAL -->
<div id="trackerDetailsModal" class="tracker-modal" style="display: none;">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modalTitle"><i class="fas fa-list"></i> <span>Today's Trackers</span></h3>
            <button class="modal-close" id="closeTrackerModal">&times;</button>
        </div>
        <div class="modal-body">
            <!-- Filter and Sort Controls (shown only for My Trackers) -->
            <div id="modalControls" class="modal-controls" style="display: none;">
                <div class="filter-sort-controls">
                    <div class="filter-control">
                        <label for="statusFilter">Filter by Status:</label>
                        <select id="statusFilter">
                            <option value="">All Statuses</option>
                            <option value="2">Open</option>
                            <option value="3">Pending</option>
                            <option value="6">Waiting on Customer</option>
                            <option value="8">Escalated</option>
                            <!-- Add more status options as needed -->
                        </select>
                    </div>
                    <div class="sort-control">
                        <label for="sortBy">Sort by:</label>
                        <select id="sortBy">
                            <option value="created_desc">Created Date (Newest First)</option>
                            <option value="created_asc">Created Date (Oldest First)</option>
                            <option value="updated_desc">Updated Date (Most Recent)</option>
                            <option value="updated_asc">Updated Date (Least Recent)</option>
                        </select>
                    </div>
                </div>
            </div>
            <div id="trackerDetailsList" class="tracker-details-list">
                <!-- Tracker details will be populated here -->
            </div>
        </div>
    </div>
</div>
```

---

## CSS Styling

### 1. Widget Carousel Styles

```css
.tracker-widgets-carousel {
    background-color: var(--card-bg);
    border-radius: 12px;
    padding: 0;
    margin-bottom: 30px;
    box-shadow: 0 4px 6px var(--shadow-color);
    border: 1px solid var(--card-border);
    overflow: hidden;
}

.carousel-container {
    position: relative;
    width: 100%;
    overflow: hidden;
}

.carousel-track {
    display: flex;
    transition: transform 0.3s ease;
    width: 300%;
}

.carousel-slide {
    flex: 0 0 33.333%;
    min-height: 120px;
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

.carousel-slide.active {
    opacity: 1;
}

.tracker-counts-dashboard {
    padding: 20px;
    background-color: var(--card-bg);
    border-radius: 12px;
    margin: 0;
}

.dashboard-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.dashboard-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
}

.dashboard-count {
    background-color: var(--secondary-color);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: 600;
    min-width: 24px;
    text-align: center;
}

.view-all-btn {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;
    white-space: nowrap;
    flex-shrink: 0;
}

.view-all-btn:hover {
    background-color: #45a049;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Support Review Alert Button */
.view-all-btn.support-review-alert {
    background: linear-gradient(135deg, #ff6b35, #ff8f00);
    color: #fff;
    font-weight: bold;
    border: 2px solid #ff6b35;
    box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
    animation: pulseWarning 2s ease-in-out infinite;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes pulseWarning {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.9;
    }
}

/* Carousel Navigation */
.carousel-nav-container {
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    margin-top: 10px;
}

.carousel-nav {
    background-color: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--text-color);
}

.carousel-nav:hover {
    background-color: var(--secondary-color);
    color: white;
    transform: scale(1.05);
}

.carousel-indicators {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 15px 0;
}

.carousel-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--input-border);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.carousel-dot.active {
    background-color: var(--secondary-color);
}
```

### 2. Modal Styles

```css
.tracker-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.modal-content {
    background-color: var(--card-bg, white);
    border-radius: 12px;
    max-width: 800px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--card-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
}

.modal-controls {
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--card-bg);
}

.filter-sort-controls {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: center;
}

.tracker-details-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.tracker-item {
    background-color: var(--card-bg);
    padding: 12px;
    border-radius: 6px;
    border: 1px solid var(--card-border);
    transition: all 0.3s ease;
}

.tracker-item:hover {
    transform: translateX(3px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.tracker-item.needs-review {
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
    box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
}

.tracker-item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.tracker-item-details {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    font-size: 13px;
    color: var(--secondary-text);
}

.tracker-needs-review {
    color: #ffc107;
    margin-left: 8px;
    font-size: 16px;
    animation: pulseReview 2s ease-in-out infinite;
}

@keyframes pulseReview {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}
```

---

## JavaScript Implementation

### 1. Core Widget Functions

```javascript
// Global variables
let currentSlide = 1;  // Start at middle widget (My Trackers)
const totalSlides = 3;
let window.myTrackers = [];
let window.todayTrackers = [];
let window.backloggedTrackers = [];

// Widget preference functions
function getWidgetPreference() {
    return localStorage.getItem('trackerWidgetPreference') || 'carousel';
}

function setWidgetPreference(preference) {
    localStorage.setItem('trackerWidgetPreference', preference);
}

// Main initialization function
function loadAndDisplayTrackerCounts() {
    console.log("Loading daily tracker counts");
    
    if (!window.client) {
        console.warn("Client not available for loading tracker counts");
        return;
    }
    
    const today = getTodayDateString();
    const storageKey = `tracker-details-${today}`;
    
    // Load today's tracker details from Freshdesk storage
    client.db.get(storageKey)
        .then(function (data) {
            console.log(`Loaded tracker details for ${today}:`, data);
            const trackers = data?.trackers || [];
            displayTrackerCounts(trackers, today);
        })
        .catch(function (error) {
            console.log(`No tracker details found for ${today}:`, error);
            displayTrackerCounts([], today);
        });
}

function displayTrackerCounts(trackers, date) {
    const preference = getWidgetPreference();
    const carousel = document.getElementById('trackerWidgetsCarousel');
    const simpleWidget = document.getElementById('simpleTrackerWidget');
    
    // Store trackers globally
    window.todayTrackers = trackers;
    
    // Calculate total count
    const totalCount = trackers.length;
    
    // Show appropriate widget based on preference
    if (preference === 'classic') {
        carousel.style.display = 'none';
        simpleWidget.style.display = 'block';
        // Update simple widget elements
        updateSimpleWidget(totalCount);
    } else {
        carousel.style.display = 'block';
        simpleWidget.style.display = 'none';
        // Update carousel elements
        updateCarouselWidget(totalCount);
        
        // Load data for other widgets
        loadMyTrackers();
        loadBackloggedTrackers();
        initializeCarousel();
    }
}
```

### 2. My Trackers Data Loading

```javascript
async function loadMyTrackers() {
    try {
        if (!window.client) {
            console.warn("Client not available for loading my trackers");
            return;
        }
        
        // Get logged in user
        const userData = await client.data.get("loggedInUser");
        if (!userData || !userData.loggedInUser) {
            console.warn("Could not get logged in user data");
            updateMyTrackersDisplay(0);
            return;
        }
        
        const userId = userData.loggedInUser.id;
        console.log("Loading trackers for user ID:", userId);
        
        // Convert userId to both string and number for comparison
        const userIdStr = String(userId);
        const userIdNum = parseInt(userId, 10);
        
        try {
            // Search for tickets assigned to current agent with unresolved statuses
            const unresolved = [2, 3, 6, 8, 9, 10, 11, 14, 15, 22, 23, 25, 26, 29, 30, 33, 36, 37];
            const filter = `tag:tracker AND agent_id:${userId} AND status:[${unresolved.join(' OR ')}]`;
            
            console.log("Searching for My Trackers with filter:", filter);
            
            const response = await client.request.invokeTemplate("getTicketsByFilter", {
                context: {
                    filter: filter
                }
            });
            
            const data = JSON.parse(response.response);
            console.log("My Trackers API response:", data);
            
            // Handle different response formats
            let tickets = [];
            if (data && data.results && Array.isArray(data.results)) {
                tickets = data.results;
            } else if (data && data.tickets && Array.isArray(data.tickets)) {
                tickets = data.tickets;
            } else if (Array.isArray(data)) {
                tickets = data;
            }
            
            console.log(`Retrieved ${tickets.length} tickets for user ${userId}`);
            
            // Filter for tracker tickets
            const trackerTickets = tickets.filter(ticket => {
                const isTracker = ticket.tags && Array.isArray(ticket.tags) &&
                    ticket.tags.some(tag => tag === 'tracker' || tag.startsWith('tracker-'));
                return isTracker;
            });
            
            // Remove duplicates
            const uniqueTrackers = [];
            const seenIds = new Set();
            
            trackerTickets.forEach(ticket => {
                if (!seenIds.has(ticket.id)) {
                    seenIds.add(ticket.id);
                    uniqueTrackers.push(ticket);
                }
            });
            
            window.myTrackers = uniqueTrackers;
            console.log(`Found ${uniqueTrackers.length} unique tracker tickets`);
            
            updateMyTrackersDisplay(window.myTrackers.length);
            
        } catch (searchError) {
            console.error("Error with ticket search:", searchError);
            // Implement fallback logic here
            handleSearchFallback(userIdStr, userIdNum);
        }
    } catch (error) {
        console.error("Error loading my trackers:", error);
        window.myTrackers = [];
        updateMyTrackersDisplay(0);
    }
}

function updateMyTrackersDisplay(count) {
    const myTrackerCount = document.getElementById('myTrackerCount');
    const viewMyTrackersBtn = document.getElementById('viewMyTrackersBtn');
    
    if (myTrackerCount) {
        myTrackerCount.textContent = count;
    }
    
    if (viewMyTrackersBtn && count > 0) {
        // Check if any trackers have Support Review status (25 or 15)
        const supportReviewCount = (window.myTrackers || []).filter(ticket =>
            ticket.status === 25 || ticket.status === 15
        ).length;
        
        if (supportReviewCount > 0) {
            // Show support review alert
            viewMyTrackersBtn.className = 'view-all-btn support-review-alert';
            viewMyTrackersBtn.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${supportReviewCount} Need Review`;
            viewMyTrackersBtn.title = `${supportReviewCount} ticket${supportReviewCount > 1 ? 's' : ''} need review`;
        } else {
            // Normal view all button
            viewMyTrackersBtn.className = 'view-all-btn';
            viewMyTrackersBtn.innerHTML = '<i class="fas fa-list"></i> View All';
            viewMyTrackersBtn.title = 'View my trackers';
        }
        
        viewMyTrackersBtn.style.display = 'inline-flex';
    } else if (viewMyTrackersBtn) {
        viewMyTrackersBtn.style.display = 'none';
    }
}
```

### 3. Carousel Navigation

```javascript
// Carousel Functions
function initializeCarousel() {
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => moveCarousel(-1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => moveCarousel(1));
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Update carousel state
    updateCarousel();
}

function moveCarousel(direction) {
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}
```

### 4. Modal Functionality

```javascript
function showTrackerDetails(widgetType = 'today') {
    const modal = document.getElementById('trackerDetailsModal');
    const detailsList = document.getElementById('trackerDetailsList');
    const modalTitleSpan = document.querySelector('#modalTitle span');
    const modalControls = document.getElementById('modalControls');
    
    if (!modal || !detailsList) {
        console.error('Modal elements not found');
        return;
    }
    
    // Clear existing content
    detailsList.innerHTML = '';
    
    // Show/hide controls based on widget type
    if (modalControls) {
        modalControls.style.display = widgetType === 'my' ? 'block' : 'none';
    }
    
    // Get trackers based on widget type
    let trackers = [];
    let noTrackersMessage = '';
    
    switch (widgetType) {
        case 'today':
            trackers = window.todayTrackers || [];
            modalTitleSpan.textContent = "Today's Trackers";
            noTrackersMessage = 'No trackers created today.';
            break;
        case 'my':
            trackers = window.myTrackers || [];
            modalTitleSpan.textContent = 'My Trackers';
            noTrackersMessage = 'No unresolved trackers assigned to you.';
            break;
        case 'backlog':
            trackers = window.backloggedTrackers || [];
            modalTitleSpan.textContent = 'Backlogged';
            noTrackersMessage = 'No trackers in backlog status.';
            break;
    }
    
    // Store original trackers and widget type for filtering/sorting
    window.modalTrackers = trackers;
    window.currentWidgetType = widgetType;
    
    // Display trackers
    displayTrackers(trackers, widgetType, noTrackersMessage);
    
    // Set up filter and sort event listeners
    if (widgetType === 'my') {
        setupFilterAndSort();
    }
    
    // Show the modal
    modal.style.display = 'flex';
}

function displayTrackers(trackers, widgetType, noTrackersMessage) {
    const detailsList = document.getElementById('trackerDetailsList');
    detailsList.innerHTML = '';
    
    if (trackers.length === 0) {
        detailsList.innerHTML = `<div class="no-trackers">${noTrackersMessage}</div>`;
        return;
    }
    
    // Sort trackers to show tickets that need review first
    if (widgetType === 'my') {
        trackers = [...trackers].sort((a, b) => {
            const aNeedsReview = a.status === 25 || a.status === 15;
            const bNeedsReview = b.status === 25 || b.status === 15;
            
            if (aNeedsReview && !bNeedsReview) return -1;
            if (!aNeedsReview && bNeedsReview) return 1;
            
            return new Date(b.created_at) - new Date(a.created_at);
        });
    }
    
    // For today's trackers, group by template type
    if (widgetType === 'today') {
        const trackersByTemplate = {};
        trackers.forEach(tracker => {
            if (!trackersByTemplate[tracker.templateType]) {
                trackersByTemplate[tracker.templateType] = [];
            }
            trackersByTemplate[tracker.templateType].push(tracker);
        });
        
        // Display grouped trackers
        Object.entries(trackersByTemplate).forEach(([templateType, templateTrackers]) => {
            const section = document.createElement('div');
            section.className = 'tracker-template-section';
            
            const header = document.createElement('h4');
            header.className = 'tracker-section-header';
            header.innerHTML = `<i class="fas fa-tag"></i> ${getTemplateName(templateType)} (${templateTrackers.length})`;
            section.appendChild(header);
            
            const trackerList = document.createElement('div');
            trackerList.className = 'tracker-list';
            
            templateTrackers.forEach(tracker => {
                const trackerItem = createTrackerItem(tracker, false);
                trackerList.appendChild(trackerItem);
            });
            
            section.appendChild(trackerList);
            detailsList.appendChild(section);
        });
    } else {
        // For other widgets, display as simple list
        trackers.forEach(tracker => {
            const trackerItem = createTrackerItem(tracker, widgetType === 'my');
            detailsList.appendChild(trackerItem);
        });
    }
}

function createTrackerItem(tracker, showDetails = false) {
    const trackerItem = document.createElement('div');
    trackerItem.className = 'tracker-item';
    
    const timestamp = tracker.timestamp ?
        new Date(tracker.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        }) : '';
    
    const ticketUrl = tracker.id ?
        `https://techsupport.benchmarkeducation.com/a/tickets/${tracker.id}` : '#';
    
    // Get status text and class
    const statusInfo = getStatusInfo(tracker.status);
    
    // Check if this ticket needs review
    const needsReview = tracker.status === 25 || tracker.status === 15;
    
    // Add highlighting class if ticket needs review
    if (needsReview) {
        trackerItem.classList.add('needs-review');
    }
    
    if (showDetails) {
        // Detailed view for My Trackers
        const createdDate = tracker.created_at ?
            new Date(tracker.created_at).toLocaleDateString() : 'N/A';
        const updatedDate = tracker.updated_at ?
            new Date(tracker.updated_at).toLocaleDateString() : 'N/A';
        const districtName = tracker.custom_fields?.cf_district509811 || 'N/A';
        
        trackerItem.innerHTML = `
            <div class="tracker-item-header">
                <div class="tracker-id">
                    <a href="${ticketUrl}" target="_blank" class="tracker-link">
                        #${tracker.id || 'N/A'}
                    </a>
                    ${timestamp ? `<span class="tracker-time">${timestamp}</span>` : ''}
                    ${needsReview ? '<span class="tracker-needs-review" title="This ticket needs review"><i class="fas fa-exclamation-circle"></i></span>' : ''}
                </div>
                <span class="tracker-status ${statusInfo.className}">${statusInfo.text}</span>
            </div>
            <div class="tracker-subject">${tracker.subject || 'No subject'}</div>
            <div class="tracker-item-details">
                <div class="tracker-detail">
                    <strong>District:</strong> ${districtName}
                </div>
                <div class="tracker-detail">
                    <strong>Created:</strong> ${createdDate}
                </div>
                <div class="tracker-detail">
                    <strong>Updated:</strong> ${updatedDate}
                </div>
            </div>
        `;
    } else {
        // Simple view for other widgets
        trackerItem.innerHTML = `
            <div class="tracker-id">
                <a href="${ticketUrl}" target="_blank" class="tracker-link">
                    #${tracker.id || 'N/A'}
                </a>
                ${timestamp ? `<span class="tracker-time">${timestamp}</span>` : ''}
                ${needsReview ? '<span class="tracker-needs-review" title="This ticket needs review"><i class="fas fa-exclamation-circle"></i></span>' : ''}
            </div>
            <div class="tracker-subject">${tracker.subject || 'No subject'}</div>
        `;
    }
    
    return trackerItem;
}

function getStatusInfo(statusId) {
    const statusMap = {
        2: { text: 'Open', className: 'status-open' },
        3: { text: 'Pending', className: 'status-pending' },
        6: { text: 'Waiting on Customer', className: 'status-waiting' },
        8: { text: 'Escalated', className: 'status-escalated' },
        9: { text: 'Dev in Progress', className: 'status-in-progress' },
        15: { text: 'Closed in JIRA', className: 'status-other' },
        25: { text: 'Support Review', className: 'status-escalated' },
        // Add more status mappings as needed
    };
    
    return statusMap[statusId] || { text: 'Unknown', className: 'status-other' };
}
```

### 5. Filter and Sort Functionality

```javascript
function setupFilterAndSort() {
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (statusFilter) {
        statusFilter.removeEventListener('change', handleFilterSort);
        statusFilter.addEventListener('change', handleFilterSort);
    }
    
    if (sortBy) {
        sortBy.removeEventListener('change', handleFilterSort);
        sortBy.addEventListener('change', handleFilterSort);
    }
}

function handleFilterSort() {
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');
    
    let filteredTrackers = [...window.modalTrackers];
    
    // Apply status filter
    if (statusFilter && statusFilter.value) {
        filteredTrackers = filteredTrackers.filter(tracker =>
            tracker.status == statusFilter.value
        );
    }
    
    // Apply sorting
    if (sortBy && sortBy.value) {
        switch (sortBy.value) {
            case 'created_desc':
                filteredTrackers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'created_asc':
                filteredTrackers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'updated_desc':
                filteredTrackers.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                break;
            case 'updated_asc':
                filteredTrackers.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
                break;
        }
    }
    
    // Re-display filtered and sorted trackers
    displayTrackers(filteredTrackers, window.currentWidgetType, 'No trackers match the current filter.');
}
```

### 6. Event Listeners Setup

```javascript
// Set up event listeners for View All and modal close
document.addEventListener('DOMContentLoaded', function () {
    const viewAllBtn = document.getElementById('viewAllTrackersBtn');
    const viewMyTrackersBtn = document.getElementById('viewMyTrackersBtn');
    const viewBacklogTrackersBtn = document.getElementById('viewBacklogTrackersBtn');
    const closeModalBtn = document.getElementById('closeTrackerModal');
    const modal = document.getElementById('trackerDetailsModal');
    
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => showTrackerDetails('today'));
    }
    
    if (viewMyTrackersBtn) {
        viewMyTrackersBtn.addEventListener('click', () => showTrackerDetails('my'));
    }
    
    if (viewBacklogTrackersBtn) {
        viewBacklogTrackersBtn.addEventListener('click', () => showTrackerDetails('backlog'));
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeTrackerDetails);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeTrackerDetails();
            }
        });
    }
});

function closeTrackerDetails() {
    const modal = document.getElementById('trackerDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}
```

---

## API Integration

### 1. Freshdesk API Templates

You'll need to create API templates in your Freshdesk app configuration:

```json
{
  "getTicketsByFilter": {
    "protocol": "https",
    "host": "<%=iparam.domain%>.freshdesk.com",
    "resources": [
      {
        "host": "<%=iparam.domain%>.freshdesk.com",
        "path": "/api/v2/search/tickets?query=\"{{context.filter}}\"",
        "method": "GET",
        "headers": {
          "Authorization": "Basic <%=encode(iparam.api_key)%>",
          "Content-Type": "application/json"
        }
      }
    ]
  }
}
```

### 2. Data Storage

Store tracker data in Freshdesk's database:

```javascript
// Store daily tracker details
function storeTrackerDetails(templateType, trackerData) {
    const today = getTodayDateString();
    const storageKey = `tracker-details-${today}`;
    
    // Get existing data
    client.db.get(storageKey)
        .then(function (existingData) {
            const trackers = existingData?.trackers || [];
            
            // Add new tracker
            trackers.push({
                id: trackerData.id,
                subject: trackerData.subject,
                templateType: templateType,
                timestamp: new Date().toISOString(),
                status: trackerData.status,
                created_at: trackerData.created_at,
                updated_at: trackerData.updated_at,
                custom_fields: trackerData.custom_fields
            });
            
            // Store updated data
            return client.db.set(storageKey, { trackers: trackers });
        })
        .then(function () {
            console.log('Successfully stored tracker details');
        })
        .catch(function (error) {
            console.error('Error storing tracker details:', error);
        });
}

function getTodayDateString() {
    const today = new Date();
    return today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');
}
```

---

## Key Features Implementation

### 1. Support Review Alert System

The widget displays special alerts when tickets need review:

```javascript
function updateMyTrackersDisplay(count) {
    const viewMyTrackersBtn = document.getElementById('viewMyTrackersBtn');
    
    if (count > 0) {
        // Check for tickets needing review (status 25 or 15)
        const supportReviewCount = (window.myTrackers || []).filter(ticket =>
            ticket.status === 25 || ticket.status === 15
        ).length;
        
        if (supportReviewCount > 0) {
            viewMyTrackersBtn.className = 'view-all-btn support-review-alert';
            viewMyTrackersBtn.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${supportReviewCount} Need Review`;
        }
    }
}
```

### 2. Dark Mode Support

All styles support dark mode using CSS custom properties:

```css
:root {
    --card-bg: #ffffff;
    --text-color: #333333;
    --border-color: #e0e0e0;
}

[data-theme="dark"] {
    --card-bg: #2c3e50;
    --text-color: #ffffff;
    --border-color: #414c56;
}
```

### 3. Error Handling and Fallbacks

Implement robust error handling:

```javascript
async function loadMyTrackers() {
    try {
        // Primary API call
        const response = await client.request.invokeTemplate("getTicketsByFilter", {
            context: { filter: primaryFilter }
        });
        
        // Process response
        processTrackerData(response);
        
    } catch (searchError) {
        console.error("Primary search failed:", searchError);
        
        // Fallback to alternative search
        try {
            const fallbackResponse = await client.request.invokeTemplate("getTicketsByFilter", {
                context: { filter: fallbackFilter }
            });
            
            processTrackerData(fallbackResponse);
            
        } catch (fallbackError) {
            console.error("Fallback search failed:", fallbackError);
            
            // Final fallback - empty state
            window.myTrackers = [];
            updateMyTrackersDisplay(0);
        }
    }
}
```

---

## Testing and Validation

### 1. Unit Tests

Test key functions:

```javascript
// Test tracker filtering
describe('Tracker Filtering', () => {
    it('should filter trackers by status', () => {
        const trackers = [
            { id: 1, status: 25 },
            { id: 2, status: 15 },
            { id: 3, status: 2 }
        ];
        
        const needsReview = trackers.filter(t => t.status === 25 || t.status === 15);
        expect(needsReview).toHaveLength(2);
    });
});
```

### 2. Integration Tests

Test API integration:

```javascript
// Test API calls
describe('API Integration', () => {
    it('should load tracker data', async () => {
        const mockResponse = {
            response: JSON.stringify({
                results: [{ id: 1, subject: 'Test Tracker' }]
            })
        };
        
        client.request.invokeTemplate = jest.fn().mockResolvedValue(mockResponse);
        
        await loadMyTrackers();
        
        expect(window.myTrackers).toHaveLength(1);
        expect(window.myTrackers[0].id).toBe(1);
    });
});
```

### 3. E2E Tests

Test user interactions:

```javascript
// Test modal opening
describe('Modal Functionality', () => {
    it('should open modal when View All is clicked', () => {
        const viewAllBtn = document.getElementById('viewMyTrackersBtn');
        const modal = document.getElementById('trackerDetailsModal');
        
        viewAllBtn.click();
        
        expect(modal.style.display).toBe('flex');
    });
});
```

---

## Performance Optimization

### 1. Lazy Loading

Only load data when needed:

```javascript
function loadMyTrackers() {
    // Only load if not already loaded
    if (window.myTrackers.length > 0) {
        return Promise.resolve();
    }
    
    return actualLoadMyTrackers();
}
```

### 2. Debouncing

Debounce search and filter operations:

```javascript
const debouncedFilterSort = debounce(handleFilterSort, 300);

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
```

### 3. Memory Management

Clean up event listeners:

```javascript
function cleanup() {
    // Remove event listeners
    document.removeEventListener('DOMContentLoaded', setupEventListeners);
    
    // Clear global variables
    window.myTrackers = null;
    window.todayTrackers = null;
    window.backloggedTrackers = null;
}
```

---

## Deployment Considerations

### 1. Environment Configuration

Set up different configurations for development and production:

```javascript
const config = {
    development: {
        apiUrl: 'https://dev.freshdesk.com',
        debug: true
    },
    production: {
        apiUrl: 'https://prod.freshdesk.com',
        debug: false
    }
};
```

### 2. Error Monitoring

Implement error tracking:

```javascript
function logError(error, context) {
    console.error('Error:', error);
    
    // Send to error tracking service
    if (window.errorTracker) {
        window.errorTracker.captureException(error, {
            extra: context
        });
    }
}
```

### 3. Performance Monitoring

Track performance metrics:

```javascript
function trackPerformance(operation, duration) {
    console.log(`${operation} took ${duration}ms`);
    
    // Send to analytics service
    if (window.analytics) {
        window.analytics.track('performance', {
            operation: operation,
            duration: duration
        });
    }
}
```

---

## Troubleshooting Guide

### Common Issues

1. **Modal not opening**: Check if event listeners are properly attached
2. **Data not loading**: Verify API permissions and network connectivity
3. **Filtering not working**: Ensure filter functions are properly bound
4. **Styling issues**: Check CSS custom properties and theme support

### Debug Tools

```javascript
// Enable debug mode
window.DEBUG = true;

function debug(message, data) {
    if (window.DEBUG) {
        console.log('[DEBUG]', message, data);
    }
}

// Usage
debug('Loading trackers', { userId: 123, filter: 'active' });
```

---

## Conclusion

This guide provides a comprehensive framework for replicating the My Trackers widget and modal functionality. The implementation includes:

- **Responsive carousel-based widget system**
- **Detailed modal with filtering and sorting**
- **Real-time data loading from Freshdesk API**
- **Support for multiple themes**
- **Error handling and fallbacks**
- **Performance optimization**

Follow this guide step-by-step to implement a fully functional tracker management system that matches the original functionality while being maintainable and extensible. 