import { debtInterestRate } from 'app/gameConstants';

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
    const fuel = state.content.fuels.find(fuel => fuel.fuelType === type);
    if (!fuel) {
        throw { errorType: 'invalidRequest', errorMessage: `
            There is no fuel of type '${type}'.
        `};
    }
    return fuel;
}



export function advanceTimer(state: State, rawDays: number) {
    const startTime = state.time;
    // Time is only incremented in increments of 0.1 days
    state.time = Math.floor((state.time + rawDays) * 10) / 10;
    const interestTicks = Math.floor(state.time) - Math.floor(startTime);
    state.debt *= debtInterestRate ** interestTicks;
}

export function getOreByType(state: State, type: OreType): Ore {
    const ore = state.content.ores.find(ore => ore.oreType === type);
    if (!ore) {
        throw { errorType: 'invalidRequest', errorMessage: `
            There is no ore of type '${type}'.
        `};
    }
    return ore;
}

export function getToolByType(state: State, type: ToolType): DiggingTool {
    const tool = state.content.diggingTools.find(tool => tool.toolType === type);
    if (!tool) {
        throw { errorType: 'invalidRequest', errorMessage: `
            There is no tool of type '${type}'.
        `};
    }
    return tool;
}

export function getToolFromStorage(state: State, type: ToolType, storage: Ship | Station | Contract): DiggingTool {
    for (const cargo of storage.cargo) {
        if (cargo.type === 'tool' && cargo.toolType === type) {
            return cargo;
        }
    }
    const tool = getToolByType(state, type);
    throw { errorType: 'invalidRequest', errorMessage: `
        No ${tool.name} was found
    `};
}

export function consumeFuel(state: State, fuelType: FuelType, units: number, storage: Ship | Station) {
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
        if (cargo.type === 'fuel' && cargo.fuelType === fuelType) {
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
export function getTotalFuelFromCargo(fuelType: FuelType, storage: Station | Ship): number {
    let fuel = 0;
    for (const cargo of storage.cargo) {
        if (cargo.type === 'fuel' && cargo.fuelType === fuelType) {
            fuel += cargo.units;
        }
    }
    return fuel;
}
export function getTotalShipFuel(ship: Ship): number {
    return getTotalFuelFromCargo(ship.fuelType, ship);
}

export function getResource(state: State, resourceType: FuelType | OreType): Fuel | Ore {
    if (isFuelType(resourceType)) {
        return getFuelByType(state, resourceType);
    }
    return getOreByType(state, resourceType);
}

export function isFuelType(resourceType: FuelType | OreType): resourceType is FuelType {
    return resourceType === 'uranium'
        || resourceType === 'fuelCells'
        || resourceType === 'tritium'
        || resourceType === 'magicCrystal';
}


export function getEmptyCargoSpace(cargoSize: number, cargo: Cargo[]): number {
    let emptyCargoSpace = cargoSize;
    for (const item of cargo) {
        emptyCargoSpace -= item.unitVolume * item.units;
    }
    return emptyCargoSpace;
}

export function gainResource(state: State, resourceType: FuelType | OreType, units: number, storage: Ship | Station | Contract) {
    const emptyCargoSpace = getEmptyCargoSpace(storage.cargoSpace, storage.cargo);
    const resource = getResource(state, resourceType);
    const volumeNeeded = resource.unitVolume * units;
    if (emptyCargoSpace < volumeNeeded) {
        throw { errorType: 'insufficientCargoSpace', errorMessage: `
            You tried gain ${volumeNeeded}L of ${resource.name} but you only have space for ${emptyCargoSpace}L.
        `};
    }
    for (const cargo of storage.cargo) {
        if (cargo.type === 'fuel' && cargo.fuelType === resourceType) {
            cargo.units += units;
            return;
        }
        if (cargo.type === 'fuel' && cargo.fuelType === resourceType) {
            cargo.units += units;
            return;
        }
    }
    storage.cargo.push({
        ...resource,
        units,
    });
}
