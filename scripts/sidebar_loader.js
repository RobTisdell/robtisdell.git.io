// sidebar_loader.js

// Load the shared sidebar HTML into the sidenav container
fetch("sidenav.html")
    .then(response => response.text())
    .then(html => {
        document.getElementById("sidenav-container").innerHTML = html;

        highlightActivePage();

        // Re-attach fade listeners now that new links exist
        if (typeof attachFadeListeners === "function") {
            attachFadeListeners();
        }
    })
    .catch(err => console.error("Sidebar failed to load:", err));


// Highlight the active page based on the current URL
function highlightActivePage() {
    const currentPage = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll("#sidenav-container a");

    links.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPage) {
            link.classList.add("current");
        }
    });
}
