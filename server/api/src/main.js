'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const fileupload = require('express-fileupload');
const basic_auth = require('express-basic-auth');
const bodyparser = require('body-parser');
const net = require('net');
const config = require('./config');
const model = require('./model');
const scheduling = require('./scheduling');
const epaper = require('./epaper');

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended : false }));
app.use(fileupload());
app.use(function(req, res, next) {
	if (req.method == 'GET') {
		// GETs are unauthed
		next();
	} else {
		// all the rest is authed
		(basic_auth({
			users : {
				'admin' : config.API_ADMIN_PASSWORD
			}
		}))(req, res, next);
	}
});

var err_snippet = { error : "unspecified error" };

// ===============================
// /api/debug
// ===============================

app.get('/api/debug', (req, res) => {
	var now = new Date();
	res.json({
		now : now,
		now_ts : parseInt(now.getTime()/1000),
	});
});

// ===============================
// /api/display
// ===============================

app.get('/api/display', (req, res) => {
	model.display_list(function(err, rows) {
		if (err) {
			res.status(500).json(err_snippet);
		}
		res.json(rows);
	});
});
app.post('/api/display', (req, res) => {
	console.log("creating display serial="+req.body.serial+" description="+req.body.description+" tags="+req.body.tags+" screen_type="+req.body.screen_type);
	model.display_create(req.body.serial, req.body.description, req.body.tags, req.body.screen_type, function(id, err, ret) {
		if (err) {
			res.status(500).json(err_snippet);
		}
		res.json({ "handle" : id });
	});
});
app.get('/api/display/:handle', (req, res) => {
	model.display_get(req.params.handle, function(err, rows) {
		if (err || rows.length == 0) {
			res.status(404).json({ error : "no such display" });
		}
		scheduling.current_schedule(req.params.handle, function(s) {
			rows[0]['schedule'] = s;
			res.json(rows[0]);
		});
	});
});
app.delete('/api/display/:handle', (req, res) => {
	model.display_delete(req.params.handle, function(err, rows) {
		if (err) {
			res.status(404).json({ error : "no such display" });
		}
		res.sendStatus(204);
	});
});
app.put('/api/display/:handle', (req, res) => {
	console.log("updating display handle="+req.params.handle+" to serial="+req.body.serial+" description="+req.body.description + " tags="+req.body.tags+" screen_type="+req.body.screen_type);
	model.display_update(req.params.handle, req.body.serial, req.body.description, req.body.tags, req.body.screen_type, function(err, rows) {
		if (err) {
			res.status(404).json({ error : "no such display" });
		}
		res.sendStatus(204);
	});
});
app.put('/api/display/:handle/image', (req, res) => {
	console.log("installing image handle="+req.body.handle+" for display handle="+req.params.handle);
	model.display_get(req.params.handle, function(err, rows) {
		if (err || rows.length == 0) {
			return res.status(404).json({ error : "no such display" });
		}
		var display = rows[0];
		model.image_get(req.body.handle, function(err, rows) {
			if (err || rows.length == 0) {
				return res.status(404).json({ error : "no such image" });
			}
			var image = rows[0];
			if (display.screen_type != image.screen_type) {
				console.log("screen types do not match (display's="+display.screen_type+" image's="+image.screen_type+")");
				return res.status(400).json({ error : "screen_type mismatch" }).end();
			} else {
				model.display_set_image(display.handle, image.id, function(err, rows) {
					if (err) {
						return res.status(500).json(err_snippet);
					}
					return res.sendStatus(204);
				});
			}
		});
	});
});
app.get('/api/display/:handle/schedule', (req, res) => {
	model.display_get(req.params.handle, function(err, rows) {
		if (err || rows.length == 0) {
			console.log(err);
			return res.status(404).json({ error : 'no such display' });
		}
		model.schedule_list(req.params.handle, undefined, false, function(err, rows) {
			if (err) {
				console.dir(err);
				return res.status(500).json(err_snippet);
			}
			res.json(rows);
		});
	});
});

// ===============================
// /api/schedule
// ===============================

app.get('/api/schedule', (req, res) => {
	model.schedule_list(undefined, undefined, false, function(err, rows) {
		if (err) {
			console.dir(err);
			return res.status(500).json(err_snippet);
		}
		res.json(rows);
	});
});
app.post('/api/schedule', (req, res) => {
	console.log("creating schedule start="+req.body.start+" stop="+req.body.stop+" image_handle="+req.body.image_handle+" display_handle="+req.body.display_handle);
	model.display_get(req.body.display_handle, function(err, rows) {
		if (err || rows.length == 0) {
			return res.status(404).json({ error : "no such display" });
		}
		var display = rows[0];
		model.image_get(req.body.image_handle, function(err, rows) {
			if (err || rows.length == 0) {
				return res.status(404).json({ error : "no such image" });
			}
			var image = rows[0];
			model.schedule_create(display.id, image.id, req.body.start, req.body.stop, function(id, err, rows) {
				if (err) {
					return res.status(500).json(err_snippet);
				}
				res.json({ "handle" : id });
			});
		});
	});
});
app.delete('/api/schedule/:handle', (req, res) => {
	model.schedule_delete(req.params.handle, function(err, rows) {
		if (err) {
			res.status(404).json({ error : "no such schedule" });
		}
		res.sendStatus(204);
	});
});

// ===============================
// /api/image
// ===============================

app.get('/api/image', (req, res) => {
	model.image_list(function(err, rows) {
		if (err) {
			return res.status(500).json(err_snippet);
		}
		res.json(rows);
	});
});
app.post('/api/image', (req, res) => {
	console.log("creating image name="+req.body.name+" description="+req.body.description+" notes="+req.body.notes+" screen_type="+req.body.screen_type);
	model.image_create(req.body.name, req.body.description, req.body.notes, req.body.screen_type, function(id, err, ret) {
		if (err) {
			return res.status(500).json(err_snippet);
		}
		res.json({ "handle" : id });
	});
});

app.get('/api/image/:handle', (req, res) => {
	model.image_get(req.params.handle, function(err, rows) {
		if (err || rows.length == 0) {
			return res.status(404).json({ error : 'no such image' });
		}
		res.json(rows[0]);
	});
});
app.get('/api/image/:handle/original', (req, res) => {
	model.image_get(req.params.handle, function(err, rows) {
		if (err || rows.length == 0 || rows[0].md5.length == 0) {
			return res.status(404).json({ error : 'no such image' });
		}
		var file_path = config.API_PATH_ORIGINAL + path.sep + rows[0].md5;
		res.sendFile(file_path);
	});
});
app.get('/api/image/:handle/processed', (req, res) => {
	model.image_get(req.params.handle, function(err, rows) {
		if (err || rows.length == 0 || rows[0].md5.length == 0) {
			return res.status(404).json({ error : 'no such image' });
		}
		var file_path = config.API_PATH_PROCESSED + path.sep + rows[0].md5;
		res.sendFile(file_path);
	});
});

app.post('/api/image/:handle/original', (req, res) => {
	if (!req.files || !req.files.data) {
		return res.status(400).json({ error : 'malformed input' });
	}
	model.image_get(req.params.handle, function(err, rows) {
		if (err || rows.length == 0) {
			return res.status(404).json({ error : 'no such image' });
		}
		var file = req.files.data;
		var path_original = config.API_PATH_ORIGINAL + path.sep + file.md5;
		var path_processed = config.API_PATH_PROCESSED + path.sep + file.md5;
		file.mv(path_original);
		epaper.image_to_epaper(path_original, path_processed, function(n_bytes) {
			model.image_update_file(req.params.handle, file.md5, file.data.byteLength, n_bytes, function(err, rows) {
				if (err) {
					return res.status(500).json(err_snippet);
				}
				res.sendStatus(204);
			});
		});
	});
});
app.delete('/api/image/:handle', (req, res) => {
	model.image_delete(req.params.handle, function(err, rows) {
		if (err) {
			return res.status(404).json({ error : 'no such image' });
		}
		res.sendStatus(204);
	});
});
app.put('/api/image/:handle', (req, res) => {
	console.log("updating image handle="+req.params.handle+" to name="+req.body.name+" description="+req.body.description+" notes="+req.body.notes+" screen_type="+req.body.screen_type);
	model.image_update(req.params.handle, req.body.name, req.body.description, req.body.notes, req.body.screen_type, function(err, rows) {
		if (err) {
			return res.status(404).json({ error : 'no such image' });
		}
		res.sendStatus(204);
	});
});
app.get('/api/image/:handle/result', (req, res) => {
	model.image_get(req.params.handle, function(err, rows) {
		if (err || rows.length == 0) {
			console.log(err);
			return res.status(404).json({ error : 'no such image' });
		}
		model.result_list_by_image(rows[0].id, function(err, rows) {
			if (err) {
				return res.status(500).json(err_snippet);
			}
			res.json(rows);
		});
	});
});
app.get('/api/image/:handle/schedule', (req, res) => {
	model.image_get(req.params.handle, function(err, rows) {
		if (err || rows.length == 0) {
			console.log(err);
			return res.status(404).json({ error : 'no such image' });
		}
		model.schedule_list(undefined, req.params.handle, false, function(err, rows) {
			if (err) {
				return res.status(500).json(err_snippet);
			}
			res.json(rows);
		});
	});
});

model.connect(function() {
	app.listen(config.PORT, config.HOST);
	console.log("running on " + config.HOST + ":" + config.PORT);
});

// ===============================
// raw tcp pipe
// ===============================

// returns a string containing the supplied integer (in base 10)
// prepended with zeros to length l
//
// feelings towards the seriousness of this language and
// it's place on the server are redacted
function itoa(i, l)
{

	var o = ''+i;
	var pad = l-o.length;
	while (pad--) {
		o = '0' + o;
	}
	return o;

}

function display_new_client(socket)
{

	var inbound = '';
	var peer = socket.address();
	var prefix = peer.address + ':' + peer.port;

	console.log(prefix + " connection up");

	socket.on('data', function(data) {
		inbound += data;
		if (inbound.indexOf('\n') > -1) {
			var fields = inbound.trim().split(',');
			if (fields.length != 3) {
				console.log(prefix + " odd input here: "+inbound);
				socket.end();
			}
			var display_serial = fields[0];
			var image_handle = fields[1];
			var values = fields[2];

			console.log(prefix + " display claiming serial="+display_serial+" image_handle="+image_handle+" values="+values);
			model.display_get_by_serial(display_serial, function(err, rows) {
				if (err || rows.length == 0) {
					// TODO handle
					console.log(prefix + " unknown display!");
					socket.end();
					return;
				}
				var display = rows[0];

				// look up the current schedule
				scheduling.current_schedule(display.handle, function(sched) {
					var image_handle_sending = undefined;
					var seconds_left = undefined;
					if (sched) {
						// there's an active schedule, take its image
						image_handle_sending = sched.schedule.image_handle;
						seconds_left = sched.seconds_left;
						console.log(prefix + " active schedule handle="+sched.schedule.handle+", taking schedule's image_handle="+image_handle_sending+" and seconds_left="+seconds_left);
					} else {
						// no active schedule, take default image
						image_handle_sending = display.image_handle;
						seconds_left = 3600*12;
						console.log(prefix + " no active schedule, taking default image_handle="+image_handle_sending+" and seconds_left="+seconds_left);
					}
					// look up the current image and send it
					model.image_get(image_handle_sending, function(err, rows) {
						if (err || rows.length == 0) {
							// whoops, we have nothing ready for this display, send it packing
							console.log(prefix + " did not find image to send to display!");
							socket.end();
							return;
						} else {
							// we know what to send, dish it out
							var image_next = rows[0];
							var file_path = config.API_PATH_PROCESSED + path.sep + image_next.md5;
							var file_data = fs.readFileSync(file_path);
							if ((image_handle == image_handle_sending) && !config.API_RESEND_IDENTICAL_IMAGE) {
								console.log(prefix + " not sending image that the display already has");
								socket.write(image_next.handle + ',' + itoa(seconds_left, 10) + ',', function() { socket.end(); });
							} else {
								console.log(prefix + " sending new image handle="+image_next.handle);
								socket.write(image_next.handle + ',' + itoa(seconds_left, 10) + ',', function() {
									socket.write(file_data, function() {
										console.log(prefix + " sent " + file_data.byteLength + " bytes.");
										socket.end();
									});
								});
							}
						}
					});
				});

				// look up what image it has result for and save
				model.image_get(image_handle, function(err, rows) {
					if (err || rows.length == 0) {
						// displaycould well be running an unknown image to us, don't save the results here
						console.log(prefix + " could not find image handle running on display, ignoring results");
					} else {
						var image = rows[0];
						model.result_create(display.id, image.id, values, function(err, rows) {
							if (err) {
								// TODO handle
								console.log(prefix + " could not save result!");
								socket.end();
								return;
							}
							console.log(prefix + " added result "+values+" for display serial="+display_serial+" and image handle="+image_handle);
						});
					}
				});

				// mark it as seen
				model.display_mark_seen(display.handle, function(err, rows) {
				});
			});
		}
	});

	socket.on('end', function() {
		console.log(prefix + " connection down");
	});

}

var display_server = net.createServer(display_new_client).listen(config.PORT_DISPLAY);

process.on('uncaughtException', function(err) {
	console.log("EXCEPTION: ",err.message);
});
