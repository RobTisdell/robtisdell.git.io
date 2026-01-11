(function () {

    const eventModal = document.getElementById('eventModal');
    const closeButton = eventModal ? document.querySelector('#eventModal .close-button') : null;

    const EventImage = document.getElementById('EventImage');
    const EventName = document.getElementById('EventName');
    const EventDateTime = document.getElementById('EventDateTime');
    const EventDescription = document.getElementById('EventDescription');
    const EventLocation = document.getElementById('EventLocation');

    if (!eventModal) return;

    // --- Utility Functions ----------------------------------------------------

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

        if (Number.isNaN(hour) || Number.isNaN(minute)) return 'TBD';

        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour === 0 ? 12 : hour;

        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }

    // --- Build schedule from Option 3 JSON -----------------------------------

    function buildDailySchedule(event) {
        const schedule = [];

        const sortedDays = [...event.Days].sort(
            (a, b) => parseLocalDate(a.Date) - parseLocalDate(b.Date)
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

    function groupConsecutiveDays(schedule) {
        const groups = [];
        let current = null;

        schedule.forEach(day => {
            const same =
                current &&
                current.location === day.location &&
                current.locationAddress === day.locationAddress &&
                current.locationURL === day.locationURL &&
                current.startTime === day.startTime &&
                current.endTime === day.endTime;

            if (!current || !same) {
                current = {
                    startDay: day.dayNumber,
                    endDay: day.dayNumber,
                    location: day.location,
                    locationURL: day.locationURL,
                    locationAddress: day.locationAddress,
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

    // --- Modal Rendering ------------------------------------------------------

    function renderDateTime(schedule, groups) {
        const startDate = schedule[0].date;
        const endDate = schedule[schedule.length - 1].date;

        let html = `<div><strong>${schedule.length > 1 ? 'Dates:' : 'Date:'}</strong> `;

        if (startDate === endDate) {
            html += `${formatDate(startDate)}</div>`;
        } else {
            html += `${formatDate(startDate)} – ${formatDate(endDate)}</div>`;
        }

        groups.forEach(group => {
            const dayLabel =
                schedule.length === 1
                    ? ''
                    : group.startDay === group.endDay
                        ? `Day ${group.startDay}`
                        : `Days ${group.startDay}–${group.endDay}`;

            html += `
                <div class="modal-day-block">
                    ${dayLabel ? `<div><strong>${dayLabel}:</strong></div>` : ''}
                    <div>${formatTime(group.startTime)} – ${formatTime(group.endTime)}</div>
                </div>
            `;
        });

        return html;
    }

    function renderLocation(groups, scheduleLength) {
        let html = '';

        groups.forEach(group => {
            const dayLabel =
                scheduleLength === 1
                    ? ''
                    : group.startDay === group.endDay
                        ? `Day ${group.startDay}`
                        : `Days ${group.startDay}–${group.endDay}`;

            let locName = group.location || 'TBD';
            if (group.locationURL && group.locationURL !== 'None') {
                locName = `<a href="${group.locationURL}" target="_blank" rel="noopener noreferrer">${locName}</a>`;
            }

            let mapLink = 'Address TBD';
            if (group.locationAddress && group.locationAddress.trim() !== '') {
                const encoded = encodeURIComponent(group.locationAddress);
                const mapURL = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
                mapLink = `<a href="${mapURL}" target="_blank" rel="noopener noreferrer">${group.locationAddress}</a>`;
            }

            html += `
                <div class="modal-location-block">
                    ${dayLabel ? `<div><strong>${dayLabel}:</strong></div>` : ''}
                    <div>${locName} — ${mapLink}</div>
                </div>
            `;
        });

        return html;
    }

    // --- Main Modal Function --------------------------------------------------

    window.openEventModal = function (eventData) {

        const schedule = buildDailySchedule(eventData);
        const groups = groupConsecutiveDays(schedule);

        // Image
        if (EventImage) {
            EventImage.innerHTML =
                `<div class="smalleventculumn"><img src="img/events/${eventData.Image || 'default.png'}"></div>`;
        }

        // Name
        if (EventName) {
            EventName.textContent = eventData.Name || 'Event Details';
        }

        // Description
        if (EventDescription) {
            EventDescription.textContent = eventData.Description || 'No description available.';
        }

        // Date/Time block (split format)
        if (EventDateTime) {
            EventDateTime.innerHTML = renderDateTime(schedule, groups);
        }

        // Location block (split format)
        if (EventLocation) {
            EventLocation.innerHTML = renderLocation(groups, schedule.length);
        }

        eventModal.style.display = 'flex';
    };

    // --- Close Modal ----------------------------------------------------------

    function closeModal() {
        eventModal.style.display = 'none';
        if (EventImage) EventImage.innerHTML = '';
        if (EventName) EventName.textContent = '';
        if (EventDateTime) EventDateTime.innerHTML = '';
        if (EventDescription) EventDescription.textContent = '';
        if (EventLocation) EventLocation.innerHTML = '';
    }

    if (closeButton) closeButton.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === eventModal) closeModal();
    });

})();
