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

/**
 * Highlights the current page in the navigation and its parent dropdown, if applicable.
 * Assumes the nav links are <a> tags with href attributes matching page filenames.
 * @param {string} navContainerId - The ID of the element containing the navigation links.
 */
function highlightCurrentNavLink(navContainerId) {
    const navContainer = document.getElementById(navContainerId);
    if (!navContainer) {
        console.warn(`Navigation container with ID '${navContainerId}' not found for highlighting.`);
        return;
    }

    const currentPath = window.location.pathname;
    const currentPageFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);

    // Get all anchor tags within the navigation container
    const navLinks = navContainer.querySelectorAll('a');

    let pageFound = false; // Flag to indicate if the current page's link has been found

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref) {
            const linkFile = linkHref.substring(linkHref.lastIndexOf('/') + 1);

            if (linkFile === currentPageFile) {
                // This is the exact link for the current page

                // 1. Highlight the exact matching <a> and its direct <li> parent
                link.classList.add('current');
                if (link.parentElement && link.parentElement.tagName === 'LI') {
                    link.parentElement.classList.add('current');
                }
                
                // 2. Check if this link is part of a sub-menu (like 'dropright')
                //    If so, highlight its main parent menu item as well.
                const parentDroprightUl = link.closest('ul.dropright');

                if (parentDroprightUl) {
                    // This link is inside a 'dropright' UL
                    const mainMenuItemLi = parentDroprightUl.parentElement; // The LI containing the main menu item
                    if (mainMenuItemLi && mainMenuItemLi.tagName === 'LI') {
                        mainMenuItemLi.classList.add('current'); // Add 'current' to the parent LI
                        const mainMenuItemLink = mainMenuItemLi.querySelector('a'); // Find the <a> within that parent LI
                        if (mainMenuItemLink) {
                            mainMenuItemLink.classList.add('current'); // Add 'current' to the parent <a>
                        }
                    }
                }
                
                pageFound = true; // Mark that we found the page
                // If you only expect one match and want to exit early, you could 'return' here
                // return; // Uncomment this if you want to stop after the first match
            } else {
                // Ensure other links and their parents don't have 'current' if they're not the current page
                link.classList.remove('current');
                if (link.parentElement && link.parentElement.tagName === 'LI') {
                    link.parentElement.classList.remove('current');
                }
            }
        }
    });

    // Optional: If you have a specific default behavior if no link matches, you could add it here
    // if (!pageFound) {
    //     console.log("No matching link found for the current page.");
    // }
}


// When the DOM is fully loaded, load the sidenav component and then highlight the current page
document.addEventListener('DOMContentLoaded', async () => {
    // Load the sidenav
    // Ensure 'sidenav-container' matches the ID in your HTML
    await loadComponent('sidenav-container', 'sidenav.html'); 

    // Now that the sidenav is loaded, highlight the current page
    highlightCurrentNavLink('sidenav-container');

    // Example for Topnav (assuming it will also be loaded dynamically)
    // If your topnav has a similar structure and a unique ID (e.g., 'topnav-placeholder'),
    // you would load and highlight it here too:
    // await loadComponent('topnav-placeholder', 'components/topnav.html');
    // highlightCurrentNavLink('topnav-placeholder');
});