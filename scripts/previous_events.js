// scripts/previous_events_loader.js

"use strict";

const eventsSource = 'scripts/events.json';
const targetContainerId = 'previous-events-container'; // ID of the div to output events into

// --- Pagination State Variables ---
const eventsPerPage = 8;
let currentPage = 0;
let filteredAndSortedEvents = []; // This will hold all the relevant events after filtering/sorting

// --- DOM Element References for Pagination ---
const prevBtn = document.getElementById('prev-events-btn');
const nextBtn = document.getElementById('next-events-btn');

// --- Main Function to Display Events for a Given Page ---
function displayEventsPage(pageNumber) {
    const outputContainer = document.getElementById(targetContainerId);
    if (!outputContainer) {
        console.error(`Error: HTML element with ID '${targetContainerId}' not found.`);
        return;
    }

    // Clear existing content
    outputContainer.innerHTML = '';

    // Calculate start and end indices for the current page
    const startIndex = pageNumber * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;

    // Get the events for the current page
    const eventsToDisplay = filteredAndSortedEvents.slice(startIndex, endIndex);

    // Generate HTML for the events
// add  <p>${event.Name} - ${new Date(event.StartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p> if we want dates after the events
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
        // Display a message if no events are found for the current page
        eventsHTML = '<p style="text-align: center; color: #CCC;">No more previous events to display.</p>';
    }

    outputContainer.innerHTML = eventsHTML;

    // Update button states (disabled/enabled)
    prevBtn.disabled = (currentPage === 0);
    nextBtn.disabled = (endIndex >= filteredAndSortedEvents.length);
}


// --- Event Data Loading and Initial Setup ---
async function loadAndInitializePreviousEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to midnight for comparison

    try {
        const response = await fetch(eventsSource);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allEvents = await response.json();

        if (!Array.isArray(allEvents)) {
            console.error("Error: Events data is not an array.");
            return;
        }

        // 1. Filter for past events
        const previousEvents = allEvents.filter(event => {
            const eventStartDate = new Date(event.StartDate);
            eventStartDate.setHours(0, 0, 0, 0); // Normalize event start date

            const eventEndDate = new Date(event.EndDate);
            eventEndDate.setHours(0, 0, 0, 0); // Normalize event end date

            // An event is "past" if its end date is before today
            // Using EndDate ensures multi-day events are not considered "past" until they actually finish
            return eventEndDate < today;
        });

        // 2. Sort from most recent to oldest (descending by StartDate)
        previousEvents.sort((a, b) => {
            const dateA = new Date(a.StartDate);
            const dateB = new Date(b.StartDate);
            return dateB.getTime() - dateA.getTime(); // Sort by date in descending order
        });

        // Store the filtered and sorted events globally
        filteredAndSortedEvents = previousEvents;

        // Display the first page of events
        displayEventsPage(currentPage);

    } catch (error) {
        console.error("Failed to load or display previous events:", error);
        const outputContainer = document.getElementById(targetContainerId);
        if (outputContainer) {
            outputContainer.innerHTML = '<p>Error loading previous events. Please try again later.</p>';
        }
        // Disable buttons if there's an error
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }
}

// --- Event Listeners for Pagination Buttons ---
prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        displayEventsPage(currentPage);
    }
});

nextBtn.addEventListener('click', () => {
    // Check if there are more events to display
    const maxPage = Math.ceil(filteredAndSortedEvents.length / eventsPerPage) - 1;
    if (currentPage < maxPage) {
        currentPage++;
        displayEventsPage(currentPage);
    }
});


// --- Initial Call: Start everything when the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', loadAndInitializePreviousEvents);