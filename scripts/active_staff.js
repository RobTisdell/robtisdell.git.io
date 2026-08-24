(function() {

	async function displayActiveStaff() {
		const outputContainer = document.getElementById('current-staff-container');

		// Pass an error if the main HTML document doesn't have a current-staff-container element.
		if (!outputContainer) {
			console.error("Error, there is no element with current-staff-container in the HTML file.");
			return;
		}

		// Attempt to get the JSON file with the staff data.
		try {
			const response = await fetch('scripts/staff.json');
			
			// Pass an error if there is a server error in retrieving the JSON file.
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const allStaffData = await response.json();

			// Pass an error if the JSON file is malformed to both the console and the webpage.
			if (!Array.isArray(allStaffData)) {
				console.error("Error: JSON data is not a valid array for staff data.");
				outputContainer.innerHTML = '<p>Error: Staff data is malformed.</p>';
				return;
			}

			const activeStaff = allStaffData.filter(staff => staff.IsActive === true);

			/*	Define position heirarchy, staff will be sorted in this order.
				NOTE:  The text must be EXACTLY as seen in the JSON file.
				Additionally, any titles added here won't be applied unless the JSON file is updated with staff members with the same title.
				This script and the JSON file go hand-in-hand and adding additional titles to one necessitates adding those to the other.
			*/
			
			const positionOrder = {
				"President": 1,
				"Vice President": 2,
				"Party Entertainment": 3
				// Add other positions here as needed, giving them a numerical order.
			};

			// Actually sort the staff.
			activeStaff.sort((a, b) => {
				return positionOrder[a.CurrentPosition] - positionOrder[b.CurrentPosition];
			});

			//	If there are no active staff members, output that to the webpage. This should never happen in practice, though.  This would only occur if someone incorrectly modified the JSON file.

			if (activeStaff.length === 0) {
				outputContainer.innerHTML = '<p>The staff list is currently empty.</p>';
				return;
			}

			// Generate HTML for the active staff members.
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
				// Append generated HTML to page.
				outputContainer.innerHTML += staffHtml;
			});

		// Handle any other miscellaneous errors that could arise.
		} catch (error) {
			console.error("Failed to load or display staff data:", error);
			outputContainer.innerHTML = '<p>Error loading staff information. Please try again later.</p>';
		}
	}

	displayActiveStaff();

})();