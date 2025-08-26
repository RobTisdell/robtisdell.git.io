(function() { // Start of IIFE

    const eventModal = document.getElementById('eventModal');
    const closeButton = eventModal ? document.querySelector('#eventModal .close-button') : null;

    const EventImage = document.getElementById('EventImage');
    const EventName = document.getElementById('EventName');
    const EventDateTime = document.getElementById('EventDateTime');
    const EventDescription = document.getElementById('EventDescription');
    const EventLocation = document.getElementById('EventLocation');

    // IMPORTANT: If modal elements are not present, this script should do nothing.
    if (!eventModal) {
        // console.warn("Modal elements not found. Modal script not initializing.");
        return;
    }

    // A variable to store all events, which modal.js will now load itself
    // We're keeping this in case modal needs to fetch its own data for other purposes
    // but calendar.js will pass the eventData directly.
    let _allEvents = []; 

    /**
     * Fetches the event data from events.json and stores it.
     * This function will be called when the modal.js script loads.
     * This is useful if modal needs to initiate on its own (e.g., direct link to an event).
     * For calendar clicks, calendar.js will provide the eventData.
     */
    async function loadEventsForModal() {
        try {
            // Using relative path, assuming 'scripts/events.json' is correct from the root.
            const response = await fetch('scripts/events.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            _allEvents = await response.json();
            // console.log("Modal.js loaded events:", _allEvents);
        } catch (error) {
            console.error("Error loading events in modal.js:", error);
        }
    }

    /**
     * Helper function to format time (e.g., "09:00" to "9:00 AM" or "9:00 PM").
     * @param {string} timeString - Time in "HH:MM" format.
     * @returns {string} Formatted time string.
     */
    function formatTime(timeString) {
        const [hourStr, minuteStr] = timeString.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour === 0 ? 12 : hour; // The hour '0' (midnight) should be '12'
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }

    /**
     * Formats the event date(s) and time(s) based on specified logic.
     * 1)  Formatted "Saturday May 25th, 2025".
     * 2) Display start and end time afterwards: "Saturday May 25th, 2025 9:00 PM - 2:00 AM".
     * 3) Don't display end date unless it's a true multi-day event.
     * @param {Object} eventData - The specific event object.
     * @returns {string} Formatted date/time string for display.
     */
    function formatEventDateTime(eventData) {
        // Ensure inputs are valid. Use current date for parsing if input is just time, etc.
        const startYear = parseInt(eventData.StartDate.substring(0,4));
        const startMonth = parseInt(eventData.StartDate.substring(5,7)) - 1; // Month is 0-indexed
        const startDay = parseInt(eventData.StartDate.substring(8,10));
        
        const endYear = parseInt(eventData.EndDate.substring(0,4));
        const endMonth = parseInt(eventData.EndDate.substring(5,7)) - 1;
        const endDay = parseInt(eventData.EndDate.substring(8,10));

        const [startHour, startMinute] = eventData.StartTime.split(':').map(Number);
        const [endHour, endMinute] = eventData.EndTime.split(':').map(Number);

        // Create full Date objects including time for duration calculation
        const eventStartDateTime = new Date(startYear, startMonth, startDay, startHour, startMinute);
        const eventEndDateTime = new Date(endYear, endMonth, endDay, endHour, endMinute);

        // Create Date objects for date parts only (normalized to start of day)
        const eventStartDateOnly = new Date(startYear, startMonth, startDay);
        eventStartDateOnly.setHours(0, 0, 0, 0);

        const eventEndDateOnly = new Date(endYear, endMonth, endDay);
        eventEndDateOnly.setHours(0, 0, 0, 0);

        const durationInMs = eventEndDateTime.getTime() - eventStartDateTime.getTime();
        const durationInHours = durationInMs / (1000 * 60 * 60);

        const LATE_NIGHT_THRESHOLD_HOURS = 10; // Same threshold as in calendar.js

        const isTrulyMultiDayByDate = eventEndDateOnly.getTime() !== eventStartDateOnly.getTime();
        const isTrueMultiDayEvent = isTrulyMultiDayByDate && durationInHours >= LATE_NIGHT_THRESHOLD_HOURS;

        // Part 1 & 2: Format Start Date and Times
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let dateTimeString = eventStartDateTime.toLocaleDateString('en-US', options); 

        // Apply day suffix (st, nd, rd, th)
        const dayOfMonth = eventStartDateTime.getDate();
        const daySuffix = (dayOfMonth % 10 === 1 && dayOfMonth !== 11) ? 'st'
                        : (dayOfMonth % 10 === 2 && dayOfMonth !== 12) ? 'nd'
                        : (dayOfMonth % 10 === 3 && dayOfMonth !== 13) ? 'rd'
                        : 'th';
        
        // Custom formatting to get "Saturday May 25th, 2025" style
        const monthName = eventStartDateTime.toLocaleString('en-US', { month: 'long' });
        dateTimeString = `${eventStartDateTime.toLocaleString('en-US', { weekday: 'long' })}, ${monthName} ${dayOfMonth}${daySuffix}, ${eventStartDateTime.getFullYear()}`;

        dateTimeString += ` ${formatTime(eventData.StartTime)}`;

        // Part 3: Conditional End Date/Time
        if (isTrueMultiDayEvent) {
            // Display full end date and time
            const endOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            let endDateTimeString = eventEndDateTime.toLocaleDateString('en-US', endOptions);

            const endDayOfMonth = eventEndDateTime.getDate();
            const endDaySuffix = (endDayOfMonth % 10 === 1 && endDayOfMonth !== 11) ? 'st'
                                : (endDayOfMonth % 10 === 2 && endDayOfMonth !== 12) ? 'nd'
                                : (endDayOfMonth % 10 === 3 && endDayOfMonth !== 13) ? 'rd'
                                : 'th';
            
            const endMonthName = eventEndDateTime.toLocaleString('en-US', { month: 'long' });
            endDateTimeString = `${eventEndDateTime.toLocaleString('en-US', { weekday: 'long' })}, ${endMonthName} ${endDayOfMonth}${endDaySuffix}, ${eventEndDateTime.getFullYear()}`;

            dateTimeString += ` - ${endDateTimeString} ${formatTime(eventData.EndTime)}`;
        } else {
            // Only display end time if it's a "spill-over" or single-day event
            dateTimeString += ` - ${formatTime(eventData.EndTime)}`;
        }

        return dateTimeString;
    }


    /**
     * Function to open the modal and populate it with event details.
     * This function is now exposed globally for calendar.js to call.
     * @param {Object} eventData - The specific event object to display.
     */
    window.openEventModal = function(eventData) { // EXPOSE GLOBALLY
        if (eventData) {
            if (EventImage){
                EventImage.innerHTML = `<div class="smalleventculumn"><img src="img/events/${eventData.Image || 'default.png'}"></div>`; // Add a default image for safety
            }
            if (EventName) {
                EventName.textContent = eventData.Name || 'Event Details';
            }
            if (EventDateTime) {
                EventDateTime.textContent = formatEventDateTime(eventData);
            }
            if (EventDescription) {
                EventDescription.textContent = eventData.Description || 'No description available.';
            }
            if (EventLocation) {
                if (eventData.Location && eventData.LocationURL) {
                    EventLocation.innerHTML = `<a href="${eventData.LocationURL}" target="_blank" rel="noopener noreferrer">${eventData.Location}</a>`;
                } else if (eventData.Location) {
                    EventLocation.textContent = `${eventData.Location}`;
                } else {
                    EventLocation.textContent = 'Location: N/A';
                }
            }

        } else {
            // If no eventData is provided, clear content
            if (EventName) EventName.textContent = 'Event Details Not Found';
            if (EventDateTime) EventDateTime.textContent = '';
            if (EventDescription) EventDescription.textContent = 'Event details not available.';
            if (EventLocation) EventLocation.textContent = '';
        }

        eventModal.style.display = 'flex'; // Make the modal visible
    };

    function closeModal() {
        eventModal.style.display = 'none'; // Hide the modal
        // Optionally clear content when closing
        if (EventImage) EventImage.innerHTML = ''; // Clear image
        if (EventName) EventName.textContent = '';
        if (EventDateTime) EventDateTime.textContent = '';
        if (EventDescription) EventDescription.textContent = '';
        if (EventLocation) EventLocation.textContent = '';
    }

    // Add event listener to the close button
    if (closeButton) { // Check if closeButton exists before adding listener
        closeButton.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === eventModal) {
            closeModal();
        }
    });

    // --- No longer need this listener here for modal.js's own event links ---
    // The calendar.js will directly call window.openEventModal with eventData.
    // Keep this only if you have direct event links on the modal.html itself that need to open THIS modal.
    // document.addEventListener('click', (e) => {
    //     const clickedEventLink = e.target.closest('.event-link');
    //     if (clickedEventLink) {
    //         e.preventDefault();
    //         const eventId = clickedEventLink.dataset.eventId;
    //         // Using the _allEvents loaded by modal.js itself (if any)
    //         const eventData = _allEvents.find(event => event.ID.toString() === eventId); // Use toString() for comparison
    //         if (eventData) {
    //             window.openEventModal(eventData); // Call the exposed function
    //         } else {
    //             console.warn(`Event with ID ${eventId} not found by modal.js.`);
    //         }
    //     }
    // });


    // --- Initial Call: Load events for modal (if needed for standalone use cases) ---
    // This will run immediately when modal.js is parsed.
    loadEventsForModal(); // This is for modal.js to have its own data, potentially for standalone use.
                          // Calendar.js will pass the event object directly.

})(); // End of the IIFE