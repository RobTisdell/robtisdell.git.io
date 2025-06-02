// Function to load and insert HTML content from a URL into a target element
async function loadComponent(targetElementId, componentURL) {
    try {
        const response = await fetch(componentURL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlContent = await response.text();
        const targetElement = document.getElementById(targetElementId);

        if (targetElement) {
            targetElement.innerHTML = htmlContent;
        } else {
            console.error(`Target element with ID '${targetElementId}' not found.`);
        }
    } catch (error) {
        console.error(`Could not load component from ${componentURL}:`, error);
    }
}

// When the DOM is fully loaded, load the sidenav component
document.addEventListener('DOMContentLoaded', () => {
    // Load the sidenav
    loadComponent('sidenav-container', 'sidenav.html');

    // You would do the same for the topnav here later
    // loadComponent('topnav-placeholder', 'components/topnav.html');
});