const staffSource = 'https://robtisdell.github.io/robtisdell.git.io/scripts/staff.json';
const targetElementId = 'test'; // ID of the div where staff will be rendered

async function displayActiveStaff() {
	try {
		const response = await fetch(staffSource);
		const allStaffData = await response.json();

		if (!Array.isArray(allStaffData)) {
			console.error("Error: JSON data is not an array.");
			return; // Exit if data is malformed
		}

		const activeStaff = allStaffData.filter(staff => staff.IsActive === true);
		
		// This is the code for sorting
		const positionOrder = {
			"President": 1,
			"Vice President": 2,
			"Party Entertainment": 3
			// We can add other positions here as needed.
		};

		activeStaff.sort((a, b) => {
			const posA = a.CurrentPosition;
			const posB = b.CurrentPosition;
			const orderA = positionOrder[posA] || Infinity;
			const orderB = positionOrder[posB] || Infinity;
			return orderA - orderB; // Sort by the numerical order
		});

		const outputContainer = document.getElementById(targetElementId);

		if (!outputContainer) {
			console.error(`Error: HTML element with ID '${targetElementId}' not found.`);
			return; // Exit if the target container doesn't exist
		}

		// Clear existing content in the container.
		outputContainer.innerHTML = '';

		// Construct the HTML for each active staff member
		activeStaff.forEach(staffMember => {
			const staffHtml = `
				<div class="container">
					<div class="staffpictures">
						<img src="img/staff/${staffMember.Image}" alt="${staffMember.Name}">
					</div>
					<div class="staff-title">
						<b>${staffMember.Name} ${staffMember.CurrentPosition ? '&#9830; ' + staffMember.CurrentPosition : ''}</b>
					</div>
					<div class="staff-box">
						<p>${staffMember.Description}</p>
					</div>
				</div>
			`;
			// Append the generated HTML
			outputContainer.innerHTML += staffHtml;
		});

	} catch (error) {
		console.error("Failed to load or display staff data:", error);
		const outputContainer = document.getElementById(targetElementId);
		if (outputContainer) {
			outputContainer.innerHTML = '<p>Error loading staff information. Please try again later.</p>';
		}
	}
}

// Call the function to load and display staff when the page loads
document.addEventListener('DOMContentLoaded', displayActiveStaff);