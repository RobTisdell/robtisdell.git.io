"use strict";

// --- Global DOM Element References ---
const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('Calendar_Dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// --- Global State Variables ---
let currentDate = new Date(); // Represents the month currently displayed on the calendar
let allEvents = [];           // Stores all events loaded from JSON

// --- Helper Function: Date Formatting ---
// This function needs to be defined BEFORE updateCalendar tries to use it.
function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- Main Calendar Rendering Logic ---
const updateCalendar = (eventsData = []) => { // Renamed parameter for clarity
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed month

    // Get details for the current month's display
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.

    let datesHTML = '';

    // Add inactive dates from the previous month (to fill the start of the week)
    for (let i = firstDayIndex; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
        datesHTML += `<div class="date inactive">${prevDate.getDate()}</div>`;
    }

    // Add active dates for the current month
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const dayId = formatDateToYYYYMMDD(date); // Generate ID for the specific day cell
        const activeClass = (date.toDateString() === new Date().toDateString()) ? 'active' : '';

        let eventsForThisDay = [];
        // Filter events that fall within the current day's range
        // Use the 'eventsData' parameter, which contains 'allEvents' from the fetch.
        if (eventsData.length > 0) {
            const currentDayDate = new Date(currentYear, currentMonth, i);
            currentDayDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

            eventsForThisDay = eventsData.filter(event => {
                // --- FIX: Parse dates into local timezone components ---
                const [startYear, startMonth, startDay] = event.StartDate.split('-').map(Number);
                const [endYear, endMonth, endDay] = event.EndDate.split('-').map(Number);

                // Month is 0-indexed in Date constructor (e.g., June is 5, not 6)
                const eventStartDate = new Date(startYear, startMonth - 1, startDay);
                const eventEndDate = new Date(endYear, endMonth - 1, endDay);
                // --- END FIX ---

                eventStartDate.setHours(0, 0, 0, 0);
                eventEndDate.setHours(0, 0, 0, 0);

                // Check if the current calendar day is within the event's span (inclusive)
                return currentDayDate >= eventStartDate && currentDayDate <= eventEndDate;
            });
        }

        let eventNotesHTML = '';
        if (eventsForThisDay.length > 0) {
            eventsForThisDay.forEach(event => {
                eventNotesHTML += `<span class="event-note"><br><a href="#0" class="event-link" data-event-id="${event.ID}">${event.Name}</a></span>`;
            });
        }

        datesHTML += `
            <div class="date ${activeClass}" id="${dayId}">
                ${i}
                ${eventNotesHTML}
            </div>
        `;
    }

    // Add inactive dates for the next month (to fill the end of the week)
    const lastDayIndex = lastDay.getDay(); // Need to recalculate or ensure this is available
    const remainingCells = 42 - (firstDayIndex + totalDays); // 42 for 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        datesHTML += `<div class="date inactive">${nextDate.getDate()}</div>`;
    }

    // Update the DOM elements
    monthYearElement.textContent = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });
    datesElement.innerHTML = datesHTML;
};

// --- Event Data Loading and Initial Setup ---

async function loadEventsAndPopulateCalendar() {
    try {
        const response = await fetch('https://robtisdell.github.io/robtisdell.git.io/scripts/events.json'); // Adjust path if needed
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allEvents = await response.json(); // Store parsed JSON data globally
        console.log("Calendar loaded events:", allEvents);

        // Initial calendar render using the fetched events
        updateCalendar(allEvents);

    } catch (error) {
        console.error("Error loading or parsing events in calendar.js:", error);
        // Render an empty calendar if events fail to load, so the page still shows
        updateCalendar([]);
    }
}

// --- Event Listeners for Navigation ---
prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar(allEvents); // Pass all loaded events for the new month
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar(allEvents); // Pass all loaded events for the new month
});

// --- Initial Call: Start everything when the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', loadEventsAndPopulateCalendar);