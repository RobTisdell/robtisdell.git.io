// scripts/currentstaff.js

(function() { // Wrap the entire script in an IIFE for scope isolation

    const staffSource = 'https://robtisdell.github.io/robtisdell.git.io/scripts/staff.json';
    const targetElementId = 'current-staff-container'; // ID of the div where staff will be rendered

    async function displayActiveStaff() {
        const outputContainer = document.getElementById(targetElementId);

        // Crucial: Check if the target container exists on the page
        // If not, this script isn't relevant for the current content, so it exits cleanly.
        if (!outputContainer) {
            // console.warn(`HTML element with ID '${targetElementId}' not found. Script skipped.`);
            return; // Exit if the target container doesn't exist
        }

        try {
            const response = await fetch(staffSource);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allStaffData = await response.json();

            if (!Array.isArray(allStaffData)) {
                console.error("Error: JSON data is not an array for staff.");
                outputContainer.innerHTML = '<p>Error: Staff data is malformed.</p>';
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
                outputContainer.innerHTML = '<p>No active staff members found.</p>';
                return;
            }

            // Construct the HTML for each active staff member
            activeStaff.forEach(staffMember => {
                const staffHtml = `
                    <div class="divided_boxes">
                        <div class="staffpictures">
                            <img src="img/staff/${staffMember.Image}" alt="${staffMember.Name}">
                        </div>
						<div class="staff-box">
							<b>${staffMember.Name}</b>
							<b>${staffMember.CurrentPosition}</b>
							<p>${staffMember.Description}</p>
						</div>
                    </div>
                `;
                // Append the generated HTML
                outputContainer.innerHTML += staffHtml;
            });

        } catch (error) {
            console.error("Failed to load or display staff data:", error);
            // Display a user-friendly error message on the page
            outputContainer.innerHTML = '<p>Error loading staff information. Please try again later.</p>';
        }
    }

    // Call the function to load and display staff when this script is executed.
    // This happens automatically when content_loader.js injects and runs the script.
    displayActiveStaff();

})(); // End of the IIFE