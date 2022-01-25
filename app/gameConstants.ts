
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
	Basic Ship + 50 fuel cells + 1 drill = 10000 + 1000 + 1000 = 12000kg
	Kinetic Energy for 12000kg @ 2000 m / s is 0.5 * 12000 * 2000^2 = 6e3 * 4e6 = 24e9
	We need to reach 24e9 KE over 5 days which is 50 fuel burns, so each burn must
	produce 24e9 / 50 ~5e8 or 500 million Joules

*/
