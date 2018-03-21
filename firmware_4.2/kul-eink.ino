// kul-eink.ino
// main logic for the Particle.io Electron implementation of the Citizen Dialogue Kit
// Copyright (c) 2018, Jef Van den broeck, for KU Leuven (Research[x]Design).
#include "buttons.h"
#include "EPD.h"
#include "eink.h"
#include "beep.h"

// fit to match
#define TALK_PORT               54321   // TCP port on which server listens
uint8_t server[] = { 51, 255, 71, 30 }; // IP of server

#define TALK_MAXWAIT            20
#define TALK_IMAGE_HANDLE_LEN   36
// EEPROM offset of current image handle
#define EEPROM_ADDR_IMAGE_HANDLE    0
// start powersaving (turning off modem) when it's been this many
// millisecs since last_powerburn
#define POWERSAVING_FROM_MILLIS     (1000*60*5)
int powersaving = 0;
unsigned long last_powerburn = 0;
// do a refresh is it's been this many millisecs ago since last_refresh
#define REFRESH_FROM_MILLIS         (1000*60*60*12)
// if we can't talk to the server, wait this long before trying again
#define REFRESH_BACKOFF_MILLIS      (1000*60*5)
unsigned long last_refresh = 0;
TCPClient tcpclient;
#define BUFFER_LEN      1024*32
uint8_t buffer[BUFFER_LEN];
int buffer_len = 0;

int refresh(void)
{

    String device_id = System.deviceID();
    String button_presses = buttons_to_string();
    char image_handle[TALK_IMAGE_HANDLE_LEN + 1];

    // load up the currently showing image handle from EEPROM
    EEPROM.get(EEPROM_ADDR_IMAGE_HANDLE, image_handle);

    // assemble our introduction to the server; "SERIAL,CURRENT_IMAGE_HANDLE,BUTTON_STATE\n"
    String introduction = String(device_id + "," + image_handle + "," + button_presses + "\n");

    // note that we're burning some power here
    last_powerburn = millis();
    powersaving = 0;

    Serial.println("bringing up link");
    Cellular.on();
    Cellular.connect();
    while (!Cellular.ready()) {
        Serial.println("waiting on link...");
        delay(1000);
    }
    if (!tcpclient.connect(server, TALK_PORT)) {
        goto fail;
    }
    Serial.println("connected!");

    // send over our introduction
    tcpclient.write(introduction);

    // wait until bytes are available
    for (int i = 0;; i++) {
        if (i >= TALK_MAXWAIT)
            goto fail;
        if (tcpclient.available())
            break;
        delay(250);
    }

    buffer_len = 0;
    while (tcpclient.available()) {
        Serial.print(".");
        int nread = tcpclient.read(buffer + buffer_len, BUFFER_LEN - buffer_len);
        if (nread == -1)
            break;
        buffer_len += nread;
    }

    Serial.println();
    Serial.println("total;");
    Serial.println(buffer_len);

    tcpclient.stop();

    if (buffer_len <= TALK_IMAGE_HANDLE_LEN) {
        // not enough data for the image handle?
        goto fail;
    }

    if (buffer_len > (TALK_IMAGE_HANDLE_LEN + 1)) {
        Serial.println("image data received, updating display");

        // save the new image handle
        memcpy(image_handle, buffer, TALK_IMAGE_HANDLE_LEN);
        image_handle[TALK_IMAGE_HANDLE_LEN] = 0;
        EEPROM.put(EEPROM_ADDR_IMAGE_HANDLE, image_handle);

        // blit the new image, in the buffer right after the handle and separator
        eink_blit(buffer + TALK_IMAGE_HANDLE_LEN + 1, buffer_len - TALK_IMAGE_HANDLE_LEN - 1);
    } else {
        Serial.println("did not receive image data, not blitting");
    }

    Serial.println("resetting button presses");
    buttons_reset();

    if (powersaving) {
        // loop()'ll flip on powersaving if we've been running long enough, but if
        // we're not there yet then don't do it here, user might want to flash
        Serial.println("bringing down link");
        Cellular.off();
    }

    last_refresh = millis();

    return 1;

fail:
    Serial.println("something went wrong there, retrying soon");
    last_refresh += REFRESH_BACKOFF_MILLIS;
    tcpclient.stop();
    return 0;

}

void setup() {

    Serial.begin(9600);
    Serial.println("booting...");

    epd_init();

    buttons_setup();

    pinMode(TONE_PIN, OUTPUT);

    Serial.println("booted.");

}

void loop() {

    int avail = 0;
    unsigned long now = millis();

    if (buttons_pressed) {
        // translate interrupt state to totals or special actions

        if (buttons[BUTTON_C] && buttons[BUTTON_E]) {
            Serial.println("special key sequence noticed, starting manual refresh");
            beep_refresh();
            refresh();
        } else {
            // standard button press, ack and add to totals
            beep_ack();
            buttons_tally();
            Serial.println(buttons_to_string());
        }

        // blank interrupt state
        buttons_clear();

    }

    // see if we've been running long enough to enter powersaving mode already,
    // this gives the user a chance to flash the device
    if (!powersaving) {
        if (abs(now - last_powerburn) > POWERSAVING_FROM_MILLIS) {
            LEDStatus led;
            Serial.println("entering powersaving mode");
            Cellular.off();
            led.off();
            powersaving = 1;
        }
    }

    // see if we need to do a refresh
    if (abs(now - last_refresh) > REFRESH_FROM_MILLIS) {
        Serial.println("starting timed refresh");
        refresh();
    }

    delay(1000);

}
