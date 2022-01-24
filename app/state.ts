function copyCargo(cargo: Cargo[]) {
    return cargo.map(cargo => ({...cargo}));
}
function copyShip(ship: Ship) {
    return {
        ...ship,
        cargo: copyCargo(ship.cargo),
    }
}
function copyContract(contract: Contract) {
    return {
        ...contract,
        grid: contract.grid.map(row => row.map(cell => ({...cell}))),
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


export function getOreByType(state: State, type: OreType): Ore {
    const ore = state.content.ores.find(ore => ore.oreType === type);
    if (!ore) {
        throw { errorType: 'invalidRequest', errorMessage: `
            There is no ore of type '${type}'.
        `};
    }
    return ore;
}
