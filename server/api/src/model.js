const mysql = require('mysql');
const uuid4 = require('uuid4');
const config = require('./config');

var pool = null;

exports.connect = function(cb) {

	pool = mysql.createPool({
		host : config.MYSQL_HOST,
		user : config.MYSQL_USER,
		password : config.MYSQL_PASSWORD,
		database : config.MYSQL_DATABASE
	});

	cb();

}

exports.display_list = function(cb) {
	var q = `
		SELECT
			d.handle as handle,
			d.serial as serial,
			d.description as description,
			d.tags as tags,
			d.screen_type as screen_type,
			d.created_at as created_at,
			d.last_seen_at as last_seen_at,
			i.handle as image_handle
		FROM
			display d
			LEFT OUTER JOIN image i ON d.image_id = i.id
		`

	pool.query(q,
		function(err, rows) {
			cb(err, rows);
		});
}

exports.display_get = function(handle, cb) {
	var q = `
		SELECT
			d.id as id,
			d.handle as handle,
			d.serial as serial,
			d.description as description,
			d.tags as tags,
			d.screen_type as screen_type,
			d.created_at as created_at,
			d.last_seen_at as last_seen_at,
			i.handle as image_handle
		FROM
			display d
			LEFT OUTER JOIN image i ON d.image_id = i.id
		WHERE
			d.handle = ?`

	//pool.query('SELECT handle, serial, description, created_at, last_seen_at FROM display WHERE handle = ?', [ handle ],
	pool.query(q, [ handle ],
		function(err, rows) {
			cb(err, rows);
		});
}
exports.display_get_by_serial = function(serial, cb) {
	var q = `
		SELECT
			d.id  as id,
			d.handle as handle,
			d.serial as serial,
			d.description as description,
			d.tags as tags,
			d.screen_type as screen_type,
			d.created_at as created_at,
			d.last_seen_at as last_seen_at,
			i.handle as image_handle
		FROM
			display d
			LEFT OUTER JOIN image i ON d.image_id = i.id
		WHERE
			d.serial = ?`
	pool.query(q, [ serial ],
		function(err, rows) {
			cb(err, rows);
		});
}
exports.display_create = function(serial, description, tags, screen_type, cb) {
	var id = uuid4();
	var values = [ id, serial, description, tags, screen_type ];
	pool.query('INSERT INTO display (handle, serial, description, tags, screen_type, created_at) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(6))', values,
		function(err, ret) {
			cb(id, err, ret);
		});
}

exports.display_delete = function(handle, cb) {
	pool.query('DELETE FROM display WHERE handle = ?', [ handle ], function(err, ret) {
		cb(err, ret);
	});
}
exports.display_update = function(handle, serial, description, tags, screen_type, cb) {
	var values = [ serial, description, tags, screen_type, handle ];
	pool.query('UPDATE display SET serial = ?, description = ?, tags = ?, screen_type = ? WHERE handle = ?', values, function(err, ret) {
		cb(err, ret);
	});
}
exports.display_set_image = function(handle, image_id, cb) {
	var values = [ image_id, handle ];
	pool.query('UPDATE display SET image_id = ? WHERE handle = ?', values, function(err, ret) {
		cb(err, ret);
	});
}
exports.display_mark_seen = function(handle, cb) {
	var values = [ handle ];
	pool.query('UPDATE display SET last_seen_at = UTC_TIMESTAMP(6) WHERE handle = ?', values, function(err, ret) {
		cb(err, ret);
	});
}

exports.image_list = function(cb) {
	pool.query('SELECT handle, name, description, screen_type, created_at FROM image;',
		function(err, rows) {
			cb(err, rows);
		});
}

exports.image_get = function(handle, cb) {
	pool.query('SELECT id, handle, name, description, screen_type, created_at, md5, bytes_original, bytes_processed FROM image WHERE handle = ?', [ handle ],
		function(err, rows) {
			cb(err, rows);
		});
}

exports.image_create = function(name, description, screen_type, cb) {
	var id = uuid4();
	var values = [ id, name, description, screen_type ];
	pool.query('INSERT INTO image (handle, name, description, screen_type, created_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP(6))', values,
		function(err, ret) {
			cb(id, err, ret);
		});
}

exports.image_delete = function(handle, cb) {
	pool.query('DELETE FROM image WHERE handle = ?', [ handle ], function(err, ret) {
		cb(err, ret);
	});
}
exports.image_update = function(handle, name, description, screen_type, cb) {
	var values = [ name , description, screen_type, handle ];
	pool.query('UPDATE image SET name = ?, description = ?, screen_type = ? WHERE handle = ?', values, function(err, ret) {
		cb(err, ret);
	});
}
exports.image_update_file = function(handle, md5, bytes_original, bytes_processed, cb) {
	var values = [ md5, bytes_original, bytes_processed, handle ];
	pool.query('UPDATE image SET md5 = ?, bytes_original = ?, bytes_processed = ? WHERE handle = ?', values, function(err, ret) {
		cb(err, ret);
	});
}

exports.result_create = function(display_id, image_id, value, cb) {
	var v = [ uuid4(), display_id, image_id, value ];
	var q = `
		INSERT INTO
			result (handle, created_at, display_id, image_id, value)
		VALUES
			(?, UTC_TIMESTAMP(6), ?, ?, ?)
		`

	pool.query(q, v,
		function(err, rows) {
			cb(err, rows);
		});
}

exports.result_list_by_image = function(image_id, cb) {
	var v = [ image_id ];
	var q = `
		SELECT
			r.handle as handle,
			r.created_at as created_at,
			r.value as value,
			i.handle as image_handle,
			d.handle as display_handle
		FROM
			result r
			LEFT OUTER JOIN image i ON r.image_id = i.id
			LEFT OUTER JOIN display d ON r.display_id = d.id
		WHERE
			i.id = ?
		ORDER BY r.created_at DESC
		`

	pool.query(q, v,
		function(err, rows) {
			cb(err, rows);
		});
}

exports.schedule_list = function(display_handle, image_handle, only_current, cb) {
	console.log("schedule_list(display_handle="+display_handle+", image_handle="+image_handle+" only_current="+only_current+")");
	var filter = '';
	var params = [];
	var filters = [];
	if (display_handle || image_handle || only_current) {
		if (display_handle) {
			filters.push(' d.handle = ?');
			params.push(display_handle);
		}
		if (image_handle) {
			filters.push(' i.handle = ?');
			params.push(image_handle);
		}
		if (only_current) {
			filters.push(' start <= UNIX_TIMESTAMP() AND UNIX_TIMESTAMP() < stop ');
		}
		filter = 'WHERE ' + filters.join(' AND ');
	}

	var q = `
		SELECT
			s.handle as handle,
			d.handle as display_handle,
			i.handle as image_handle,
			s.start as start,
			s.stop as stop,
			s.created_at as created_at
		FROM
			schedule s
			INNER JOIN image i ON s.image_id = i.id
			INNER JOIN display d ON s.display_id = d.id
		`
	q += filter;

	pool.query(q, params,
		function(err, rows) {
			cb(err, rows);
		});
}

exports.schedule_create = function(display_id, image_id, start, stop, cb) {
	var id = uuid4();
	var v = [ id, display_id, image_id, start, stop ];
	var q = `
		INSERT INTO
			schedule (handle, created_at, display_id, image_id, start, stop)
		VALUES
			(?, UTC_TIMESTAMP(6), ?, ?, ?, ?)
		`

	pool.query(q, v,
		function(err, rows) {
			cb(id, err, rows);
		});
}
exports.schedule_delete = function(handle, cb) {
	pool.query('DELETE FROM schedule WHERE handle = ?', [ handle ], function(err, ret) {
		cb(err, ret);
	});
}

exports.schedule_get = function(handle, cb) {
	q = `
		SELECT
			s.handle as handle,
			d.handle as display_handle,
			i.handle as image_handle,
			s.start as start,
			s.stop as stop,
			s.created_at as created_at
		FROM
			schedule s
			INNER JOIN image i ON s.image_id = i.id
			INNER JOIN display d ON s.display_id = d.id
		WHERE
			s.handle = ?
		`

	pool.query(q, [ handle ],
		function(err, rows) {
			cb(err, rows);
		});
}
