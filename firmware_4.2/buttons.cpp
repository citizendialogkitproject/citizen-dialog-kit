// buttons.cpp
// button handling
// Copyright (c) 2018, Jef Van den broeck, for KU Leuven (Research[x]Design).
#include "application.h"
#include "buttons.h"

// global count incremented by each button interrupt, used to check for activity
volatile unsigned char buttons_pressed = 0;
// per-button count incremented by each button interrupt
volatile unsigned char buttons[N_BUTTONS] = { 0, 0, 0, 0, 0 };
// per-button timestamp to implement a backoff timer
volatile unsigned long buttons_last_pressed[N_BUTTONS] = { 0, 0, 0, 0, 0 };
// per-button tally of presses, the "actual presses"
int button_presses[N_BUTTONS] = { 0, 0, 0, 0, 0 };

// return button state as a string "0=XXXX|1=XXXX|2=XXXX"
// (for N_BUTTONS) where XXXX is that button's presses
String buttons_to_string(void)
{
    
    char line[N_BUTTONS*(1+1+4) + (N_BUTTONS-1)*(1) + 1];
    
    for (int i = 0; i < N_BUTTONS; i++) {
        int offset = i*6 + i; // i elements and separators
        
        sprintf(line+offset, "%1d=%04d", i, button_presses[i]);
        
        if (i < (N_BUTTONS-1)) {
            // separator right after this button, except if it's
            // the last one (which handily overwrites all the non-
            // last zero bytes)
            line[(i+1)*6+i] = '|';
        }
    }
    
    return String(line);
    
}

// interrupt handlers, all follow the same pattern
void button_press_a(void)
{
    unsigned long now = millis();
    
    // if we haven't passed this button's ignore time, don't register
    if (now < (buttons_last_pressed[BUTTON_A] + BUTTON_IGNORE_TIME)) {
        return;
    }
    buttons_last_pressed[BUTTON_A] = now;

    // read the pin for BUTTON_N_READS, debounce measure
    for (int i = 0; i < BUTTON_N_READS; i++) {
        if (!digitalRead(BUTTON_PIN_A))
            return;
    }
    
    // increment the global count and this button's count
    buttons_pressed++;
    buttons[BUTTON_A]++;
}
void button_press_b(void)
{
    unsigned long now = millis();
    if (now < (buttons_last_pressed[BUTTON_B] + BUTTON_IGNORE_TIME)) {
        return;
    }
    buttons_last_pressed[BUTTON_B] = now;

    for (int i = 0; i < BUTTON_N_READS; i++) {
        if (!digitalRead(BUTTON_PIN_B))
            return;
    }
    buttons_pressed++;
    buttons[BUTTON_B]++;
}
void button_press_c(void)
{
    unsigned long now = millis();
    if (now < (buttons_last_pressed[BUTTON_C] + BUTTON_IGNORE_TIME)) {
        return;
    }
    buttons_last_pressed[BUTTON_C] = now;
    
    for (int i = 0; i < BUTTON_N_READS; i++) {
        if (!digitalRead(BUTTON_PIN_C))
            return;
    }
    buttons_pressed++;
    buttons[BUTTON_C]++;
}
void button_press_d(void)
{
    unsigned long now = millis();
    if (now < (buttons_last_pressed[BUTTON_D] + BUTTON_IGNORE_TIME)) {
        return;
    }
    buttons_last_pressed[BUTTON_D] = now;

    for (int i = 0; i < BUTTON_N_READS; i++) {
        if (!digitalRead(BUTTON_PIN_D))
            return;
    }
    buttons_pressed++;
    buttons[BUTTON_D]++;
}
void button_press_e(void)
{
    unsigned long now = millis();
    if (now < (buttons_last_pressed[BUTTON_E] + BUTTON_IGNORE_TIME)) {
        return;
    }
    buttons_last_pressed[BUTTON_E] = now;

    for (int i = 0; i < BUTTON_N_READS; i++) {
        if (!digitalRead(BUTTON_PIN_E))
            return;
    }
    buttons_pressed++;
    buttons[BUTTON_E]++;
}

// reset button totals
void buttons_reset(void)
{
    
    for (int i = 0; i < N_BUTTONS; i++) {
        button_presses[i] = 0;
    }
    
}

// tally interrupt activity into actual button presses
void buttons_tally(void)
{
    
    for (int i = 0; i < N_BUTTONS; i++) {
        if (buttons[i])
            button_presses[i]++;
    }
    
}

// clear the interrupt state (because there might be
// data there we don't want in the next tally)
void buttons_clear(void)
{
    
    for (int i = 0; i < N_BUTTONS; i++) {
        buttons[i] = 0;
    }
    
    buttons_pressed = 0;    
   
}

void buttons_setup(void)
{
    
    pinMode(BUTTON_PIN_A, INPUT_PULLDOWN);
    pinMode(BUTTON_PIN_B, INPUT_PULLDOWN);
    pinMode(BUTTON_PIN_C, INPUT_PULLDOWN);
    pinMode(BUTTON_PIN_D, INPUT_PULLDOWN);
    pinMode(BUTTON_PIN_E, INPUT_PULLDOWN);
    
    attachInterrupt(BUTTON_PIN_A, button_press_a, RISING);
    attachInterrupt(BUTTON_PIN_B, button_press_b, RISING);
    attachInterrupt(BUTTON_PIN_C, button_press_c, RISING);
    attachInterrupt(BUTTON_PIN_D, button_press_d, RISING);
    attachInterrupt(BUTTON_PIN_E, button_press_e, RISING);
    
}
