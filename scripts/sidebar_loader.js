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
		.then(r => r.text())
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
		if (typeof attachFadeListeners === "function") attachFadeListeners();
		return;
	}

	fetch("sidenav.html")
		.then(r => r.text())
		.then(html => {
			container.innerHTML = html;
			sessionStorage.setItem("cachedSidebar", html);
			highlightActivePage();
			if (typeof attachFadeListeners === "function") attachFadeListeners();
		})
		.catch(err => console.error("Sidebar failed to load:", err));
}

// ===============================
// Highlight active page (sidebar)
// ===============================
function highlightActivePage() {
	let current = window.location.pathname.split("/").pop().toLowerCase();
	current = current.split(/[?#]/)[0];

	document.querySelectorAll("#sidenav-container a").forEach(link => {
		let href = link.getAttribute("href");
		if (!href) return;

		href = href.split("/").pop().toLowerCase().split(/[?#]/)[0];

		if (href === current) {
			link.classList.add("current");

			const li = link.closest("li");
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
	const wrapper = document.querySelector(".topnav-wrapper");
	const menuButton = document.querySelector(".menu-button-box");
	const dropdownMenu = document.querySelector(".dropdown-menu");

	if (menuButton && dropdownMenu && wrapper) {
		menuButton.addEventListener("click", () => {
			dropdownMenu.classList.toggle("open");
			wrapper.classList.toggle("menu-open");
			document.body.classList.toggle("menu-open");
		});
	}

	// Submenu toggles (only one open at a time)
	document.querySelectorAll(".has-submenu > a").forEach(link => {
		link.addEventListener("click", e => {
			e.preventDefault();

			const parent = link.parentElement;
			const submenu = parent.querySelector(".dropdown");

			// Close all other submenus
			document.querySelectorAll(".dropdown.open").forEach(openMenu => {
				if (openMenu !== submenu) {
					openMenu.classList.remove("open");
					openMenu.parentElement.classList.remove("open");
				}
			});

			// Toggle this submenu
			submenu.classList.toggle("open");
			parent.classList.toggle("open");
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
