import {
    attemptTravel,
    consumeFuel,
    gainResource,
    getFuelByType,
    getToolFromStorage,
    moveCargo,
} from 'app/state';

function requireAtContract(state: State) {
    const contract = state.currentContract;
    if (!contract || state.atStation) {
        throw { errorType: 'notMining', errorMessage: `
            You must be at an asteroid to mine.
        `};
    }
    const ship = state.currentShip;
    if (!ship) {
        throw { errorType: 'noShip', errorMessage: `
            You shouldn't be at an asteroid without a ship.
            This is a bug.
        `};
    }
    return {contract, ship};
}

function mineCell(state: State, contract: Contract, x: number, y: number, miningPower: number) {
    const cell = contract.grid[y]?.[x];
    // Explosives will often hit empty cells, we just ignore them.
    if (!cell) {
        return;
    }
    const p = Math.min(1, miningPower / cell.durability);
    if (cell.resourceType && cell.resourceUnits && cell.resourceUnits > 0) {
        gainResource(state, cell.resourceType, cell.resourceUnits * p, contract);
        cell.resourceUnits -= cell.resourceUnits * p;
    }
    cell.durability -= miningPower;
    if (cell.durability <= 0) {
        contract.grid[y][x] = null;
    }
}

export function getMiningApi(state: State) {
    return {
        dig(x: number, y: number, toolType: ToolType) {
            const { contract, ship } = requireAtContract(state);
            const cell = contract.grid[y][x];
            if (!cell?.durability) {
                throw { errorType: 'emptyCell', errorMessage: `
                    There is nothing to dig at ${x},${y}
                `};
            }
            const tool = getToolFromStorage(state, toolType, ship);
            if (tool.energyPerUse) {
                const fuel = getFuelByType(state, ship.fuelType);
                const fuelBurnt = tool.energyPerUse / fuel.unitEnergy;
                // This will throw an error if there is not enough fuel left.
                // This will consume fractional fuel.
                consumeFuel(state, ship.fuelType, fuelBurnt, ship);
            }
            if (tool.cargoType === 'smallExplosives' || tool.cargoType === 'largeExplosives') {
                // Explosives mine all cells in a diamond around the selected cell.
                const r = tool.cargoType === 'largeExplosives' ? 4 : 1;
                for (let dy = -r; dy <= r; dy++) {
                    const r2 = r - Math.abs(dy);
                    for (let dx = -r2; dx <= r2; dx++) {
                        mineCell(state, contract, x + dx, y + dy, tool.miningPower);
                    }
                }
            } else {
                mineCell(state, contract, x, y, tool.miningPower);
            }
            tool.remainingUses--;
            if (tool.remainingUses <= 0) {
                ship.cargo.splice(ship.cargo.indexOf(tool), 1);
            }
        },
        returnToStation(maxFuelToBurn: number, { ignoreDebtInterest = false, ignoreLongTravelTime = false } = {}) {
            const { contract, ship } = requireAtContract(state);
            if (maxFuelToBurn < 2) {
                throw { errorType: 'invalidAction', errorMessage: `
                    You must burn at least 2 units of fuel during travel.
                `};
            }
            attemptTravel(state, ship, contract.distance, maxFuelToBurn, { ignoreDebtInterest, ignoreLongTravelTime });
            state.currentShip = undefined;
            state.atStation = true;
        },
        loadCargo(cargoType: ToolType | OreType | FuelType, units: number) {
            const { contract, ship } = requireAtContract(state);
            moveCargo(state, cargoType, units, contract, ship);
        },
        unloadCargo(cargoType: ToolType | OreType | FuelType, units: number) {
            const { contract, ship } = requireAtContract(state);
            moveCargo(state, cargoType, units, ship, contract);
        },
    };
}
