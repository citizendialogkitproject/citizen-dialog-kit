// buttons.cpp
// button handling
// Copyright (c) 2018, Jef Van den broeck, for KU Leuven (Research[x]Design).
#define N_BUTTONS       5
#define BUTTON_A        0
#define BUTTON_B        1
#define BUTTON_C        2
#define BUTTON_D        3
#define BUTTON_E        4
#define BUTTON_PIN_A    C0
#define BUTTON_PIN_B    C1
#define BUTTON_PIN_C    C2
#define BUTTON_PIN_D    C3
#define BUTTON_PIN_E    C4
#define BUTTON_IGNORE_TIME  1000
#define BUTTON_N_READS  100

extern volatile unsigned char buttons_pressed;
extern volatile unsigned char buttons[];
extern volatile unsigned long buttons_last_pressed[];
extern int button_presses[];

String buttons_to_string(void);
void button_press_a(void);
void button_press_b(void);
void button_press_c(void);
void button_press_d(void);
void button_press_e(void);
void buttons_setup(void);
void buttons_tally(void);
void buttons_clear(void);
void buttons_reset(void);
