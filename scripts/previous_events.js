// scripts/previous_events_loader.js

(function() { // Start of the main IIFE for scope isolation

    "use strict";

    const eventsSource = 'scripts/events.json';
    const targetContainerId = 'previous-events-container'; // ID of the div to output events into

    // --- Pagination State Variables (reset on each load) ---
    let currentPage = 0;
    const eventsPerPage = 8;
    let filteredAndSortedEvents = []; // This will hold all the relevant events after filtering/sorting

    // --- DOM Element References (will be assigned inside the main function) ---
    let prevBtn = null; // Initialize as null
    let nextBtn = null; // Initialize as null

    // --- Helper function to remove existing listeners (important for SPA) ---
    function removeEventListeners() {
        if (prevBtn) {
            prevBtn.removeEventListener('click', handlePrevClick);
        }
        if (nextBtn) {
            nextBtn.removeEventListener('click', handleNextClick);
        }
    }

    // --- Pagination Event Handlers (separate functions for easier removal) ---
    function handlePrevClick() {
        if (currentPage > 0) {
            currentPage--;
            displayEventsPage(currentPage);
        }
    }

    function handleNextClick() {
        const maxPage = Math.ceil(filteredAndSortedEvents.length / eventsPerPage) - 1;
        if (currentPage < maxPage) {
            currentPage++;
            displayEventsPage(currentPage);
        }
    }

    // --- Main Function to Display Events for a Given Page ---
    function displayEventsPage(pageNumber) {
        const outputContainer = document.getElementById(targetContainerId);
        if (!outputContainer) {
            console.error(`Error: HTML element with ID '${targetContainerId}' not found.`);
            return; // Exit if the container isn't there
        }

        // Clear existing content
        outputContainer.innerHTML = '';

        // Calculate start and end indices for the current page
        const startIndex = pageNumber * eventsPerPage;
        const endIndex = startIndex + eventsPerPage;

        // Get the events for the current page
        const eventsToDisplay = filteredAndSortedEvents.slice(startIndex, endIndex);

        // Generate HTML for the events
        let eventsHTML = '';
        if (eventsToDisplay.length > 0) {
            eventsToDisplay.forEach(event => {
                eventsHTML += `
                    <div class="smalleventculumn">
                        <img src="img/events/${event.Image}" alt="${event.Name} Event" />
                        </div>
                `;
            });
        } else {
            eventsHTML = '<p style="text-align: center; color: #CCC;">No more previous events to display.</p>';
        }

        outputContainer.innerHTML = eventsHTML;

        // Update button states (disabled/enabled) ONLY if buttons exist
        if (prevBtn && nextBtn) {
            prevBtn.disabled = (currentPage === 0);
            nextBtn.disabled = (endIndex >= filteredAndSortedEvents.length);
        }
    }

    // --- Event Data Loading and Initial Setup ---
    async function loadAndInitializePreviousEvents() {
        // --- Reset State and References for a Clean Load ---
        currentPage = 0; // Always start on the first page
        filteredAndSortedEvents = []; // Clear previous data
        removeEventListeners(); // Clean up old event listeners

        // Get references to buttons (they might not exist on other pages)
        // These IDs are direct children of the DOM when this script runs
        prevBtn = document.getElementById('prev-events-btn');
        nextBtn = document.getElementById('next-events-btn');

        const outputContainer = document.getElementById(targetContainerId);
        // If the target container or pagination buttons aren't present, exit gracefully.
        if (!outputContainer || !prevBtn || !nextBtn) {
            // console.warn("Previous events containers or pagination buttons not found. Script skipped.");
            return;
        }

        // Add event listeners (now that we know the buttons exist)
        prevBtn.addEventListener('click', handlePrevClick);
        nextBtn.addEventListener('click', handleNextClick);

        // --- Core Data Fetching and Filtering ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to midnight for comparison

        try {
            const response = await fetch(eventsSource);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allEvents = await response.json();

            if (!Array.isArray(allEvents)) {
                console.error("Error: Events data is not an array for previous events.");
                outputContainer.innerHTML = '<p>Error: Events data is malformed.</p>';
                if (prevBtn) prevBtn.disabled = true;
                if (nextBtn) nextBtn.disabled = true;
                return;
            }

            // 1. Filter for past events
            const previousEvents = allEvents.filter(event => {
                const eventEndDate = new Date(event.EndDate);
                // Normalize event end date to end of day for more robust comparison
                eventEndDate.setHours(23, 59, 59, 999); 
                
                // An event is "past" if its end date is strictly before the beginning of today
                return eventEndDate < today; 
            });

            // 2. Sort from most recent to oldest (descending by StartDate)
            previousEvents.sort((a, b) => {
                const dateA = new Date(a.StartDate);
                const dateB = new Date(b.StartDate);
                return dateB.getTime() - dateA.getTime(); // Sort by date in descending order
            });

            // Store the filtered and sorted events globally within this module's scope
            filteredAndSortedEvents = previousEvents;

            // Display the first page of events
            displayEventsPage(currentPage);

        } catch (error) {
            console.error("Failed to load or display previous events:", error);
            outputContainer.innerHTML = '<p>Error loading previous events. Please try again later.</p>';
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
        }
    }

    // --- Initial Call: Execute when the script is loaded/injected ---
    loadAndInitializePreviousEvents();

})(); // End of the main IIFE