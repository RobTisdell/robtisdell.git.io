// scripts/formerstaff.js

(function() { // Wrap the entire script in an IIFE for scope isolation

    const staffSource = 'scripts/staff.json';
    const targetElementId = 'former-staff-container'; // Changed ID for uniqueness and clarity

    // Heirarchy for position history
    const pastPositionOrder = {
        "President": 1,
        "Vice President": 2,
        "Party Entertainment": 3
        // Add other positions here as needed.
        // Positions not listed will appear at the end, sorted alphabetically by name.
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

    async function displayFormerStaff() { // Renamed for consistency
        const outputContainer = document.getElementById(targetElementId);

        // Crucial: Check if the target container exists on the page
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
                console.error("Error: JSON data is not an array for former staff.");
                outputContainer.innerHTML = '<p>Error: Staff data is malformed.</p>';
                return;
            }

            const formerStaff = allStaffData.filter(staff => staff.IsActive === false);

            // This block does the sorting
            // Sort by position priority first, then by name
            formerStaff.sort((a, b) => {
                const priorityA = sortPosition(a.PastPositions);
                const priorityB = sortPosition(b.PastPositions);

                if (priorityA !== priorityB) {
                    return priorityA - priorityB; // Sort by position priority
                }

                // If positions are the same or both are unlisted, sort by name as a secondary sort
                const nameA = a.Name.toLowerCase();
                const nameB = b.Name.toLowerCase();
                return nameA.localeCompare(nameB); // Use localeCompare for robust alphabetical sort
            });

            // Clear existing content in the container.
            outputContainer.innerHTML = '';

            if (formerStaff.length === 0) {
                outputContainer.innerHTML = '<p>No former staff members found.</p>';
                return;
            }

            // Construct the HTML for each former staff member
            formerStaff.forEach(staffMember => {
                const staffHtml = `
                    <div class="divided_boxes">
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
            console.error("Failed to load or display former staff data:", error);
            // Display a user-friendly error message on the page
            outputContainer.innerHTML = '<p>Error loading staff information. Please try again later.</p>';
        }
    }

    // Call the function to load and display staff when this script is executed.
    // This happens automatically when content_loader.js injects and runs the script.
    displayFormerStaff();

})(); // End of the IIFE