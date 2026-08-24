Hello!

If you're reading this, it is likely because I (Rob) am no longer actively maintaining the FLAG website and you're looking to make modifications.

This is going to be a readme to hopefully explain how to update what I call normal content (New titleholders, changes in staff, adding events, etc).  Since I am an ameteur (At best) web developer, I had to do this using what technical skills I had available to me - That is, limited knowledge of Javascript.  This means updates will unfortunately have to be made by directly manipulating files and images, rather than a fancy database interface that I just do not have the expertise to code.

So long as the .js files in the scripts folder aren't touched, they should handle any updates and keep normal content flow.  You should *not* need to modify the .js files *unless* the instructions in this readme explicitly say to.

This readme is a little verbose, and that's so that you can understand exactly what you're looking at.  The actual steps to updating the website are simple, but knowing the logic of how things are arranged will help with any troubleshooting that could arise.

Table of Contents:

1) Updating titleholders
2) Updating staff
3) Updating events
4) Updating affiliates
5) Updating other pages


*********************************************************************
*********************** Updating titleholders ***********************
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
	
I will repeat this information in each section in case anyone decides to jump to a relevant section, so bear with me if you've already read this bit.  Data in the JSON files are always in the form of "Property": "Value". Some values have to follow certain rules, others can be freely modified.  The template provided must be used exactly (That is, each titleholder entry needs to be between the curly braces, a comma must appear after each value, and a comma must appear after the end curly brace, and quotation marks are used similarly to how they are displayed in the example).  If you update the JSON file and it does not seem to work properly, chances are that the format was not followed properly and you should look it over again.

If you are looking to add a new titleholder, simply copy and paste the template provided above at the top of the JSON file (But below the square brace there) and modify it as desired.  To properly update that information, I will explain each line:

	"ID": "titled_22",

ID is a unique property for each titleholder.  If you are trying to add a new titleholder, the new titleholder should have their own unique ID value following it.  I have simply been updating using titled_XX where XX is just adding 1 to the previous ID.

	"Prefix": "Mx.",
	
Prefix is just the preferred title prefix for the titleholder.  You can make this whatever you want in the JSON file and it will reflect properly on the website.

	"Name": "Indulgence Period",

Name is just the name of the titleholder.  Like the prefix, this can be freely edited in the JSON file and it will reflect properly on the website.

	"Active": true,
	
Active is the status of the different titleholders.  There should only ever be one active titleholder at a time.  The scripts dealing with titleholders assume this.  If you're adding a new titleholder, the new titleholder should have the true value applied to the Active property, and the previous titleholder should have the value set to false.  Note that there are no quotation marks around true and this is deliberate.  The same applies to false.  These are also case sensitive, so be aware to only use true & false as the values here.

	"Year": "2026",
	
Year is the titleholder's active year.  This will reflect properly on the website and the website will auto-sort in descending order based on the active year of the titleholder.

While this has only ever happened once (As of this writing), if it becomes necessary to do this again, you can add multiple years to a titleholder, so long as those years are sequential.  You can use "2019 and 2020", or "2026 through 2029", or whatever.  The scripts only care about the first four numbers and will treat the rest as skipped years.

	"Image": "MxFLAG2026-Indulgence_Period.jpg",
	
Image is what's used to display the titleholder pictures.  The scripts look for the value text (In the example case here MxFLAG2026-Indulgence_Period.jpg) in two folders.  First, it looks for a low-res file in the img/titleholders/Thumbnails folder for the listing on the site, and then it looks for the full size picture to use when you click on the titleholder's picture on the website in img/titleholders/FullSize.  It is not strictly necessary to follow the naming standard I've been using for the images (Prefix-FLAG-Year-name.jpg), and you can use any naming standard you want.  What's important is that you upload a low-res picture into the Thumbnails folder, a hi-res picture in the FullSize folder, that they have the EXACT same filename in each folder (including the upper and lower case details) and that the same filename is included in the JSON file.  This is the only part that you are required to do something besides updating the JSON file.

	"Description": "The image here is bigger than the staff page because, presumably, we'd have only one active titlteholder at a time. I assume if we wanted past titleholders, we'd have a historical section where I'd make the list more in-line with the Staff section.  But we could also merge the previous and current titleholders into one page, with the current titleholder being on top if we wanted to."

Description is the plain text put on the page under the titleholder nam.  The description can be whatever you want, and it can absolutely handle HTML tags in order to stylize or provide links a titleholder may want as part of their description.