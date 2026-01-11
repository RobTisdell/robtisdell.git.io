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
    // Normalize current page
    let currentPage = window.location.pathname.split("/").pop().toLowerCase();
    currentPage = currentPage.split("?")[0].split("#")[0];

    const links = document.querySelectorAll("#sidenav-container a");

    links.forEach(link => {
        let href = link.getAttribute("href");
        if (!href) return;

        // Normalize link href
        href = href.split("/").pop().toLowerCase();
        href = href.split("?")[0].split("#")[0];

        if (href === currentPage) {
            // Highlight the link itself
            link.classList.add("current");

            // Highlight the LI containing this link
            let li = link.closest("li");
            if (li) {
                li.classList.add("current");
            }

            // If this LI is inside a dropright submenu,
            // also highlight the parent category LI
            const parentUl = li.parentElement.closest("ul");
            if (parentUl && parentUl.classList.contains("dropright")) {
                const parentLi = parentUl.closest("li");
                if (parentLi) {
                    parentLi.classList.add("current");
                }
            }
        }
    });
}