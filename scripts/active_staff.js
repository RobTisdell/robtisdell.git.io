(function() {

	async function displayActiveStaff() {
		const outputContainer = document.getElementById('current-staff-container');

		// Pass an error if the main HTML document doesn't have a former-staff-container element.
		if (!outputContainer) {
			console.error("Error, there is no element with former-staff-container in the HTML file.");
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

			//	If there are no active staff members, output that to the webpage. This should never happen in practice, though.  This would only occur if someone incorrectly modified the JSON file.

			if (activeStaff.length === 0) {
				outputContainer.innerHTML = '<p>The staff list is currently empty.</p>';
				return;
			}

			/*	Define position heirarchy, staff will be sorted in this order.
				NOTE:  The text must be EXACTLY as seen in the JSON file.
				Additionally, any titles added here won't be applied unless the JSON file is updated with staff members with the same title.
				This script and the JSON file go hand-in-hand and adding additional titles to one necessitates adding those to the other.
			*/
			
			const positionOrder = {
				"President": 1,
				"Vice President": 2,
				"Executive Secretary": 3,
				"Events Coordinator": 4,
				"Webmaster": 5
				// Add other positions here as needed, giving them a numerical order.
			};

			// Actually sort the staff.
			activeStaff.sort((a, b) => {
				return positionOrder[a.CurrentPosition] - positionOrder[b.CurrentPosition];
			});


			// Helper function to format past positions.  If any exist, display.  If not, leave blank (Sort of, part of the HTML generation code also helps with this)

			const formatPastPositions = staffMember => {
				if (!staffMember.PastPositions || staffMember.PastPositions.length === 0) {
					return '';
				}

				let output = '';

				for (const position of staffMember.PastPositions) {
					const title = position.Title;
					const years = position.Years.join(', ');
					output += `${title} (${years}), `;
				}

				return output.slice(0, -2);
			};

			// Generate HTML for the active staff members.
			activeStaff.forEach(staffMember => {

				// The part of the HTML generation code that uses the above helper function to format past positions.
					let pastPositionsLine = '';
					const doesMemberHavePastPositions = formatPastPositions(staffMember);
						if (doesMemberHavePastPositions !== '') {
							pastPositionsLine = `<span class="staff-position">Also served as ${doesMemberHavePastPositions}</span>`;
							}

				// The final HTML generation.

				const staffHtml = `
					<div class="divided_boxes">
						<div class="staffpictures">
							<a href="#" class="image-link"><img src="img/staff/Thumbnails/${staffMember.Image}" alt="${staffMember.Name}"></a>
						</div>
						<div class="staff-box">
							<span class="staff-name"><b>${staffMember.Name} - ${staffMember.CurrentPosition} since ${staffMember.YearStarted}</b></span>
							${pastPositionsLine}
							<span class="staff-description">${staffMember.Description}</span>
						</div>
					</div>
				`;
				
				// Append generated HTML to page.
				outputContainer.innerHTML += staffHtml;
			});
		}

		// Handle any other miscellaneous errors that could arise.
		catch (error) {
			console.error("Failed to load or display staff data:", error);
			outputContainer.innerHTML = '<p>Error loading staff information. Please try again later.</p>';
		}
	}

	displayActiveStaff();

})();