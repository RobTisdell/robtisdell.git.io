// scripts/modal.js

// Get reference to the modal container
const eventModal = document.getElementById('eventModal');
const closeButton = document.querySelector('#eventModal .close-button');

// Get reference to the elements where content will be displayed
const EventImage = document.getElementById('EventImage');
const EventName = document.getElementById('EventName');
const EventDateTime = document.getElementById('EventDateTime'); // Target for the date/time display
const EventDescription = document.getElementById('EventDescription');
const EventLocation = document.getElementById('EventLocation');


// A variable to store all events, which modal.js will now load itself
let _allEvents = [];

/**
 * Fetches the event data from events.json and stores it.
 * This function will be called when the modal.js script loads.
 */
async function loadEventsForModal() {
	try {
		const response = await fetch('https://robtisdell.github.io/robtisdell.git.io/scripts/events.json');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		_allEvents = await response.json();
		console.log("Modal.js loaded events:", _allEvents);
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
	const [startYear, startMonth, startDay] = eventData.StartDate.split('-').map(Number);
	const [endYear, endMonth, endDay] = eventData.EndDate.split('-').map(Number);
	const [startHour, startMinute] = eventData.StartTime.split(':').map(Number);
	const [endHour, endMinute] = eventData.EndTime.split(':').map(Number);

	// Create full Date objects including time for duration calculation
	const eventStartDateTime = new Date(startYear, startMonth - 1, startDay, startHour, startMinute);
	const eventEndDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);

	// Create Date objects for date parts only (normalized to start of day)
	const eventStartDateOnly = new Date(startYear, startMonth - 1, startDay);
	eventStartDateOnly.setHours(0, 0, 0, 0);

	const eventEndDateOnly = new Date(endYear, endMonth - 1, endDay);
	eventEndDateOnly.setHours(0, 0, 0, 0);

	const durationInMs = eventEndDateTime.getTime() - eventStartDateTime.getTime();
	const durationInHours = durationInMs / (1000 * 60 * 60);

	const LATE_NIGHT_THRESHOLD_HOURS = 10; // Same threshold as in calendar.js

	const isTrulyMultiDayByDate = eventEndDateOnly.getTime() !== eventStartDateOnly.getTime();
	const isTrueMultiDayEvent = isTrulyMultiDayByDate && durationInHours >= LATE_NIGHT_THRESHOLD_HOURS;

	// Part 1 & 2: Format Start Date and Times
	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	let dateTimeString = eventStartDateTime.toLocaleDateString('en-US', options); // "Saturday, May 25, 2025"

	// Remove the comma after the weekday if present, and handle day suffix
	const dayOfMonth = eventStartDateTime.getDate();
	const daySuffix = (dayOfMonth % 10 === 1 && dayOfMonth !== 11) ? 'st'
					: (dayOfMonth % 10 === 2 && dayOfMonth !== 12) ? 'nd'
					: (dayOfMonth % 10 === 3 && dayOfMonth !== 13) ? 'rd'
					: 'th';
	// Reformat for "Saturday May 25th, 2025"
	dateTimeString = dateTimeString.replace(`, ${eventStartDateTime.toLocaleString('en-US', { month: 'long', day: 'numeric' })},`, ` ${eventStartDateTime.toLocaleString('en-US', { month: 'long' })} ${dayOfMonth}${daySuffix},`);


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
		// Reformat for "Sunday May 25th, 2025"
		endDateTimeString = endDateTimeString.replace(`, ${eventEndDateTime.toLocaleString('en-US', { month: 'long', day: 'numeric' })},`, ` ${eventEndDateTime.toLocaleString('en-US', { month: 'long' })} ${endDayOfMonth}${endDaySuffix},`);

		dateTimeString += ` - ${endDateTimeString} ${formatTime(eventData.EndTime)}`;
	} else {
		// Only display end time if it's a "spill-over" or single-day event
		dateTimeString += ` - ${formatTime(eventData.EndTime)}`;
	}

	return dateTimeString;
}


/**
 * Function to open the modal and populate it with event details.
 * @param {Object} eventData - The specific event object to display.
 */
function openModal(eventData) {
	if (eventData) {
		if (EventImage){
			EventImage.innerHTML = `<div class="smalleventculumn"><img src="img/events/${eventData.Image}"></img></div>`;
		}
		if (EventName) {
			EventName.textContent = eventData.Name || 'Event Details';
		}
		if (EventDateTime) { // Populate the EventDateTime element
			EventDateTime.textContent = formatEventDateTime(eventData);
		}
		if (EventDescription) {
			EventDescription.textContent = eventData.Description || 'No description available.';
		}
		if (EventLocation) {
			// Check if both Location name AND LocationURL exist for a link
			if (eventData.Location && eventData.LocationURL) {
				// Construct an <a> tag string and set it as innerHTML
				// target="_blank" opens link in new tab.
				// rel="noopener noreferrer" is for security best practices with target="_blank".
				EventLocation.innerHTML = `<a href="${eventData.LocationURL}" target="_blank" rel="noopener noreferrer">${eventData.Location}</a>`;
			} else if (eventData.Location) {
				// If Location name exists but no URL, just display the text
				EventLocation.textContent = `${eventData.Location}`;
			} else {
				// If no Location data at all, provide a fallback message
				EventLocation.textContent = 'Location: N/A';
			}
		}

	} else {
		// If no eventData is provided, clear content
		if (EventName) EventName.textContent = 'Event Details Not Found';
		if (EventDateTime) EventDateTime.textContent = '';
		if (EventDescription) EventDescription.textContent = 'Event details not available.';
	}

	eventModal.style.display = 'flex'; // Make the modal visible
}


function closeModal() {
	eventModal.style.display = 'none'; // Hide the modal
	// Optionally clear content when closing
	if (EventName) EventName.textContent = '';
	if (EventDateTime) EventDateTime.textContent = '';
	if (EventDescription) EventDescription.textContent = '';
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

// --- Event Listener for clicks on event links ---
document.addEventListener('click', (e) => {
	const clickedEventLink = e.target.closest('.event-link');

	if (clickedEventLink) {
		e.preventDefault(); // Stop the link from trying to navigate (e.g., to #)

		const eventId = clickedEventLink.dataset.eventId;
		console.log("Event link clicked with ID:", eventId);

		const eventData = _allEvents.find(event => event.ID === eventId);

		// Open the modal, passing the found event data
		openModal(eventData);
	}
});

// --- Call loadEventsForModal when the DOM is ready ---
// This ensures _allEvents is populated before a user can click an event link.
document.addEventListener('DOMContentLoaded', loadEventsForModal);