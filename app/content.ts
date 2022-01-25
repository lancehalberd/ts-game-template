import { generateContractList } from 'app/contract';

// More cost effective than Fuel Cells, but slower acceleration.
const uranium: Fuel = {
	type: 'fuel',
	fuelType: 'uranium',
	name: 'Uranium',
    unitCost: 500,
    unitMass: 19, // about 19 g/cm^3
    unitVolume: 1,
    unitEnergy: 1,
    miningDurabilityPerUnit: 10,
    units: 0,
}
const fuelCells: Fuel = {
	type: 'fuel',
	fuelType: 'fuelCells',
	name: 'Fuel Cells',
    unitCost: 1500,
    unitMass: 20,
    unitVolume: 1,
    unitEnergy: 2,
    miningDurabilityPerUnit: 10,
    units: 0,
}
const tritium: Fuel = {
	type: 'fuel',
	fuelType: 'tritium',
	name: 'Tritium',
    unitCost: 5000,
    unitMass: 12, // Tritium is a gas, so we assume it is in some mineral.
    unitVolume: 1,
    unitEnergy: 3,
    miningDurabilityPerUnit: 20,
    units: 0,
}
const magicFuel: Fuel = {
	type: 'fuel',
	fuelType: 'magicFuel',
	name: 'Magic Fuel',
    unitCost: 20000,
    unitMass: 10,
    unitVolume: 1,
    unitEnergy: 10,
    miningDurabilityPerUnit: 50,
    units: 0,
}

const iron: Ore = {
	type: 'ore',
	oreType: 'iron',
	name: 'Iron',
    unitCost: 100,
    unitMass: 8, // 7.874 g/cm^3
    unitVolume: 1,
    miningDurabilityPerUnit: 20,
    units: 0,
};
const silver: Ore = {
	type: 'ore',
	oreType: 'silver',
	name: 'Silver',
    unitCost: 300,
    unitMass: 10.5, // 10.49 g/cm^3
    unitVolume: 1,
    miningDurabilityPerUnit: 30,
    units: 0,
};
const gold: Ore = {
	type: 'ore',
	oreType: 'gold',
	name: 'Gold',
    unitCost: 1000,
    unitMass: 19, // 19.3 g/cm^3
    unitVolume: 1,
    miningDurabilityPerUnit: 40,
    units: 0,
};
const platinum: Ore = {
	type: 'ore',
	oreType: 'platinum',
	name: 'Platinum',
    unitCost: 2500,
    unitMass: 21.5, // 21.45 g/cm^3
    unitVolume: 1,
    miningDurabilityPerUnit: 50,
    units: 0,
};
const diamond: Ore = {
	type: 'ore',
	oreType: 'diamond',
	name: 'Diamond',
    unitCost: 700,
    unitMass: 3.5, // 3.53 g/cm^3
    unitVolume: 1,
    miningDurabilityPerUnit: 60,
    units: 0,
};
const magicCrystal: Ore = {
	type: 'ore',
	oreType: 'magicCrystal',
	name: 'Magic Crystal',
    unitCost: 15000,
    unitMass: 50, // diamond is already very light, so let's make magic crystals heavy.
    unitVolume: 1,
    miningDurabilityPerUnit: 100,
    units: 0,
}

/*   type ToolType = 'explosives' |
        'advancedHarvestingDrill' | 'advancedDiggingDrill' | 'advanceDiggingLaser' |
        'magicHarvestingDrill' | 'magicDiggingDrill' | 'magicDiggingLaser';*/

const basicHarvestingDrill: DiggingToolDefinition = {
    type: 'tool',
    toolType: 'basicHarvestingDrill',
	name: 'Harvesting Drill',
    remainingUses: 50,
    miningPower: 100,
    miningEfficiency: 0.9,
    energyPerUse: 0,
    unitVolume: 50,
    unitMass: 400,
    unitCost: 10000,
    units: 1,
};
const basicDiggingDrill: DiggingToolDefinition = {
    type: 'tool',
    toolType: 'basicDiggingDrill',
	name: 'Digging Drill',
    remainingUses: 100,
    miningPower: 200,
    miningEfficiency: 0.5,
    energyPerUse: 0,
    unitVolume: 100,
    unitMass: 1000,
    unitCost: 10000,
    units: 1,
};
const basicDiggingLaser: DiggingToolDefinition = {
    type: 'tool',
    toolType: 'basicDiggingLaser',
	name: 'Laser',
    remainingUses: 10000,
    miningPower: 100,
    miningEfficiency: 0.6,
    energyPerUse: 1,
    unitVolume: 200,
    unitMass: 2000,
    unitCost: 50000,
    units: 1,
};
const advancedHarvestingDrill: DiggingToolDefinition = {
    type: 'tool',
    toolType: 'advancedHarvestingDrill',
	name: 'Advanced Harvesting Drill',
    remainingUses: 50,
    miningPower: 100,
    miningEfficiency: 0.9,
    energyPerUse: 0,
    unitVolume: 50,
    unitMass: 400,
    unitCost: 10000,
    units: 1,
};
const advancedDiggingDrill: DiggingToolDefinition = {
    type: 'tool',
    toolType: 'advancedDiggingDrill',
	name: 'Advanced Digging Drill',
    remainingUses: 100,
    miningPower: 200,
    miningEfficiency: 0.5,
    energyPerUse: 0,
    unitVolume: 100,
    unitMass: 1000,
    unitCost: 10000,
    units: 1,
};
const advancedDiggingLaser: DiggingToolDefinition = {
    type: 'tool',
    toolType: 'advancedDiggingLaser',
	name: 'Advanced Laser',
    remainingUses: 10000,
    miningPower: 100,
    miningEfficiency: 0.6,
    energyPerUse: 1,
    unitVolume: 200,
    unitMass: 2000,
    unitCost: 50000,
    units: 1,
};
const magicHarvestingDrill: DiggingToolDefinition = {
    type: 'tool',
    toolType: 'magicHarvestingDrill',
	name: 'Magic Harvesting Drill',
    remainingUses: 50,
    miningPower: 100,
    miningEfficiency: 0.9,
    energyPerUse: 0,
    unitVolume: 50,
    unitMass: 400,
    unitCost: 10000,
    units: 1,
};
const magicDiggingDrill: DiggingToolDefinition = {
    type: 'tool',
    toolType: 'magicDiggingDrill',
	name: 'Magic Digging Drill',
    remainingUses: 100,
    miningPower: 200,
    miningEfficiency: 0.5,
    energyPerUse: 0,
    unitVolume: 100,
    unitMass: 1000,
    unitCost: 10000,
    units: 1,
};
const magicDiggingLaser: DiggingToolDefinition = {
    type: 'tool',
    toolType: 'magicDiggingLaser',
	name: 'Magic Laser',
    remainingUses: 10000,
    miningPower: 100,
    miningEfficiency: 0.6,
    energyPerUse: 1,
    unitVolume: 200,
    unitMass: 2000,
    unitCost: 50000,
    units: 1,
};
// Destroys a diamond of radius 1 around the target destorying up to 4 tiles.
const smallExplosives: DiggingToolDefinition = {
    type: 'tool',
    toolType: 'smallExplosives',
	name: 'Small Explosives',
    remainingUses: 1,
    miningPower: 10000,
    miningEfficiency: 0.1,
    energyPerUse: 0,
    unitVolume: 10,
    unitMass: 50,
    unitCost: 10000,
    units: 1,
};
// Destroys a diamond of radius 4 around the target, ~25 tiles on surface, ~37 tiles in interior
const largeExplosives: DiggingToolDefinition = {
    type: 'tool',
    toolType: 'largeExplosives',
	name: 'Large Explosives',
    remainingUses: 1,
    miningPower: 10000,
    miningEfficiency: 0.1,
    energyPerUse: 0,
    unitVolume: 50,
    unitMass: 300,
    unitCost: 20000,
    units: 1,
};

const basicSmallShip: ShipDefinition = {
	shipType: 'basicSmallShip',
	name: 'Scout Ship',
    cargoSpace: 1000,
    cargo: [],
    fuelType: 'fuelCells',
    mass: 4000,
    cost: 200e3,
    isRented: false,
    isOwned: false,
};
const basicShip: ShipDefinition = {
	shipType: 'basicShip',
	name: 'Mining Ship',
    cargoSpace: 5000,
    cargo: [],
    fuelType: 'fuelCells',
    mass: 10000,
    cost: 500e3,
    isRented: false,
    isOwned: false,
};
const basicBigShip: ShipDefinition = {
	shipType: 'basicBigShip',
	name: 'Cargo Ship',
    cargoSpace: 50000,
    cargo: [],
    fuelType: 'uranium',
    mass: 30000,
    cost: 1500e3,
    isRented: false,
    isOwned: false,
};

const advancedSmallShip: ShipDefinition = {
	shipType: 'advancedSmallShip',
	name: 'Advanced Scout Ship',
    cargoSpace: 1200,
    cargo: [],
    fuelType: 'tritium',
    mass: 3200,
    cost: 1000e3,
    isRented: false,
    isOwned: false,
};
const advancedShip: ShipDefinition = {
	shipType: 'advancedShip',
	name: 'Advanced Mining Ship',
    cargoSpace: 6000,
    cargo: [],
    fuelType: 'tritium',
    mass: 8000,
    cost: 2500e3,
    isRented: false,
    isOwned: false,
};
const advancedBigShip: ShipDefinition = {
	shipType: 'advancedBigShip',
	name: 'Advanced Cargo Ship',
    cargoSpace: 60000,
    cargo: [],
    fuelType: 'uranium',
    mass: 24000,
    cost: 7500e3,
    isRented: false,
    isOwned: false,
};

const magicSmallShip: ShipDefinition = {
	shipType: 'magicSmallShip',
	name: 'Magic Scout Ship',
    cargoSpace: 1500,
    cargo: [],
    fuelType: 'magicFuel',
    mass: 1000,
    cost: 10000e3,
    isRented: false,
    isOwned: false,
};
const magicShip: ShipDefinition = {
	shipType: 'magicShip',
	name: 'Magic Mining Ship',
    cargoSpace: 7500,
    cargo: [],
    fuelType: 'magicFuel',
    mass: 5000,
    cost: 25000e3,
    isRented: false,
    isOwned: false,
};
const magicBigShip: ShipDefinition = {
	shipType: 'magicBigShip',
	name: 'Magic Cargo Ship',
    cargoSpace: 100000,
    cargo: [],
    fuelType: 'magicFuel',
    mass: 15000,
    cost: 75000e3,
    isRented: false,
    isOwned: false,
};


export function generateInitialState(): State {
	const state: State = {
		// Immutable state that defines what can be bought/found in the game.
        content: {
	        diggingTools: [
	        	basicHarvestingDrill, basicDiggingDrill, basicDiggingLaser,
	        	advancedHarvestingDrill, advancedDiggingDrill, advancedDiggingLaser,
	        	magicHarvestingDrill, magicDiggingDrill, magicDiggingLaser,
	        	smallExplosives, largeExplosives,
	        ],
	        fuels: [uranium, fuelCells, tritium, magicFuel],
	        ores: [iron, silver, gold, platinum, diamond, magicCrystal],
            ships: [
            	basicSmallShip, basicShip, basicBigShip,
            	advancedSmallShip, advancedShip, advancedBigShip,
            	magicSmallShip, magicShip, magicBigShip,
            ],
        },
        // Time in standard days (100,000 seconds)
        // Every mining action takes 10,000 seconds so 10 actions a day.
        time: 0,
        // Player's liquid assets
        credits: 100000,
        // Amount of money the player currently owes
        debt: 0,
        // The amount of debt the player may take on, increases based on players actions
        creditLimit: 500000,
        // State relevant to being at the space station.
        station: {
            availableContracts: [],
            cargoSpace: 10000,
            cargo: [],
            ships: [],
        },
        // Flag indicating the player is at the space station.
        atStation: true,
        // The ship the player has selected for the current contract
        currentShip: undefined,
        // The current contract the player has taken,
        // contains the state of the current asteroid when mining.
        currentContract: undefined,
	};
    // Populate the initial list of contracts.
    state.station.availableContracts = generateContractList(state, 20);
    return state;
}

