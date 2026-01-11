// fade_nav.js

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("MainContent");

    // Fade in when the page loads
    container.classList.add("fade-in");

    // Attach fade-out behavior to all internal links
    document.querySelectorAll("a").forEach(link => {
        const href = link.getAttribute("href");

        // Skip anchors, JS links, external links, and blank targets
        if (!href || href.startsWith("#") || link.target === "_blank") return;

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
});
