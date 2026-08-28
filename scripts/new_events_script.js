(function() {

	async function displayUpcomingEvents() {
		const outputContainer = document.getElementById('Upcoming_Events_List');
		
		// Pass an error if the main HTML document doesn't have a former-staff-container element.
		if (!outputContainer) {
			console.error("Error, there is no element with Upcoming_Events_List in the HTML file.");
			return;
		}

		// Attempt to get the JSON file with the event data.
		try {
			const response = await fetch('scripts/testNewEvents.json');

			// Pass an error if there is a server error in retrieving the JSON file.
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const eventData = await response.json();

			// Pass an error if the JSON file is malformed to both the console and the webpage.
			if (!Array.isArray(eventData)) {
				console.error("Error: JSON data is not a valid array for event data.");
				outputContainer.innerHTML = '<p>Error: Event  is malformed.</p>';
				return;
			}

			/* Unlike other scripts, here we need to actually process data from the dates before we can filter anything.
			 Since we want events showing up 31 days out from the current date, we need to convert the date strings in the JSON file to a readable format and compare them to the current date. */

			const currentDate = new Date();
			const targetDate = new Date(currentDate);
			targetDate.setDate(currentDate.getDate() + 31);

			// Now we can actually filter.

			const upcomingEvents = eventData.filter(event => {
				const eventDate = new Date(event.StartDate);
				return eventDate >= currentDate && eventDate <= targetDate;
			});

			// If we don't have an upcoming event, then look for the nearest event in the future and display that instead.
			if (upcomingEvents.length === 0) {
				
				const futureEvents = eventData.filter(event => new Date(event.StartDate) > currentDate);
				futureEvents.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
				upcomingEvents[0] = futureEvents[0];
			}

			// Now actually sort the events by date.

			upcomingEvents.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));

			/* Whoo boy, this next is gonna be a doozy.  Basically we need to set up two sections within the display code.  One section for single-day events, and one section for multi-day events.
			
			I'm just going to lay down the logic here.  This was written mostly for my own benefit and to lay out thoughts, and I was gonna delete it, but if anyone happens to need to adjust the code, seeing the logic laid out in text might be useful.
			
			1) Determine if the event is a 1-day event or a multi-day event.  We already explicitly define this in the JSON.  If it's a 1-day event, we don't have to condense anything.  The event has a standard procedure.  Pull information from the core of the event, put that into the HTML.  Then iterate through each sub-event and display that information.  Since we already define the length of the event in the core, we already know that there's only 1 day and thus we don't need parsing logic.

			2) For single-day events with multi-event blocks, we eschew the type of event in favor of the sub-event descriptions.  

			3) If the event is a multi-day event, we want to compare the location & time of day of each sub-event.  If there is a consistent location and time of day, we can say "Days 1-X", display the location and time of day beneath.  If there is *Not* a consistency, then we need to clearly display each day's itinerary second.  As of right now, we are counting *all* inconsistencies in sub-events as a reason to display each day separately, even if there is another sub-event that is in line with a previous one.  This logic could change later, but as of right now...

			There are a lot of intermediate steps to go through here.  Since my long-term plan includes making "Add to calendar" links, there are no two ways about it, timezones need to be parsed regardless.  Since using military notation means that there's never confusion in the data (And also incidentally requiring *less* parsing code-wise), we'll need to take the time start and endpoints and convert them to AM/PM notation.

			In addition, we have conditional URLS.  Some locations have URLs associated with them, others won't. Some events will have addresses, others won't (In the case, say, of events at private homes).  We need to account for those.
			*/

			// We need this one variable to allow the various iterations to append to.
			
			let shellHTML = ""

			// This goes through each event by sifting through what events have multiple days, single days, multiple parts, or single parts and generates HTML based on what's what.  Anything that has more than one part and/or days has some logic handling for formatting.

			// But generally speaking, eventHTML handles the variance of what goes on in individual days or 

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
							<li><strong>Location:</strong> ${Part.Location.Place} - ${Part.Location.Address}</li>
							<li><strong>Time:</strong> ${Part.StartTime} - ${Part.EndTime}</li>
							<li>${Part.Description}</li>
							`
				})
				}

				// If condition that checks if there are is just 1 part to an event (Or day), and passes off the parts of the event HTML that applies to a single event.

				if (eventParts.length === 1) {

					const Part = eventParts[0]

					eventHTML += `
						<li><strong>Type of event:</strong> ${Part.EventName}</li>
						<li><strong>Location:</strong> ${Part.Location.Place} - ${Part.Location.Address}</li>
						<li><strong>Time:</strong> ${Part.StartTime} - ${Part.EndTime}</li>
                        <li>${Part.Description}</li>
					`

				}

                // Generates simple HTML around the sub-event lists.

					shellHTML += `
					<div class="event_boxes" id="event-${event.ID}">
					<div class="event_images"><img src="img/events/${event.Image}" alt="${event.Name} image"></div>
					<ul>`
						if (event.Days === 1) {
							shellHTML += `<li><strong>Date:</strong> ${event.StartDate}</li>`
						}

						if (event.Days > 1) {
							shellHTML += `<li><strong>Dates :</strong> ${event.StartDate} - ${event.EndDate}</li>`
						}
					shellHTML += `
							${eventHTML}
							</ul>
					</div>`
			})

			outputContainer.innerHTML += shellHTML;
		}

		catch (error) {
			console.error("Failed to load or display upcoming events:", error);
			// Display a user-friendly error message on the page
			outputContainer.innerHTML = '<p>Error loading event information. Please try again later.</p>';
		}
			
	}

	displayUpcomingEvents();

})();