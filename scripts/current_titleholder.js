(function() {

	async function displayActiveTitleholder() {
		const titleHolderBox = document.getElementById('titleholder-container');

		// Pass an error if the main HTML document doesn't have a titleholder-container element.
		if (!titleHolderBox) {
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
				titleHolderBox.innerHTML = '<p>Error: Titleholder data is malformed.</p>';
				return;
			}

			// Filter the data so that the active titleholder is what is being worked with.  There should only ever be one of these.
			const activeTitleholder = allTitleholderData.filter(titleHolder => titleHolder.Active === true);

			//	If there are no previous titleholders, output that to the webpage. This should never happen in practice, though.  This would only occur if someone incorrectly modified the JSON file.
			
			if (activeTitleholder.length === 0) {
				titleHolderBox.innerHTML = '<p>No active titleholder found.</p>';
				return;
			}

			// Generate HTML for the active titleholder.
			activeTitleholder.forEach(titleHolder => {
				const titleholderHtml = `
					<div class="unified_box">
						<div class="titleholder-pictures">
							<a href="#0" class="event-link"><img src="img/titleholders/Thumbnails/${titleHolder.Image}" alt="${titleHolder.Name}"></a>
						</div>
						<div class="titleholder-box">
							<span class="staff-name"><b>${titleHolder.Name}</b></span>
							<span class="staff-position"><b>${titleHolder.Prefix} FLAG ${titleHolder.Year.slice(0, 4)}</b></span>
							<span class="staff-description">${titleHolder.Description}</span>
						</div>
					</div>
				`;
				// Append generated HTML to page.
				titleHolderBox.innerHTML += titleholderHtml;
			});

		// Handle any other miscellaneous errors that could arise.
		} catch (error) {
			console.error("Failed to load or display titleholder data:", error);
			titleHolderBox.innerHTML = '<p>Error loading titleholder information. Please try again later.</p>';
		}
	}
	
	displayActiveTitleholder();

})();