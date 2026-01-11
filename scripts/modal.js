(function () {

    const eventModal = document.getElementById('eventModal');
    const closeButton = eventModal ? document.querySelector('#eventModal .close-button') : null;

    const EventDetailsList = document.getElementById('EventDetailsList');

    if (!eventModal) return;

    // ------------------------------------------------------------
    // Utility Functions
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // Build schedule from Option 3 JSON
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // Rendering Functions
    // ------------------------------------------------------------

    function renderDateTime(schedule) {

        // Single-day event
        if (schedule.length === 1) {
            const d = schedule[0];
            return `
                <li>
                    <strong>When:</strong> 
                    ${formatDate(d.date)}, ${formatTime(d.startTime)} – ${formatTime(d.endTime)}
                </li>
            `;
        }

        // Multi-day event
        let html = `<li><strong>When:</strong></li>`;

        schedule.forEach(day => {
            html += `
                <li class="modal-day-block">
                    <strong>Day ${day.dayNumber}:</strong> 
                    ${formatDate(day.date)}, 
                    ${formatTime(day.startTime)} – ${formatTime(day.endTime)}
                </li>
            `;
        });

        return html;
    }

    function renderLocation(groups, scheduleLength) {
        let html = `<li><strong>Where:</strong></li>`;

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
                <li class="modal-location-block">
                    <strong>${dayLabel ? dayLabel + ':' : ''}</strong>
                    ${locName} — ${mapLink}
                </li>
            `;
        });

        return html;
    }

    // ------------------------------------------------------------
    // Main Modal Function
    // ------------------------------------------------------------

    window.openEventModal = function (eventData) {

        const schedule = buildDailySchedule(eventData);
        const groups = groupConsecutiveDays(schedule);

        // Build the entire <ul> content INCLUDING the image
        EventDetailsList.innerHTML = `
            <li>
                <div class="smalleventculumn">
                    <img src="img/events/${eventData.Image || 'default.png'}">
                </div>
            </li>

            <li><strong>Event:</strong> ${eventData.Name}</li>

            ${renderLocation(groups, schedule.length)}

            ${renderDateTime(schedule)}

            <li><strong>What:</strong> ${eventData.Description}</li>
        `;

        eventModal.style.display = 'flex';
    };

    // ------------------------------------------------------------
    // Close Modal
    // ------------------------------------------------------------

    function closeModal() {
        eventModal.style.display = 'none';
        EventDetailsList.innerHTML = '';
    }

    if (closeButton) closeButton.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === eventModal) closeModal();
    });

})();
