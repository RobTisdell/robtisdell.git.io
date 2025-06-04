const titleholderSource = 'scripts/titleholders.json';
const targetElementId = 'titlecontainer';

async function displayformerTitleholders() {
	try {
		const response = await fetch(titleholderSource);
		const allTitleholderData = await response.json();

		if (!Array.isArray(allTitleholderData)) {
			console.error("Error: JSON data is not an array.");
			return; // Exit if data is malformed
		}

		const formerTitleholders = allTitleholderData.filter(titleholder => titleholder.Active === false);
		
		// This block does the sorting
		formerTitleholders.sort((a, b) => {
            const yearA = a.Year;
            const yearB = b.Year;

            if (yearA < yearB) {
                return -1;
            }
            if (yearA > yearB) {
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
		formerTitleholders .forEach(titleHolder => {
			const staffHtml = `
				<div class="container">
					<div class="staffpictures">
						<img src="img/titleholders/${titleHolder.Image}" alt="${titleHolder.Name}">
					</div>
					<div class="staff-title">
						<b>${titleHolder.Name} &#9830; ${titleHolder.Prefix} FLAG (${titleHolder.Year})</b>
					</div>
					<div class="staff-box">
						<p>${titleHolder.Description}</p>
					</div>
				</div>
			`;
			// Append the generated HTML
			outputContainer.innerHTML += staffHtml;
		});

	} catch (error) {
		console.error("Failed to load or display titleholder data:", error);
		// You might want to display a user-friendly error message on the page here
		const outputContainer = document.getElementById(targetElementId);
		if (outputContainer) {
			outputContainer.innerHTML = '<p>Error loading titleholder information. Please try again later.</p>';
		}
	}
}

// Call the function to load and display titleholders when the page loads
document.addEventListener('DOMContentLoaded', displayformerTitleholders);