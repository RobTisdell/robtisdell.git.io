(function() {

	async function displayRetiredStaff() {
		const outputContainer = document.getElementById('former-staff-container');
	
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

			const retiredStaff = allStaffData.filter(staff => staff.IsActive === false);

			//	If there are no former staff members, output that to the webpage. This should never happen in practice, though.  This would only occur if someone incorrectly modified the JSON file.

			if (retiredStaff.length === 0) {
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
				"Party Entertainment": 3
				// Add other positions here as needed, giving them a numerical order.
			};


		/*	The following functions will further create groups of retired staff based on their past positions and sort them accordingly.
			From there, each sub-section will be sorted by most recently active date first, then name if necessary.
			Note that this is different than how active_staff.js sorts the active staff, which is to create a list of positions and prioritize in that order.
			This is because active staff members can only have one position at a time, while retired staff members can have multiple past positions.
		*/

			// Helper function that will return the highest list priority based on passed positions.  This will get called in the sort function.
			
			const getHighestPosition = formerStaff => {
				return formerStaff.PastPositions.reduce((highest, position) => {
					if (positionOrder[position.Title] < positionOrder[highest.Title]) {
						return position;
					}
					else {
		   				return highest;
					}
				});
			};

			/*	Helper function that will return the most recent year a staff member held a position.
				Note that this assumes that the years someone held a position are listed in ascending chronological order.
			*/

			const getMostRecentYear = position => {
  			const lastRange = position.Years[position.Years.length - 1];
 				return parseInt(lastRange.slice(-4), 10);
			};

			//	The actual sort function.
			retiredStaff.sort((a, b) => {

			// First, sort by the highest position held by each staff member, using the helper function above.
				const aPosition = getHighestPosition(a);
				const bPosition = getHighestPosition(b);
				const aOrder = positionOrder[aPosition.Title];
				const bOrder = positionOrder[bPosition.Title];
					if (aOrder !== bOrder) {
	 				   return aOrder - bOrder;   // lower number = higher priority
   					}
			// Second, sort by the most recent year someone held the highest priority position they were active in.
				const aYear = getMostRecentYear(aPosition);
				const bYear = getMostRecentYear(bPosition);

					if (aYear !== bYear) {
					return bYear - aYear;   // newer year first
					}
			// Finally, sort by name if all else is equal.
				return a.Name.localeCompare(b.Name);
			});


			const formatPastPositions = staffMember => {
				if (!staffMember.PastPositions || staffMember.PastPositions.length === 0) {
					return 'Error: No former staff positions found for this retired staff member. Please check the JSON file for errors.';
				}

				let output = '';

				for (const position of staffMember.PastPositions) {
					const title = position.Title;
					const years = position.Years.join(', ');
					output += `${title} (${years}), `;
				}

				return output.slice(0, -2); // remove trailing comma + space
			};

		// Construct the HTML for each former staff member
		retiredStaff.forEach(staffMember => {
			const staffHtml = `
				<div class="divided_boxes">
					<div class="staffpictures">
						<a href="#0" class="event-link"><img src="img/staff/Thumbnails/${staffMember.Image}" alt="${staffMember.Name}"></a>
					</div>
					<div class="staff-box">
							<span class="staff-name"><b>${staffMember.Name}</b></span>
							<span class="staff-position"><b>Past Positions:</b> ${formatPastPositions(staffMember)}</span>
							<span class="staff-description">${staffMember.Description}</span>
					</div>
				</div>
			`;
				// Append the generated HTML
				outputContainer.innerHTML += staffHtml;
			});

		} 
			
		catch (error) {
			console.error("Failed to load or display retired staff data:", error);
			// Display a user-friendly error message on the page
			outputContainer.innerHTML = '<p>Error loading staff information. Please try again later.</p>';
		}
	}

	displayRetiredStaff();

})();