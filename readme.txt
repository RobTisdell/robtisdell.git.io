Hello!

If you're reading this, it is likely because I (Rob) am no longer actively maintaining the FLAG website and you're looking to make modifications.

This is going to be a readme to hopefully explain how to update what I call normal content (New titleholders, changes in staff, adding events, etc).  Since I am an ameteur (at best) web developer, I had to do this using what technical skills I had available to me - that is, limited knowledge of Javascript.  This means updates will unfortunately have to be made by directly manipulating files and images, rather than a fancy database interface that I just do not have the expertise to code.

This readme assumes a few things.  One, that you know how to navigate files and have some basic computer literacy (This is not a shot at anyone, but I can't write a how-to for someone who just doesn't get computers).  Two, that you understand how to use an FTP client in order to make updates to a website.  I'm only explaining how to update the files that the site operates on.  Three, that you already have some basic knowledge of HTML.  Four, that you at least understand conceptually what a script is and why you should not edit one without an idea of how it works.  So long as the .js files in the scripts folder aren't touched, they should handle any updates you make and keep normal content flow.  You should *not* need to modify the .js files *unless* the instructions in this readme explicitly say to, and that should not be common for you to need to deal with.  I am NOT asuming you have familiarity with Javascript or JSON.  The point of this is to explain how to update the site for a fairly competent user.

This readme is quite verbose, and that's so that you can understand exactly what you're looking at.  I promise that the actual steps to updating the site data are actually quite simple. But knowing the logic of how things are arranged will help with any troubleshooting that might be needed.  You'll spend more time reading the document than actually doing a single update once you understand it.

Table of Contents:

1) JSON Files
2) Updating Titleholders
3) Updating Staff
4) Updating events
5) Updating affiliates
6) Updating other pages
7) Updating social media links
8) Adding new pages






*********************************************************************
***************************** Section 1 *****************************
**************************** JSON Files *****************************
*********************************************************************

The FLAG site basically has 2 types of pages.  Static web pages that are assumed to rarely, if ever, need an update.  If you look in the HTML page for those (Such as the Home page or the About Us pages), the site only loads a navigation and fade handling script.  These pages can be updated directly in the .html files with basic knowledge of HTML.  For other pages, more complex scripts are loaded.  In those pages, content is assumed to be dynamic and requiring regular updates (The titleholder changes once a year, staff members come and go, events get rescheduled, etc).  For those pages, data is processed via Javascript and corresponding JSON files to make it so content doesn't have to be updated in raw HTML (That would be a nightmare to routinely update and create lots of bloated pages).  The vast majority of your content updates will be done by modifying JSON files.  I will explain the basic structure of each one in their update sections so you have an idea of what you need to do.

While some of the ways I have things structured are design decisions by me, others absolutely are not.  Not knowing how a JSON is structured could cause you to accidentally break the file.  I will re-emphasize this in later sections where it becomes particularly relevant, but you should familiarize yourself with the structure of a JSON.  If you've made an update and something seems to not be working, JSON validators are available online to see if you've made a mistake in the JSON structure. Machine learning chatbots (ChatGPT, etc) all can tell you if there is a structural problem with a JSON as well, but if you're using a chatbot, be very careful on what you ask it to evaluate.  They can and will rewrite code based on some internal logic to them that doesn't apply to the setup.






*********************************************************************
***************************** Section 2 *****************************
*********************** Updating Titleholders ***********************
*********************************************************************


The text data for titleholders is all stored in titleholders.json in the scripts folder.  You can open the JSON file using any text editor you like (Notepad++ is what I use when not using a dedicated workspace for coding).  The way the data for the titleholders is structured looks like this:

{
	"ID": "titled_22",
	"Prefix": "Mx.",
	"Name": "Indulgence Period",
	"Active": true,
	"Year": "2026",
	"Image": "MxFLAG2026-Indulgence_Period.jpg",
	"Description": "The image here is bigger than the staff page because, presumably, we'd have only one active titlteholder at a time. I assume if we wanted past titleholders, we'd have a historical section where I'd make the list more in-line with the Staff section.  But we could also merge the previous and current titleholders into one page, with the current titleholder being on top if we wanted to."
},
	
I will repeat the information in each section in case anyone decides to jump to update something specific and would otherwise miss this explanation, so bear with me if you've already read this bit.  Data in the JSON files are always in the form of "Property": "Value".  Properties are case sensitive and should always be pasted exactly as shown in the example.  The scripts use all of these properties in some form or another.  The values are a bit different.  Some values have to follow certain rules (which will be explained further down), while others can more-or-less be freely modified.  The template provided must be used exactly (That is, each titleholder entry needs to be between the curly braces, a comma must appear after each value, and a comma must appear after the end curly brace, and quotation marks are used similarly to how they are displayed in the example.  Values without quotation marks in the example deliberately do not have them.).  If you update the JSON file and it does not seem to work properly, chances are that the format was not followed properly and you should look it over again.

If you are looking to add a new titleholder, simply copy and paste the template provided above at the top of the titlehonders.json file (But below the square brace in that file) and modify it as desired.  To properly update that information, I will explain each line:



	"ID": "titled_22",

ID is a unique property for each titleholder.  If you are trying to add a new titleholder, the new titleholder should have their own unique ID value following it.  I have simply been updating using titled_XX where XX is just adding 1 to the previous ID to the previous entry in the JSON file.



	"Prefix": "Mx.",
	
Prefix is just the preferred title prefix for the titleholder.  You can make this whatever you want in the JSON file and it will reflect properly on the website.



	"Name": "Indulgence Period",

Name is just the name of the titleholder.  Like the prefix, this can be freely edited in the JSON file and it will reflect properly on the website.



	"Active": true,
	
Active is the status of the different titleholders.  There should only ever be one active titleholder at a time.  The scripts dealing with titleholders assume this.  If you're adding a new titleholder, the new titleholder should have the true value applied to the Active property, and the previous titleholder should have the value set to false.  Note that there are no quotation marks around true and this is deliberate.  The same applies to false.  These are also case sensitive, so be aware to only use true & false as the values here, not True or False.



	"Year": "2026",
	
Year is the titleholder's active year.  This will reflect properly on the website and the website will auto-sort in descending order based on the active year of the titleholder.

While this has only ever happened once (As of this writing), if it becomes necessary for this to happen again, you can add multiple years to a titleholder, so long as those years are sequential.  You can use "2019 and 2020", or "2026 through 2029", or whatever.  The scripts only care about the first four numbers and will treat the rest as skipped years.  So long as you begin with four numbers, how you fill out the rest is not important.  The script will sort numerically in descending order for the first 4 digits.



	"Image": "MxFLAG2026-Indulgence_Period.jpg",
	
Image is what's used to display the titleholder pictures.  The scripts look for the value text (In the example case here, MxFLAG2026-Indulgence_Period.jpg) in two folders.  First, it looks for a low-res file in the img/titleholders/Thumbnails folder for the listing on the site, and then it looks for the full size picture to use when you click on the titleholder's picture on the website in img/titleholders/FullSize.  It is not strictly necessary to follow the naming standard I've been using for the images (Prefix-FLAG-Year-name.jpg), and you can use any naming standard you want.  What's important is that you upload a low-res picture into the Thumbnails folder, a hi-res picture in the FullSize folder, that they have the EXACT same filename in each folder (including the upper and lower case details), and that the same filename is included in the JSON file.  This is the only part in updating titleholder information that you are required to do something besides updating the JSON file.



	"Description": "The image here is bigger than the staff page because, presumably, we'd have only one active titlteholder at a time. I assume if we wanted past titleholders, we'd have a historical section where I'd make the list more in-line with the Staff section.  But we could also merge the previous and current titleholders into one page, with the current titleholder being on top if we wanted to."

Description is the plain text put on the page under the titleholder nam.  The description can be whatever you want, and it can absolutely handle HTML tags in order to stylize or provide links a titleholder may want as part of their description.

And that's all there is to updating a titleholder.  It's a lot of explanation here, but the steps are really simple and once you've done it once, you'll see how simple it really is and be able to quickly update the information again.






*********************************************************************
***************************** Section 3 *****************************
************************** Updating Staff ***************************
*********************************************************************

In the exact same way as the data for titleholders is stored, the text data for staff members (Both former and current) is all stored in staff.json in the scripts folder.  You can open the JSON file using any text editor you like (Notepad++ is what I use when not using a dedicated workspace for coding).  The way the data for the titleholders is structured looks like this:


{
	"ID": "staff_6",
	"Name": "Leather Daddy 7",
	"IsActive": false,
	"CurrentPosition": null,
	"YearStarted": null,
	"PastPositions": [
		{
			"Title": "President",
			"Years": ["2010-2012", "2014-2016"]
		},
		{
			"Title": "Party Entertainment",
			"Years": ["2012-2014"]
		}
	],
	"Image": "dude7.jpg",
	"Description": "Takes what he wants and makes it look good."
},

I will repeat this information in each section in case anyone decides to jump to update something specific and would otherwise miss this explanation, so bear with me if you've already read this bit.  Data in the JSON files are always in the form of "Property": "Value".  Properties are case sensitive and should always be pasted exactly as shown in the example.  The scripts use all of these properties in some form or another.  The values are a bit different.  Some values have to follow certain rules (which will be explained further down), while others can more-or-less be freely modified.  The template provided must be used exactly (That is, each titleholder entry needs to be between the curly braces, a comma must appear after each value, and a comma must appear after the end curly brace, and quotation marks are used similarly to how they are displayed in the example.  Values without quotation marks in the example deliberately do not have them.).  If you update the JSON file and it does not seem to work properly, chances are that the format was not followed properly and you should look it over again.

If you are looking to add staff members, simply copy and paste the template provided above at the top of the titlehonders.json file (But below the square brace in that file) and modify it as desired.  To modify existing staff members, you can just modify their existing data, so long as you follow the scheme set up in the above example.  To properly update that information, I will explain each line:



	"ID": "staff_6",

ID is a unique property for each staff member.  If you are trying to add a new staff member, the new staff member should have their own unique ID value following it.  I have simply been updating using staff_XX where XX is just adding 1 to the previous ID in the JSON file.



	"Name": "Leather Daddy 7",

Name is just the name of the staff member.  This can be freely edited in the JSON file and it will reflect properly on the website.



	"IsActive": false,
	
IsActive flags the staff member as either active or not.  false means the staff member is not currently active, true means that the staff member is active.  Note that there are no quotation marks around true and this is deliberate.  The same applies to false.  These are also case sensitive, so be aware to only use true & false as the values here, not True or False.



	"CurrentPosition": null,

CurrentPosition notes what the current position of the staff member is.  *IT IS VERY IMPORTANT TO NOTE THAT THE TEXT HERE IS ALSO IMPORTANT TO THE .JS SCRIPT FILES*.  The scripts sort based on clearly defined titles, and currently accept the following values:

	"President"
	"Vice President"
	"Party Entertainment"

If you use any other text, the scripts *will* break.  If you are simply giving a person an existing title, then that's fine and you can just use one of these.  However, if you want to give people new titles, you will have to modify the two scripts: active_staff.js & retired_staff.js.

This is a simple process.  Just look for this section of the code in both active_staff.js and retired_staff.js:

			const positionOrder = {
				"President": 1,
				"Vice President": 2,
				"Party Entertainment": 3
				// Add other positions here as needed, giving them a numerical order.
			};
			
You can add new positions as you see fit.  You will just need to update the order things appear in, as this section of code also functions to sort the active staff list.  So if you wanted a new position that goes above the Vice President in order, for example, you would add "New Position" : 2, below the president, and then update Vice President's number to 3, Party Entertainment's number to 4, and so on.



	"YearStarted": null,

YearStarted simply marks the year that the person holding their *current* position started.  In this example, since the current staff member is not an active member, the value is null.  However, if the staff member was active, this would be written in a 4-digit year format with no quotations (IE "YearStarted": 2025).  When switching an active staff member to a retired one, change this value to null and update the past position information (Covered in a below) with that instead, and vice-versa if a former staff member comes out of retirement for a new position.



	"PastPositions": [
		{
			"Title": "President",
			"Years": ["2010-2012", "2014-2016"]
		},
		{
			"Title": "Party Entertainment",
			"Years": ["2012-2014"]
		}
	],
	
This one is a little more convoluted looking, but it's really not all that different than what you've seen before.  PastPositions is a list of previous positions held, and what year those positions were held in.  It is important to note that, like the other Title section, the script absolutely cares about the exact spelling and capitalization of the titles.  The script assumes that you list years in ascending numerical order.  If you were to, say, write ""Years": ["2014-2016", "2010-2012"]", the script would only parse 2012 for sorting issues and, while it would *appear* to work, you'd have inconsistent sorting on the page.  The reason for the rest of the data is simply for historical displaying purposes on the Staff pages.  Incidentally, since the sorter only cares about the last characters of the last entry of the Years lists, if you prefer "2014 through 2016" to be displayed instead of a dash, you can change that too.

Note carefully the structure in square brackets.  The "Title" value ends with a comma, the "Years" value does not, the first closing curly brace ends with a comma, the second one does not.  This is how JSON files are structured and it is important that you follow this standard (And I recommend Googling a bit on JSON structures if you're wondering why), but basically every entry that is followed by another entry needs a comma, and the very last entry in a group needs to not have a comma.  To reiterate, this is not a developmental decision I made, this is a fundamental structure of JSON and the *entire* document will be considered invalid if you do not follow this standard.



	"Image": "dude7.jpg",
	
Image is what's used to display the staff pictures.  If you've already read the Image description for titleholders, this works in the exact same way.  The scripts look for the value text (In the example case here, dude7.jpg) in two folders.  First, it looks for a low-res file in the img/staff/Thumbnails folder for the listing on the site, and then it looks for the full size picture to use when you click on the titleholder's picture on the website in img/staff/FullSize.  It is not strictly necessary to follow the naming standard I've been using for the images, and you can use any naming standard you want.  What's important is that you upload a low-res picture into the Thumbnails folder, a hi-res picture in the FullSize folder, that they have the EXACT same filename in each folder (including the upper and lower case details), and that the same filename is included in the JSON file.  This is the only part in updating staff information that you are required to do something besides updating the JSON file, and you will only need to do it when adding a new staff member, not editing an existing one.



	"Description": "Takes what he wants and makes it look good."

Description is the plain text put on the page under the staff name.  The description can be whatever you want, and it can absolutely handle HTML tags in order to stylize or provide links a titleholder may want as part of their description.






*********************************************************************
***************************** Section 4 *****************************
************************** Updating Events **************************
*********************************************************************