// modal.js

// Get reference to the modal container
const eventModal = document.getElementById('eventModal');
const closeButton = document.querySelector('#eventModal .close-button');

// Get reference to the element where description will be displayed
const modalEventDescription = document.getElementById('modalEventDescription');

// A variable to store all events, which modal.js will now load itself
let _allEvents = [];

/**
 * Fetches the event data from events.json and stores it.
 * This function will be called when the modal.js script loads.
 */
async function loadEventsForModal() {
    try {
        const response = await fetch('https://robtisdell.github.io/robtisdell.git.io/scripts/events.json'); // Modal.js fetches events itself
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        _allEvents = await response.json();
        console.log("Modal.js loaded events:", _allEvents); // For debugging
    } catch (error) {
        console.error("Error loading events in modal.js:", error);
    }
}

// Function to open the modal (no content population here)
/**
 * Function to open the modal and populate it with event details.
 * @param {Object} eventData - The specific event object to display.
 */
function openModal(eventData) {
    if (eventData) {
        // Populate the description
        if (modalEventDescription) {
            modalEventDescription.textContent = eventData.Description || 'No description available.';
        }
    } else {
        // If no eventData is provided (e.g., event ID not found), clear content
        if (modalEventDescription) {
            modalEventDescription.textContent = 'Event details not available.';
        }
    }
    eventModal.style.display = 'flex'; // Make the modal visible and centered
}


function closeModal() {
    eventModal.style.display = 'none'; // Hide the modal
    // Optionally clear content when closing
    if (modalEventDescription) {
        modalEventDescription.textContent = '';
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

// --- NEW CODE FOR MODAL.JS: Handle clicks on event links ---
// This listener will be active on the entire document.
document.addEventListener('click', (e) => {
    // Check if the clicked element (or its closest ancestor) is an element
    // with the class 'event-link'.
    const clickedEventLink = e.target.closest('.event-link');

    // If an event link was clicked, prevent its default behavior and open the modal
    if (clickedEventLink) {
        e.preventDefault(); // Stop the link from trying to navigate (e.g., to #)

        // For this simplified modal, we just open it.
        // If you later wanted to populate the modal with event-specific data,
        // you would retrieve the data-event-id here:
        // const eventId = clickedEventLink.dataset.eventId;
        // console.log("Event link clicked with ID:", eventId); // For debugging

        openModal(); // Call the modal's own open function
    }
});