// scripts/upcoming_events.js

(function() { // Start of IIFE for scope isolation

    const eventsListContainerId = 'upcoming-events-list';
    const introTextContainerId = 'upcoming-events-intro';
    const eventsJsonSource = 'scripts/events.json';

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
        hour = hour === 0 ? 12 : hour;
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }

    function getEventDayCount(event) {
        const start = new Date(event.StartDate);
        const end = new Date(event.EndDate);
        const [endHourStr] = event.EndTime.split(':');
        const endHour = parseInt(endHourStr, 10);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (diffDays === 1 && endHour < 6) {
            return 1;
        }
        return diffDays + 1;
    }

    function buildDailySchedule(event) {
        const dayCount = getEventDayCount(event);
        const schedule = [];
        const startDate = new Date(event.StartDate);

        for (let i = 1; i <= dayCount; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + (i - 1));

            const suffix = `-Day${i}`;

            const startTime = event[`StartTime${suffix}`] || event.StartTime;
            const endTime = event[`EndTime${suffix}`] || event.EndTime;

            const location = event[`Location${suffix}`] || event.Location;
            const locationURL = event[`LocationURL${suffix}`] || event.LocationURL;
            const locationAddress = event[`LocationAddress${suffix}`] || event.LocationAddress;

            schedule.push({
                dayNumber: i,
                date: date.toISOString().split('T')[0],
                startTime,
                endTime,
                location,
                locationURL,
                locationAddress
            });
        }

        return schedule;
    }

    function createEventHtml(event) {
        const schedule = buildDailySchedule(event);

        let dateDisplay;
        let dateLabel = 'Date';
        const startDate = new Date(event.StartDate);
        const endDate = new Date(event.EndDate);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const [endHourStr] = event.EndTime.split(':');
        const endHour = parseInt(endHourStr, 10);

        if (diffDays === 1 && endHour < 6) {
            dateDisplay = formatDate(event.StartDate);
        } else if (event.StartDate === event.EndDate) {
            dateDisplay = formatDate(event.StartDate);
        } else {
            dateDisplay = `${formatDate(event.StartDate)} - ${formatDate(event.EndDate)}`;
            dateLabel = 'Dates';
        }

        let locationHtml = '';
        schedule.forEach(day => {
            let loc;
            if (day.locationURL && day.locationURL !== 'None') {
                loc = `<a href="${day.locationURL}" target="_blank" rel="noopener noreferrer">${day.location}</a>`;
            } else {
                loc = day.location || 'TBD';
            }

            let mapLink = 'Address TBD';
            if (day.locationAddress && day.locationAddress.trim() !== '') {
                const encoded = encodeURIComponent(day.locationAddress);
                const mapURL = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
                mapLink = `<a href="${mapURL}" target="_blank" rel="noopener noreferrer">${day.locationAddress} <i class="fa fa-map"></i></a>`;
            }

            locationHtml += `
                <p class="event_details"><strong>Day ${day.dayNumber} Location:</strong> ${loc} — ${mapLink}</p>
            `;
        });

        let timeHtml = '';
        schedule.forEach(day => {
            timeHtml += `
                <p class="event_details"><strong>Day ${day.dayNumber}:</strong> ${formatTime(day.startTime)} - ${formatTime(day.endTime)}</p>
            `;
        });

        return `
            <div class="event_boxes" id="event-${event.ID}">
                <img src="img/events/${event.Image}" alt="${event.Name} image">
                <p class="event_details"><strong>Type of event:</strong> ${event.Type}</p>
                ${locationHtml}
                <p class="event_details"><strong>${dateLabel}:</strong> ${dateDisplay}</p>
                ${timeHtml}
                <p class="event_description">${event.Description}</p>
            </div>
        `;
    }

    async function loadUpcomingEvents() {
        const eventsListContainer = document.getElementById(eventsListContainerId);
        const introTextContainer = document.getElementById(introTextContainerId);

        if (!eventsListContainer || !introTextContainer) {
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

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const thirtyOneDaysFromNow = new Date(today);
            thirtyOneDaysFromNow.setDate(today.getDate() + 31);
            thirtyOneDaysFromNow.setHours(23, 59, 59, 999);

            let filteredEvents = [];

            events.forEach(event => {
                const eventStartDate = new Date(event.StartDate);
                eventStartDate.setHours(0, 0, 0, 0);

                const eventEndDate = new Date(event.EndDate);
                eventEndDate.setHours(23, 59, 59, 999);

                const isCurrentlyOccurring = (today.getTime() >= eventStartDate.getTime() && today.getTime() <= eventEndDate.getTime());
                const startsWithin31Days = (eventStartDate.getTime() >= today.getTime() && eventStartDate.getTime() <= thirtyOneDaysFromNow.getTime());

                if (isCurrentlyOccurring || startsWithin31Days) {
                    filteredEvents.push(event);
                }
            });

            filteredEvents.sort((a, b) => {
                const dateA = new Date(a.StartDate);
                const dateB = new Date(b.StartDate);
                return dateA.getTime() - dateB.getTime();
            });

            let upcomingEventsHtml = '';
            let introText = '';

            if (filteredEvents.length === 0) {
                introText = '<p>We have no events planned for the immediate future. Check out our <a href="calendar.html">calendar</a> to see what we have planned later in the year!</p>';
            } else {
                introText = '<p>These are the upcoming events for the month. For events further out, check out our <a href="calendar.html">calendar</a>!</p>';
                filteredEvents.forEach(event => {
                    upcomingEventsHtml += createEventHtml(event);
                });
            }

            introTextContainer.innerHTML = introText;
            eventsListContainer.innerHTML = upcomingEventsHtml;

        } catch (error) {
            console.error('Error fetching or processing events:', error);
            eventsListContainer.innerHTML = '<p>Sorry, there was an error loading the events. Please try again later.</p>';
            introTextContainer.innerHTML = '<p>We are currently experiencing issues loading event information. Please check back later.</p>';
        }
    }

    loadUpcomingEvents();

})(); // End of IIFE
