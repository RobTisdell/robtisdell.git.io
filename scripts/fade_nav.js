// fade_nav.js

// This function attaches fade-out listeners to all internal links.
// It must be callable both on DOMContentLoaded and after the sidebar loads.
function attachFadeListeners() {
    const container = document.getElementById("MainContent");
    if (!container) return;

    document.querySelectorAll("a").forEach(link => {
        const href = link.getAttribute("href");

        // Skip anchors, JS links, external links, and blank targets
        if (!href || href.startsWith("#") || link.target === "_blank") return;

        // Avoid double-binding listeners
        if (link.dataset.fadeBound === "true") return;
        link.dataset.fadeBound = "true";

        link.addEventListener("click", event => {
            event.preventDefault();

            container.classList.remove("fade-in");
            container.classList.add("fade-out");

            // Wait for fade-out to finish, then navigate
            setTimeout(() => {
                window.location = href;
            }, 200); // match your CSS transition duration
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("MainContent");
    if (container) {
        container.classList.add("fade-in");
    }

    // Attach listeners to links already in the DOM
    attachFadeListeners();
});
