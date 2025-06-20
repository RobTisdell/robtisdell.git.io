// Updated calendar.js
(function() { // Start of the Immediately Invoked Function Expression (IIFE)

    // --- Global DOM Element References ---
    const monthYearElement = document.getElementById('monthYear');
    const datesElement = document.getElementById('Calendar_Dates');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    // eventModalContainer is not strictly needed in calendar.js if modal.js is handling opening
    // const eventModalContainer = document.getElementById('eventModal');


    // IMPORTANT: Check if the essential calendar elements exist on the page.
    // If not, this script isn't meant for the current content, so it exits cleanly.
    if (!monthYearElement || !datesElement || !prevBtn || !nextBtn) {
        // console.warn("Calendar elements not found. Calendar script skipped for this page.");
        return;
    }

    // --- Global State Variables ---
    let currentDate = new Date(); // Represents the month currently displayed on the calendar
    let allEvents = [];          // Stores all events loaded from JSON

    // --- Helper Function: Date Formatting ---
    // formatDateToYYYYMMDD is still useful for div IDs.
    function formatDateToYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Removed formatDateDisplay and formatTimeDisplay as modal.js now handles the formatting
    // for the displayed event details.


    // --- Main Calendar Rendering Logic ---
    const updateCalendar = (eventsData = []) => {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const totalDays = lastDay.getDate();
        const firstDayIndex = firstDay.getDay();

        let datesHTML = '';

        // Add inactive dates from the previous month
        for (let i = firstDayIndex; i > 0; i--) {
            const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
            datesHTML += `<div class="date inactive"><span class="calendarnumber">${prevDate.getDate()}</span></div>`;
        }

        // Add active dates for the current month
        for (let i = 1; i <= totalDays; i++) {
            const date = new Date(currentYear, currentMonth, i);
            const dayId = formatDateToYYYYMMDD(date);
            const today = new Date();
            today.setHours(0,0,0,0); // Normalize today for comparison
            const activeClass = (date.getTime() === today.getTime()) ? 'active' : ''; // Use getTime for accurate comparison

            let eventsForThisDay = [];
            if (eventsData.length > 0) {
                const currentDayDate = new Date(currentYear, currentMonth, i);
                currentDayDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

                eventsForThisDay = eventsData.filter(event => {
                    // Ensure dates are parsed robustly
                    const [startYear, startMonth, startDay] = event.StartDate.split('-').map(Number);
                    const [endYear, endMonth, endDay] = event.EndDate.split('-').map(Number);
                    const [startHour, startMinute] = event.StartTime.split(':').map(Number);
                    const [endHour, endMinute] = event.EndTime.split(':').map(Number);

                    // Create Date objects that include time for precise duration calculation
                    const eventStartDateTime = new Date(startYear, startMonth - 1, startDay, startHour, startMinute);
                    const eventEndDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);

                    // Create Date objects that only include date for day-by-day comparison
                    const eventStartDateOnly = new Date(startYear, startMonth - 1, startDay);
                    eventStartDateOnly.setHours(0, 0, 0, 0);

                    const eventEndDateOnly = new Date(endYear, endMonth - 1, endDay);
                    eventEndDateOnly.setHours(0, 0, 0, 0);

                    // Calculate duration in hours
                    const durationInMs = eventEndDateTime.getTime() - eventStartDateTime.getTime();
                    const durationInHours = durationInMs / (1000 * 60 * 60);

                    // Define a threshold for what constitutes a "true" multi-day event vs. a "spill-over"
                    const LATE_NIGHT_THRESHOLD_HOURS = 10; // Events shorter than this, crossing midnight, are treated as single-day for display

                    // Check if the current calendar day matches the event's start date
                    const isCurrentDayStartDate = currentDayDate.getTime() === eventStartDateOnly.getTime();

                    // Check if the event truly spans multiple distinct calendar days (by date component alone)
                    const isTrulyMultiDayByDate = eventEndDateOnly.getTime() !== eventStartDateOnly.getTime();

                    // If it's a multi-day event by date AND its duration is long enough (e.g., > 10 hours)
                    if (isTrulyMultiDayByDate && durationInHours >= LATE_NIGHT_THRESHOLD_HOURS) {
                        // It's a true multi-day event, show link on all days it spans
                        return currentDayDate >= eventStartDateOnly && currentDayDate <= eventEndDateOnly;
                    } else {
                        // It's either a single-day event OR a multi-day event that's short (like a bar night spill-over)
                        // In these cases, only show the link on the start date
                        return isCurrentDayStartDate;
                    }
                });
            }

            let eventNotesHTML = '';
            if (eventsForThisDay.length > 0) {
                // Ensure unique IDs if multiple events on one day
                eventsForThisDay.forEach(event => {
                    // Make sure event.ID is consistent (string or number)
                    eventNotesHTML += `<span class="event-note"><br><a href="#0" class="event-link" data-event-id="${event.ID}">${event.Name}</a></span>`;
                });
            }

            datesHTML += `
                <div class="date ${activeClass}" id="${dayId}">
                    <span class="calendarnumber">${i}</span>
                    ${eventNotesHTML}
                </div>
            `;
        }

        // Add inactive dates for the next month
        const lastDayIndex = lastDay.getDay();
        const remainingCells = 42 - (firstDayIndex + totalDays);
        for (let i = 1; i <= remainingCells; i++) {
            const nextDate = new Date(currentYear, currentMonth + 1, i);
            datesHTML += `<div class="date inactive"><span class="calendarnumber">${nextDate.getDate()}</span></div>`;
        }

        // Update the DOM elements
        monthYearElement.textContent = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });
        datesElement.innerHTML = datesHTML;
    };

    // --- Event Data Loading and Initial Setup ---
    async function loadEventsAndPopulateCalendar() {
        try {
            const response = await fetch('scripts/events.json'); // Relative path from root is usually best
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allEvents = await response.json();
            console.log("Calendar loaded events:", allEvents);
            updateCalendar(allEvents);

        } catch (error) {
            console.error("Error loading or parsing events in calendar.js:", error);
            datesElement.innerHTML = '<p>Error loading calendar events. Please try again.</p>'; // Display error on calendar
            updateCalendar([]); // Render empty calendar on error
        }
    }

    // --- Event Listeners for Navigation ---
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar(allEvents);
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar(allEvents);
    });

    // --- Event Listener for clicking on an event link within the calendar dates ---
    datesElement.addEventListener('click', (e) => {
        const eventLink = e.target.closest('.event-link');
        if (eventLink) {
            e.preventDefault(); // Prevent default link behavior
            const eventId = eventLink.dataset.eventId;
            // Use toString() on event.ID to ensure consistent comparison type
            const eventDetails = allEvents.find(event => event.ID.toString() === eventId); 

            if (eventDetails) {
                // Assuming modal.js exposes a global function named openEventModal
                if (typeof window.openEventModal === 'function') {
                    window.openEventModal(eventDetails);
                } else {
                    // This error is now more likely if modal.js failed to load or expose its function
                    console.error("Error: window.openEventModal function is not defined. Ensure modal.js is loaded and properly exposes openEventModal.");
                }
            } else {
                console.warn(`Event with ID ${eventId} not found in allEvents data.`);
            }
        }
    });

    // --- Initial Call: Start everything when this script is executed ---
    loadEventsAndPopulateCalendar();

})(); // End of the IIFE