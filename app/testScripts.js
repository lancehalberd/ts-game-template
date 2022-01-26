function asteroidToString(contract) {
    return contract.grid.map(row => row.map(cell => {
        if (!cell) return ' ';
        if (cell.resourceType) {
            return cell.resourceType[0];
        }
        return Math.min(9, Math.round(cell.durability / 100));
    }).join('')).join("\n");
}
function storageToString(storage) {
    return storage.cargo.map(cargo =>
        cargo.cargoType + ': ' + (cargo.remainingUses || cargo.units)
    ).join("\n");
}
function mineAsteroid(api, {debugCargo, debugAsteroid} = {}) {
    function state() {
        return api.state || api.getState();
    }
    if (debugAsteroid) {
        console.log(asteroidToString(state().currentContract));
    }
    let rows = state().currentContract.grid.length
    let columns = state().currentContract.grid[0].length
    let x = 0, y = 0;
    function getTool(toolType) {
        return state().currentShip.cargo.find(cargo => cargo.cargoType === toolType);
    }
    while (getTool('basicDiggingDrill')?.remainingUses) {
        const grid = state().currentContract.grid;
        if (grid[y][x]?.durability) {
            try {
                // Use the harvesting drill for resources if any uses are left.
                if (getTool('basicHarvestingDrill')?.remainingUses
                    && grid[y][x].resourceType
                ) {
                    api.dig(x, y, 'basicHarvestingDrill');
                } else {
                    api.dig(x, y, 'basicDiggingDrill');
                }
                continue;
            } catch (e) {
            }
        }
        x++;
        if (x >= columns) {
            x = 0;
            y++;
            if (y >= rows) {
                break;
            }
        }
    }
    if (debugAsteroid) {
        console.log(asteroidToString(state().currentContract));
    }
    // Set the amount high to make sure we load it all.
    api.loadCargo('diamond', 10000);
    api.loadCargo('uranium', 10000);
    api.loadCargo('fuelCells', 10000);
    api.loadCargo('tritium', 10000);
    api.loadCargo('magicFuel', 10000);
    api.loadCargo('iron', 10000);
    api.loadCargo('silver', 10000);
    api.loadCargo('gold', 10000);
    api.loadCargo('platinum', 10000);
    api.loadCargo('magicCrystal', 10000);
    if (debugCargo) {
        console.log(storageToString(state().currentShip));
    }
}
function travelToContract(api) {
    const state = api.state || api.getState();
    const ship = state.station.ships[0];
    const fuelAmount = ship.cargo.find(cargo => cargo.cargoType === ship.fuelType).units;
    api.travelToContract(ship.shipType, Math.floor(fuelAmount / 2));
}
function returnToStation(api) {
    const state = api.state || api.getState();
    const ship = state.currentShip;
    const fuelAmount = ship.cargo.find(cargo => cargo.cargoType === ship.fuelType).units;
    api.returnToStation(Math.floor(fuelAmount));
}
function getRentalTime(simulation) {
    const startTime = simulation.state.time;
    travelToContract(simulation);
    mineAsteroid(simulation);
    returnToStation(simulation);
    return Math.ceil(simulation.state.time - startTime);
}
function purchaseBasicLoadout(api, rentalTime, { debugActions } = {}) {
    if (debugActions) {
        console.log('Renting basicShip for ' + rentalTime + ' days');
    }
    api.rentShip('basicShip', rentalTime, { spendCredit: true });
    if (debugActions) {
        console.log('Purchasing 60 units of fuel, 1 basic digging drill and 2 basic harvesting drills.');
    }
    api.purchaseFuel('basicShip', 60, { spendCredit: true });
    api.purchaseTool('basicDiggingDrill', 1, 'basicShip', { spendCredit: true });
    api.purchaseTool('basicHarvestingDrill', 2, 'basicShip', { spendCredit: true });
}
function runContract(api, contractIndex, {debugActions, debugCargo, debugAsteroid} = {}) {
    if (debugActions) {
        console.log('Purchasing contract ', contractIndex)
    }
    api.purchaseContract(contractIndex, { spendCredit: true });
    const rentalSimulation = api.simulate();
    purchaseBasicLoadout(rentalSimulation, 20);
    const rentalTime = getRentalTime(rentalSimulation);
    purchaseBasicLoadout(api, rentalTime, {debugActions});
    if (debugActions) {
        console.log('Traveling to contract ');
    }
    travelToContract(api);
    if (debugActions) {
        console.log('Mining asteroid');
    }
    mineAsteroid(api, { debugCargo, debugAsteroid });
    if (debugActions) {
        console.log('Returning to station');
    }
    returnToStation(api);
    if (debugActions) {
        console.log('Selling all ore and returning rental');
    }
    api.sellAllOre('basicShip');
    api.returnShip('basicShip', { liquidateCargo: true });
}
let bestContract = 0, bestResult = -1000000, bestRentalTime = 20;
const startState = gameApi.getState();
const startTime = startState.time;
const startCredits = startState.credits - startState.debt;
for (let i = 0; i < 10; i++) {
    try {
        const simulation = gameApi.simulate();
        runContract(simulation, i, { debugAsteroid: false, debugCargo: true });
        const deltaCredits = (simulation.state.credits - simulation.state.debt) - startCredits;
        const deltaTime = simulation.state.time - startTime;
        const result = deltaCredits / deltaTime;
        if (result > bestResult) {
            console.log('New PR :) ', result, i, deltaTime);
            bestResult = result;
            bestContract = i;
            bestRentalTime = Math.ceil(deltaTime);
        } else {
            console.log('Worse :( ', result, i, deltaTime);
        }
    } catch (e) {
        console.log('Failed on', i, e);
    }
}
runContract(gameApi, bestContract, {debugActions: true});
refreshReact();
