// scripts/previous_titleholders.js

(function() { // <--- This opens the IIFE and creates a new scope

    const titleholderSource = 'scripts/titleholders.json';
    const targetElementId = 'titlecontainer'; // Changed ID for clarity and uniqueness

    // Function to display former titleholders
    async function displayFormerTitleholders() {
        const outputContainer = document.getElementById(targetElementId);

        // IMPORTANT: Check if the target container exists on the page.
        if (!outputContainer) {
            // console.warn(`HTML element with ID '${targetElementId}' not found. Script skipped.`);
            return; // Exit if the target container doesn't exist
        }

        try {
            const response = await fetch(titleholderSource);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allTitleholderData = await response.json();

            if (!Array.isArray(allTitleholderData)) {
                console.error("Error: JSON data is not an array for titleholders.");
                outputContainer.innerHTML = '<p>Error: Titleholder data is malformed.</p>';
                return;
            }

            const formerTitleholders = allTitleholderData.filter(titleholder => titleholder.Active === false);

            // Sort former titleholders by Year (ascending)
            formerTitleholders.sort((a, b) => {
                const yearA = a.Year;
                const yearB = b.Year;
                return yearA - yearB;
            });

            // Clear existing content in the container before rendering new content.
            outputContainer.innerHTML = '';

            if (formerTitleholders.length === 0) {
                outputContainer.innerHTML = '<p>No previous titleholders found.</p>';
                return;
            }

            // Construct the HTML for each former titleholder
            formerTitleholders.forEach(titleHolder => {
                const titleholderHtml = `
                    <div class="divided_boxes">
                        <div class="staffpictures">
                            <img src="img/titleholders/${titleHolder.Image}" alt="${titleHolder.Name}">
                        </div>
                        <div class="staff-box">
                            <b>${titleHolder.Name}</b>
							<b>${titleHolder.Prefix} FLAG (${titleHolder.Year})</b>
                            <p>${titleHolder.Description}</p>
                        </div>
                    </div>
                `;
                // Append the generated HTML
                outputContainer.innerHTML += titleholderHtml;
            });

        } catch (error) {
            console.error("Failed to load or display former titleholder data:", error);
            outputContainer.innerHTML = '<p>Error loading previous titleholder information. Please try again later.</p>';
        }
    }

    // Call the function when this script is executed.
    displayFormerTitleholders();

})(); // <--- This closes the IIFE