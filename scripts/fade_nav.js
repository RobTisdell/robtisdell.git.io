// fade_nav.js

// Attach fade-out listeners to all internal links.
// Called on DOMContentLoaded and again after sidebar loads.
function attachFadeListeners() {
    const container = document.getElementById("MainContent");
    if (!container) return;

    document.querySelectorAll("a").forEach(link => {
        const href = link.getAttribute("href");

        // Skip anchors, JS links, external links, and blank targets
        if (!href || href.startsWith("#") || link.target === "_blank") return;

        // Prevent double-binding
        if (link.dataset.fadeBound === "true") return;
        link.dataset.fadeBound = "true";

        link.addEventListener("click", event => {
            event.preventDefault();

            container.classList.remove("fade-in");
            container.classList.add("fade-out");

            setTimeout(() => {
                window.location = href;
            }, 200); // match your CSS transition duration
        });
    });
}


// Fade-in on initial load
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("MainContent");
    if (container) {
        // Small delay ensures CSS is parsed before transition
        setTimeout(() => {
            container.classList.add("fade-in");
        }, 10);
    }

    attachFadeListeners();
});


// ⭐ Fix for browser Back/Forward Cache (bfcache)
// Ensures the page becomes visible again when restored from cache.
window.addEventListener("pageshow", event => {
    const container = document.getElementById("MainContent");
    if (!container) return;

    if (event.persisted) {
        // Page was restored from cache — reset fade state
        container.classList.remove("fade-out");
        container.classList.add("fade-in");
    }
});
