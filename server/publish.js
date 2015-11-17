Meteor.publish('events', function(start, end){
	check(start, Date);
	check(end, Date);

	return Events.find({
		$or: [{
			start: { $gte: start, $lt: end }
		},{
			end: { $gte: start, $lt: end }
		}]
	});
});
