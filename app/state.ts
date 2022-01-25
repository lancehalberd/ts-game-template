import { dayLength, debtInterestRate, energyUnit } from 'app/gameConstants';

function copyCargo(cargo: Cargo[]) {
    return cargo.map(cargo => ({...cargo}));
}
function copyShip(ship: Ship) {
    return {
        ...ship,
        cargo: copyCargo(ship.cargo),
    }
}
function copyContract(contract: Contract): Contract {
    return {
        ...contract,
        grid: contract.grid.map(row => row.map(cell => cell ? {...cell} : cell)),
    }
}
// If we ever have private data on the state, we could make a PublicState interface and make a copyPublicState function.
export function copyState(state: State): State {
    return {
        ...state,
        station: {
            cargoSpace: state.station.cargoSpace,
            cargo: copyCargo(state.station.cargo),
            availableContracts: state.station.availableContracts.map(copyContract),
            ships: state.station.ships.map(copyShip),
        },
        atStation: state.atStation,
        currentContract: state.currentContract ? copyContract(state.currentContract) : undefined,
        currentShip: state.currentShip ? copyShip(state.currentShip) : undefined,
    };
}


export function getFuelByType(state: State, type: FuelType): Fuel {
    const fuel = state.content.fuels.find(fuel => fuel.cargoType === type);
    if (!fuel) {
        throw { errorType: 'invalidRequest', errorMessage: `
            There is no fuel of type '${type}'.
        `};
    }
    return fuel;
}

export function isFuelType(state: State, cargoType: CargoType): cargoType is FuelType {
    for (const fuel of state.content.fuels) {
        if (fuel.cargoType === cargoType) {
            return true;
        }
    }
    return false;
}
export function isOreType(state: State, cargoType: CargoType): cargoType is OreType {
    for (const ore of state.content.ores) {
        if (ore.cargoType === cargoType) {
            return true;
        }
    }
    return false;
}
export function isToolType(state: State, cargoType: CargoType): cargoType is ToolType {
    for (const digginTool of state.content.diggingTools) {
        if (digginTool.cargoType === cargoType) {
            return true;
        }
    }
    return false;
}
export function getCargoByType(state: State, cargoType: CargoType): Cargo {
    if (isToolType(state, cargoType)) {
        return getToolByType(state, cargoType);
    }
    if (isFuelType(state, cargoType)) {
        return getFuelByType(state, cargoType);
    }
    if (isOreType(state, cargoType)) {
        return getOreByType(state, cargoType);
    }
    throw { errorType: 'invalidCargoType', errorMessage: `No cargo of type ${cargoType} exists.`}
}

// Attempt to move X units of cargo from one cargo storage to another.
// Will only throw errors if the `cargoType` is invalid, otherwise it will simply move
// as many units as is valid up to the limit. It can stop early if there are no more units
// or if the target storage is too full.
export function moveCargo(state: State, cargoType: CargoType, units: number, source: CargoStorage, target: CargoStorage) {
    let emptySpace = getEmptyCargoSpace(target);
    const isDiscrete = isToolType(state, cargoType);
    for (let i = 0; i < source.cargo.length; i++) {
        const cargo = source.cargo[i];
        if (cargo.cargoType === cargoType) {
            let unitsToMove = Math.min(cargo.units, emptySpace / cargo.unitVolume);
            if (isDiscrete) {
                unitsToMove = Math.floor(unitsToMove);
            }
            // Not enough room to move any more cargo to the target storage, so we stop.
            if (unitsToMove <= 0) {
                return;
            }
            if (isDiscrete) {
                // Tools are discrete objects that must be moved in entirety.
                // This is because they have unique state 'remainingUses' tracked for each object.
                source.cargo.splice(i--, 1);
                target.cargo.push(cargo);
            } else {
                cargo.units -= unitsToMove;
                emptySpace -= unitsToMove * cargo.unitVolume;
                gainResource(state, cargoType, unitsToMove, target);
            }
        }
    }
}
export function gainResource(state: State, resourceType: FuelType | OreType, units: number, storage: CargoStorage) {
    const emptyCargoSpace = getEmptyCargoSpace(storage);
    const cargo = getCargoByType(state, resourceType);
    const volumeNeeded = cargo.unitVolume * units;
    if (emptyCargoSpace < volumeNeeded) {
        throw { errorType: 'insufficientCargoSpace', errorMessage: `
            You tried gain ${volumeNeeded}L of ${cargo.name} but you only have space for ${emptyCargoSpace}L.
        `};
    }
    for (const cargo of storage.cargo) {
        if (cargo.cargoType === resourceType) {
            cargo.units += units;
            return;
        }
    }
    storage.cargo.push({
        ...cargo,
        units,
    });
}


export function advanceTimer(state: State, rawDays: number) {
    const startTime = state.time;
    // Time is only incremented in increments of 0.1 days
    state.time = Math.floor((state.time + rawDays) * 10) / 10;
    const interestTicks = Math.floor(state.time) - Math.floor(startTime);
    state.debt *= debtInterestRate ** interestTicks;
}

export function getOreByType(state: State, type: OreType): Ore {
    const ore = state.content.ores.find(ore => ore.cargoType === type);
    if (!ore) {
        throw { errorType: 'invalidRequest', errorMessage: `
            There is no ore of type '${type}'.
        `};
    }
    return ore;
}
export function getToolByType(state: State, type: ToolType): DiggingTool {
    const tool = state.content.diggingTools.find(tool => tool.cargoType === type);
    if (!tool) {
        throw { errorType: 'invalidRequest', errorMessage: `
            There is no tool of type '${type}'.
        `};
    }
    return tool;
}
export function getResource(state: State, resourceType: FuelType | OreType): Fuel | Ore {
    if (isFuelType(state, resourceType)) {
        return getFuelByType(state, resourceType);
    }
    return getOreByType(state, resourceType);
}

export function getToolFromStorage(state: State, type: ToolType, storage: CargoStorage): DiggingTool {
    for (const cargo of storage.cargo) {
        if (cargo.type === 'tool' && cargo.cargoType === type) {
            return cargo;
        }
    }
    const tool = getToolByType(state, type);
    throw { errorType: 'invalidRequest', errorMessage: `
        No ${tool.name} was found
    `};
}

export function consumeFuel(state: State, fuelType: FuelType, units: number, storage: CargoStorage) {
    const fuel = getFuelByType(state, fuelType);
    const storedFuel = getTotalFuelFromCargo(fuelType, storage);
    if (storedFuel < units) {
        throw { errorType: 'insufficientFuel', errorMessage: `
            You only have ${storedFuel}L of ${fuel.name}.
        `};
    }
    let unitsRemaining = units;
    for (let i = 0; i < storage.cargo.length; i++)  {
        const cargo = storage.cargo[i];
        if (cargo.type === 'fuel' && cargo.cargoType === fuelType) {
            if (cargo.units >= unitsRemaining) {
                cargo.units -= unitsRemaining;
                break;
            }
            // If we sell the entire stock of fuel in this cargo element, remove
            // it from the cargo array.
            unitsRemaining -= cargo.units;
            storage.cargo.splice(i--, 1);
        }
    }
}
export function getTotalFuelFromCargo(fuelType: FuelType, storage: CargoStorage): number {
    let fuel = 0;
    for (const cargo of storage.cargo) {
        if (cargo.type === 'fuel' && cargo.cargoType === fuelType) {
            fuel += cargo.units;
        }
    }
    return fuel;
}
export function getTotalShipFuel(ship: Ship): number {
    return getTotalFuelFromCargo(ship.fuelType, ship);
}



export function getEmptyCargoSpace(storage: CargoStorage): number {
    let emptyCargoSpace = storage.cargoSpace;
    for (const item of storage.cargo) {
        emptyCargoSpace -= item.unitVolume * item.units;
    }
    return emptyCargoSpace;
}

function getTotalShipMass(ship: Ship): number {
    let mass = ship.mass;
    for (const cargo of ship.cargo) {
        mass += cargo.unitMass * cargo.units;
    }
    return mass;
}

export function requireMyShipByType(state: State, type: ShipType): Ship {
    const myShip = state.station.ships.find(ship => ship.shipType === type);
    if (!myShip) {
        throw { errorType: 'invalidRequest', errorMessage: `
            You do not have a ship of type '${type}' in your possession.
        `};
    }
    return myShip;
}

export function attemptTravel(state: State, ship: Ship, distance: number, maxFuelToBurn: number, { ignoreDebtInterest = false, ignoreLongTravelTime = false } = {}) {
    const fuel = getFuelByType(state, ship.fuelType);
    const fuelAmount = getTotalShipFuel(ship);
    if (fuelAmount < maxFuelToBurn) {
        throw { errorType: 'insufficientFuel', errorMessage: `
            The selected ship only has ${fuel}L of ${fuel.name}.
        `};
    }

    const simulatedState = copyState(state);
    const simulatedShip = requireMyShipByType(simulatedState, ship.shipType);
    travelDistance(simulatedState, simulatedShip, distance, maxFuelToBurn);
    const daysTraveled = simulatedState.time - state.time;
    if (daysTraveled > 20 && !ignoreLongTravelTime) {
        throw { warningType: 'longTravel', warningMessage: `
            This trip will take ${daysTraveled} days.
            Increase fuel, decrease weight or call with ignoreLongTravelTime=true.
        `};
    }
    // Increased the debt again assuming a similar return trip time.
    const debt = simulatedState.debt;// * debtInterestRate ** (Math.ceil(daysTraveled));
    if (debt > state.creditLimit && !ignoreDebtInterest) {
        throw { warningType: 'excessiveDebtInterest', warningMessage: `
            Your debt will reach $${debt} by the end of this trip,
            which exceeds your credit limit of $${state.creditLimit}.
            Increase fuel, decrease weight or call with ignoreDebtInterest=true.
        `};
    }
    // If there are no warnings or errors, actually travel to the contract.
    travelDistance(state, ship, distance, maxFuelToBurn);
}

function travelDistance(state: State, ship: Ship, distance: number, maxFuelToBurn: number) {
    const fuel = getFuelByType(state, ship.fuelType);
    let distanceTraveled = 0, kineticEnergy = 0, fuelBurnt = 0, currentVelocity = 0;
    let mass = getTotalShipMass(ship);
    while (distanceTraveled < distance && kineticEnergy >= 0) {
        // This is in days.
        advanceTimer(state, 0.1);
        // Continue burning fuel if we have not exceeded the max burn constraints
        // or already covered half of the distance.
        if (distanceTraveled < distance / 2 && fuelBurnt < maxFuelToBurn / 2) {
            // Burn fuel to accelerate.
            kineticEnergy += fuel.unitEnergy * energyUnit;
            kineticEnergy *= (mass - fuel.unitMass) / mass;
            mass -= fuel.unitMass;
            fuelBurnt++;
        } else if (distanceTraveled < distance / 2) {
            // Travel at constant speed until we are ready to decelerate
            const cruiseDistance = distance - 2 * distanceTraveled;
            const cruiseTime = Math.floor(10 * cruiseDistance / currentVelocity / dayLength) / 10;
            advanceTimer(state, cruiseTime);
            distanceTraveled += cruiseTime * dayLength * currentVelocity;
            // Just in case make sure we get to the back half of the trip, probably not necessary.
            distanceTraveled = Math.max(distanceTraveled, distance / 2);
        } else {
            // Burn fuel to decelerate.
            kineticEnergy -= fuel.unitEnergy * energyUnit;
            kineticEnergy *= (mass - fuel.unitMass) / mass;
            mass -= fuel.unitMass;
            fuelBurnt++;
        }
        // E = 1/2 mass * v**2
        const newVelocity = Math.sqrt(2 * kineticEnergy / mass); // m / s
        distanceTraveled += (newVelocity + currentVelocity) / 2 * dayLength / 10;
        currentVelocity = newVelocity;
        // console.log({ time: state.time, kineticEnergy, currentVelocity, distanceTraveled });
    }
    consumeFuel(state, ship.fuelType, fuelBurnt, ship);
    return fuelBurnt;
}
