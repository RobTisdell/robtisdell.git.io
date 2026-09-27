(function() {

	// These are variables that need to get called within multiple nested functions down the line.  The parts that use these variables describe exactly how they're used, they just need to be declared up here so they can be applied properly, as they will contain data needed throughout the function.

	const categoryLookup = {}
	let setOfCategories = new Set([])

	// This will stop the normal behavior of anchor links.

	async function displayAffiliates() {
		const outputContainer = document.getElementById("affiliates")
		const outputHeader = document.getElementById("header_links")

		// Pass an error if the main HTML document doesn't have a former-staff-container element.
		if (!outputContainer) {
			console.error("Error, there is no element with affiliates-container in the HTML file.")
			return
		}

		if (!outputHeader) {
			console.error("Error, there is no element with header_links in the HTML file.")
			return
		}

		// Helper function for creating hashtags out of category information.
		function createHashTag(category){
			const hashTag = category.replace(/[^A-Za-z0-9_]/g, '')
			return hashTag
		}

		// Helper function for stripping links of active status and adding active status for the currently active link.
		function setActiveLink(hash) {
			document.querySelectorAll("#header_links a").forEach(link => {link.classList.remove("Active")
				if (link.getAttribute("href") === `#${hash}`) {
					link.classList.add("Active")
				}
			})
		}

		// I hesitate to call this a helper function, because this is really kind of the end-goal.  But this is what's going to generate the links based on hashtag values.
		function renderCategory(hash) {

   			const selectedCategory = categoryLookup[hash]
				if (!selectedCategory) {
				return
    		}

			outputContainer.innerHTML = ""

			selectedCategory.forEach(affiliate => {
				outputContainer.innerHTML += `
				<a href="${affiliate.URL}" target="_blank">
					<div class="affiliate-container">
						<div class="affiliate-picture"><img src="img/affiliates/${affiliate.Logo}"></div>
						<div class="affiliate-title">${affiliate.Name}</div>
					</div>
				</a>
        	`
		})
}

		// Attempt to get the JSON file with the affiliate data.
		try {
			const response = await fetch('scripts/affiliates.json')
			
			// Pass an error if there is a server error in retrieving the JSON file.
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			
			const affiliateData = await response.json()

			// Pass an error if the JSON file is malformed to both the console and the webpage.
			if (!Array.isArray(affiliateData)) {
				console.error("Error: JSON data is not a valid array for affiliate data.")
				outputContainer.innerHTML = '<p>Error: Affiliate data is malformed.</p>'
				return
			}

			// This part of the function creates a set (A set is defined as only having unique values) of categories and hashtags from the Category data of affiliates.json.  The Category set will be used to generate the list of category links at the top of the affiliates page, the hashtag set will be used as variables for switch cases later.

			affiliateData.forEach(affiliate => {
				setOfCategories.add(affiliate.Category)
			})

			// Sets can not be sorted naturally in Javascript, so I gotta convert them to an array temporarily, sort the array, then re-cast it as a set.  I'll do this for each, though honestly sorting the cases may be completely unnecessary.  I'll kill it if it is..
			// It is important to note that, at this point, I'm not planning on modifying the sets and they're not relevant anymore (They were made to filter unique data).  I can use these arrays without worrying about the sets anymore, *but only if* they're never being modified.  If they are expected to be, this needs to be reconsidered, since it's important that the links we generate from these all be unique.

			const sortedCategories = Array.from(setOfCategories)
			sortedCategories.sort((a, b) => {
				return a.localeCompare(b)
			})

			// Now we can start generating some links.  This outputs the header links with hashtags converted by the same function that made the variable set.

			sortedCategories.forEach(category => {
				outputHeader.innerHTML += `<a href=#${createHashTag(category)}>${category}</a>`
			})

			// Now that we have header links, we can move onto dealing with the real meat and potatoes here.

			// Pre-sort the entire array, this should propagate into categories later.
			affiliateData.sort((a, b) => {
				return a.Name.localeCompare(b.Name)
			})

			// Now we start moving onto where the real important stuff lies.  The first thing that will be done is to set up a filter that will functionally sort the links by their categories

			sortedCategories.forEach(category => {
				categoryLookup[createHashTag(category)] =
					affiliateData.filter(affiliate => affiliate.Category === category)
			})


			// These next two code sections handle the loading of links. There are two situations to consider here, and this first one is when a link without an anchoring hash is provided (affiliates.html rather than affiliates.html#ClubsandCommunity for example).  This *could* be solved by just including a hash, but I'd prefer to just have a clean link setup.  It just looks nicer.
			let currentHash = window.location.hash.substring(1)

				// If no hash exists, use the first category.
			if (!currentHash) {
    			currentHash = createHashTag(sortedCategories[0])
    			window.location.hash = currentHash
			}

				renderCategory(currentHash)
				setActiveLink(currentHash)
			
			// This is the other case, where when an anchor hash is present and/or changes (Which is what's happening when a user clicks a header link). This will run the rendering and active link functions again when this happens.
			window.addEventListener("hashchange", () => {

			const hash = window.location.hash.substring(1)
    		renderCategory(hash)
   			setActiveLink(hash)
		})
	

		} catch (error) {
			// Handle any other miscellaneous errors that could arise.
			console.error("Failed to load or display affiliate data:", error)
			outputContainer.innerHTML = '<p>Error loading affiliate information. Please try again later.</p>'
		}
	}

	displayAffiliates()

})()
