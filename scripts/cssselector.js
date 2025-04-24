function selectCSS {
    if ( document.documentElement.clientWidth > 900 ) {
		ocument.getElementsByTagName("head")[0].insertAdjacentHTML( "beforeend", "<link rel='stylesheet' href='desktop_style.css' />");
	}
	else {
        document.getElementsByTagName("head")[0].insertAdjacentHTML( "beforeend", "<link rel='stylesheet' href='mobile_style.css />");
    }
}