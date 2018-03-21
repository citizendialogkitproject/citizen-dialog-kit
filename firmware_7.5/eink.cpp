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

    Serial.println("starting start");
    epd_image_start();
    Serial.println("done start");

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
            case EINK_COLOR_WHITE:
                color = 0x3;
                break;
            case EINK_COLOR_BLACK:
                color = 0x0;
                break;
            case EINK_COLOR_RED:
                color = 0x4;
                break;
        }

        // repeat the pixel, but take care to always write in twos
        for (int j = 0; j < n; j++) {
            if ((total % 2) == 0) {
                // even pixel, shift high
                pack = color << 4;
            } else {
                // uneven pixel, dump together with previously shifted-high pixel
                pack |= color;
                epd_image_add(pack);
            }
            total++;
        }
    }

    Serial.println("starting end");

    epd_image_end();
    Serial.println("done end");


}
