(function() {

	// Support functions for the main functions.  This one turns military time to 12-hour notation.

	function formatTime(timeData) {
	const [hourInput, minuteInput] = timeData.split(':')
	let hourOutput = parseInt(hourInput, 10)
	const minuteOutput = parseInt(minuteInput, 10)

	if (Number.isNaN(hourOutput) || Number.isNaN(minuteOutput) || hourInput > 23 || minuteInput > 59) {
		return 'Time data is malformed';
	}

		if (hourOutput <= 12) {
			isAMorPM = 'AM'
		}
		if (hourOutput > 12 && hourOutput <= 23) {
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

	// Helper function to turn address data to a link.  This *could* be done as an if statement in the code but honestly that would just create some clutter.

	function makeMapLink(addressData) {
		if (addressData != 'None') {
			linkData = encodeURIComponent(addressData)
			return ` - <a href="https://www.google.com/maps/search/?api=1&query=${linkData}" target="_blank" rel="noopener noreferrer">${addressData} <i class="fa fa-map"></i></a>`
		}
		else {
			return ''
		}
	}

	async function displayUpcomingEvents() {

		const outputContainer = document.getElementById('Upcoming_Events_List')
		
		// Pass an error if the main HTML document doesn't have a former-staff-container element.
		if (!outputContainer) {
			console.error("Error, there is no element with Upcoming_Events_List in the HTML file.")
			return
		}

		// Attempt to get the JSON file with the event data.
		try {
			const response = await fetch('scripts/events.json')

			// Pass an error if there is a server error in retrieving the JSON file.
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			
			const eventData = await response.json();

			// Pass an error if the JSON file is malformed to both the console and the webpage.
			if (!Array.isArray(eventData)) {
				console.error("Error: JSON data is not a valid array for event data.")
				outputContainer.innerHTML = '<p>Error: Event  is malformed.</p>'
				return
			}

			/* Unlike other scripts, here we need to actually process data from the dates before we can filter anything.
			 Since we want events showing up 31 days out from the current date, we need to convert the date strings in the JSON file to a readable format and compare them to the current date. */

			const currentDate = new Date()
			const targetDate = new Date(currentDate)
			targetDate.setDate(currentDate.getDate() + 31)

			// Now we can actually filter.

			const upcomingEvents = eventData.filter(event => {
				const eventDate = new Date(event.StartDate)
				return eventDate >= currentDate && eventDate <= targetDate
			})

			// If we don't have an upcoming event, then look for the nearest event in the future and display that instead.
			if (upcomingEvents.length === 0) {
				
				const futureEvents = eventData.filter(event => new Date(event.StartDate) > currentDate)
				futureEvents.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate))
				upcomingEvents[0] = futureEvents[0]
			}

			// Now actually sort the events by date.

			upcomingEvents.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate))


			// We need this one variable to allow the various iterations to append to.
			
			let shellHTML = ""

			// This goes through each event by sifting through what events have multiple days, single days, multiple parts, or single parts and generates HTML based on what's what.  Anything that has more than one part and/or days has some logic handling for formatting.

			upcomingEvents.forEach(event => {
				const eventParts = event.Part
				let eventHTML = ""
				let checkDayLogo = 1

				// If condition that checks if there are more than 1 parts to an event, does some logic parsing for formatting, and passes off the parts of the event HTML that are different for multi-part events.

				if (eventParts.length > 1) {

					eventParts.forEach((Part, index) => {

						const eventPartNumber = index + 1
						
						// Simple if statement that makes sure that "Day 1, Day 2" etc are only added one time for each day of events.

							if (checkDayLogo === Part.Day) { 
								eventHTML += `<li><strong>Day ${Part.Day}</strong></li>`
								checkDayLogo++
							}

						// Generate HTML for each sub-event within an event.

						eventHTML += `
							<li><strong>Event ${eventPartNumber} - ${Part.EventName}</strong></li>
							<li><strong>Location:</strong> ${displayLocation(Part.Location.Place, Part.Location.URL)}${makeMapLink(Part.Location.Address)}</li>
							<li><strong>Time:</strong> ${formatTime(Part.StartTime)} - ${formatTime(Part.EndTime)}</li>
							<li>${Part.Description}</li>
							`
				})
				}

				// If condition that checks if there are is just 1 part to an event (Or day), and passes off the parts of the event HTML that applies to a single event.

				if (eventParts.length === 1) {

					const Part = eventParts[0]

					eventHTML += `
						<li><strong>Type of event:</strong> ${Part.EventName}</li>
						<li><strong>Location:</strong> ${displayLocation(Part.Location.Place, Part.Location.URL)}${makeMapLink(Part.Location.Address)}</li>
						<li><strong>Time:</strong> ${formatTime(Part.StartTime)} - ${formatTime(Part.EndTime)}</li>
                        <li>${Part.Description}</li>
					`
				}

                // Generates simple HTML around the sub-event lists.

					shellHTML += `
					<div class="event_boxes" id="event-${event.ID}">
					<div class="event_images"><img src="img/events/${event.Image}" alt="${event.Name} image"></div>
					<ul>`
						if (event.Days === 1) {
							shellHTML += `<li><strong>Date:</strong> ${formatDate(event.StartDate)}</li>`
						}

						if (event.Days > 1) {
							shellHTML += `<li><strong>Dates :</strong> ${formatDate(event.StartDate)} - ${formatDate(event.EndDate)}</li>`
						}
					shellHTML += `
							${eventHTML}
							</ul>
					</div>`
			})

			outputContainer.innerHTML += shellHTML;
		}

		catch (error) {
			console.error("Failed to load or display upcoming events:", error)
			// Display a user-friendly error message on the page
			outputContainer.innerHTML = '<p>Error loading event information. Please try again later.</p>'
		}
	}

	displayUpcomingEvents()

})();