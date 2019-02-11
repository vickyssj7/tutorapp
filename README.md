# tutorapp
A tutormate app allows, tutors of the school to add notes against their tutees based on their categories which can be academic, sports, medical etc.

This app is build in ionic1 and using speech recognition feature that allows the tutor to either speak to the app to write a note and save it or he can either add not by typing against the selected categories.

This app saves data in Google Spreadsheet and using spreadsheet api to write against the tutee.

One of the best thing about this app is, each note will be saved against that tutee only without creating duplicate row, which means if you are adding second or third note against a selected tutee, then it will add that note by finding that tutee in the sheet and inserting it after other rows and also it will merge the columns of that tutee to make it feel like it's added against that tutee only.
