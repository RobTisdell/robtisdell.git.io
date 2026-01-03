(function() {

    const titleholderSource = 'scripts/titleholders.json';
    const targetElementId = 'titlecontainer';

    async function displayActiveTitleholder() {
        const outputContainer = document.getElementById(targetElementId);

        if (!outputContainer) {
            return;
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

            const activeTitleholder = allTitleholderData.filter(titleHolder => titleHolder.Active === true);

            // Clear existing content in the container before rendering new content.
            outputContainer.innerHTML = '';

            if (activeTitleholder.length === 0) {
                outputContainer.innerHTML = '<p>No active titleholder found.</p>';
                return;
            }

            // Construct the HTML for the active titleholder(s)
            activeTitleholder.forEach(titleHolder => {
                const titleholderHtml = `
                    <div class="unified_box">
                        <div class="titleholder-pictures">
                            <img src="img/titleholders/${titleHolder.Image}" alt="${titleHolder.Name}">
                        </div>
                        <div class="titleholder-box">
                            <p class="titleholder-title"><b>${titleHolder.Name}</b></p>
							<p class="titleholder-title"><b>${titleHolder.Prefix} FLAG ${titleHolder.Year.slice(0, 4)}</b></p>
                            <p class="titleholder-description">${titleHolder.Description}</p>
                        </div>
                    </div>
                `;
                // Append the generated HTML
                outputContainer.innerHTML += titleholderHtml;
            });

        } catch (error) {
            console.error("Failed to load or display titleholder data:", error);
            // Display error message inside the container
            outputContainer.innerHTML = '<p>Error loading titleholder information. Please try again later.</p>';
        }
    }

    // Call the function to load and display titleholder when this script is executed.
    // We no longer use DOMContentLoaded because content_loader.js executes this script
    // as soon as it's injected and available in the DOM.
    displayActiveTitleholder();

})(); // End of the IIFE