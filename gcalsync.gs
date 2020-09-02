// sync events from a 'secondary' calendar to a 'primary' calendar
// 
// major changes from previous author versions:
//   - tags imported events so that dupes are not created if you want to copy event titles
//   - sets new events PUBLIC so that coworkers can read details of events
//   - handles updates via updating vs. deleting/creating
//
// todo:
//   - add some nice constants: PUBLIC vs. PRIVATE, scanning duration in days, etc
//
// author: scott boone; adapted from the following:
//   https://medium.com/@willroman/auto-block-time-on-your-work-google-calendar-for-your-personal-events-2a752ae91dab
//   https://gist.github.com/ttrahan/a88febc0538315b05346f4e3b35997f2

function gcalsync() {
    var pCalId = "[email address]"; // calendar ID

    var today = new Date();
    var enddate = new Date();
    enddate.setDate(today.getDate()+14); // scan the next two weeks
  
    var primaryCal = CalendarApp.getDefaultCalendar();  // calendar that events are being copied to
    var primaryEvents = primaryCal.getEvents(today,enddate);
    var secondaryCal = CalendarApp.getCalendarById(pCalId); // calendar that events are being imported from
    var secondaryEvents = secondaryCal.getEvents(today,enddate);
  
    // find primary calendar events that were created during a previous import from the secondary calendar
    var pcImported = [];
    for (pev in primaryEvents) {
        var pEvent = primaryEvents[pev];
        if (pEvent.getTag(pCalId)) {
            pcImported.push(pEvent);
        }
    }
    Logger.log('found ' + primaryEvents.length + ' events in ' + primaryCal.getName());  
    Logger.log('  > previously imported: ' + pcImported.length);
    Logger.log('found ' + secondaryEvents.length + ' events in ' + secondaryCal.getName());
  
    // filter events to be imported to skip all day events and weekends:
    var scFiltered = [];
    for (sev in secondaryEvents) {
        var sEvent = secondaryEvents[sev];
        if (sEvent.isAllDayEvent() || sEvent.getStartTime().getDay() == 0 || sEvent.getStartTime().getDay() == 6) { continue; }
        scFiltered.push(sEvent);
    }
    Logger.log(scFiltered.length + ' events to consider for import from ' + secondaryCal.getName());

    // put all primary calendar events into a map to search by ID and start date 
    // (ID is insufficient to disambiguate recurring events)
    var pceMap = {};
    for (pev in pcImported) {
        var pEvent = pcImported[pev];
        pceMap[pEvent.getTag(pCalId)] = pEvent;
    }

    var updated = 0;
    var deleted = 0;
    var created = 0;

    for (sev in scFiltered) {
        var sEvent = scFiltered[sev];
        var tagStr = sEvent.getId() + sEvent.getStartTime();

        if (pceMap[tagStr]) { // this is an event that has already been imported
            var pEvent = pceMap[tagStr];
            // if the event has been modified more recently than the import, update it
            if (sEvent.getLastUpdated() > pEvent.getLastUpdated()) {
                pEvent.setTitle(sEvent.getTitle());
                pEvent.setTime(sEvent.getStartTime(), sEvent.getEndTime());
                pEvent.setLocation(sEvent.getLocation());
                pEvent.setDescription(sEvent.getDescription());
                updated++;
                Logger.log('PRIMARY EVENT UPDATED:\n    primaryId: ' + pEvent.getId() + ' \n    primaryTitle: ' + pEvent.getTitle());
            }
            delete pceMap[tagStr];  // remove this from the map to indicate that we have dealt with it
        } else { // this is a new event
            var newEvent = primaryCal.createEvent(sEvent.getTitle(), sEvent.getStartTime(), sEvent.getEndTime(),
                { location: sEvent.getLocation(), description: sEvent.getDescription() });  
            newEvent.setVisibility(CalendarApp.Visibility.PUBLIC); // allow other primary calendar users to see event details
            newEvent.removeAllReminders();   // prevent double-reminders
            newEvent.setTag(pCalId, tagStr); // tag the event as being imported from the secondary calendar
            created++;
            Logger.log('EVENT CREATED:\n    primaryId: ' + newEvent.getId() + '\n    primaryTitle: ' + newEvent.getTitle());
        }

    }

    // delete previously imported items that don't match to anything anymore
    for (pev in pceMap) {
        Logger.log('EVENT DELETED:\n    primaryId: ' + pceMap[pev].getId() + '\n    primaryTitle: ' + pceMap[pev].getTitle());
        pceMap[pev].deleteEvent();
        deleted++;
    }

    Logger.log('COMPLETED: ' + created + ' created, ' + updated + ' updated, ' + deleted + ' deleted.');
}
