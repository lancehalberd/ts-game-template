
// This resolution is based on SNES.
export const CANVAS_WIDTH = 256;
export const CANVAS_HEIGHT = 224;
export const FRAME_LENGTH = 20;

// Average distance to a meteor in meters
export const averageTravelDistance = 1e9;
// Standardized day length in seconds.
export const dayLength = 100000;
// Energy per energy unit in Joules
export const energyUnit = 1e9;

// This is compounded daily.
export const debtInterestRate = 1.01;


/*
1e9 distance in 10 days
peak velocity is 1e9 = 10days * v / 2 => V = 2e8 meters per day
    Since 1 day = 100,000s this is 2e8 / 1e5 = 2e3 = 2000 m / s


*/
