(function() {

	// Support functions for the main functions.  This one turns military time to 12-hour notation.

	function formatTime(timeData) {
	const [hourInput, minuteInput] = timeData.split(':')
	let hourOutput = parseInt(hourInput, 10)
	const minuteOutput = parseInt(minuteInput, 10)

	// Global variable to store data in.  We want this accessible by modal.js, so we let it be global.
	let eventData = []

	if (Number.isNaN(hourOutput) || Number.isNaN(minuteOutput) || hourOutput > 23 || minuteOutput > 59) {
		return 'Time data is malformed';
	}

		var isAMorPM = ''
		if (hourOutput < 12) {
			isAMorPM = 'AM'
		}
		if (hourOutput >= 12 && hourOutput <= 23) {
			isAMorPM = 'PM'
		}

		if (hourOutput > 0) {
			hourOutput = hourOutput % 12
		}
		if (hourOutput === 0) {
			hourOutput = 12
		}

	return `${hourOutput}:${minuteOutput.toString().padStart(2, '0')} ${isAMorPM}`
	}

	// This one takes the YYYY-MM-DD notation from JSON and turns it into a Javascript date object.

	function parseLocalDate(dateString) {
		const [year, month, day] = dateString.split('-')
		return new Date(Number(year), Number(month) - 1, Number(day))
	}

	// This one takes the Javascript date object and turns it into nicer textual data.

	function formatDate(dateString) {
		const date = parseLocalDate(dateString)

		const year = date.getFullYear()
		const month = date.toLocaleString(`en-US`, {month: 'long'})
		const day = date.getDate()
		let ordinal = ''

		if (day === 11 || day === 12 || day === 13) {
			ordinal = 'th'
		}
		else {
			switch(day % 10) {
				case 1:
					ordinal = 'st'
					break
				case 2:
					ordinal = 'nd'
					break
				case 3:
					ordinal = 'rd'
					break
				default:
					ordinal = 'th'
			}
		}
		return `${month} ${day}${ordinal}, ${year}`
	}

	// Helper function to display location and a link if included.
	
	function displayLocation(locationData, linkData) {
		if (locationData != 'Private' && (linkData === 'None' || !linkData)){
			return locationData
		}
		else if (locationData === 'Private') {
			return 'This event is hosted at a private location.  Please contact Jim Maciel for the address.'
		}
		else {
			return `<a href="${linkData}">${locationData}</a>`
		}
	}

	// Helper function to turn address data to a link.  This *could* be done as an if statement in the code but honestly that would just create some clutter.

	function makeMapLink(addressData) {
		if (addressData != 'None') {
			const linkData = encodeURIComponent(addressData)
			return `<br><a href="https://www.google.com/maps/search/?api=1&query=${linkData}" target="_blank" rel="noopener noreferrer">${addressData} <i class="fa fa-map"></i></a>`
		}
		else {
			return ''
		}
	}

	async function displayUpcomingEvents() {

		const mobileOutputContainer = document.getElementById('mobile-events')
		const eventOutputContainer = document.getElementById('flag-events')
		const meetingOutputContainer = document.getElementById('flag-meetings')
		
		// Pass an error if the main HTML document doesn't have a former-staff-container element.
		if (!mobileOutputContainer || !eventOutputContainer || !meetingOutputContainer) {
			console.error("Error, one of the containers for the event outputs is missing.  Check upcoming_events.html to make sure the containers are present and have the correct IDs.")
			return
		}

		// Attempt to get the JSON file with the event data.
		try {
			const response = await fetch('scripts/events.json')

			// Pass an error if there is a server error in retrieving the JSON file.
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			
			eventData = await response.json();

			// Pass an error if the JSON file is malformed to both the console and the webpage.
			if (!Array.isArray(eventData)) {
				console.error("Error: JSON data is not a valid array for event data.")
				mobileOutputContainer.innerHTML = '<p>Error: Event is malformed.</p>'
				eventOutputContainer.innerHTML = '<p>Error: Event is malformed.</p>'
				return
			}

			// Now actually sort the events by date.

			eventData.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate))


			// We need these three variables to hold the HTML output for events.  Since Jim wants to split events on the desktop site into two columns (One for events and one for normal meetings), we need those two variables.  Since mobile doesn't have enough physical screen space for this to work, that needs its own variable that contains everything.
			
			let mobileHTML = ""
			let meetingHTML = ""
			let eventHTML = ""

			// This goes through each event by sifting through what events have multiple days, single days, multiple parts, or single parts and generates HTML based on what's what.  Anything that has more than one part and/or days has some logic handling for formatting.

			eventData.forEach(event => {

				// These are the containers HTML will get appeneded to in the loops.  Their final content will be added directly to mobileHTML, meetingHTML, and eventHTML at the end.
				// EDIT: We're not doing the loops anymore, delete these if the setup doesn't require them further.


				// let mobileEvents = ""
				// let meetingEvents = ""
				// let flagEvents = ""


                // the HTML for each event box.  This section handles the mobile list.

					mobileHTML += `
					<div class="event_boxes" id="event-${event.ID}">
					<div class="event_images"><img src="img/events/${event.Image}" alt="${event.Name} image"></div>
					<ul>
						<li><strong>Event:</strong> ${event.Name}</li>`
						if (event.Days === 1) {
							mobileHTML += `<li><strong>Date:</strong> ${formatDate(event.StartDate)}</li>`
						}

						if (event.Days > 1) {
							mobileHTML += `<li><strong>Dates :</strong> ${formatDate(event.StartDate)} - ${formatDate(event.EndDate)}</li>`
						}
					mobileHTML += `</ul></div>`

					// This section handles the desktop list of meetings. BE AWARE!  This was written with the assumption that all meetings are 1-day meetings, and likely only have 1, possibly 2, parts (Such as going to a restaraunt).  If this assumption is wrong, the meeting box will bloat.  If the nature of meetings change, this MUST be rewrtitten.

					if (event.Type === "FLAG Meeting") {
						meetingHTML += `<div class="event_boxes" id="event-${event.ID}">
					<div class="event_flyer">
					<a href="#" class="image-link"><img src="img/events/flyers/${event.Flyer}" alt="${event.Name} flyer preview"></a></div>
					<div class="event_description">
						<strong>Event:</strong><br>${event.Name}<br><br>
						<strong>Date:</strong><br>${formatDate(event.StartDate)}<br><br>
						`

						event.Part.forEach(Part => {
						meetingHTML +=
							`<strong>Location:</strong><br>${displayLocation(Part.Location.Place, Part.Location.URL)}${makeMapLink(Part.Location.Address)}`
						})
					meetingHTML += `</div></div>`
					}

					// This section handles the desktop list of events.  This one either outputs identical to the Meeting section if the event is simple (One night, one part), or outputs a generic "Click here for more information" that opens a modal window that contains all the details, in very much the same style as the Calendar script uses.

					if (event.Type !== "FLAG Meeting") {
						eventHTML += `<div class="event_boxes" id="event-${event.ID}">
					<div class="event_flyer">
						<a href="#" class="image-link"><img src="img/events/flyers/${event.Flyer}" alt="${event.Name} image"></a>
					</div>
					<div class="event_description">
						<strong>Event:</strong><br>${event.Name}<br><br>`
						if (event.Days > 1 || event.Part.length > 1) {
							eventHTML +=`<strong>Start Date:</strong><br>${formatDate(event.StartDate)}<br><br>
							This event has multiple parts to it!  Please click <a href="#" class="event-link" data-event-id="${event.ID}">here</a> to see all the details.<br><br>`
						}
						if (event.Days === 1 && event.Part.length === 1){
							const eventPart = event.Part[0];
							eventHTML +=
							`<strong>Date:</strong><br>${formatDate(event.StartDate)}<br><br>
							<strong>Time:</strong><br>${formatTime(eventPart.StartTime)} - ${formatTime(eventPart.EndTime)}<br><br>
							<strong>Location:</strong><br>${displayLocation(eventPart.Location.Place, eventPart.Location.URL)}${makeMapLink(eventPart.Location.Address)}`
						}
					eventHTML += `</div></div>`
					}
			})

			mobileOutputContainer.innerHTML += mobileHTML;
			meetingOutputContainer.innerHTML += meetingHTML;
			eventOutputContainer.innerHTML += eventHTML;

		}

		catch (error) {
			console.error("Failed to load or display upcoming events:", error)
			// Display a user-friendly error message on the page
			mobileOutputContainer.innerHTML = '<p>Error loading event information. Please try again later.</p>'
		}
	}

	displayUpcomingEvents()

})();