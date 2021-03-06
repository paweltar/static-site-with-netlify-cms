/* requires:
vendor/jquery-3.2.0.js
vendor/scrolloverflow.js
vendor/jquery.fullpage.js
*/

$(document).ready(function() {
	$("#fullpage").fullpage({
		paddingTop: "100px",
		menu: "#menu",
		anchors: ["home", "portfolio", "contact"],
		scrollOverflow: true,
		touchSensitivity: 15,
		fitToSection: false,
		paddingTop: '100px',
		paddingBottom: '10px',
		responsiveWidth: '900px'
		// autoScrolling: false
	});
});
