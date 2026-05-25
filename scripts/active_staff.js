// scripts/currentstaff.js

(function() {

	const staffSource = 'https://robtisdell.github.io/robtisdell.git.io/scripts/staff.json';
	const targetElementId = 'current-staff-container'; // ID of the div where staff will be rendered

	async function displayActiveStaff() {
		const outputContainer = document.getElementById(targetElementId);

		// Do not proceed if the target container is not found in the DOM. This allows the script to be safely included on pages that do not have the container.
		if (!outputContainer) {
			console.warn(`HTML element with ID '${targetElementId}' not found. Script skipped.`);
			return;
		}

		try {
			const response = await fetch(staffSource);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const allStaffData = await response.json();

			if (!Array.isArray(allStaffData)) {
				console.error("Error: Staff data is not an array as expected.");
				outputContainer.innerHTML = '<p>Apologies, but there seems to be an issue with the staff information, we can not display the list at this time.</p>';
				return;
			}

			const activeStaff = allStaffData.filter(staff => staff.IsActive === true);

			// This is the code for sorting
			const positionOrder = {
				"President": 1,
				"Vice President": 2,
				"Party Entertainment": 3
				// Add other positions here as needed, giving them a numerical order.
				// Positions not listed will appear after sorted ones, in their original order.
			};

			activeStaff.sort((a, b) => {
				const posA = a.CurrentPosition;
				const posB = b.CurrentPosition;
				const orderA = positionOrder[posA] || Infinity; // Assign Infinity for unlisted positions
				const orderB = positionOrder[posB] || Infinity;
				
				// If positions are the same or both are unlisted, sort by name as a secondary sort
				if (orderA === orderB) {
					return a.Name.localeCompare(b.Name);
				}
				
				return orderA - orderB; // Sort by the numerical order
			});

			// Clear existing content in the container.
			outputContainer.innerHTML = '';

			if (activeStaff.length === 0) {
				outputContainer.innerHTML = '<p>The staff list is currently empty.</p>';
				return;
			}

			// Construct the HTML for each active staff member
			activeStaff.forEach(staffMember => {
				const staffHtml = `
					<div class="divided_boxes">
						<div class="staffpictures">
							<a href="#0" class="event-link"><img src="img/staff/Thumbnails/${staffMember.Image}" alt="${staffMember.Name}"></a>
						</div>
						<div class="staff-box">
							<span class="staff-name"><b>${staffMember.Name}</b></span>
							<span class="staff-position"><b>${staffMember.CurrentPosition}</b></span>
							<span class="staff-description">${staffMember.Description}</span>
						</div>
					</div>
				`;
				// Append the generated HTML
				outputContainer.innerHTML += staffHtml;
			});

		} catch (error) {
			console.error("Failed to load or display staff data:", error);
			// Generic failure message for if something wonky happens.
			outputContainer.innerHTML = '<p>Error loading staff information. Please try again later.</p>';
		}
	}
	displayActiveStaff();

})();