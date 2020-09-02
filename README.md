# gcalsync

Google Script to synchronize from one calendar to another.

## purpose

A lot of us have calendars for different contexts, e.g., work and home, their agency and a client, and so on. This makes it easier to expose blocked time to others who you are coordinating schedules with. 

## configuration & installation

* Calendar `A` is the calendar you are importing TO
* Calendar `B` is the calendar you are importing FROM

### modify the script

* look up calendar id for `B` (look in 'Calendar Details' ; it is likely your gsuite email address)
* insert this id into the script as the `pCalId` variable
* if you do not want event details to show for imported events, change `PUBLIC` to `PRIVATE` in this line: `newEvent.setVisibility(CalendarApp.Visibility.PUBLIC)`

### install the script

* go to My Drive on Google Drive for `A`
* New -> More -> Connect More Apps
* search for "script", select `Google Apps Script`, and press `+ connect`
* My Drive -> More -> Google Apps Script -> "Untitled Project"
* Copy and paste the modified script into this window, name it whatever you want

### automate the script
* Click clock icon to left of play icon
* Click to add a new trigger, set it up to run however often you want

## thanks

this is largely based on:
* https://medium.com/@willroman/auto-block-time-on-your-work-google-calendar-for-your-personal-events-2a752ae91dab 
* https://gist.github.com/ttrahan/a88febc0538315b05346f4e3b35997f2

## todo

Google will occasionally complain about this script when there are a lot of events to migrate.
It will generally sort itself out, but this can lead to some spam in your inbox.


