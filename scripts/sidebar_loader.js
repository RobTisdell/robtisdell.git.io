// ===============================
// Load TOPNAV (mobile header)
// ===============================
function loadTopnav() {
    const container = document.getElementById("topnav-container");
    if (!container) return;

    const cached = sessionStorage.getItem("cachedTopnav");
    if (cached) {
        container.innerHTML = cached;
        attachMobileMenuListeners();
        return;
    }

    fetch("topnav.html")
        .then(response => response.text())
        .then(html => {
            container.innerHTML = html;
            sessionStorage.setItem("cachedTopnav", html);
            attachMobileMenuListeners();
        })
        .catch(err => console.error("Topnav failed to load:", err));
}

// ===============================
// Load SIDENAV (desktop sidebar)
// ===============================
function loadSidebar() {
    const container = document.getElementById("sidenav-container");
    if (!container) return;

    const cached = sessionStorage.getItem("cachedSidebar");
    if (cached) {
        container.innerHTML = cached;
        highlightActivePage();
        if (typeof attachFadeListeners === "function") {
            attachFadeListeners();
        }
        return;
    }

    fetch("sidenav.html")
        .then(response => response.text())
        .then(html => {
            container.innerHTML = html;
            sessionStorage.setItem("cachedSidebar", html);

            highlightActivePage();
            if (typeof attachFadeListeners === "function") {
                attachFadeListeners();
            }
        })
        .catch(err => console.error("Sidebar failed to load:", err));
}

// ===============================
// Highlight active page (sidebar)
// ===============================
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
            link.classList.add("current");

            let li = link.closest("li");
            if (li) li.classList.add("current");

            const parentUl = li?.parentElement.closest("ul");
            if (parentUl && parentUl.classList.contains("dropright")) {
                const parentLi = parentUl.closest("li");
                if (parentLi) parentLi.classList.add("current");
            }
        }
    });
}

// ===============================
// MOBILE MENU LOGIC (topnav)
// ===============================
function attachMobileMenuListeners() {
    const menuButton = document.querySelector(".dropdown-button");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    if (menuButton && dropdownMenu) {
        menuButton.addEventListener("click", () => {
            dropdownMenu.classList.toggle("open");
        });
    }

    document.querySelectorAll(".has-submenu > a").forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const submenu = this.nextElementSibling;
            submenu.classList.toggle("open");
        });
    });
}


// ===============================
// Run on page load
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    loadTopnav();
    loadSidebar();
});
