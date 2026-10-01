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
	
I will repeat the information in each section in case anyone decides to jump to update something specific and would otherwise miss this explanation, so bear with me if you've already read this bit.  Data in the JSON files are always in the form of "Property": "Value".  Properties are case sensitive and should always be pasted exactly as shown in the example.  The scripts use all of these properties in some form or another.  The values, however, behave a bit differently.  Some values have to follow certain rules (which will be explained further down), while others can more-or-less be freely modified.  The template provided must be used exactly (That is, each titleholder entry needs to be between the curly braces, a comma must appear after each value, and a comma must appear after the end curly brace, and quotation marks are used similarly to how they are displayed in the example.  Values without quotation marks in the example deliberately do not have them.).  If you update the JSON file and it does not seem to work properly, chances are that the format was not followed properly and you should look it over again.

If you are looking to add a new titleholder, simply copy and paste the template provided above at the top of the titlehonders.json file (But below the square brace in that file) and modify it as desired.  To properly update that information, I will explain each line:



	"ID": "titled_22",

ID is a unique property for each titleholder.  If you are trying to add a new titleholder, the new titleholder should have their own unique ID value following it.  I have simply been updating using titled_XX where XX is just adding 1 to the previous ID to the previous entry in the JSON file.  But this can be anything arbitrary.  Just make sure it's unique to each entry.



	"Prefix": "Mx.",
	
Prefix is just the preferred title prefix for the titleholder.  You can make this whatever you want in the JSON file and it will reflect properly on the website.



	"Name": "Indulgence Period",

Name is just the name of the titleholder.  Like the prefix, this can be freely edited in the JSON file and it will reflect properly on the website.



	"Active": true,
	
Active is the status of the different titleholders.  There should only ever be one active titleholder at a time.  The scripts dealing with titleholders assume this.  If you're adding a new titleholder, the new titleholder should have the true value applied to the Active property, and the previous titleholder should have the value set to false.  Note that there are no quotation marks around true and this is deliberate.  The same applies to false.  These are also case sensitive, so be aware to only use true & false as the values here, not True or False.  It's important to note that true and false are the only acceptable values here, anything else will cause issues.



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

In the exact same way as the data for titleholders is stored, the text data for staff members (Both former and current) is all stored in staff.json in the scripts folder.  You can open the JSON file using any text editor you like (Notepad++ is what I use when not using a dedicated workspace for coding).  The way the data for the staff is structured looks like this:


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

If you are looking to add staff members, simply copy and paste the template provided above at the top of the staff.json file (But below the square brace in that file) and modify it as desired.  To modify existing staff members, you can just modify their existing data, so long as you follow the scheme set up in the above example.  To properly update that information, I will explain each line:



	"ID": "staff_6",

ID is a unique property for each staff member.  If you are trying to add a new staff member, the new staff member should have their own unique ID value following it.  I have simply been updating using staff_XX where XX is just adding 1 to the previous ID in the JSON file.  But this can be anything arbitrary.  Just make sure it's unique to each entry.



	"Name": "Leather Daddy 7",

Name is just the name of the staff member.  This can be freely edited in the JSON file and it will reflect properly on the website.



	"IsActive": false,
	
IsActive flags the staff member as either active or not.  false means the staff member is not currently active, true means that the staff member is active.  Note that there are no quotation marks around true and this is deliberate.  The same applies to false.  These are also case sensitive, so be aware to only use true & false as the values here, not True or False.  It's important to note that true and false are the only acceptable values here, anything else will cause issues.



	"CurrentPosition": null,

CurrentPosition notes what the current position of the staff member is.  *IT IS VERY IMPORTANT TO NOTE THAT THE TEXT HERE IS ALSO RELEVANT TO THE .JS SCRIPT FILES*.  The scripts sort based on clearly defined titles, and currently accept the following values:

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
	
This one is a little more convoluted looking, but it's really not all that different than what you've seen before.  PastPositions is a list of previous positions held, and what year those positions were held in.  It is important to note that, like the other Title section, the script absolutely cares about the exact spelling and capitalization of the titles.  The script assumes that you list years in ascending numerical order.  If you were to, say, write ""Years": ["2014-2016", "2010-2012"]", the script would only parse 2012 for sorting issues and, while it would *appear* to work, you'd have inconsistent sorting on the page.  The reason for the rest of the data is simply for historical displaying purposes on the Staff pages.  Incidentally, since the sorting function only cares about the last characters of the last entry of the Years lists, if you prefer "2014 through 2016" to be displayed instead of a dash, you can write it that way too.

Note carefully the structure in square brackets.  The "Title" value ends with a comma, the "Years" value does not, the first closing curly brace ends with a comma, the second one does not.  This is how JSON files are structured and it is important that you follow this standard (And I recommend Googling a bit on JSON structures if you're wondering why), but basically every entry that is followed by another entry needs a comma, and the very last entry in a group needs to not have a comma.  To reiterate, this is not a developmental decision I made, this is a fundamental structure of JSON and the *entire* document will be considered invalid if you do not follow this standard.



	"Image": "dude7.jpg",
	
Image is what's used to display the staff pictures.  If you've already read the Image description for titleholders, this works in the exact same way.  The scripts look for the value text (In the example case here, dude7.jpg) in two folders.  First, it looks for a low-res file in the img/staff/Thumbnails folder for the listing on the site, and then it looks for the full size picture to use when you click on the titleholder's picture on the website in img/staff/FullSize.  It is not strictly necessary to follow the naming standard I've been using for the images, and you can use any naming standard you want.  What's important is that you upload a low-res picture into the Thumbnails folder, a hi-res picture in the FullSize folder, that they have the EXACT same filename in each folder (including the upper and lower case details), and that the same filename is included in the JSON file.  This is the only part in updating staff information that you are required to do something besides updating the JSON file, and you will only need to do it when adding a new staff member, not editing an existing one.



	"Description": "Takes what he wants and makes it look good."

Description is the plain text put on the page under the staff name.  The description can be whatever you want, and it can absolutely handle HTML tags in order to stylize or provide links a titleholder may want as part of their description.






*********************************************************************
***************************** Section 4 *****************************
************************** Updating Events **************************
*********************************************************************

Fair warning that this is probably the most complicated thing you will have to update.  The events JSON deals with both information for display on the Event page *and* information for the Calendar page.  As of this writing, the text data for events are all stored in events.json in the scripts folder.  If and when we start getting other communities involved, I will change this so that each group we associate with has their own events file (Having a bunch of events in one file would get overwhelming very quickly).  When that happens I will update this to reflect that.  But until then, you can open the events.json file using any text editor you like (Notepad++ is what I use when not using a dedicated workspace for coding).  Events are handled by the site in a few different ways.  I'm going to go through the *most* complicated one, as it contains all information that the simpler ones do.  I will highlight in the explanations what the differences are  Fair warning, it's going to look intimidating.  I promise it's not that bad though.

{
	"ID": "Event_3",
	"Name": "FLAG Anniversary Weekend",
	"Type": "Anniversary Weekend",
	"Image": "red_event.jpg",
	"Flyer": "demo_flyer_3.jpg",
	"Description": "Test event!",
	"Host": "FLAG",
	"HostURL": "",
	"Days": 3,
	"StartDate": "2026-10-11",
	"EndDate": "2026-10-13",
	"Part": [
		{
			"PartID": "Event_3_Part_1",
			"Day": 1,
			"StartTime": "21:00",
			"EndTime": "02:00",
			"EventName": "Bar Night",
			"Location": {
				"Place": "Providence Eagle",
				"URL": "http://providenceeagle.com/Providence_Eagle/index.html",
				"Address": "124 Snow St, Providence, RI"
				},
			"Description": "Enjoy the party at the bar!"
		},

		{
			"PartID": "Event_3_Part_2",
			"Day": 2,
			"StartTime": "12:00",
			"EndTime": "15:00",
			"EventName": "Board Game Gathering",
			"Location": {
				"Place": "Mariott Hotel",
				"URL": "http://mariott.com",
				"Address": "456 Not Real Road, Nowhere, AK"
			},
		"Description": "Board game event!"
		},

		{
			"PartID": "Event_3_Part_3",
			"Day": 2,
			"StartTime": "17:00",
			"EndTime": "21:00",
			"EventName": "Meet and Greet",
			"Location": {
				"Place": "Eagle's Nest",
				"URL": "https://www.facebook.com/Providencehealthclub/",
				"Address": "257 Weybosset St, Providence, RI"
			},
			"Description": "Enjoy the party at the bar!"
		},

		{
			"PartID": "Event_3_Part_4",
			"Day": 2,
			"StartTime": "22:00",
			"EndTime": "02:00",
			"EventName": "Mr. FLAG Contest",
			"Location": {
				"Place": "Providence Eagle",
				"URL": "http://providenceeagle.com/Providence_Eagle/index.html",
				"Address": "124 Snow St, Providence, RI"
			},
			"Description": "Official FLAG contest!"
		},

		{
			"PartID": "Event_3_Part_5",
			"Day": 3,
			"StartTime": "12:00",
			"EndTime": "18:00",
			"EventName": "FLAG Annual Cookout",
			"Location": {
				"Place": "Private",
				"URL": "None",
				"Address" : "None"
				},
			"Description": "FLAG Annual cookout!"
		}
	],
	"Timezone": "America/New_York"
},

I will repeat this information in each section in case anyone decides to jump to update something specific and would otherwise miss this explanation, so bear with me if you've already read this bit.  Data in the JSON files are always in the form of "Property": "Value".  Properties are case sensitive and should always be pasted exactly as shown in the example.  The scripts use all of these properties in some form or another.  The values are a bit different.  Some values have to follow certain rules (which will be explained further down), while others can more-or-less be freely modified.  The template provided must be used exactly (That is, each event entry needs to be between the curly braces, a comma must appear after each value, and a comma must appear after the end curly brace, and quotation marks are used similarly to how they are displayed in the example.  Values without quotation marks in the example deliberately do not have them.).  If you update the JSON file and it does not seem to work properly, chances are that the format was not followed properly and you should look it over again.

If you are looking to add staff members, simply copy and paste the template provided above at the top of the staff.json file (But below the square brace in that file) and modify it as desired.  To modify existing staff members, you can just modify their existing data, so long as you follow the scheme set up in the above example.  To properly update that information, I will explain each line:

	"ID": "staff_6",

ID is a unique property for each event.  If you are trying to add a new staff member, the new staff member should have their own unique ID value following it.  I have simply been updating using staff_XX where XX is just adding 1 to the previous ID in the JSON file.  But this can be anything arbitrary.  Just make sure it's unique to each entry.

	"Name": "FLAG Anniversary Weekend",

This is the name of the event.  Like all the other JSON objects with names, this can be whatever you want it to be.

	"Type": "Anniversary Weekend",

This is used for multiple areas of listing out event details (Our events page or the calendar).  I recommend keeping the description relatively simple, as the design of the site is meant to have this be simple, but this can be anything arbitrary.  A birthday party, a bowling night, a movie night, whatever.  There is an entry for more details that comes later, and the styling script assumes that entry to be longer.  Note that the design of the site assumes that this encapsulates the details of an ENTIRE event, so keep that in mind.  

	"Image": "red_event.jpg",

This is used for event banners on the Calendar page.  These *can* be any size but I would recommend banners wide rather than tall (The styling assumes this to be the case).  When you have a banner, it needs to be uploaded into the folder img/events/banners/.  If you do not include a banner (Either because you don't have one or whatever), you can use "" and the page will load a generic default banner.  It won't have any useful information on it.

	"Flyer": "demo_flyer_3.jpg",

This is used for event flyers.  As of right now those are only pertinent to our events, so if you don't include this as an object for other events, that's probably fine.  These are more detailed and stylized graphics that describe our events and are usually used on social media.  If you have an event flyer, you need to put it in the img\events\flyers folder.

	"Description": "Test event!",

This is the detailed description I mentioned earlier.  This populates on the calendar or anywhere else it's necessary for the details to be.  Consider this more of an ad-read for your event, as address and URL information is handled later. 


	"Host": "FLAG",

This just lists out the group hosting the event.  This is just text and can be whatever you want.

	"HostURL": "",

If the group hosting the event has a website, you can put it here.  If you do, each instance of the host name will become a link to their website.  Fill this out if you can, it would be best to promote as much inter-group exchange as possible and this is a very small way to do it.

	"Days": 3,

This is necessary for the script to process the event, as the level of detail that the script needs to apply per event depends on how complex the event is.  If your event is just an evening out or something, just use 1.  If your event spills into another day, still just use 1 (IE when FLAG does an event from 9PM - 2AM listed at The Eagle).  Use 2 or more when there's a significant break in event times (IE 9PM-2AM on Friday and 9PM-2AM on Saturday would be 2 days, adding another cookout on Sunday from 12PM-6PM would be a 3rd day)  This only takes numerical values.

	"StartDate": "2026-10-11",

This is the start date for the event.  This is in the form of YYYY-MM-DD.  This format must be followed exactly.  This is used both for display on the Events page and for setting up the display date on the calendar.

	"EndDate": "2026-10-13",

This is the end date for the event.  For events that bleed into another day (Again using the example of a bar night from 9PM-2AM), just use the date the last event begins on (So if it was September 9th for the bar night start and September 10th for the end, use September 9th).  Events that are only one day long do not need to have an end date set.

	"Part": [
		{
			"PartID": "Event_3_Part_1",
			"Day": 1,
			"StartTime": "21:00",
			"EndTime": "02:00",
			"EventName": "Bar Night",
			"Location": {
				"Place": "Providence Eagle",
				"URL": "http://providenceeagle.com/Providence_Eagle/index.html",
				"Address": "124 Snow St, Providence, RI"
				},
			"Description": "Enjoy the party at the bar!"
		},
	]

I'm going to give an overview of this before I get into specifics.  All events have at least one part associated with them.  Each part contains details for the event that are specific to that part (Rather than the whole).  It's worth noting that this is where a lot of how the scripts handle things start varying.  An event with multiple days (Which we defined earlier) and multiple events is handled differently from an event with just one day but multiple parts, which again is handled differently than an event with just one day and one part.

Parts have the same sort of JSON structure as the events they're part of (Consider it something like a box within a box).  It just stays nested within the broader event box.  It still looks like this:

	"Part": [
		{
			Event details
		},
		
		{
			Event details
		}
	]

Where each curly brace has a comma after it except for the last one (And in the case of only one event part, just no comma at all).  The extra indentation is just to make it clear that this is "box within a box".  This is basically what the "Part": does, so now I'll get into each specific part.

		"PartID": "Event_3_Part_1",

This is much like IDs for everything else, just a unique identifier for this particular event part.  This can be anything you want as long as it's unique.

			"Day": 1,

Specifies on which day of the overall event this is part of.  For 1-day events, this still needs to be present (Just leave it at 1).  The site will do math based on this value to display dates properly on the site.  This only takes numeric values.

			"StartTime": "21:00",
			"EndTime": "02:00",

Listed because these go hand in hand.  All parts need both.  This is, notably, in military time.  The site will convert this to the AM/PM system.  If you're wondering "Then why not do it AM/PM here", the answer is "Because that would have been more annoying to code, plus there are features where I need to split and rework numbers anyways, and making it easy on this side means less work code-side".  Always put in the form "HH:MM"

			"EventName": "Bar Night",

This is the name for this part of the event.  For example, on our anniversary weekends, we do cookouts.  So this could be "Annual cookout" or something.  This is displayed on the details of an event when clicked on either from the calendar or our events page.

			"Location": {
				"Place": "Providence Eagle",
				"URL": "http://providenceeagle.com/Providence_Eagle/index.html",
				"Address": "124 Snow St, Providence, RI"
				},

This is the location data.  In order:

The Place just gives out the place name.  Since occasionally we do have events at peoples' houses, the scripts for the page allow you to put "Private" here.  If you do, the script will give a notice about the private nature of the event and to contact Jim for details.  This way we can advertise our events while also giving proper privacy and screening for events where that could be important.

The URL is a link to a website for the place.  If one is not available, just put "None" here.  Also put "None" here if the event is private.

The Address is just what it looks like.  Enter the address in standard form, and the site will append it to a Google map search and output a link to the address that a user can click on.  If an event is private, use "None" here.

			"Description": "Enjoy the party at the bar!"

This is a broader description for the specific event part.  Yes, there are lots of details that can be displayed, but that's honestly a good thing.

Lastly, we get back to the normal event information (After we've input all the parts).  The last bit is:

	"Timezone": "America/New_York"

This is going to be used to handle "Add to calendar" and possibly some other international information in the future.  Right now it doesn't do anything, but include this (Or whatever is appropriate for the region the event is being held in) regardless.

This is where I'll end it.  I wanted to show the overall structure, but we don't need to go into every line from the first example.  It's just got multiple entries in its Parts section for demonstration purposes.  You can look in the JSON file for smaller events if you want as well.






*********************************************************************
***************************** Section 5 *****************************
************************ Updating Affiliates ************************
*********************************************************************

Ok, after seeing all the others, I'm sure you're looking at this going "Ugh I don't need more complicated stuff".  Well, the good news is affiliates is very much the easiest to update.  It only has a few properties per entry in its JSON:

{
	"ID": "affiliate_1",
	"Name": "Full Kit Gear",
	"URL": "https://www.fullkit.com/",
	"Logo": "full_kit_gear.png",
	"Category": "Gear"
},

I will repeat this information in each section in case anyone decides to jump to update something specific and would otherwise miss this explanation, so bear with me if you've already read this bit.  Data in the JSON files are always in the form of "Property": "Value".  Properties are case sensitive and should always be pasted exactly as shown in the example.  The scripts use all of these properties in some form or another.  The values are a bit different.  Some values have to follow certain rules (which will be explained further down), while others can more-or-less be freely modified.  The template provided must be used exactly (That is, each event entry needs to be between the curly braces, a comma must appear after each value, and a comma must appear after the end curly brace, and quotation marks are used similarly to how they are displayed in the example.  Values without quotation marks in the example deliberately do not have them.).  If you update the JSON file and it does not seem to work properly, chances are that the format was not followed properly and you should look it over again.

If you are looking to add affiliates, simply copy and paste the template provided above at the top of the affiliates.json file (But below the square brace in that file) and modify it as desired.  To modify existing affiliates, you can just modify their existing data, so long as you follow the scheme set up in the above example.  To properly update that information, I will explain each line:

	"ID": "affiliate_1",

ID is a unique property for each affiliate.  If you are trying to add a new affiliate, the new staff member should have their own unique ID value following it.  I have simply been updating using affiliate_XX where XX is just adding 1 to the previous ID in the JSON file.  But this can be anything arbitrary.  Just make sure it's unique to each entry.

	"Name": "Full Kit Gear",

This is just the name of whatever we're linking to.  Easy-peasy.

	"URL": "https://www.fullkit.com/",

This is just the link to the website for the affiliate.  Simple!

	"Logo": "full_kit_gear.png",

Easily the most complicated part of a new affiliate.  You need to upload the image to img\affiliates and copy the filename for this value.  GET PERMISSION FROM THE GROUP YOU ARE LINKING TO FIRST, IDEALLY IN WRITING.

	"Category": "Gear"

Category is interesting here.  The site will look at the value (Keep it text in quotations), strip out characters that are invalid for links, use that stripped version to generate anchor links (Don't worry if you don't know what these are, the site takes care of it all for you), and then appends those anchor links to the list of categories that appear at the top of the affiliates page.  Those anchor links are used to switch between different display categories on the affiliates page.

Just be a little careful here.  The categories are case sensitive, and since these are dynamically generated, you can accidentally create more categories than you need.  "Gear" and "gear" would actually be different categories.  The website handles (currently) about 4 or 5 categories properly before things break down.  If we REALLY need more, I can work it. But try to keep all affiliates using existing categories found in the JSON file.






*********************************************************************
***************************** Section 6 *****************************
*********************** Updating Other Pages ************************
*********************************************************************

This is where things get simpler.  Every other page is static HTML (They do load scripts but they're either logic for handling mobile browsers or handling fade transitions between pages).  If you know even just the barest-bones of HTML, you can update the page however you want.  If you don't, it's a broader topic than this readme can handle and I recommend doing some Youtube tutorials on it (You only need simple knowledge).  But you really can't modify an HTML document without understanding what's going on because you can easilly accidentally break things.

The static pages currently are:
about.html, history.html, contest.html, contest_rules.html, contest_application.html, membership.html, and mission_statement.html.






*********************************************************************
***************************** Section 7 *****************************
******************** Updating Social Media Links ********************
*********************************************************************


Social media links show up in two files.  They show up in sidenav.html and topnav.html.  These two files are navigation files, and while they're still technically static html pages, I did not list them with the above ones, as they're fundamental to how users navigate.   As with all HTML files, it should only be modified if you know what you're doing.  I am *only* pointing out where the relevant code lies so you don't have to dig.  I'm not going to explain what's going on (With one exception) below, because frankly there needs to be a filter.  Someone who doesn't know what they're doing can break something accidentaly, so if you can't read and understand this, don't try and update it.

		<div class="socials">
			<a href="https://www.facebook.com/groups/79158953813" target="_blank" rel="noopener noreferrer">
				<i class="fa fa-facebook sidebar-icon"></i>
			</a>
			<a href="https://www.facebook.com/groups/79158953813" target="_blank" rel="noopener noreferrer">
				<i class="fa fa-instagram" aria-hidden="true"></i>
			</a>
		</div>

This is exactly the same on both pages.  The <i class="fa fa-instagram" aria-hidden="true"></i> is a pointer to a site called Font Awesome.  You can see its CSS loaded at the beginning of each HTML file.  The version of Font Awesome is in the CSS file name.  There are a variety of Font Awesome stuff.  I use it for the maps, for example.  You can find relevant social media images by googling it.  If you add a social media link, the CSS auto-adjusts for you to accommodate more or less at the bottom of the navigation sections.


*********************************************************************
***************************** Section 8 *****************************
************************** Adding New Pages *************************
*********************************************************************

Again, I will assume you know enough HTML to actually properly write a new page.  And I will assume that you know how Javascript works if you need to make an interactive page.  This is only to point in the right direction for updating stuff.  If you don't know how to write a static web page, please don't try and add them.  Go learn HTML first.  I say this not to be mean, but as a genuine piece of advice.  You should not be adding pages to a website if you do not know HTML, because you will not be able to fix things that break or keep the styling in line.  And please, for the love of all that is dark and unholy, do not rely on generative chat bots to design new site pages for you.  I'm not going to say never use them for anything (You *can* learn things from them), but you need to be able to read what it puts out, know how to apply it to the site, and modify and style it for consistency.

The overall site style is found in general_styles.css.  All coloring uses variables defined in that file.  Below the variable declarations is a list of what's used where, so you can easily keep up with the site theme.

The sidebar for the desktop site is sidenav.html, you can add your page there.  I can't imagine this site ever needing so many pages that you need to alter any stylings for sidenav.html, but if it does ever explode that much, sidenav.css is where the heights are all defined, so you can modify that to make space.

For mobile, topnav.html and topnav.css govern the navigation appearance.  I should note that, unlike the sidebar, I did style the dropdowns such that when the dropdown button that creates the most amount of visible links makes the dropdown cover 100% of the page.  If you want to add more, you DEFINITELY want to go through that CSS file and change the height (It uses viewport heights) and adjust those to account both for more dropdown menu options (if applicable) *and* links.

And that covers it.  Sorry for the length and verbosity, but I'd rather be clear in the information presented than not.  The goal is to be able to hand this off to someone to be able to maintain with minimal effort (I promise that learning basic HTML and CSS is minimal effort for making new pages), which meant being clear on what needs to be updated and what is doing what.