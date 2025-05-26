"use strict"

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
        const dayId = formatDateToYYYYMMDD(date);

        // --- NEW CODE: Check for events that span this specific date ---
        let eventsForThisDay = [];
        if (allEvents && allEvents.length > 0) { // Using 'allEvents' from global scope
            const currentDayDate = new Date(currentYear, currentMonth, i); // Create Date object for current calendar day
            currentDayDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

            eventsForThisDay = allEvents.filter(event => {
                // Ensure event.StartDate and event.EndDate are valid Date objects
                // These will be in YYYY-MM-DD format from your JSON
                const eventStartDate = new Date(event.StartDate);
                const eventEndDate = new Date(event.EndDate);

                // Normalize event dates to start of day for accurate comparison
                eventStartDate.setHours(0, 0, 0, 0);
                eventEndDate.setHours(0, 0, 0, 0);

                // An event is relevant for this day if:
                // The current calendar day is on or after the event's start date
                // AND
                // The current calendar day is on or before the event's end date
                return currentDayDate >= eventStartDate && currentDayDate <= eventEndDate;
            });
        }
        // --- END OF NEW CODE ---


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