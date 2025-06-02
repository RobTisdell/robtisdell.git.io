const staffSource = 'https://robtisdell.github.io/robtisdell.git.io/scripts/staff.json';
const targetElementId = 'test';

// Heirarchy for position history
const pastPositionOrder  = {
	"President": 1,
	"Vice President": 2,
	"Party Entertainment": 3
	// We can add other positions here as needed.
};

// Helper function to find the highest priority position from an array of past positions
function sortPosition(pastPositionsArray) {
    if (!pastPositionsArray || pastPositionsArray.length === 0) {
        return Infinity; // If no past positions, put them at the very end
    }

    let highestPriority = Infinity; // Start with the lowest possible priority

    for (const position of pastPositionsArray) {
        // Look up the priority; if not found, treat it as very low priority
        const currentPriority = pastPositionOrder[position] || Infinity;
        if (currentPriority < highestPriority) {
            highestPriority = currentPriority; // Found a higher priority position
        }
    }
    return highestPriority;
}

async function displayformerStaff() {
	try {
		const response = await fetch(staffSource);
		const allStaffData = await response.json();

		if (!Array.isArray(allStaffData)) {
			console.error("Error: JSON data is not an array.");
			return; // Exit if data is malformed
		}

		const formerStaff = allStaffData.filter(staff => staff.IsActive === false);
		
		// This block does the sorting
		// This first section sorts by position
        formerStaff.sort((a, b) => {
			
            const priorityA = sortPosition(a.PastPositions);
            const priorityB = sortPosition(b.PastPositions);

            if (priorityA !== priorityB) {
                return priorityA - priorityB; // Sort by position priority
            }

            // This second section sorts by name.
            const nameA = a.Name.toLowerCase(); // Convert to lowercase for case-insensitive sort
            const nameB = b.Name.toLowerCase();

            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0; // This is to handle the extremely unlikely event of same names.
        });

		const outputContainer = document.getElementById(targetElementId);

		if (!outputContainer) {
			console.error(`Error: HTML element with ID '${targetElementId}' not found.`);
			return; // Exit if the target container doesn't exist
		}

		// Clear existing content in the container.
		outputContainer.innerHTML = '';

		// Construct the HTML for each active staff member
		formerStaff.forEach(staffMember => {
            const staffHtml = `
                <div class="container">
                    <div class="staffpictures">
                        <img src="img/staff/${staffMember.Image}" alt="${staffMember.Name}">
                    </div>
                    <div class="staff-title">
                        <b>${staffMember.Name}</b>
                    </div>
                    <div class="staff-box">
                        <p>Past Positions: ${staffMember.PastPositions && staffMember.PastPositions.length > 0 ? staffMember.PastPositions.join(', ') : 'N/A'}</p>
                        <p>${staffMember.Description}</p>
                    </div>
                </div>
            `;
			// Append the generated HTML
			outputContainer.innerHTML += staffHtml;
		});

	} catch (error) {
		console.error("Failed to load or display staff data:", error);
		// You might want to display a user-friendly error message on the page here
		const outputContainer = document.getElementById(targetElementId);
		if (outputContainer) {
			outputContainer.innerHTML = '<p>Error loading staff information. Please try again later.</p>';
		}
	}
}

// Call the function to load and display staff when the page loads
document.addEventListener('DOMContentLoaded', displayformerStaff);