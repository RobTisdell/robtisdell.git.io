(function() {

	// Takes elements from the calendar HTML page and turns them into variables we can play with.

	const monthYearElement = document.getElementById('monthYear')
	const datesElement = document.getElementById('calendar-dates')
	const prevBtn = document.getElementById('prevBtn')
	const nextBtn = document.getElementById('nextBtn')

	// Makes sure the calendar elements actually exist.	If not, close the program.
	if (!monthYearElement || !datesElement || !prevBtn || !nextBtn) {
		return
	}

	// Pulls the current date out as a reference for the rest of the calendar.  This is played with by the previous and next buttons and used to alter the calendar dynamically.
	let currentDate = new Date()

	// Create empty array that we'll store future events in.
	let allEvents = [];

	// Build the calendar schedule from the event data pulled.
	function buildCalendarSchedule(event) {
		const schedule = [];

		
		if (Array.isArray(event.Part) && event.StartDate) {
			const startDate = new Date(event.StartDate);

			// If there's no day number defined in the Part section, then we assume it's on day 1 (Always true for single day events), or else we just assign it the actual day number.
			event.Part.forEach(part => {
				if (!part.Day) {
					dayNumber = 1
				}
				else {
					dayNumber = part.Day
				}

				// Get the date of the individual parts, and set the dates.  This is necessary because we define the days as "Day 1, Day 2, etc" in the JSON as a way of simplifying what we have to process.  The script would have to parse this anyways, so this is where the conversion happens.
				const partDate = new Date(startDate);
				partDate.setDate(startDate.getDate() + (dayNumber - 1));
				
				// Dates in Javascript are complex objects.  This strips down the date to YYYY-MM-DD format, just like in the JSON for simpler parsing down the line.
				const dateString = partDate.toISOString().split('T')[0];

				// These parts are taken from the overall event information and kicked over to the schedule array.
				schedule.push({
					date: dateString,
					startTime: part.StartTime,
					endTime: part.EndTime,
					partName: part.EventName || event.Name,
					location: part.Location || {}
				});
			});
		}

		return schedule;
	}

	// Now onto the calendar itself...
	const updateCalendar = () => {

	// These are necessary for the calendar.  These just get the data from the current date and use those as the default to build the calendar.

	// These comments are unnecessary for anyone who knows what they're doing.  I don't, I did this all by googling and watching videos and hopefully jamming stuff together that made sense and then cleaning it up as best I knew how.  So documenting what these do for my own benefit can't hurt...

	//	Gets the 4-digit year from currentDate defined globally for the calendar function above.
		const currentYear = currentDate.getFullYear()

		// Gets the current month from currentDate.
		const currentMonth = currentDate.getMonth()

		// Pulls data for the first day of the month.  Note that Date(Year, Month, Day) is the general format.	The substitution of the value 1 here for the day means the 1st day of *whatever* month and year is defined.
		const firstDay = new Date(currentYear, currentMonth, 1)

		// Gets the last day.  This is a little less obvious in formatting.  Javascript gets the next month's data (currentMonth +1), and sets the day to 0.  This actually functionally works as -1 day from the start of the next month (Which would otherwise be currentMonth +1, 1), meaning "Last day of this month".
		const lastDay = new Date(currentYear, currentMonth + 1, 0)

		// Gets the numerical value of the last day of the month.
		const totalDays = lastDay.getDate()

		// Gets the data for which day of the month (Sun-Say) is the starting day.
		const firstDayIndex = firstDay.getDay()

		// This is the variable the div list will get appended to.
		let datesHTML = ''

		// This runs through any days from the previous month that could be displayed and sets them up as a bunch of divs.  Rendering for the calendar is dealt with by CSS, this is just creating an amount of necessary divs to solve for the fact that a full calendar DISPLAY month is 42 days and we need to fill the	days.

		//	This one took me a while to understand when I saw it weitten out.  But it's actually simple.  The first day of the week is defined numerically in Javascript as 0-6.  firstDayIndex sets the first day of the month to one of those.  Then it iterates backwards until i hits 0, filling in the first week with the excess information.
		for (let i = firstDayIndex; i > 0; i--) {
			const prevDate = new Date(currentYear, currentMonth, 0 - i + 1)
			datesHTML += `<div class="date inactive"><span class="calendarnumber">${prevDate.getDate()}</span></div>`
		}

		// Iterates through the number of days of the month and adds a div for each.
		for (let i = 1; i <= totalDays; i++) {
			const date = new Date(currentYear, currentMonth, i)
			const today = new Date()
			today.setHours(0, 0, 0, 0)

		// This was a new one for me when I came across it.	This is basically a simplified if statement.	If the condition in parentheses is true, then 'active' is applied to activeClass.	If false, it's left blank. I'm not about to start updating my old scripts with this, but this is cool...
			const activeClass = (date.getTime() === today.getTime()) ? 'active' : ''
		
		// This section pulls data from each day and makes a string with the dates of each cell.  These will be compared with the event array and if there's a match, populate the cell with event links.
			const compareEventYear = date.getFullYear()
			const compareEventMonth = String(date.getMonth() + 1).padStart(2, '0')
	   		const compareEventDayNumber = String(date.getDate()).padStart(2, '0')
			const compareEventString = `${compareEventYear}-${compareEventMonth}-${compareEventDayNumber}`

			// Build event HTML for the specific day in the div iteration loop.
			let eventHtml = ''
			allEvents.forEach(event => {
				if (event._schedule) {
					const hasEventOnThisDay = event._schedule.some(item => item.date === compareEventString)
					if (hasEventOnThisDay) {
						eventHtml += `<a href="#" class="event-link" data-event-id="${event.ID}">${event.Name}</a>`
					}
				}
			})

			// Makes the date number for each cell.
			datesHTML += `
			<div class="date ${activeClass}">
				<span class="calendarnumber">${i}</span>
				<div class="day-events">${eventHtml}</div>
			</div>
			`
		}

		// This deals with whatever dates remain.	Since the full calendar is 42 days, add up the value that the first day occurs on + the total days, subtract it from 42, and iterate through making that many divs.
		let remainingCells = 42 - (firstDayIndex + totalDays)

		// If we have a full extra week of remaining data, we can just nix that from the calendar.
		if (remainingCells > 6) {
			remainingCells = remainingCells - 7
		}

		for (let i = 1; i <= remainingCells; i++) {
			const nextDate = new Date(currentYear, currentMonth + 1, i)
			datesHTML += `<div class="date inactive"><span class="calendarnumber">${nextDate.getDate()}</span></div>`
		}

		// This just updates the month and year at the top of the calendar to display whatever the month and year should be.
		monthYearElement.textContent = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' })
		datesElement.innerHTML = datesHTML
	}

	// Navigation buttons.	These add or subtract 1 from the current DISPLAYED month and then runs the calendar update function.
	prevBtn.addEventListener('click', () => {
		currentDate.setMonth(currentDate.getMonth() - 1)
		updateCalendar()
	})

	nextBtn.addEventListener('click', () => {
		currentDate.setMonth(currentDate.getMonth() + 1)
		updateCalendar()
	})

	updateCalendar()

		// This pulls the data from events and runs them through the calendar schedule builder function.  This is exactly the same procedure done in other content loading scripts, which have detailed commentary if you're curious to read how this works.
	async function loadEvents() {
		try {
			const response = await fetch('scripts/events.json');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			allEvents = await response.json();

			allEvents.forEach(event => {
				event._schedule = buildCalendarSchedule(event);
			});

			updateCalendar();

		} catch (error) {
			console.error("Error loading or parsing events:", error);
		}
	}

	// This bit turns the links on the calendar to open a modal window that will display the complete event information.
	document.addEventListener('click', (event) => {
		const eventLink = event.target.closest('.event-link');
		if (eventLink) {

			// Kills the normal function of links and substitute our own.
			event.preventDefault();

			// Looks for event ID and we'll use that to populate the modal window.
			const eventId = eventLink.dataset.eventId;

			const eventDetails = allEvents.find(event => event.ID.toString() === eventId);

			// Opens the modal window or error out if the modal isn't found
			if (eventDetails) {
				if (typeof window.openEventModal === 'function') {
					window.openEventModal(eventDetails);
				}
				else {
					console.error("Error: window.openEventModal is not defined. Ensure modal.js is loaded.")
				}
			} 
			
			else {
				console.warn(`Event with ID ${eventId} not found.`)
			}
		}
	});

	// --- Initialize ---
	loadEvents();

})()