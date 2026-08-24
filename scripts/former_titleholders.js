(function() {

	async function displayFormerTitleholders() {
		const titleHolderList = document.getElementById('titleholder-container');

		// Pass an error if the main HTML document doesn't have a titleholder-container element.
		if (!titleHolderList) {
			console.error("Error, there is no element with titleholder-container in the HTML file.")
			return;
		}
		
		// Attempt to get the JSON file with the titleholder data.
		try {
			const response = await fetch('scripts/titleholders.json');
			
			// Pass an error if there is a server error in retrieving the JSON file.
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const allTitleholderData = await response.json();

			// Pass an error if the JSON file is malformed to both the console and the webpage.
			if (!Array.isArray(allTitleholderData)) {
				console.error("Error: JSON data is not a valid array for titleholder data.");
				titleHolderList.innerHTML = '<p>Error: Titleholder data is malformed.</p>';
				return;
			}
			
			// Filter the data so that the former titleholders are what is being worked with.
			const formerTitleholders = allTitleholderData.filter(titleholder => titleholder.Active === false);

			// Sort former titleholders by Year (descending, using first 4 digits). Some of this may look unnecessary, but because we have (as of this writing) one instance of a multi-year titleholder, the data is stored as a string so it needs to be converted, first 4 digits compared, then sorted.
			formerTitleholders.sort((a, b) => {
				const yearA = parseInt(a.Year.substring(0, 4), 10);
				const yearB = parseInt(b.Year.substring(0, 4), 10);
				return yearB - yearA;
			});


			/*	If there are no previous titleholders, output that to the webpage. This should never happen in practice, though.  This would only occur if someone incorrectly modified the JSON file.
			*/
			if (formerTitleholders.length === 0) {
				titleHolderList.innerHTML = '<p>No previous titleholders found.</p>';
				return;
			}

			// Generate HTML for the former titleholders.
			formerTitleholders.forEach(titleHolder => {
				const titleholderHtml = `
					<div class="divided_boxes">
						<div class="staffpictures">
							<a href="#0" class="event-link"><img src="img/titleholders/Thumbnails/${titleHolder.Image}" alt="${titleHolder.Name}"></a>
						</div>
						<div class="staff-box">
							<span class="staff-name"><b>${titleHolder.Name} - ${titleHolder.Prefix} FLAG (${titleHolder.Year})</b></span>
							<span class="staff-description">${titleHolder.Description}</span>
						</div>
					</div>
				`;
				// Append generated HTML to page.
				titleHolderList.innerHTML += titleholderHtml;
			});

		// Handle any other miscellaneous errors that could arise.
		} catch (error) {
			console.error("Failed to load or display former titleholder data:", error);
			titleHolderList.innerHTML = '<p>Error loading previous titleholder information. Please try again later.</p>';
		}
	}

	displayFormerTitleholders();

})();