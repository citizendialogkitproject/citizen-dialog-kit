// EPD.h
// support for Waveshare's 7.5" red-black epaper display,
// based on the information on their wiki at
//   https://www.waveshare.com/wiki/7.5inch_e-Paper_HAT_(B)
// but rewritten for simplicity
// Copyright (c) 2018, Jef Van den broeck, for KU Leuven (Research[x]Design)
#define EPD_PIN_DIN     A5  // out, spi data from master to slave (mosi)
#define EPD_PIN_CLK     A3  // out, spi clock
#define EPD_PIN_CS      A2  // out, chip select
#define EPD_PIN_DC      D0  // out, data or command
#define EPD_PIN_RST     D1  // out, reset display
#define EPD_PIN_BUSY    D2  // in, display busy

#define EPD_WIDTH   640
#define EPD_HEIGHT  384

#define EPD_CMD_PANEL_SETTING                   0x00
#define EPD_CMD_POWER_SETTING                   0x01
#define EPD_CMD_POWER_ON                        0x04
#define EPD_CMD_BOOSTER_SOFT_START              0x06
#define EPD_CMD_DATA_START_TRANSMISSION_1       0x10
#define EPD_CMD_DISPLAY_REFRESH                 0x12
#define EPD_CMD_PLL_CONTROL                     0x30
#define EPD_CMD_TEMPERATURE_CALIBRATION         0x41
#define EPD_CMD_VCOM_AND_DATA_INTERVAL_SETTING  0x50
#define EPD_CMD_TCON_SETTING                    0x60
#define EPD_CMD_TCON_RESOLUTION                 0x61
#define EPD_CMD_VCM_DC_SETTING                  0x82
#define EPD_CMD_FLASH_MODE                      0xe5    // i think, from comment in arduino code

#define EPD_COLOR_WHITE     0x3
#define EPD_COLOR_BLACK     0x0
#define EPD_COLOR_RED       0x4

inline void epd_sendByte(unsigned char b);
void epd_sendCommand(unsigned char b);
void epd_sendData(unsigned char b);
void epd_reset(void);
void epd_image_start(void);
void epd_image_add(unsigned char b);
void epd_image_end(void);
void epd_wait(void);
void epd_init(void);
