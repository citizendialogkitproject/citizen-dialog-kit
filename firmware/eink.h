// eink.cpp
// parser for a simple yet compact image format
// Copyright (c) 2018, Jef Van den broeck, for KU Leuven (Research[x]Design).
#define EINK_COLOR_WHITE    0x0
#define EINK_COLOR_BLACK    0x1
#define EINK_COLOR_RED      0x2

void eink_blit(const unsigned char* bytes, unsigned int length);
