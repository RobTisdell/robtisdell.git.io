const titleSource = 'scripts/titleholders.json';
const targetElementId = 'titlecontainer'; // ID of the div where staff will be rendered

async function displayActiveTitleholder() {
	try {
		const response = await fetch(titleSource);
		const allTitleholderData = await response.json();

		if (!Array.isArray(allTitleholderData)) {
			console.error("Error: JSON data is not an array.");
			return; // Exit if data is malformed
		}

		const activeTitleholder = allTitleholderData.filter(titleHolder => titleHolder.Active === true);

		const outputContainer = document.getElementById(targetElementId);

		if (!outputContainer) {
			console.error(`Error: HTML element with ID '${targetElementId}' not found.`);
			return; // Exit if the target container doesn't exist
		}

		// Clear existing content in the container.
		outputContainer.innerHTML = '';

		// Construct the HTML for the active titleholder
		activeTitleholder.forEach(titleHolder => {
			const staffHtml = `
				<div class="container">
					<div class="titleholderpictures">
						<img src="img/titleholders/${titleHolder.Image}" alt="${titleHolder.Name}">
					</div>
					<div class="titleholder-title">
						<b>${titleHolder.Name} &#9830; ${titleHolder.Prefix} FLAG ${titleHolder.Year.slice(0, 4)}</b>
					</div>
					<div class="titleholder-box">
						<p>${titleHolder.Description}</p>
					</div>
				</div>
			`;
			// Append the generated HTML
			outputContainer.innerHTML += staffHtml;
		});

	} catch (error) {
		console.error("Failed to load or display titleholder data:", error);
		const outputContainer = document.getElementById(targetElementId);
		if (outputContainer) {
			outputContainer.innerHTML = '<p>Error loading titleholder information. Please try again later.</p>';
		}
	}
}

// Call the function to load and display staff when the page loads
document.addEventListener('DOMContentLoaded', displayActiveTitleholder);