const config = require('./config');
const model = require('./model');

// for a given display handle, calculate the currently running schedule
// and how long that schedule will still run for, callbacking
// { 'schedule' : <schedule object>, 'seconds_left' : int }
// or null if no schedule is currently running
exports.current_schedule = function(display_handle, cb) {

	model.schedule_list(display_handle, undefined, true, function(err, rows) {
		if (err)
			throw err;

		var now = parseInt(new Date().getTime()/1000);
		var winning_schedule = undefined;

		// filter out all schedules not covering this point in time
		//rows = rows.filter(sched => ((sched.start <= now) && (now <= sched.stop)));

		// look for the schedule with the lowest stopping time
		rows.forEach((schedule) => {
			if ((!winning_schedule) || (schedule.stop < winning_schedule.stop)) {
				winning_schedule = schedule;
			}
		});

		if (winning_schedule) {
			model.schedule_get(winning_schedule.handle, function(err, rows) {
				if (err)
					throw err;
				cb({
					'schedule' : rows[0],
					'seconds_left' : winning_schedule.stop - now,
				});
			});
		} else {
			cb(null);
		}
	});

}
