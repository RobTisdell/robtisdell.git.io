// scripts/upcoming_events.js

(function() { // Start of IIFE for scope isolation

    const eventsListContainerId = 'upcoming-events-list';
    const introTextContainerId = 'upcoming-events-intro';
    const eventsJsonSource = 'scripts/events.json';

    // --- Helper Functions (can remain as is within the IIFE) ---

    // Function to format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatTime(timeString) {
        const [hourStr, minuteStr] = timeString.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour === 0 ? 12 : hour; // The hour '0' (midnight) should be '12'
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }

    // Function to generate event HTML
    function createEventHtml(event) {
        let dateDisplay;
        let dateLabel = 'Date'; // Default label
        const startDate = new Date(event.StartDate);
        const endDate = new Date(event.EndDate);

        // Calculate the difference in days
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Get the end time hour to determine if it's an early morning spillover
        const [endHourStr] = event.EndTime.split(':');
        const endHour = parseInt(endHourStr, 10);

        // Rule for "spill over" events: if the event ends one day after it starts,
        // AND the end time is before 6 AM, display only the start date.
        if (diffDays === 1 && endHour < 6) { // You can adjust '6' to any hour that defines "early morning"
            dateDisplay = formatDate(event.StartDate);
            dateLabel = 'Date'; // Still "Date" for these single-day display cases
        } else if (event.StartDate === event.EndDate) {
            dateDisplay = formatDate(event.StartDate);
            dateLabel = 'Date'; // Single day event
        } else {
            dateDisplay = `${formatDate(event.StartDate)} - ${formatDate(event.EndDate)}`;
            dateLabel = 'Dates'; // Multi-day event
        }

        // Check if LocationURL exists for linking, otherwise just display Location
        let locationHtml;
        if (event.LocationURL && event.Location) {
            locationHtml = `<a href="${event.LocationURL}" target="_blank" rel="noopener noreferrer">${event.Location}</a>`;
        } else if (event.Location) {
            locationHtml = event.Location;
        } else {
            locationHtml = 'TBD'; // Fallback if no location data
        }
		
		let mapLink;
		if (event.LocationAddress && event.LocationAddress.trim() !== '') {
			const encodedAddress = encodeURIComponent(event.LocationAddress)
			const mapURL = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
			mapLink = `(<a href="${mapURL}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-map-location-dot"></i> Map it</a>)`;
		}


        return `
            <div class="event_boxes" id="event-${event.ID}">
                <img src="img/events/${event.Image}" alt="${event.Name} image">
                <p class="event_details"><strong>Type of event:</strong> ${event.Type}</p>
                <p class="event_details"><strong>Location:</strong> ${locationHtml} (${event.LocationAddress || 'Address TBD'}) ${mapLink}</p>
                <p class="event_details"><strong>${dateLabel}:</strong> ${dateDisplay}</p>
                <p class="event_details"><strong>Time:</strong> ${formatTime(event.StartTime)} - ${formatTime(event.EndTime)}</p>
                <p class="event_description">${event.Description}</p>
            </div>
        `;
    }

    // --- Main Logic Function ---
    async function loadUpcomingEvents() {
        // Get references to the target containers
        const eventsListContainer = document.getElementById(eventsListContainerId);
        const introTextContainer = document.getElementById(introTextContainerId);

        // Crucial: Check if the required elements exist before proceeding.
        // If not, this script isn't meant for the current page content.
        if (!eventsListContainer || !introTextContainer) {
            // console.warn("Upcoming events containers not found. Script skipped for this page.");
            return;
        }

        try {
            const response = await fetch(eventsJsonSource);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const events = await response.json();

            if (!Array.isArray(events)) {
                console.error("Error: Events data is not an array.");
                eventsListContainer.innerHTML = '<p>Error: Events data is malformed.</p>';
                introTextContainer.innerHTML = '<p>We are currently experiencing issues loading event information. Please check back later.</p>';
                return;
            }

            // Get current date and normalize to start of the day for accurate comparison
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Calculate 31 days from now, normalized
            const thirtyOneDaysFromNow = new Date(today);
            thirtyOneDaysFromNow.setDate(today.getDate() + 31);
            thirtyOneDaysFromNow.setHours(23, 59, 59, 999); // Set to end of the 31st day

            let filteredEvents = [];

            events.forEach(event => {
                const eventStartDate = new Date(event.StartDate);
                eventStartDate.setHours(0, 0, 0, 0); // Normalize event start date

                const eventEndDate = new Date(event.EndDate);
                eventEndDate.setHours(23, 59, 59, 999); // Normalize event end date to end of day

                // Rule 1: Event is currently occurring (today is between StartDate and EndDate, inclusive)
                // The current date/time (today) must be greater than or equal to the event's start date
                // AND less than or equal to the event's end date.
                const isCurrentlyOccurring = (today.getTime() >= eventStartDate.getTime() && today.getTime() <= eventEndDate.getTime());

                // Rule 2: Event starts within the next 31 days (from today)
                // Event's start date must be greater than or equal to today
                // AND less than or equal to 31 days from now.
                const startsWithin31Days = (eventStartDate.getTime() >= today.getTime() && eventStartDate.getTime() <= thirtyOneDaysFromNow.getTime());

                if (isCurrentlyOccurring || startsWithin31Days) {
                    filteredEvents.push(event);
                }
            });

            // Sort filtered events by their start date
            filteredEvents.sort((a, b) => {
                const dateA = new Date(a.StartDate);
                const dateB = new Date(b.StartDate);
                return dateA.getTime() - dateB.getTime(); // Use getTime() for reliable date comparison
            });

            let upcomingEventsHtml = '';
            let introText = ''; // Variable for the intro text

            if (filteredEvents.length === 0) {
                introText = '<p>We have no events planned for the immediate future. Check out our <a href="calendar.html">calendar</a> to see what we have planned later in the year!</p>';
            } else {
                introText = '<p>These are the upcoming events for the month. For events further out, check out our <a href="calendar.html">calendar</a>!</p>';
                filteredEvents.forEach(event => {
                    upcomingEventsHtml += createEventHtml(event);
                });
            }

            // Set the introductory text and events list
            introTextContainer.innerHTML = introText;
            eventsListContainer.innerHTML = upcomingEventsHtml;

        } catch (error) {
            console.error('Error fetching or processing events:', error);
            eventsListContainer.innerHTML = '<p>Sorry, there was an error loading the events. Please try again later.</p>';
            introTextContainer.innerHTML = '<p>We are currently experiencing issues loading event information. Please check back later.</p>';
        }
    }

    // Call the main function when the script is executed by content_loader.js
    loadUpcomingEvents();

})(); // End of IIFE