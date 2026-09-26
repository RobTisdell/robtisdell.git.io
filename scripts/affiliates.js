(function() {

	// If I'm right on how this will need to play out, I'll want these as variables outside of  other functions.  Since this is the only page where visible data changes on demand, I won't want to have to run the same loop logic multiple times when I could just create a conditional statement that compares against whether or not these have values.  The HTML will get kicked into these and then they can get cleared and reloaded on demand.

	let gearHTML = "blank"
	let placesHTML = "blank"
	let eventsHTML = "blank"
	let communitiesHTML = "blank"
	let supportHTML = "blank"

	// This will stop the normal behavior of anchor links.

	async function displayAffiliates() {
		const outputContainer = document.getElementById("affiliates")

		// Pass an error if the main HTML document doesn't have a former-staff-container element.
		if (!outputContainer) {
			console.error("Error, there is no element with affiliates-container in the HTML file.")
			return
		}

		// Attempt to get the JSON file with the affiliate data.
		try {
			const response = await fetch('scripts/affiliates.json')
			
			// Pass an error if there is a server error in retrieving the JSON file.
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			
			const affiliateData = await response.json()

			// Pass an error if the JSON file is malformed to both the console and the webpage.
			if (!Array.isArray(affiliateData)) {
				console.error("Error: JSON data is not a valid array for affiliate data.")
				outputContainer.innerHTML = '<p>Error: Affiliate data is malformed.</p>'
				return;
			}

			// Pre-sort the entire array, this should propagate into categories later.
			affiliateData.sort((a, b) => {
				return a.Name.localeCompare(b.Name);
			});

			// Create 4 different arrays based on the category of the
			const gear = affiliateData.filter(affiliates => affiliates.Category === "Gear")
			const places = affiliateData.filter(affiliates => affiliates.Category === "Cruisin' Grounds")
			const events = affiliateData.filter(affiliates => affiliates.Category === "Weekend Fun")
			const communities = affiliateData.filter(affiliates => affiliates.Category === "Clubs and Community")

			/* This should not be necessary, but I'm keeping it here in case the sort -> recategorize logic fails.
			// Sort each list
			gear.sort((a, b) => {
				return positionOrder[a.Name] - positionOrder[b.Name];
			});
			places.sort((a, b) => {
				return positionOrder[a.Name] - positionOrder[b.Name];
			});
			events.sort((a, b) => {
				return positionOrder[a.Name] - positionOrder[b.Name];
			});
			communities.sort((a, b) => {
				return positionOrder[a.Name] - positionOrder[b.Name];
			});
			*/

			// Generate HTML for the gear list:
			if (gearHTML === "blank") {
				let gearOutput = ''
				gear.forEach(gear => {
					const gearStructure = `
						<a href="${gear.URL}" target="_blank">
						<div class="affiliate-container">
							<div class="affiliate-picture">
								<img src="img/affiliates/${gear.Logo}">
							</div>
							<div class="affiliate-title">
								<b>${gear.Name}</b>
							</div>
						</div>
						</a>
					`
					gearOutput += gearStructure
				})
				gearHTML = gearOutput
			}

			// Generates HTML for the places list:
			if (placesHTML === "blank") {
				let placeOutput = ''
				places.forEach(place => {
					const placeStructure = `
						<a href="${place.URL}" target="_blank">
						<div class="affiliate-container">
							<div class="affiliate-picture">
								<img src="img/affiliates/${place.Logo}">
							</div>
							<div class="affiliate-title">
								<b>${place.Name}</b>
							</div>
						</div>
						</a>
					`
					placeOutput += placeStructure
				})
				placesHTML = placeOutput
			}
			
			if (eventsHTML === "blank") {
				let eventOutput = ''
				events.forEach(event => {
					const eventStructure = `
						<a href="${event.URL}" target="_blank">
						<div class="affiliate-container">
							<div class="affiliate-picture">
								<img src="img/affiliates/${event.Logo}">
							</div>
							<div class="affiliate-title">
								<b>${event.Name}</b>
							</div>
						</div>
						</a>
					`
					eventOutput += eventStructure
				})
				eventsHTML = eventOutput
			}

			if (communitiesHTML === "blank") {
				let communityOutput = ''
				communities.forEach(community => {
					const communityStructure = `
						<a href="${community.URL}" target="_blank">
						<div class="affiliate-container">
							<div class="affiliate-picture">
								<img src="img/affiliates/${community.Logo}">
							</div>
							<div class="affiliate-title">
								<b>${community.Name}</b>
							</div>
						</div>
						</a>
					`
					communityOutput += communityStructure
				})
				communitiesHTML = communityOutput
			}

			if (supportHTML === "blank") {
				let supportOutput = ''
				communities.forEach(community => {
					const supportStructure = `
						<a href="${community.URL}" target="_blank">
						<div class="affiliate-container">
							<div class="affiliate-picture">
								<img src="img/affiliates/${community.Logo}">
							</div>
							<div class="affiliate-title">
								<b>${community.Name}</b>
							</div>
						</div>
						</a>
					`
					supportOutput += supportStructure
				})
				supportHTML = supportOutput
			}

		} catch (error) {
			// Handle any other miscellaneous errors that could arise.
			console.error("Failed to load or display affiliate data:", error);
			outputContainer.innerHTML = '<p>Error loading affiliate information. Please try again later.</p>';
		}

		// Anchor link handling
		document.querySelectorAll('a[href^="#"]').forEach(link => {
			link.addEventListener('click', function(event) {
				event.preventDefault();

				const hash = link.getAttribute('href').substring(1);

				switch (hash) {
					case "gear":
						outputContainer.innerHTML = gearHTML;
						break;
					case "places":
						outputContainer.innerHTML = placesHTML;
						break;
					case "events":
						outputContainer.innerHTML = eventsHTML;
						break;
					case "clubs":
						outputContainer.innerHTML = communitiesHTML;
						break;
					case "support":
						outputContainer.innerHTML = supportHTML;
					default:
						outputContainer.innerHTML = "<p>No matching category.</p>";
				}
			});
		});
	}

	displayAffiliates();

})();
