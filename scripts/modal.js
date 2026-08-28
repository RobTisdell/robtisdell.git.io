(function () {

	const EventModal = document.getElementById('EventModal');
	const ModalContent = EventModal ? EventModal.querySelector('.modal-content') : null;

	if (!EventModal || !ModalContent) return;

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
	// Rendering Functions (now return <p> blocks)
	// ------------------------------------------------------------

	function renderDateTime(schedule) {

		if (schedule.length === 1) {
			const d = schedule[0];
			return `
				<p><strong>When:</strong> 
					${formatDate(d.date)}, ${formatTime(d.startTime)} – ${formatTime(d.endTime)}
				</p>
			`;
		}

		let html = `<p><strong>When:</strong></p>`;

		schedule.forEach(day => {
			html += `
				<p class="modal-day-block">
					<strong>Day ${day.dayNumber}:</strong> 
					${formatDate(day.date)}, 
					${formatTime(day.startTime)} – ${formatTime(day.endTime)}
				</p>
			`;
		});

		return html;
	}

	function renderLocation(groups, scheduleLength) {
		let html = '';

		groups.forEach((group, index) => {

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

			if (index === 0) {
				html += `
					<p class="modal-location-block">
						<strong>Where:</strong>
						${dayLabel ? `${dayLabel}:` : ''}
						${locName} — ${mapLink}
					</p>
				`;
			} else {
				html += `
					<p class="modal-location-block">
						<strong>${dayLabel ? dayLabel + ':' : ''}</strong>
						${locName} — ${mapLink}
					</p>
				`;
			}
		});

		return html;
	}

	// ------------------------------------------------------------
	// Main Calendar Modal Function
	// ------------------------------------------------------------

	window.openEventModal = function (eventData) {

		const schedule = buildDailySchedule(eventData);
		const groups = groupConsecutiveDays(schedule);

		ModalContent.innerHTML = `
			<span class="close-button">&times;</span>

			<div class="smalleventcolumn">
				<img src="img/events/${eventData.Image || 'default.png'}">
			</div>

			<p><strong>Event:</strong> ${eventData.Name}</p>
			<p><strong>Hosted By:</strong> ${eventData.Host}</p>

			${renderLocation(groups, schedule.length)}
			${renderDateTime(schedule)}

			<p><strong>What:</strong> ${eventData.Description}</p>
		`;

		EventModal.style.display = 'flex';
	};

	// ------------------------------------------------------------
	// Image-only modal (titleholders)
	// ------------------------------------------------------------

	window.openImageModal = function (imgPath) {
		ModalContent.innerHTML = `
			<span class="close-button">&times;</span>
			<div class="modal-image-container">
				<img src="${imgPath}">
			</div>
		`;
		EventModal.style.display = 'flex';
	};

	// ------------------------------------------------------------
	// Delegated click handler for titleholder thumbnails
	// ------------------------------------------------------------

	document.addEventListener('click', function (e) {
		const link = e.target.closest('.event-link');
		if (!link) return;

		e.preventDefault();

		const img = link.querySelector('img');
		if (!img) return;

		const fullImagePath = img.src.replace('/Thumbnails/', '/FullSize/');
		openImageModal(fullImagePath);
	});

	// ------------------------------------------------------------
	// Close Modal
	// ------------------------------------------------------------

	function closeModal() {
		EventModal.style.display = 'none';
		ModalContent.innerHTML = '';
	}

	document.addEventListener('click', (event) => {
		if (event.target.classList.contains('close-button')) closeModal();
		if (event.target === EventModal) closeModal();
	});

})();
