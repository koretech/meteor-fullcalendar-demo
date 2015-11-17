# meteor-reactive-fullcalendar demo

This demo is for the krt:meteor-reactive-fullcalendar package.

https://github.com/koretech/meteor-reactive-fullcalendar

https://atmospherejs.com/krt/meteor-reactive-fullcalendar

It demonstrates how to reactively display events with publish and subscribe.

## Installation

Clone the repository.

    git clone https://github.com/koretech/meteor-fullcalendar-demo.git
    
Run with meteor

    meteor
    
You can perform the following actions:

  * Click on a day to create a random event
  * Click on an event to delete it
  * Drag the end of an event to resize it
  * Drag the event to a new date
  
I commented the code as best I could.

Watch out for how Fullcalendar deals with timezones. This can cause really strange off by 1 day errors.

Also Fullcalendar uses end times of 1 full second PAST when the event ended.
For example if the last full day of an event is Thursday the end date will be on 00:00:00 Friday!
