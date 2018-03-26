# Citizen Dialog Kit

## Introduction
Citizen Dialog Kit is a tool kit developed by Research[x]Design (KU Leuven University) to enable citizens and cities to create and deploy public data visualizations to address urban issues.

The inspiration behind the project is the increasing amount of open data and citizen science initiatives, but a lack of tools for sharing that data in the context where it's most relevant: the streets and the neighborhood.

Use this tool kit to build and deploy impactful public displays to start conversations about the topics you care about most.

## Versions
The Citizen Dialog Kit is still in development and important features (such as scheduling) are not supported yet. Updates to come.

## Documentation
1. [Hardware Assembly and Firmware Installation](#1-hardware-and-firmware)
2. [Server Setup](#2-server-setup)
3. [Display Management API](#3-display-management-api)
4. [Display Management Demo Front-end](#4-display-management-demo)
5. [Weather Resistant Casing](#5-weather-resistant-casing)

### 1. Hardware and Firmware
#### Required parts;
- [ ] 1x Particle.io Electron (with accessories)
- [ ] 1x Waveshare 7.5inch white/black/red epaper display
- [ ] (recommended) 1x bundle of male/male “dupont cables” in various colors
- [ ] 2x small breadboards (or 1x large)
- [ ] 5x momentary buttons
- [ ] 5x 22kOhm resistors (red/red/orange) (exact value depends on button type)
- [ ] (optional) 1x piezo buzzer
- [ ] (optional) 1x 120Ohm resistor (brown/red/brown) (exact value depends on piezo buzzer type)

#### Setup the Electron
This process is for 7.5" display but is identical for other SPI e-ink displays from the same manufacturer.

Set up the Electron following it’s supplied documentation. This implies creating an account on their website (https://particle.io) and registering the product and SIM card. Note, registering the SIM may take a few attempts, because such annoyances seem necessary when dealing with telecommunication carriers.

The outcome of this should be an Electron fully set up with antenna, SIM and battery. You can attach the battery and have it connected with USB to your computer at the same time (this also charges the battery). The RGB led should be “breathing” cyan/white, meaning it’s connected to the internet and ready to go.

One last step here is to make sure that the base firmware (as supplied by Particle.io) is updated to a newer version. My unit came with 0.4.8 which contained some problems, these were alleviated by upgrading to 0.6.4. Do this as described in the section “THE SIMPLE WAY (ONE CLI COMMAND)” as described on the following URL (this required me to install the Particle.io software suite): https://docs.particle.io/support/troubleshooting/firmware-upgrades/electron/ .

#### Setup the display

Assemble the display as it appears on the photo on the Waveshare wiki page linked below. Please be very careful with the ribbon cable and the connectors, the connectors have plastic “lips” which should be carefully pulled away a few millimeters from the connectors themselves, after which the ribbon cable can be inserted without trouble. Press the lip back into the connector to keep the cable in place.

The wiki page is at https://www.waveshare.com/wiki/7.5inch_e-Paper_HAT_(B) .

The jumpers on the supplied “e-Paper HAT” were placed correctly on my unit:
“Display Config” set to “B” (right)
“Interface Config” set to “0” (right)

#### Connect display to Electron

(Please unplug the Electron from the battery and any USB cables before wiring up anything.)

This is straightforward, use the supplied bundle of cables with the white connector connecting to the “e-Paper HAT”, and extended these with standard “Dupont cables” (with the same colors) to plug them into the breadboard (on which the Electron was plugged in). The breadboard isn’t necessary, one can also just connect the supplied bundle of cables directly to the relevant pins of the Electron. But the breadboard becomes needed later on when connecting buttons etc.

The pin mapping is as follows. On the left are the pins of the Electron (they are labeled on the top as well as on the side of the Electron, or one can use the supplied graphic cardboard). On the right are the pins on the white connector on the “e-Paper HAT”. In between is the color of the cables (please check!).

* 3V3 - red - 3V3
* GND - black - GND
* A5 - blue - DIN
* A3 - yellow - CLK
* A2 - orange - CS
* D0 - green - DC
* D1 - white - RST
* D2 - purple - BUSY

#### Connect the buttons

The five buttons (A to E) are connected to pins C0 to C4 respectively, each in a pulldown configuration with external pulldown resistors. This means that each button looks like this:
One side of the button is connected to the Electron’s 3V3.
The other side of the button is connected to one side of a resistor (22kOhm in my case).
The other side of that resistor is connected to the Electron’s GND.
Where the button meets the resistor, a junction is made to the relevant input pin on the Electron for that button (C0, C1, C2, C3, C4).

This is visualized in the second of the two examples on this page (please follow it carefully): https://playground.arduino.cc/CommonTopics/PullUpDownResistor .

The resistor value needs to be quite high, because if it was low a short circuit between 3V3 and GND would be made when pressing the button (which is bad). In my test setup (using very small push buttons), 22kOhm (color code red/red/orange) worked.

#### Connect the piezo buzzer

The Piezo buzzer’s black lead can be connected to the Electron’s GND pin. The red lead can be connected to a resistor which in turn is connected to the Electron’s B0 pin. The specific value of the resistor depends on what the piezo buzzer requires. In my case, a 120Ohm (brown/red/brown) was sufficient.

For a visualisation, please look at the circuit diagram at http://www.instructables.com/id/How-to-use-a-Buzzer-Arduino-Tutorial/ .

#### Flash the software on the Electron

The link below should take you to your own IDE at the particle.io website. From there on you should be able to compile it and flash it to your device. The device needs to be powered on and connected (RGB led breathing cyan/white) for that to happen. Pressing lightning-bolt symbol on the upper left of the IDE will ask you if you really want to flash it over the air (OTA). You can also choose to flash it via USB, the needed documentation to do that is referenced on that screen. You can choose OTA, a single flash doesn’t consume that much data (please defer to flashing over USB if you plan to flash a lot). The RGB led will turn purple when flashing, and then the device will restart and after a while again breathe cyan/white. The software is running at that point.

Some notes on that particular version of the software;
Upon starting it will play the “refresh” jingle on the piezo buzzer (100ms of 880hz, 300ms of 440hz), and perform a single download and display cycle.
Upon button presses it will play the “button” jingle on the piezo buzzer (100ms of 440hz, 100ms of 880hz, 200ms of 1660hz) (which are chord variations of the A note, by the way). It will remember the number of times the corresponding button was pressed, but not communicate that to the server yet.
When buttons B and D are pressed (connected to C1 and C3 of the Electron respectively), it will play the “refresh” jingle and start a new download/display cycle.

Some notes in using the Electron:
Watch your data usage! The console on the particle.io site will tell you how much data you’ve used.
If you installed the commandline tools (which were needed to upgrade the Electron to a recent version of base firmware), you can run “particle serial monitor” on a commandline to watch serial output. The software writes some debugging information to it’s serial output.
Think it crashed? Press the RESET button on the Electron itself.

### 2. Server Setup
#### Overview

The API backend is supplied as a set of docker containers with a docker-compose file to orchestrate them.

Three containers are present:
"web" contains the webserver (a standard nginx installation) which can serve HTTP and HTTPS calls and will forward API calls (starting with "/api") to the API container
This webserver can also serve any static content you might want to add
"db" contains a standard MySQL database used as the API's datastore
"api" contains the API server (written in Node.js)

On a machine equiped with docker-compose, the entire stack can be brought up with a "docker-compose up". Please look at the docker-compose docs for your version for more information.

Furthermore, it provides some niceties for configuration and backups.

#### Configuration

The "docker-compose.yml" file contains all the usual port bindings, please edit these if you'd like to run the containers on non-standard ports. Please refer to the docker-compose docs of your version for specifics.

There is a central configuration file called "env" at the root of the project, it can be edited (don't forget a docker-compose restart!) and contains the following keys:


* MYSQL_{ROOT_PASSWORD,DATABASE,USER,PASSWORD}; used by the "api" container to talk to the "db" container (and by the "db" container itself upon first run, to create the necessary database and user etc).
* API_PATH_{ORIGINAL,PROCESSED}; used by the "api" container to determine where to store its image files (the default location points to a volume set in "docker-compose.yml" for easy backups).
* API_PIXEL_THRESHOLD; a 0-255 value used by the API when transcoding images to the display format, basically the pixel value threshold used to decide if a pixel is black or red or white.
* API_ADMIN_PASSWORD; the password for the "admin" user in non-GET API calls.
* API_RESEND_IDENTICAL_IMAGE; "true" or "false", when a display comes looking for a new image but the new image is the same as the old one, it will not send the display the image again if this flag is set to "true" (but will otherwise).

#### Backups

Backups come in two parts:

The database contents, via the scripts detailed below.
The image files themselves, in the default config they are present in the "/api/files" folder which can simply be zipped.
If you change the API_PATH_* configuration, be sure to update "docker-compose.yml" to match so the files can be reached from outside the container!

In the "/scripts" folder there are a few scripts which facilitate backups:
"db_backup.sh" will enter the "db" container and dump a backup to it's internal "/backups" directory, which is exposed to the host (via "docker-compose.yml") to the "/db/backups" directory. It returns the full path of the resulting backup file as it's last line of output.
This script can be cronned.
"db_restore.sh" will restore a backup file (made with "db_backup.sh") from the "/db/backups" directory. Simply drop a backup in there and pass it's filename as the argument to "db_restore.sh".

#### Misc

The "/scripts/db_shell.sh" script instantly calls up a mysql prompt in the "db" container.

The "db" container has (via "docker-compose.yml") its internal "/var/lib/mysql" directory (where it keeps its actual data) mapped to the host as "/db/contents". To entirely remove the database and force creation of a new empty database, one can stop the "db" container, remove all files within this directory, and re-start the "db" container. Please do not do this for production data.

### 3. Display Management API
#### Overview

The API for the PROJECT deals primarily in three types of data:
displays; the physical displays which can connect to the backend to download images and report user input about those images
images; graphical images to be shown on the device
results; the user input accepted by the displays when showing an image

For displays and images, the API provides Create/Read/Update/Delete calls allowing API clients to fully manage their details. The results however are generated by the API backend itself and can only be viewed by API clients.

The API is a standard HTTP REST API which speaks JSON, reverting to multipart/form-data for binary data submission.

All data entities in the API (displays, images, results) are referenced by their "handle", which is a UUIDv4 generated by the API server at that entry's creation.

#### Security

The API should be accessed with TLS (HTTPS), but can be configured to be accessed with plain HTTP for development purposes.

In the spirit of the project, all GET calls can be accessed without authentication (subject to change). All other calls however (which update the database contents) are protected with HTTP Basic authentication (username 'admin', password configurable but by default 'flotilla').

#### Notes

Where timestamps are used, timestamps are in ISO 8061 format (UTC).

All API calls return a 2xx-ranged status when successf ul, a 4xx-ranged status when given bad input, and a 5xx-ranged status upon internal error. Errors generated by the API will contain a JSON blob with the error message:
{
  "error" : <string>
}

#### Displays

Displays can be created/read/updated/deleted by API clients. They have the following recurring fields:
serial; the actual serial number of the display (used to determine which display is contacting the server)
handle; UUIDv4 used for referencing to this display in API calls
description; a free-form description of this display
screen_type; a free-form description of it's screen type
the display can only accept images with a matching screen_type
created_at; timestamp detailing when this display was first created
last_seen_at; timestamp detailing when the display last logged into the backend
image_handle; handle of the image currently assigned to this display (can be null if none has been assigned yet)

GET /api/display lists displays, returns a JSON list of objects detailing all displays known in the backend, each object having the fields detailed above.

POST /api/display creates a display, it expects a JSON object with the necessary fields and returns a JSON object containing the resulting handle of this newly created display. In detail, it expects:
{
  "serial" : <string>,
  "description" : <string>,
  "screen_type" : <string>
}
And returns:
{
  "handle" : <string>
}

GET /api/display/<handle> returns a single JSON object with fields as described above, relevant for the referenced display.

DELETE /api/display/<handle> deletes the referenced display. All other entities which reference to this display will have their reference set to null.

PUT /api/display/<handle> updates a display, it expects a JSON object:
{
  "serial" : <string>,
  "description" : <string>,
  "screen_type" : <string>
}
Please note that all of these fields need to be supplied, and the display will be updated with all of them.

PUT /api/display/<handle>/image is used to bind an image to a display, which will be downloaded by the display on it's next connection to the backend. It expects a JSON object containing only the handle of the image to display:
{
  "handle" : <string>
}
This call returns a special error message in the case that the referenced image is not of the same screen_type as the display (with status code 400):
{
  "error" : "screen_type mismatch"
}

#### Images

Images can be created/retrieved/updated/deleted by API clients. They have the following recurring fields:
name; a user-friendly name for this image (not used by the system itself)
handle; UUIDv4 used for referencing to this image in API calls
description; a free-form description of this image
screen_type; a free-form description of it's screen type
the image can only be bound to displays with the same screen_type
created_at; timestamp detailing when this image was first created
md5; an md5 checksum of the image's contents, once uploaded
bytes_original; size in bytes of the image's original contents, once uploaded
bytes_processed; size in bytes of the image's processed contents, once uploaded
the processed image is the one sent to the display in a format it can understand

Image creation follows two steps;
Creation of the entity with an API call
Uploading of image contents with another API call

GET /api/image lists images, returns a JSON list of objects detailing all images known in the backend, each object having the fields detailed above (except the md5, bytes_original and bytes_processed fields).

POST /api/image creates an image, it expects a JSON object with the necessary fields and returns a JSON object containing the resulting handle of this newly created image. In detail, it expects:
{
  "name" : <string>,
  "description" : <string>,
  "screen_type" : <string>
}
And returns:
{
  "handle" : <string>
}

POST /api/image/<handle>/original is used to upload the image contents. It does *not* expect JSON, yet follows the normal multipart/form-data method. It expects a single file with "data" as the field name.

GET /api/image/<handle> returns a single JSON object with fields as described above (including md5, bytes_original and bytes_processed) relevant for the referenced image.

GET /api/image/<handle>/original is used to download the original image contents. It does not return JSON, just the binary image data as one would expect for a file download. Only available after image contents have been uploaded via the API.

GET /api/image/<handle>/processed is used to download the processed (for use by the display) image contents. It does not return JSON, just the binary image data as one would expect for a file download. Only available after image contents have been uploaded via the API.

DELETE /api/image/<handle> deletes the referenced image. All other entities which reference to this image will have their reference set to null.

PUT /api/image/<handle> updates an image, it expects a JSON object:
{
  "name" : <string>,
  "description" : <string>,
  "screen_type" : <string>
}
Please note that all of these fields need to be supplied, and the image will be updated with all of them.

#### Results

Results have no full-fledged Create/Read/Update/Delete semantics as in the case of displays and images. Instead, they are created by the backend itself and immutable from the perspective of the API clients.

Since results represent interactions by people near the display, they are logically bound to the image being displayed at the time of those interactions. The API reflects this and lists results based on a given image.

GET /api/image/<handle>/result returns all results received from displays by the backend which are relevant for this image. It returns a JSON list of objects in the following layout;
[
  {
    "handle" : <string>, // this result's handle
    "created_at" : <string>,
    "image_handle" : <string>,
    "display_handle" : <string>,  // the display uploading this result
    "value" : <string>  // the actual uploaded result values
  },
  ...
]
The results are ordered by their created_at timestamp in a descending order (newest first).

The value field here is the raw data supplied by the display. At the time of writing, it contains a string of the following format:
"0=XXXX|1=XXXX|2=XXXX|3=XXXX|4=XXXX"
Where the 0 till 4 indices are the buttons on the display, and the XXXX's are the number of times that button has been pressed (zero-padded to four digits).

### 4. Display Management Demo
A demo front-end application is added to the repository to demonstrate display management using the API. Will be updated as features are added to the API.

** SECURITY**
This demo has passwords in the open. Use a solution like [nginx basic authentication](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication/) to protect the sensitive information.

### 5. Weather Resistant Casing
Designs for easy laser cutter casing manufacturing and assembly will be shared soon.
