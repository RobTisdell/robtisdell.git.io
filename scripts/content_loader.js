// scripts/content_loader.js

document.addEventListener('DOMContentLoaded', function() {
    const mainContentDiv = document.getElementById('MainContent');
    const sidenavContainer = document.getElementById('sidenav-container');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const defaultPage = 'about.html';
    const sidenavPage = 'sidenav.html';

    // Function to highlight the active link in the sidenav
    function highlightActiveNavLink(currentPageFileName) {
        console.log(`[Highlighting] Attempting to highlight for page: ${currentPageFileName}`);

        // 1. Remove 'current' class from ALL links and their parent <li>s first
        const allSidenavLinks = sidenavContainer.querySelectorAll('a.nav-link');
        allSidenavLinks.forEach(link => {
            link.classList.remove('current');
            const parentLi = link.closest('li');
            if (parentLi) {
                parentLi.classList.remove('current');
            }
        });
        console.log("[Highlighting] Removed existing 'current' classes.");

        // 2. Find the SPECIFIC link in the sidenav that matches the current page file name
        const activePageLink = sidenavContainer.querySelector(`a.nav-link[data-target-page="${currentPageFileName}"]`);

        if (activePageLink) {
            console.log("[Highlighting] Found active page link:", activePageLink);

            activePageLink.classList.add('current');

            const immediateParentLi = activePageLink.closest('li');
            if (immediateParentLi) {
                immediateParentLi.classList.add('current');
                console.log("[Highlighting] Applied 'current' to immediate parent <li>:", immediateParentLi);

                const isSubMenuItem = immediateParentLi.parentElement && immediateParentLi.parentElement.classList.contains('dropright');

                if (isSubMenuItem) {
                    console.log("[Highlighting] Active link is a sub-menu item. Highlighting its top-level parent category.");

                    const topLevelParentLi = immediateParentLi.parentElement.closest('li');

                    if (topLevelParentLi) {
                        topLevelParentLi.classList.add('current');
                        console.log("[Highlighting] Applied 'current' to top-level parent <li>:", topLevelParentLi);

                        const topLevelParentLink = topLevelParentLi.querySelector('a.nav-link');
                        if (topLevelParentLink) {
                            topLevelParentLink.classList.add('current');
                            console.log("[Highlighting] Applied 'current' to top-level parent <a>:", topLevelParentLink);
                        }
                        // Ensure the dropright is open if its child is active
                        const parentDroprightUl = immediateParentLi.parentElement;
                        if (parentDroprightUl) {
                            parentDroprightUl.classList.add('open');
                            // Also ensure its own parent li is also considered 'current'
                            const grandparentLi = parentDroprightUl.closest('li');
                            if (grandparentLi) {
                                grandparentLi.classList.add('current');
                                const grandparentLink = grandparentLi.querySelector('a.nav-link');
                                if (grandparentLink) {
                                    grandparentLink.classList.add('current');
                                }
                            }
                        }
                    } else {
                        console.warn("[Highlighting] Could not find the top-level parent <li> for the sub-menu item.");
                    }
                } else {
                    console.log("[Highlighting] Active link is a top-level menu item.");

                    const topLevelLinkHasDropright = activePageLink.nextElementSibling && activePageLink.nextElementSibling.classList.contains('dropright');

                    if (topLevelLinkHasDropright) {
                        console.log("[Highlighting] Top-level link has a dropright. Checking for matching first child.");
                        const dropdownUl = activePageLink.nextElementSibling;
                        const firstDropdownChildLink = dropdownUl.querySelector('li:first-child > a.nav-link');

                        if (firstDropdownChildLink && firstDropdownChildLink.getAttribute('data-target-page') === currentPageFileName) {
                            console.log("[Highlighting] First child of dropright matches current page. Highlighting it too:", firstDropdownChildLink);
                            firstDropdownChildLink.classList.add('current');
                            const firstChildLi = firstDropdownChildLink.closest('li');
                            if (firstChildLi) {
                                firstChildLi.classList.add('current');
                            }
                            // Also ensure this dropright is open when its first child (which matches parent link) is active
                            dropdownUl.classList.add('open');
                        }
                    }
                }
            } else {
                console.warn("[Highlighting] Could not find immediate parent <li> for active link.");
            }
        } else {
            console.log(`[Highlighting] No nav link found with data-target-page="${currentPageFileName}". This might be expected for 'index.html' if it's purely a shell, or if a content page isn't represented in the navigation.`);
        }
    }

    // Function to load main content dynamically into #MainContent
    async function loadMainContent(pageName) {
        if (!mainContentDiv) {
            console.error("Error: Main content div with ID 'MainContent' not found.");
            return;
        }

        try {
            mainContentDiv.style.opacity = '0';
            mainContentDiv.style.transition = 'opacity 0.3s ease-out';
            await new Promise(resolve => setTimeout(resolve, 300));

            const response = await fetch(pageName);
            if (!response.ok) {
                throw new Error(`Failed to load ${pageName}: ${response.statusText}`);
            }
            const html = await response.text();

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const fetchedContent = tempDiv.querySelector('.content') || tempDiv;
            const contentToInject = fetchedContent.innerHTML;

            // Clear previous scripts
            mainContentDiv.querySelectorAll('script').forEach(script => script.remove());
            
            // Extract and prepare scripts from the fetched content before injection
            const scriptsToExecute = Array.from(tempDiv.querySelectorAll('script'));
            
            // Inject the main content. This injection should not include the script tags
            mainContentDiv.innerHTML = contentToInject;
            
            // Load and execute scripts in the correct order
            for (const script of scriptsToExecute) {
                const newScript = document.createElement('script');
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, script.getAttribute(attr.name));
                });
                if (script.textContent) {
                    newScript.textContent = script.textContent;
                }
                
                newScript.async = false;
                await new Promise((resolve, reject) => {
                    newScript.onload = () => {
                        console.log(`[Content Loader] Executed ${newScript.src || 'inline'} script.`);
                        resolve();
                    };
                    newScript.onerror = reject;
                    document.body.appendChild(newScript);
                });
            }

            mainContentDiv.style.opacity = '0';
            mainContentDiv.style.transition = 'opacity 0.5s ease-in';
            setTimeout(() => {
                mainContentDiv.style.opacity = '1';
            }, 50);

            console.log(`[Content Loader] Main content loaded: ${pageName}`);

            highlightActiveNavLink(pageName);

            if (sidenavContainer.classList.contains('open') && window.innerWidth <= 800) {
                sidenavContainer.classList.remove('open');
            }

        } catch (error) {
            console.error(`Error loading main content from ${pageName}:`, error);
            mainContentDiv.innerHTML = '<p>Error loading content. Please try again later.</p>';
            mainContentDiv.style.opacity = '1';
            mainContentDiv.style.transition = 'none';
        }
    }

    // Function to load the sidenav dynamically into #sidenav-container
    async function loadSidenav() {
        if (!sidenavContainer) {
            console.error("Error: Sidenav container div with ID 'sidenav-container' not found.");
            return;
        }

        try {
            const response = await fetch(sidenavPage);
            if (!response.ok) {
                throw new Error(`Failed to load ${sidenavPage}: ${response.statusText}`);
            }
            const html = await response.text();
            sidenavContainer.innerHTML = html;
            console.log(`[Content Loader] Sidenav loaded: ${sidenavPage}`);

            attachNavLinkListeners();

        } catch (error) {
            console.error(`Error loading sidenav from ${sidenavPage}:`, error);
            sidenavContainer.innerHTML = '<p>Error loading navigation.</p>';
        }
    }

    // Function to attach navigation link event listeners
    function attachNavLinkListeners() {
        const allSidenavLinks = sidenavContainer.querySelectorAll('a.nav-link');
        allSidenavLinks.forEach(link => {
            link.removeEventListener('click', handleNavLinkClick);
            link.addEventListener('click', handleNavLinkClick);
        });

        const mobileNavLinks = document.querySelectorAll('#MobileMenuList .nav-link');
        mobileNavLinks.forEach(link => {
            link.removeEventListener('click', handleNavLinkClick);
            link.addEventListener('click', handleNavLinkClick);
        });
        console.log("[Content Loader] Navigation link listeners attached.");
    }

    // Handle navigation link clicks
    async function handleNavLinkClick(event) {
        const link = event.currentTarget;
        const targetPage = link.getAttribute('data-target-page');
        const parentLi = link.closest('li');
        const droprightUl = parentLi ? parentLi.querySelector('.dropright') : null;

        if (droprightUl && !parentLi.parentElement.classList.contains('dropright') && window.innerWidth <= 800) {
            event.preventDefault();
            droprightUl.classList.toggle('open');
            console.log("[Navigation] Toggled dropright for:", link.textContent.trim());
        } else if (targetPage) {
            event.preventDefault();
            await loadMainContent(targetPage);
            history.pushState({ page: targetPage }, '', targetPage);
            console.log(`[Navigation] Navigated to: ${targetPage}`);
        } else {
            console.warn("Clicked nav link missing data-target-page attribute or unhandled scenario:", link);
        }
    }

    // Handle browser's back/forward button clicks
    window.addEventListener('popstate', function(event) {
        const pageToLoad = event.state && event.state.page ? event.state.page : defaultPage;
        console.log(`[History] Popstate detected. Loading: ${pageToLoad}`);
        loadMainContent(pageToLoad);
    });

    // --- NEW: Mobile Sidenav Toggle Event Listener ---
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidenavContainer.classList.toggle('open');
            console.log("[Mobile Sidenav] Toggled sidenav open/close.");
        });
    } else {
        console.warn("Mobile menu toggle button with ID 'mobile-menu-toggle' not found.");
    }

    // --- Initial Page Load Sequence ---
    async function initialPageLoad() {
        await loadSidenav();

        const path = window.location.pathname;
        const currentPageFromUrl = path.substring(path.lastIndexOf('/') + 1);

        const knownContentPages = [
            'index.html',
            'about.html',
            'current_titleholder.html',
            'previous_titleholders.html',
            'contest.html',
            'upcoming_events.html',
            'previous_events.html',
            'calendar.html',
            'staff.html',
            'formerstaff.html',
            'membership.html',
            'affiliates.html'
        ];

        let pageToLoad = defaultPage;

        if (currentPageFromUrl && currentPageFromUrl !== '' && currentPageFromUrl !== 'index.html') {
            if (knownContentPages.includes(currentPageFromUrl)) {
                pageToLoad = currentPageFromUrl;
                console.log(`[Initial Load] URL matches known content page: ${pageToLoad}`);
            } else {
                console.warn(`[Initial Load] URL contains an unknown content page: "${currentPageFromUrl}". Loading default page: ${defaultPage}`);
            }
        } else if (currentPageFromUrl === 'index.html' || currentPageFromUrl === '') {
            pageToLoad = defaultPage;
            console.log(`[Initial Load] URL is index.html or empty. Loading default page: ${defaultPage}`);
        }

        await loadMainContent(pageToLoad);

        if (window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1) !== pageToLoad) {
            history.replaceState({ page: pageToLoad }, '', pageToLoad);
            console.log(`[Initial Load] Replaced history state to: ${pageToLoad}`);
        }
    }

    initialPageLoad();
});