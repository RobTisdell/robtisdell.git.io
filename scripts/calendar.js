"use strict"

const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('Calendar_Dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentDate = new Date();
let allEvents = []; // This will store the loaded events

// Function to format a Date object into YYYY-MM-DD string
// This function is robust for both date comparison and ID generation
function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    // getMonth() is 0-indexed, so add 1
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const updateCalendar = (events = []) => { // Accept events as an argument, default to empty array
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed month

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const lastDayIndex = lastDay.getDay();

    const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthYearElement.textContent = monthYearString;

    let datesHTML = '';

    // Add inactive dates from the previous month
    for (let i = firstDayIndex; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
        datesHTML += `<div class="date inactive">${prevDate.getDate()}</div>`;
    }

    // Add active dates for the current month
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const activeClass = date.toDateString() === new Date().toDateString() ? 'active' : '';

        // *** FIX: Generate the ID for the current day with padded zeros ***
        // Use the same formatting logic as formatDateToYYYYMMDD for consistency
        const dayId = formatDateToYYYYMMDD(date);

        // Check for events on this specific date
        let eventsForThisDay = [];
        if (events && events.length > 0) {
            // Already using formatDateToYYYYMMDD for consistency
            // The format of event.date (from JSON) and formattedCurrentDay will now match
            eventsForThisDay = events.filter(event => event.Date === dayId);
        }

        let eventNotesHTML = '';
        if (eventsForThisDay.length > 0) {
            eventsForThisDay.forEach(event => {
                eventNotesHTML += `<span class="event-note"><br>${event.Name}</span>`;
            });
        }

        datesHTML += `
            <div class="date ${activeClass}" id="${dayId}">
                ${i}
                ${eventNotesHTML}
            </div>
        `;
    }

    // Add inactive dates for the next month
    for (let i = 1; i <= (6 - lastDayIndex); i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        datesHTML += `<div class="date inactive">${nextDate.getDate()}</div>`;
    }

    datesElement.innerHTML = datesHTML;
};


// Function to fetch events from JSON and populate the calendar
async function loadEventsAndPopulateCalendar() {
    try {
        const response = await fetch('https://robtisdell.github.io/robtisdell.git.io/scripts/events.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allEvents = await response.json(); // Store parsed JSON data globally
        console.log("Loaded Events:", allEvents);

        // Now that events are loaded, update the calendar
        updateCalendar(allEvents);

    } catch (error) {
        console.error("Error loading or parsing events:", error);
        // Even if there's an error, still display the calendar without notes
        updateCalendar();
    }
}


// Event Listeners for navigation buttons
prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar(allEvents); // Pass events again when changing month
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar(allEvents); // Pass events again when changing month
});

// Initial call to load events and then update the calendar
document.addEventListener('DOMContentLoaded', () => {
    loadEventsAndPopulateCalendar();
});