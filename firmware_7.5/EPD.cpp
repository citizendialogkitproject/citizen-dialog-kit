// EPD.cpp
// support for Waveshare's 7.5" red-black epaper display,
// based on the information on their wiki at
//   https://www.waveshare.com/wiki/7.5inch_e-Paper_HAT_(B)
// but rewritten for simplicity
// Copyright (c) 2018, Jef Van den broeck, for KU Leuven (Research[x]Design)
#include "application.h"
#include "EPD.h"

inline void epd_sendByte(unsigned char b)
{

    digitalWrite(EPD_PIN_CS, LOW);
    SPI.transfer(b);
    digitalWrite(EPD_PIN_CS, HIGH);

}
void epd_sendCommand(unsigned char b)
{

    digitalWrite(EPD_PIN_DC, LOW);
    epd_sendByte(b);

}
void epd_sendData(unsigned char b)
{

    digitalWrite(EPD_PIN_DC, HIGH);
    epd_sendByte(b);

}

void epd_reset(void)
{

    digitalWrite(EPD_PIN_RST, LOW);
    delay(200);
    digitalWrite(EPD_PIN_RST, HIGH);
    delay(200);

}

// call sequence for blitting an image (can't do other epd_*() stuff in between):
//  1) epd_image_start();           // starts transfer
//  2) epd_image_add(two_pixels);   // ((EPD_WIDTH*EPD_HEIGHT)/2) times
//  3) epd_image_end();             // starts blitting
void epd_image_start(void)
{

    epd_sendCommand(EPD_CMD_DATA_START_TRANSMISSION_1);

}

// b is two pixels, with each nibble;
//  0x0: black pixel
//  0x3: white pixel
//  0x4: red pixel
void epd_image_add(unsigned char b)
{

    epd_sendData(b);

}
void epd_image_end(void)
{

    epd_sendCommand(EPD_CMD_DISPLAY_REFRESH);
    delay(100);
    epd_wait();

}
void epd_wait(void)
{
    while (digitalRead(EPD_PIN_BUSY) == 0)
        delay(50);

}

void epd_init(void)
{

    pinMode(EPD_PIN_CS, OUTPUT);
    pinMode(EPD_PIN_DC, OUTPUT);
    pinMode(EPD_PIN_RST, OUTPUT);
    pinMode(EPD_PIN_BUSY, INPUT);

    // arduino code does a begintransaction(spisettings(...); begin()
    SPI.begin(EPD_PIN_CS);
    SPI.setBitOrder(MSBFIRST);
    SPI.setClockSpeed(2000000);
    SPI.setDataMode(SPI_MODE0);

    epd_reset();

    epd_sendCommand(EPD_CMD_POWER_SETTING);
    epd_sendData(0x37);
    epd_sendData(0x00);
    epd_sendCommand(EPD_CMD_PANEL_SETTING);
    epd_sendData(0xcf);
    epd_sendData(0x08);
    epd_sendCommand(EPD_CMD_BOOSTER_SOFT_START);
    epd_sendData(0xc7);
    epd_sendData(0xcc);
    epd_sendData(0x28);
    epd_sendCommand(EPD_CMD_POWER_ON);
    epd_wait();
    epd_sendCommand(EPD_CMD_PLL_CONTROL);
    epd_sendData(0x3c);
    epd_sendCommand(EPD_CMD_TEMPERATURE_CALIBRATION);
    epd_sendData(0x00);
    epd_sendCommand(EPD_CMD_VCOM_AND_DATA_INTERVAL_SETTING);
    epd_sendData(0x77);
    epd_sendCommand(EPD_CMD_TCON_SETTING);
    epd_sendData(0x22);
    epd_sendCommand(EPD_CMD_TCON_RESOLUTION);
    epd_sendData(EPD_WIDTH>>8);
    epd_sendData(EPD_WIDTH & 0xff);
    epd_sendData(EPD_HEIGHT>>8);
    epd_sendData(EPD_HEIGHT & 0xff);
    epd_sendCommand(EPD_CMD_VCM_DC_SETTING);
    epd_sendData(0x1e);
    epd_sendCommand(EPD_CMD_FLASH_MODE);
    epd_sendData(0x03);

}
