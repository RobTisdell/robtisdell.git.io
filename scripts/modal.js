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

	// Helper function to display location and a link if included.
	
	function displayLocation(locationData, linkData) {
		if (locationData != 'Private' && linkData === 'None' || ''){
			return locationData
		}
		else if (locationData === 'Private') {
			return 'This event is hosted at a private location.  Please contact Jim Maciel for the address.'
		}
		else {
			return `<a href="${linkData}">${locationData}</a>`
		}
	}

// ------------------------------------------------------------
	// Hierarchical Schedule Builder & Renderer
	// ------------------------------------------------------------

	function renderComplexSchedule(event) {
		const parts = event.Part || [];
		const startDate = event.StartDate ? parseLocalDate(event.StartDate) : new Date();
		const totalDays = event.Days || 1;

		// Group parts by Day number
		const daysMap = {};
		parts.forEach((part, index) => {
			const dayNum = part.Day || 1;
			if (!daysMap[dayNum]) {
				daysMap[dayNum] = [];
			}
			
			// Calculate date for this day
			const partDate = new Date(startDate);
			partDate.setDate(startDate.getDate() + (dayNum - 1));
			
			daysMap[dayNum].push({
				partId: part.PartID || `part_${index}`,
				eventName: part.EventName || event.Name,
				startTime: part.StartTime || 'TBD',
				endTime: part.EndTime || 'TBD',
				location: part.Location?.Place || event.DefaultLocation?.Name || 'TBD',
				locationURL: part.Location?.URL || 'None',
				locationAddress: part.Location?.Address || '',
				description: part.Description || event.Description,
				dateString: formatDate(partDate.toISOString().split('T')[0])
			});
		});

		const dayKeys = Object.keys(daysMap);
		const isMultiDay = dayKeys.length > 1;

		let html = `<div class="schedule-container">`;

		dayKeys.forEach((dayNum, dayIndex) => {
			const dayEvents = daysMap[dayNum];
			const sampleDate = dayEvents[0].dateString;

			// If multi-day, use collapsible <details>. If single day with multiple events, keep it open/static.
			const wrapperTag = isMultiDay ? 'details' : 'div';
			const openAttr = (dayIndex === 0 && isMultiDay) ? 'open' : ''; // Open first day by default

			if (isMultiDay) {
				html += `<details class="modal-day-group" ${openAttr}>`;
				html += `<summary class="modal-day-header"><strong>Day ${dayNum}</strong> (${sampleDate})</summary>`;
			}
			else {
				html += `<div class="modal-day-group">`;
				html += `<p class="modal-day-header"><strong>Day ${dayNum}:</strong> ${sampleDate}</p>`;
			}

			html += `<div class="modal-subevents-list">`;

			dayEvents.forEach((ev, evIndex) => {
				html += `
					<div class="sub-event-block" data-part-id="${ev.partId}">
						<div class="sub-event-summary">
							<span class="sub-event-name">${ev.eventName}</span></span>
						</div>
						<div class="sub-event-details" style="display: none;">
							<p><strong>Where:</strong> ${ev.locationURL !== 'None' ? `<a href="${ev.locationURL}" target="_blank" rel="noopener noreferrer">${ev.location}</a>` : ev.location}</p>
							${ev.locationAddress && ev.locationAddress !== 'None' ? `<p><strong>Address:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.locationAddress)}" target="_blank" rel="noopener noreferrer">${ev.locationAddress}</a></p>` : ''}
							<p><strong>Details:</strong> ${ev.description}</p>
						</div>
					</div>
				`;
			});

			html += `</div>`; // close subevents-list
			html += `</${wrapperTag}>`; // close details or div
		});

		html += `</div>`;
		return html;
	}

window.openEventModal = function (eventData) {
		const parts = eventData.Part || [];
		
		// Fallback check: if it's a legacy single-event structure without parts
		const isSimpleEvent = parts.length <= 1 && (!eventData.Days || eventData.Days === 1);


		// This generates a basic list if the event in question is exactly 1 day and exactly 1 event, there's no need to complicate this bit.
		if (!eventData.Days || eventData.Days && eventData.Part.length === 1) {
		ModalContent.innerHTML = `
			<span class = "close-button">&times;</span>
			<div class="contentist">
				<div class="smalleventcolumn">
					<img src="img/events/${eventData.Image || 'default.png'}">
				</div>
				<ul>
					<li><strong>Event:</strong> ${eventData.Name}</li>
					<li><strong>Hosted by:</strong> ${eventData.Host}</li>
					<li><strong>Date:</strong> ${eventData.StartDate}</li>
					<li><strong>Time:</strong> ${formatTime(eventData.Part[0].StartTime)} - ${formatTime(eventData.Part[0].EndTime)}</li>
					<li><strong>Where:</strong> ${displayLocation()}</li>

			`
		}
		else {
		ModalContent.innerHTML = `
			<span class="close-button">&times;</span>
			<div class = "contentlist">
		   		<div class="smalleventcolumn">
					<img src="img/events/${eventData.Image || 'default.png'}">
				</div>
				<p><strong>Event:</strong> ${eventData.Name}</p>
				<p><strong>Hosted by:</strong> ${eventData.Host}</p>
				${renderComplexSchedule(eventData)}
			</dic>
			`;
		}
		

		EventModal.style.display = 'flex';
	};


	ModalContent.addEventListener('click', function (event) {
		const subEventBlock = event.target.closest('.sub-event-block');
		if (!subEventBlock) return;

		// Prevent toggling if they clicked an actual link inside the details
		if (event.target.tagName === 'A') return;

		const detailsPane = subEventBlock.querySelector('.sub-event-details');
		if (detailsPane) {
			const isVisible = detailsPane.style.display === 'block';
			detailsPane.style.display = isVisible ? 'none' : 'block';
			subEventBlock.classList.toggle('active', !isVisible);
		}
	});

	// Opens Modal window for titleholders.  Simply displays the full-res version of the display image.

	window.openImageModal = function (imgPath) {
		ModalContent.innerHTML = `
			<span class="close-button">&times;</span>
			<div class="modal-image-container">
				<img src="${imgPath}">
			</div>
		`;
		EventModal.style.display = 'flex';
	};

	// Handles the display case for titleholders.

	document.addEventListener('click', function (event) {
		const link = event.target.closest('.event-link');
		
		// Failure case.  Should never happen, but if there's no link data...
		if (!link) return;

		event.preventDefault();

		// Check for the image path.  If it doesn't exist, this is a failure case.
		const img = link.querySelector('img');
		if (!img) return;

		// Does the actual replacing of the thumbnail directory to the FullSize directory.
		const fullImagePath = img.src.replace('/Thumbnails/', '/FullSize/');
		openImageModal(fullImagePath);
	});

	// Closes the Modal window in all cases.

	function closeModal() {
		EventModal.style.display = 'none';
		ModalContent.innerHTML = '';
	}

	document.addEventListener('click', (event) => {
		if (event.target.classList.contains('close-button')) closeModal();
		if (event.target === EventModal) closeModal();
	});

})();