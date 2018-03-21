// beep.cpp
// simple PWM beeps
// Copyright (c) 2018, Jef Van den broeck, for KU Leuven (Research[x]Design).
#include "application.h"
#include "beep.h"

void beep_ack(void) {
    
    tone(TONE_PIN, 440, 100);
    delay(125);
    tone(TONE_PIN, 880, 100);
    delay(125);
    tone(TONE_PIN, 1660, 200);
    delay(200);
    
}

void beep_refresh(void) {
    
    tone(TONE_PIN, 880, 100);
    delay(125);
    tone(TONE_PIN, 440, 300);
    delay(300);
    
}
