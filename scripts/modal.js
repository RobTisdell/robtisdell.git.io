(function () {

	// Before going further, it's worth noting that the Modal script is used on multiple pages.	Initially I was going to have each page have their own scripts with modals, but it became clear pretty quickly that I want a uniform display from all modal windows based on what they are (IE All staff/titleholder pictures are handled the same, all event popups are handled the same whether from calendar or upcoming events pages).	So there are a lot of disconnected parts in here but they're all called *somewhere* on the site.	Sorry if this is a headache for whoever comes after me~

	const EventModal = document.getElementById('EventModal')
	const ModalContent = EventModal ? EventModal.querySelector('.modal-content') : null

	if (!EventModal || !ModalContent) return

	// Suport functions.

	// These two deal with dates. The first one splits date data into three separate numerical values.	The second one turns those values into something more human-readable.

	function parseLocalDate(dateString) {
		const [y, m, d] = dateString.split('-')
		return new Date(Number(y), Number(m) - 1, Number(d))
	}

	function formatDate(dateString) {
		const date = parseLocalDate(dateString)
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

	// This one takes the time data and converts the Continental time format into AM/PM.

	function formatTime(timeString) {
		const [hourStr, minuteStr] = timeString.split(':')
		let hour = parseInt(hourStr, 10)
		const minute = parseInt(minuteStr, 10)

		// Fail case just in case something was typod in the JSON.	This totally didn't happen...

		if (Number.isNaN(hour) || Number.isNaN(minute)) return 'Error in time formatting.'

		const ampm = hour >= 12 ? 'PM' : 'AM'
		hour = hour % 12
		hour = hour === 0 ? 12 : hour

		return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`
	}

	// This one passes through a link to a location if defined in the JSON.
	
	function displayLocation(locationData, linkData) {
		if (locationData != 'Private' && linkData === 'None' || ''){
			return locationData
		}
		else if (locationData === 'Private') {
			return 'This event is hosted at a private location.	Please contact Jim Maciel for the address.'
		}
		else {
			return `<a href="${linkData}">${locationData}</a>`
		}
	}

// This one is a bit of a doozy.	To be perfectly clear, this function is a *helper* function despite taking up something like a quarter of the script.	Events can have multiple days.	For events that do, the modal pops up a series of dropdown lists.	This function is what generates those lists when called on in later functions.	I wouldn't recommend touching it if you don't know what you're doing.	It took me a *lot* of videos, google, and yes sadly some generative chatbot queries to get this down to something that seems to work.	

	function buildMultiDaySchedule(event) {
		const parts = event.Part || []
		const startDate = event.StartDate ? parseLocalDate(event.StartDate) : new Date()

		// Generates the day count.	Named itinerary because eventually this *will* become an itinerary.
		const itinerary = {}
		parts.forEach((part, index) => {
			const dayNum = part.Day || 1
			if (!itinerary[dayNum]) {
				itinerary[dayNum] = []
			}
			
			// Calculates the specific date for each day of an event.	While there's no reason this couldn't have been done in the events JSON, it would have been just as much code (if not potentially more) here to parse that, as well as a more annoying JSON structure where the JSON file is already a bit monstrous.
			const partDate = new Date(startDate)
			partDate.setDate(startDate.getDate() + (dayNum - 1))
			
			// this is where the itinerary name comes in.	This throws the used information into the itinerary array that then gets called in future HTML in this script.	Errors are thrown if data is missing because everything here should exist.	I specifically want errors to be clear here because I know exactly how big and insane events can get and I'd like to be able to identify where clearly.
			itinerary[dayNum].push({
				partId: part?.PartID || `part_${index}`,
				eventName: part?.EventName || event?.Name || 'Error: No event name and no sub-event name given',
				startTime: part?.StartTime || 'Error: No start time given',
				endTime: part?.EndTime || 'Error: No end time given',
				location: part?.Location?.Place || 'Error: No location data stored.',
				locationURL: part?.Location?.URL || 'None',
				locationAddress: part.Location?.Address || '',
				description: part?.Description || event?.Description,
				dateString: formatDate(partDate.toISOString().split('T')[0])
			})
		})

		// Pulls the days and numbers data from the itinerary for easy access later.
		const dayKeys = Object.keys(itinerary)
		const isMultiDay = dayKeys.length > 1

		let html = `<div class="schedule-container">`

		dayKeys.forEach((dayNum, dayIndex) => {
			const dayEvents = itinerary[dayNum]
			const sampleDate = dayEvents[0].dateString

			// For complex events, if there is a multi-day event, we want to have the user be able to select which day they want to see details of (We need this because the modal would get too big too fast and I honestly don't feel like writing a scrollbar into the modal).  For single-day complex events, this isn't as much a problem.  So this is just a quick "See if it's single or not" as well as being complex.  If single, then it creates a static 1-day list (Which you can just click to find sub-events for) and if it's multi, then have a clickable day list.
			const checkDayCount = (dayIndex === 0 && isMultiDay) ? 'open' : ''

			// Now for the giant nonsense that is the HTML output.
			if (isMultiDay) {
				html += `<details class="multi-day-event" ${checkDayCount}>`
				html += `<summary class="modal-day-header"><strong>Day ${dayNum}</strong> (${sampleDate})</summary>`
			}
			else {
				html += `<div class="single-day-event">`
				html += `<p class="modal-day-header"><strong>Day ${dayNum}:</strong> ${sampleDate}</p>`
			}

			html += `<div class="modal-subevents-list">`

			dayEvents.forEach((subEvent) => {
				html += `
					<div class="sub-event-block" data-part-id="${subEvent.partId}">
						<div class="sub-event-summary">
							<span class="sub-event-name">${subEvent.eventName}</span>
						</div>
						<div class="sub-event-details">
							<p><strong>Where:</strong> ${subEvent.locationURL !== 'None' ? `<a href="${subEvent.locationURL}" target="_blank" rel="noopener noreferrer">${subEvent.location}</a>` : subEvent.location}</p>
							${subEvent.locationAddress && subEvent.locationAddress !== 'None' ? `<p><strong>Address:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(subEvent.locationAddress)}" target="_blank" rel="noopener noreferrer">${subEvent.locationAddress}</a></p>` : ''}
							<p><strong>Details:</strong> ${subEvent.description}</p>
						</div>
					</div>
				`
			})

			/* For mulit-day events, we need to close the details tag.  For single-day events, we don't use a details tag so we close the div.
			
			Thinking about it more, this is a bit obtuse.  I'm not gonna rewrite this now, but if I need to make updates to this page, it can all just be a details tag.*/

			if (isMultiDay) {
				html += `</details>`
			}
			else {
				html += `</div>`
			}
		})

		html += `</div>`
		return html
	}

window.openDayModal = function(dayEvents, selectedDate) {

	let html = `
		<span class="close-button">&times</span>

		<div class="day-modal-content">

		<div class="multi-day-header">Events happening on<br>${formatDate(selectedDate)}</div>
		<br>
		<div class="day-modal-events">
	`

	dayEvents.forEach(event => {

		html += `
			<a href="#"
				class="day-modal-view-event"
				data-event-id="${event.ID}">
				${event.Name}
			</a> - Hosted by: ${event.Host}
			<br>
		`
	})

	html += `</div></div>`

	ModalContent.innerHTML = html

	EventModal.style.display = 'flex'
}

window.openEventModal = function (eventData) {
		// This generates a basic list if the event in question is exactly 1 day and exactly 1 event.  These are so simple that they don't need much explaining.
		if (!eventData.Days || eventData.Days && eventData.Part.length === 1) {
		ModalContent.innerHTML = `
			<span class = "close-button">&times</span>
			<div class="contentist">
				<div class="smalleventcolumn">
					<img src="img/events/${eventData.Image || 'default.png'}">
				</div>
			<ul>
				<li><strong>Event:</strong> ${eventData.Name}</li>
				<li><strong>Hosted by:</strong> ${eventData.Host}</li>
				<li><strong>Date:</strong> ${eventData.StartDate}</li>
				<li><strong>Time:</strong> ${formatTime(eventData.Part[0].StartTime)} - ${formatTime(eventData.Part[0].EndTime)}</li>
				<li><strong>Where:</strong> ${displayLocation(eventData.Part[0].Location.Place, eventData.Part[0].Location.URL)}</li>
			</ul>
		`}
		// This is where that big stupid helper function is used.	This is for the complex events.
		else {
		ModalContent.innerHTML = `
			<span class="close-button">&times</span>
			<div class = "contentlist">
			 		<div class="smalleventcolumn">
					<img src="img/events/${eventData.Image || 'default.png'}">
				</div>
				<p><strong>Event:</strong> ${eventData.Name}</p>
				<p><strong>Hosted by:</strong> ${eventData.Host}</p>
				${buildMultiDaySchedule(eventData)}
			</div>
			`
		}
		EventModal.style.display = 'flex'

		// I had to rely a lot on generative chat models for this segment, unfortunately.  I didn't know how to animate stuff and the one explanation I found didn't really have a good "Here's how to deal with your complexities".  And I really just needed the list to not populate while being jarring to see. Given more weeks I could have figured something out, but this was done at the point where most everything else was set and this needed to just be finished.  I am at least commenting on how it works for my own future reference at least.
		
		// Kicks all multi-day events into a single variable
		const subEventsList = ModalContent.querySelectorAll('.multi-day-event')

		// Now we set an IsAnimating variable to false for all within the list.  This is necessary because I don't want a bunch of animations all firing off at once.  The user can wait a whole .3 seconds (literally) before dropping down another day's details.
			subEventsList.forEach(details => {
			const summary = details.querySelector('summary')
			const content = details.querySelector('.modal-subevents-list')
		let isAnimating = false

		// Reacts when a click is made on one of the summary tags holding the sub-event data.  Fails to do anything whern isAnimating is active.

		summary.addEventListener('click', ev => {
			ev.preventDefault()
			if (isAnimating) return
		// Now we start the animation.  contentHeight is set to the value of the actual height of the details list.  The height exists as a value despite not being shown.  Then flag that the content is animating. */
			const contentHeight = content.scrollHeight
			isAnimating = true

			// This is where hairs start getting split.  This animation closes a sub-event detail day.
			if (details.open) {
				content.animate(
					{ height: [contentHeight + 'px', '0px'] },
					{ duration: 300, easing: 'ease' }
				).finished.then(() => {
				details.open = false
				isAnimating = false
				})
			}
		// This is the other case where we want to open a new day.
			else {
				// This part of the block closes the already open days.
					subEventsList.forEach(other => {
					if (other !== details && other.open) {
						const otherContent = other.querySelector('.modal-subevents-list')
						const otherHeight = otherContent.scrollHeight
						otherContent.animate(
							{ height: [otherHeight + 'px', '0px'] },
							{ duration: 300, easing: 'ease' }
						).finished.then(() => {
						other.open = false
						})
					}
				})

				// And this part of the block actually opens up the new day.
				details.open = true
				content.animate(
					{ height: ['0px', contentHeight + 'px'] },
					{ duration: 300, easing: 'ease' }
				).finished.then(() => {
				isAnimating = false
				})
			}
		})
	})

// --- Sub-event accordion handlers ---
// --- Sub-event accordion handlers ---
const subEventBlocks = ModalContent.querySelectorAll('.sub-event-block')

subEventBlocks.forEach(block => {
	const summary = block.querySelector('.sub-event-summary')
	const details = block.querySelector('.sub-event-details')
	let isAnimating = false

	summary.addEventListener('click', (e) => {
		e.stopPropagation()
		if (isAnimating) return

		isAnimating = true
		const isActive = block.classList.contains('active')

		if (isActive) {
			// CLOSING
			const height = details.scrollHeight
			
			const animation = details.animate(
				[
					{ height: `${height}px`, opacity: 1 },
					{ height: '0px', opacity: 0 }
				],
				{ duration: 250, easing: 'ease' }
			)

			animation.onfinish = () => {
				block.classList.remove('active')
				details.style.display = 'none' // Hide content after closing
				isAnimating = false
			}
		} else {
			// OPENING
			details.style.display = 'block' // Make element visible so scrollHeight can be calculated
			const height = details.scrollHeight

			// Optional: Close other active sub-events in the same list
			const parent = block.parentElement
			const activeOther = parent.querySelector('.sub-event-block.active')
			if (activeOther) {
				const activeDetails = activeOther.querySelector('.sub-event-details')
				const otherHeight = activeDetails.scrollHeight
				activeOther.classList.remove('active')

				activeDetails.animate(
					[
						{ height: `${otherHeight}px`, opacity: 1 },
						{ height: '0px', opacity: 0 }
					],
					{ duration: 200, easing: 'ease' }
				).onfinish = () => {
					activeDetails.style.display = 'none'
				}
			}

			const animation = details.animate(
				[
					{ height: '0px', opacity: 0 },
					{ height: `${height}px`, opacity: 1 }
				],
				{ duration: 250, easing: 'ease' }
			)

			animation.onfinish = () => {
				block.classList.add('active')
				isAnimating = false
			}
		}
	})
})

}

	// Opens Modal window for titleholders.	Simply displays the full-res version of the display image.

	window.openImageModal = function (imgPath) {
		ModalContent.innerHTML = `
			<span class="close-button">&times</span>
			<div class="modal-image-container">
				<img src="${imgPath}">
			</div>
		`
		EventModal.style.display = 'flex'
	}

	document.addEventListener('click', (event) => {
		const link = event.target.closest('.day-modal-view-event')

		if (!link) {
			return
		}

		event.preventDefault()

		const eventId = link.dataset.eventId

		const eventDetails = window.eventData.find(
			event => event.ID.toString() === eventId
		)

		if (eventDetails) {
			window.openEventModal(eventDetails)
		}
	})


	// This looks for links for images specifically.	This is the section that pops up the modal window for titleholder images, staff images, and event flyers.

	document.addEventListener('click', function (event) {
		const link = event.target.closest('.image-link')
		
		// Failure case.	Should never happen, but if there's no link data...
		if (!link) return

		event.preventDefault()

		// Check for the image path.	If it doesn't exist, this is a failure case.
		const img = link.querySelector('img')
		if (!img) return

		// Does the actual replacing of the thumbnail directory to the FullSize directory.
		const fullImagePath = img.src.replace('/Thumbnails/', '/FullSize/')
		openImageModal(fullImagePath)
	})

		document.addEventListener('click', (event) => {
		const eventLink = event.target.closest('.event-link')
		if (eventLink) {

			// Kills the normal function of links and substitute our own.
			event.preventDefault()

			// Looks for event ID and we'll use that to populate the modal window.
			const eventId = eventLink.dataset.eventId

			const eventDetails = eventData.find(event => event.ID.toString() === eventId)

			// Opens the modal window or error out if the modal isn't found
			if (eventDetails) {
				if (typeof window.openEventModal === 'function') {
					window.openEventModal(eventDetails)
				}
				else {
					console.error("Error: window.openEventModal is not defined. Ensure modal.js is loaded.")
				}
			} 

			else {
				console.warn(`Event with ID ${eventId} not found.`)
			}
		}
	})

	// Closes the Modal window in all cases.

	function closeModal() {
		EventModal.style.display = 'none'
		ModalContent.innerHTML = ''
	}

	document.addEventListener('click', (event) => {
		if (event.target.classList.contains('close-button')) closeModal()
		if (event.target === EventModal) closeModal()
	})

})()