/**
 * @summary Compares two dates using moment library
 * @param a
 * @param b
 * @return {*}
 */
function compareDates(a,b){
	return moment(a).isSame(moment(b));
}

// These are the currently displayed date range
var startDate = new ReactiveVar(new Date(), compareDates);
var endDate = new ReactiveVar(new Date(), compareDates);

Template.myCalendar.onCreated(function(){
	var self = this;

	// (Re-)subscribe to published events when the start and end date changes
	self.autorun(function(){
		self.subscribe('events', startDate.get(), endDate.get());
	});
});

Template.myCalendar.helpers({
	options: function () {
		return {
			id:               'cal',        // DOM id
			editable:         true,
			startEditable:    true,
			durationEditable: true,
			events:           events,
			eventClick:       eventClick,
			dayClick:         dayClick,
			eventResize:      eventResize,
			eventDrop:        eventDrop,
			autoruns:         [
				function () {
					//This just needs to watch the events collection and run reactively
					//when it changes. We don't need to do anything with the results here.
					Events.find().fetch();
				}
			]
		};
	}
});

/**
 * FullCalendar events() method
 * See: http://fullcalendar.io/docs/event_data/events_function/
 *
 * This function can be called in 2 different ways:
 *   * When fullcalendar needs event data
 *   * When the underlying collection reactively updates
 */
function events(fStart, fEnd, timezone, callback) {
	// Convert the dates to JavaScript dates.
	//  I wish mongo could store momentjs natively...
	var start = fStart.toDate(),
		end = fEnd.toDate();

	// If the start and end dates have been altered then update the subscription.
	//
	// Changing startDate or endDate will cause the subscription above to rerun,
	// which in turn updates what's in the collection, which in turn reruns this
	// events() function.
	startDate.set(start);
	endDate.set(end);

	// Return the currently requested events
	var eventsResult = Events.find({
		$or: [{
			start: { $gte: start, $lt: end }
		},{
			end: { $gte: start, $lt: end }
		}]
	}).fetch();

	callback(eventsResult);
}

/**
 * FullCalendar eventClick() method
 * See: http://fullcalendar.io/docs/mouse/eventClick/
 */
function eventClick(ev, jsEv, view) {
	// We will remove the even when we click on it.
	Events.remove({
		_id: ev._id
	});
}

/**
 * FullCalendar dayClick() method
 * See: http://fullcalendar.io/docs/mouse/dayClick/
 */
function dayClick(date, jsEv, view) {
	// The date here is a moment() which has no time component.
	// See: http://fullcalendar.io/docs/utilities/Moment/#ambiguously-zoned
	// What this really means is that the time component is 00:00:00 UTC,
	// which in my timezone (GMT-0600) is the day BEFORE the one clicked.

	// I adjust the date by converting it to ISO8601, then back to moment, the to a date
	// This works but there has to be a better way...
	var adjDate = moment(date.toISOString()).toDate();

	// Insert a random event on the day that was clicked.
	Events.insert(generateRandomEvent(adjDate));
}

/**
 * FullCalendar eventResize() method
 * See: http://fullcalendar.io/docs/event_ui/eventResize/
 */
function eventResize(ev, delta, revertFunc) {
	// See dayClick() on why I'm adjusting these dates
	var adjStartDate = moment(ev.start.toISOString()).toDate();
	var adjEndDate = moment(ev.end.toISOString()).toDate();

	// Update the database
	Events.update({
		_id:ev._id
	},{
		$set: {
			end: (ev.end) ? adjEndDate : adjStartDate
		}
	},function(err){
		// Call revert if there is an error updating the database
		if (err) revertFunc();
	});
}

/**
 * FullCalendar eventDrop() method
 * See: http://fullcalendar.io/docs/event_ui/eventDrop/
 */
function eventDrop(ev, delta, revertFunc, jsEv, ui, view) {
	// See dayClick() on why I'm adjusting these dates
	var adjStartDate = moment(ev.start.toISOString()).toDate();

	var updateObject = {
		start: adjStartDate
	};

	if (ev.end) {
		updateObject.end = moment(ev.end.toISOString()).toDate();
	}

	// Update the database
	Events.update({
		_id:ev._id
	},{
		$set: updateObject
	}, function(err){
		// Call revert if there is an error updating the database
		if (err) revertFunc();
	});
}

/**
 * Generate a random FullCalendar event
 * @param {date} date
 * @return {object}
 */
function generateRandomEvent(date) {
	return {
		title: Math.random().toString(36).substring(7), // Random text
		start: date,
		allDay: true,
		backgroundColor: generateRandomColor()
	}
}

/**
 * Generate a random hex color
 * @return {string}
 */
function generateRandomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
