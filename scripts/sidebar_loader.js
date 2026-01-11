// sidebar_loader.js

// Load the sidebar, using sessionStorage cache if available
function loadSidebar() {
    const container = document.getElementById("sidenav-container");
    if (!container) return;

    // If cached, load instantly
    const cached = sessionStorage.getItem("cachedSidebar");
    if (cached) {
        container.innerHTML = cached;
        highlightActivePage();
        if (typeof attachFadeListeners === "function") {
            attachFadeListeners();
        }
        return;
    }

    // Otherwise fetch from server once
    fetch("sidenav.html")
        .then(response => response.text())
        .then(html => {
            container.innerHTML = html;

            // Cache it for the rest of the session
            sessionStorage.setItem("cachedSidebar", html);

            highlightActivePage();

            if (typeof attachFadeListeners === "function") {
                attachFadeListeners();
            }
        })
        .catch(err => console.error("Sidebar failed to load:", err));
}


// Highlight the active page based on the current URL
function highlightActivePage() {
    let currentPage = window.location.pathname.split("/").pop().toLowerCase();
    currentPage = currentPage.split("?")[0].split("#")[0];

    const links = document.querySelectorAll("#sidenav-container a");

    links.forEach(link => {
        let href = link.getAttribute("href");
        if (!href) return;

        href = href.split("/").pop().toLowerCase();
        href = href.split("?")[0].split("#")[0];

        if (href === currentPage) {
            // Highlight the link itself
            link.classList.add("current");

            // Highlight its LI
            let li = link.closest("li");
            if (li) {
                li.classList.add("current");
            }

            // If inside a dropright submenu, highlight parent category
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


// Run on page load
document.addEventListener("DOMContentLoaded", loadSidebar);
