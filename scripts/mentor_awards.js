(function() {

	async function displayGloveAwardRecipients() {
		// Note that I'm using the titleholder-container ID.  This is because I don't want to have to create new CSS just because of an ID.  The CSS for the titleholders, staff, and glove award recipients are all the same, so there's no reason to make more work for myself.
		const mentorAwardList = document.getElementById('titleholder-container')

		// Pass an error if the main HTML document doesn't have a titleholder-container element.
		if (!mentorAwardList) {
			console.error("Error, there is no element with titleholder-container in the HTML file.")
			return
		}
		
		// Attempt to get the JSON file with the titleholder data.
		try {
			const response = await fetch('scripts/mentor_award_recipients.json')
			
			// Pass an error if there is a server error in retrieving the JSON file.
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const recipients = await response.json()

			// Pass an error if the JSON file is malformed to both the console and the webpage.
			if (!Array.isArray(recipients)) {
				console.error("Error: JSON data is not a valid array for titleholder data.")
				mentorAwardList.innerHTML = '<p>Error: Titleholder data is malformed.</p>'
				return
			}

			// Sort glove award first by year, then by name.  Descending for year, ascending for name.
			recipients.sort((a, b) => {
    			// Primary sort: Year descending
   				if (a.Year !== b.Year) {
        			return b.Year - a.Year;
    			}
				return a.Name.localeCompare(b.Name);
			});

			/*	If there are no recipients, output that to the webpage. This should never happen in practice, though.  This would only occur if someone incorrectly modified the JSON file.
			*/
			if (recipients.length === 0) {
				mentorAwardList.innerHTML = '<p>No previous mentor award recipients found.</p>'
				return
			}

			// Generate HTML for the former titleholders.
			recipients.forEach(recipient => {
				const recipientHtml = `
					<div class="divided_boxes">
						<div class="staffpictures">
							<a href="#" class="image-link"><img src="img/mentorawardrecipients/Thumbnails/${recipient.Image}" alt="${recipient.Name}"></a>
						</div>
						<div class="staff-box">
							<span class="staff-name"><b>${recipient.Name} - ${recipient.Year}</b></span>
							<span class="staff-description">${recipient.Description}</span>
						</div>
					</div>
				`
				// Append generated HTML to page.
				mentorAwardList.innerHTML += recipientHtml
			})

		// Handle any other miscellaneous errors that could arise.
		} catch (error) {
			console.error("Failed to load or display glove award recipient data:", error)
			mentorAwardList.innerHTML = '<p>Error loading glove award recipient information. Please try again later.</p>'
		}
	}

	displayGloveAwardRecipients()

})()