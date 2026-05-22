function collapseexpandmenu() {
	var collapse = document.getElementById("MobileMenuList");
	var hidecontent = document.getElementById("Main_Content");
	if (collapse.style.display === "block") {
	collapse.style.display = "none";
	} 
		else {
			collapse.style.display = "block";
		}

	if (hidecontent.style.display === "none") {
		hidecontent.style.display = "block";
	}
		else {
			hidecontent.style.display = "none";
		}
}