// scripts/upcoming_events.js

(function() { // Start of IIFE for scope isolation

    const eventsListContainerId = 'upcoming-events-list';
    const introTextContainerId = 'upcoming-events-intro';
    const eventsJsonSource = 'scripts/events.json';

    // Parse YYYY-MM-DD as a local date (avoids UTC shift issues)
    function parseLocalDate(dateString) {
        const [y, m, d] = dateString.split('-');
        return new Date(Number(y), Number(m) - 1, Number(d));
    }

    function formatDate(dateString) {
        const date = parseLocalDate(dateString);
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

        if (Number.isNaN(hour) || Number.isNaN(minute)) {
            return 'TBD';
        }

        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour === 0 ? 12 : hour;
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }

    // Build normalized schedule from Option 3 JSON
    function buildDailySchedule(event) {
        const schedule = [];

        // Sort days chronologically using local parsing
        const sortedDays = [...event.Days].sort((a, b) =>
            parseLocalDate(a.Date) - parseLocalDate(b.Date)
        );

        sortedDays.forEach((day, index) => {
            const times = day.OverrideTimes || event.DefaultTimes;
            const location = day.OverrideLocation || event.DefaultLocation;

            schedule.push({
                dayNumber: index + 1,
                date: day.Date,
                startTime: times.Start,
                endTime: times.End,
                location: location.Name,
                locationURL: location.URL,
                locationAddress: location.Address
            });
        });

        return schedule;
    }

    // Group consecutive days with identical details
    function groupConsecutiveDays(schedule) {
        const groups = [];
        let current = null;

        schedule.forEach(day => {
            const sameAsCurrent =
                current &&
                current.location === day.location &&
                current.locationAddress === day.locationAddress &&
                current.locationURL === day.locationURL &&
                current.startTime === day.startTime &&
                current.endTime === day.endTime;

            if (!current || !sameAsCurrent) {
                current = {
                    startDay: day.dayNumber,
                    endDay: day.dayNumber,
                    location: day.location,
                    locationAddress: day.locationAddress,
                    locationURL: day.locationURL,
                    startTime: day.startTime,
                    endTime: day.endTime
                };
                groups.push(current);
            } else {
                current.endDay = day.dayNumber;
            }
        });

        return groups;
    }

    function createEventHtml(event) {
        // Use cached schedule if present, otherwise build and cache
        const schedule = event._schedule || buildDailySchedule(event);
        event._schedule = schedule;

        const groups = groupConsecutiveDays(schedule);

        // Correct date range using local parsing
        const startDateObj = parseLocalDate(schedule[0].date);
        const endDateObj = parseLocalDate(schedule[schedule.length - 1].date);

        let dateDisplay;
        let dateLabel = 'Date';

        if (startDateObj.getTime() === endDateObj.getTime()) {
            dateDisplay = formatDate(schedule[0].date);
        } else {
            dateDisplay = `${formatDate(schedule[0].date)} - ${formatDate(schedule[schedule.length - 1].date)}`;
            dateLabel = 'Dates';
        }

        // Build grouped HTML blocks: Day(s) → Location → Time
        let groupedHtml = '';

        groups.forEach(group => {
            // Determine day label (omit for single-day events)
            let dayLabel = '';
            if (schedule.length > 1) {
                dayLabel =
                    group.startDay === group.endDay
                        ? `Day ${group.startDay}`
                        : `Days ${group.startDay}–${group.endDay}`;
            }

            // Location name (linked or plain)
            let loc;
            if (group.locationURL && group.locationURL !== 'None') {
                loc = `<a href="${group.locationURL}" target="_blank" rel="noopener noreferrer">${group.location}</a>`;
            } else {
                loc = group.location || 'TBD';
            }

            // Map link
            let mapLink = 'Address TBD';
            if (group.locationAddress && group.locationAddress.trim() !== '') {
                const encoded = encodeURIComponent(group.locationAddress);
                const mapURL = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
                mapLink = `<a href="${mapURL}" target="_blank" rel="noopener noreferrer">${group.locationAddress} <i class="fa fa-map"></i></a>`;
            }

            groupedHtml += `
                <div class="event_group_block">
                    ${dayLabel ? `<p class="event_details"><strong>${dayLabel}:</strong></p>` : ''}
                    <p class="event_details"><strong>Location:</strong> ${loc} — ${mapLink}</p>
                    <p class="event_details"><strong>Time:</strong> ${formatTime(group.startTime)} - ${formatTime(group.endTime)}</p>
                </div>
            `;
        });

        return `
            <div class="event_boxes" id="event-${event.ID}">
                <img src="img/events/${event.Image}" alt="${event.Name} image">
                <p class="event_details"><strong>Type of event:</strong> ${event.Type}</p>
                <p class="event_details"><strong>${dateLabel}:</strong> ${dateDisplay}</p>
                ${groupedHtml}
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
                // Build and cache schedule once per event
                const schedule = buildDailySchedule(event);
                event._schedule = schedule;

                const eventStart = parseLocalDate(schedule[0].date);
                const eventEnd = parseLocalDate(schedule[schedule.length - 1].date);

                eventStart.setHours(0, 0, 0, 0);
                eventEnd.setHours(23, 59, 59, 999);

                const isCurrentlyOccurring =
                    today.getTime() >= eventStart.getTime() &&
                    today.getTime() <= eventEnd.getTime();

                const startsWithin31Days =
                    eventStart.getTime() >= today.getTime() &&
                    eventStart.getTime() <= thirtyOneDaysFromNow.getTime();

                if (isCurrentlyOccurring || startsWithin31Days) {
                    filteredEvents.push(event);
                }
            });

            // Sort by start date using cached schedule
            filteredEvents.sort((a, b) => {
                const aStart = parseLocalDate(a._schedule[0].date);
                const bStart = parseLocalDate(b._schedule[0].date);
                return aStart - bStart;
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
