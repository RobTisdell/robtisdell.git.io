(function() {

    // --- Global DOM Element References ---
    const monthYearElement = document.getElementById('monthYear');
    const datesElement = document.getElementById('Calendar_Dates');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // If the calendar isn't on this page, exit cleanly
    if (!monthYearElement || !datesElement || !prevBtn || !nextBtn) {
        return;
    }

    // --- Global State ---
    let currentDate = new Date();
    let allEvents = [];

    // --- Helper: Format date as YYYY-MM-DD for IDs ---
    function formatDateToYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- NEW: Build normalized schedule from Option 3 JSON ---
    function buildDailySchedule(event) {
        const schedule = [];

        const sortedDays = [...event.Days].sort((a, b) =>
            new Date(a.Date) - new Date(b.Date)
        );

        sortedDays.forEach(day => {
            const times = day.OverrideTimes || event.DefaultTimes;

            schedule.push({
                date: day.Date,            // "2026-01-30"
                startTime: times.Start,    // "21:00"
                endTime: times.End         // "02:00"
            });
        });

        return schedule;
    }

    // --- Main Calendar Rendering ---
    const updateCalendar = (eventsData = []) => {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const totalDays = lastDay.getDate();
        const firstDayIndex = firstDay.getDay();

        let datesHTML = '';

        // Inactive days from previous month
        for (let i = firstDayIndex; i > 0; i--) {
            const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
            datesHTML += `<div class="date inactive"><span class="calendarnumber">${prevDate.getDate()}</span></div>`;
        }

        // Active days for current month
        for (let i = 1; i <= totalDays; i++) {
            const date = new Date(currentYear, currentMonth, i);
            const dayId = formatDateToYYYYMMDD(date);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const activeClass = (date.getTime() === today.getTime()) ? 'active' : '';

            const currentDayString = formatDateToYYYYMMDD(date);

            // --- NEW: Match events using schedule[] instead of StartDate/EndDate ---
            let eventsForThisDay = eventsData.filter(event => {
                if (!event._schedule) {
                    event._schedule = buildDailySchedule(event);
                }
                return event._schedule.some(sched => sched.date === currentDayString);
            });

            // Build event links
            let eventNotesHTML = '';
            if (eventsForThisDay.length > 0) {
                eventsForThisDay.forEach(event => {
                    eventNotesHTML += `
                        <span class="event-note">
                            <br>
                            <a href="#0" class="event-link" data-event-id="${event.ID}">
                                ${event.Name}
                            </a>
                        </span>
                    `;
                });
            }

            datesHTML += `
                <div class="date ${activeClass}" id="${dayId}">
                    <span class="calendarnumber">${i}</span>
                    ${eventNotesHTML}
                </div>
            `;
        }

        // Inactive days for next month
        const lastDayIndex = lastDay.getDay();
        const remainingCells = 42 - (firstDayIndex + totalDays);
        for (let i = 1; i <= remainingCells; i++) {
            const nextDate = new Date(currentYear, currentMonth + 1, i);
            datesHTML += `<div class="date inactive"><span class="calendarnumber">${nextDate.getDate()}</span></div>`;
        }

        // Update DOM
        monthYearElement.textContent = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });
        datesElement.innerHTML = datesHTML;
    };

    // --- Load Events + Initialize Calendar ---
    async function loadEventsAndPopulateCalendar() {
        try {
            const response = await fetch('scripts/events.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            allEvents = await response.json();

            // Precompute schedules for all events
            allEvents.forEach(event => {
                event._schedule = buildDailySchedule(event);
            });

            updateCalendar(allEvents);

        } catch (error) {
            console.error("Error loading or parsing events in calendar.js:", error);
            datesElement.innerHTML = '<p>Error loading calendar events. Please try again.</p>';
            updateCalendar([]);
        }
    }

    // --- Navigation Buttons ---
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar(allEvents);
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar(allEvents);
    });

    // --- Event Link Click Handler (opens modal) ---
    datesElement.addEventListener('click', (e) => {
        const eventLink = e.target.closest('.event-link');
        if (eventLink) {
            e.preventDefault();
            const eventId = eventLink.dataset.eventId;

            const eventDetails = allEvents.find(event => event.ID.toString() === eventId);

            if (eventDetails) {
                if (typeof window.openEventModal === 'function') {
                    window.openEventModal(eventDetails);
                } else {
                    console.error("Error: window.openEventModal is not defined. Ensure modal.js is loaded.");
                }
            } else {
                console.warn(`Event with ID ${eventId} not found.`);
            }
        }
    });

    // --- Initialize ---
    loadEventsAndPopulateCalendar();

})(); // End IIFE
