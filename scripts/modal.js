// scripts/modal.js

// Get reference to the modal container
const eventModal = document.getElementById('eventModal');
const closeButton = document.querySelector('#eventModal .close-button');

// Get reference to the element where description will be displayed
const EventDescription = document.getElementById('EventDescription');
const EventName = document.getElementById('EventName');

// A variable to store all events, which modal.js will now load itself
let _allEvents = [];

/**
 * Fetches the event data from events.json and stores it.
 * This function will be called when the modal.js script loads.
 */
async function loadEventsForModal() {
    try {
        // Updated URL for clarity, assuming your JSON is hosted here
        const response = await fetch('https://robtisdell.github.io/robtisdell.git.io/scripts/events.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        _allEvents = await response.json();
        console.log("Modal.js loaded events:", _allEvents); // For debugging
    } catch (error) {
        console.error("Error loading events in modal.js:", error);
    }
}

/**
 * Function to open the modal and populate it with event details.
 * @param {Object} eventData - The specific event object to display.
 */
function openModal(eventData) {
    if (eventData) {
        // Populate the description
        if (EventDescription) {
            EventDescription.textContent = eventData.Description || 'No description available.';
        }
    } else {
        // If no eventData is provided (e.g., event ID not found), clear content
        if (EventDescription) {
            EventDescription.textContent = 'Event details not available.';
        }
    }
	
		 if (EventName) {
            EventName.textContent = eventData.Name || 'Event Details';
        }
		else {
		if (EventName) {
			EventName.textcontent = 'Error: No Event Name';
		}
	}
    eventModal.style.display = 'flex'; // Make the modal visible and centered
}


function closeModal() {
    eventModal.style.display = 'none'; // Hide the modal
    // Optionally clear content when closing
    if (EventDescription) {
        EventDescription.textContent = '';
    }
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

// --- CRUCIAL: Restore and fix the event listener for clicks on event links ---
document.addEventListener('click', (e) => {
    // Check if the clicked element (or its closest ancestor) is an element
    // with the class 'event-link'.
    const clickedEventLink = e.target.closest('.event-link');

    // If an event link was clicked, prevent its default behavior and open the modal
    if (clickedEventLink) {
        e.preventDefault(); // Stop the link from trying to navigate (e.g., to #)

        // --- THESE LINES ARE WHAT WERE MISSING/COMMENTED OUT ---
        const eventId = clickedEventLink.dataset.eventId; // Get the ID from the data attribute
        console.log("Event link clicked with ID:", eventId); // For debugging

        // FIND THE EVENT DATA: Use event.ID (uppercase) to match your JSON
        const eventData = _allEvents.find(event => event.ID === eventId);

        // Open the modal, passing the found event data
        openModal(eventData);
    }
});

// --- Call loadEventsForModal when the DOM is ready ---
// This ensures _allEvents is populated before a user can click an event link.
document.addEventListener('DOMContentLoaded', loadEventsForModal);