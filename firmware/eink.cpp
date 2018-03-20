// eink.cpp
// parser for a simple yet compact image format
// Copyright (c) 2018, Jef Van den broeck, for KU Leuven (Research[x]Design).
#include "application.h"
#include "EPD.h"
#include "eink.h"

void eink_blit(const unsigned char* bytes, unsigned int length)
{

    /*
     * image format;
     * each byte has the following format;
     *   CCMMNNNN
     * where;
     *   CC = color (0 white, 1 black, 2 red)
     *   MM = bytes used for N (currently 0 or 1)
     *   NNNN = number of pixel repetitions
     * if MM == 0x01, the NNNN is shifted up by 8 bits and ORred with the full
     * next byte, resulting in a max number of 0x0fff pixels repeated
     */

    int total = 0;
    unsigned char pack = 0;

    Serial.println("starting black");
    epd_image_start_black();

    // waveshare 4.5inch display wants a full run of black pixels first, then a
    // run for red pixels
    
    // run for black pixels
    for (unsigned int i = 0; i < length; i++) {
        unsigned char what = bytes[i];
        unsigned char color = what >> 6;
        unsigned char more_bytes = (what >> 4) & 0x03;
        unsigned short n = what & 0x0f;

        // check if we need to read a byte more
        if (more_bytes == 1) {
            n = n << 8;
            n |= bytes[++i];
        }

        // map file color to display color
        switch (what >> 6) {
            case EINK_COLOR_RED:
            case EINK_COLOR_WHITE:
                color = 0x1;
                break;
            case EINK_COLOR_BLACK:
                color = 0x0;
                break;
        }

        // repeat the pixel, but take care to always write in blocks of 8
        for (int j = 0; j < n; j++) {
            
            // shift in this pixel
            pack = pack << 1;
            pack |= color;
            total++;
            
            if ((total % 8) == 0) {
                // we've packed 8 pixels, send them to display memory
                epd_image_add(pack);
            }
        }
    }

    total = 0;
    pack = 0;

    Serial.println("starting red");
    epd_image_start_red();

    // run again for red pixels
    for (unsigned int i = 0; i < length; i++) {
        unsigned char what = bytes[i];
        unsigned char color = what >> 6;
        unsigned char more_bytes = (what >> 4) & 0x03;
        unsigned short n = what & 0x0f;

        // check if we need to read a byte more
        if (more_bytes == 1) {
            n = n << 8;
            n |= bytes[++i];
        }

        // map file color to display color
        switch (what >> 6) {
            case EINK_COLOR_BLACK:
            case EINK_COLOR_WHITE:
                color = 0x1;
                break;
            case EINK_COLOR_RED:
                color = 0x0;
                break;
        }

        // repeat the pixel, but take care to always write in blocks of 8
        for (int j = 0; j < n; j++) {
            
            // shift in this pixel
            pack = pack << 1;
            pack |= color;
            total++;
            
            if ((total % 8) == 0) {
                // we've packed 8 pixels, send them to display memory
                epd_image_add(pack);
            }
        }
    }

    epd_image_end();

    Serial.println("done");

}
