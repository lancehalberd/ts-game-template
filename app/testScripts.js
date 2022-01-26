const resouceTypes = [];
const resourceMap = {};
const content = gameApi.getState().content;
for (const fuel of content.fuels) {
    resouceTypes.push(fuel.cargoType);
    resourceMap[fuel.cargoType] = fuel;
}
for (const ore of content.pres) {
    resouceTypes.push(ore.cargoType);
    resourceMap[ore.cargoType] = ore;
}

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
function mineAsteroidBad(api, {debugCargo, debugAsteroid} = {}) {
    function state() {
        return api.state || api.getState();
    }
    if (debugAsteroid) {
        console.log(asteroidToString(state().currentContract));
    }
    let rows = state().currentContract.grid.length
    let columns = state().currentContract.grid[0].length
    let x = 0, y = 0;
    while (api.getMiningTool('basicDiggingDrill')?.remainingUses) {
        const grid = state().currentContract.grid;
        if (grid[y][x]?.durability) {
            try {
                // Use the harvesting drill for resources if any uses are left.
                if (api.getMiningTool('basicHarvestingDrill')?.remainingUses
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
    for (const resourceType of resouceTypes) {
        api.loadCargo(resourceType, 10000);
    }
    if (debugCargo) {
        console.log(storageToString(state().currentShip));
    }
}
function attemptPlan(api, plan) {
    try {
        plan(api.simulate());
        plan(api);
    } catch {
        // Do nothing if the simulation throws an error.
    }
}
// Gets the state, quickly if the api is a simulation.
function getState(api) {
    return api.state || api.getState();
}
function getMiningState(api) {
    return api.state || api.getMiningState();
}
function digCell(api, x, y, diggingTool, harvestingTool) {
    cell = api.getMiningCell(x, y);
    while (cell?.durability) {
        if (!cell.resourceType) {
            api.dig(x, y, diggingTool);
        } else {
            if (api.getMiningTool(harvestingTool)?.remainingUses) {
                api.dig(x, y, harvestingTool);
            } else {
                api.dig(x, y, diggingTool);
            }
        }
        cell = api.getMiningCell(x, y);
    }
}
function mineAsteroidBetter(api, {debugCargo, debugAsteroid} = {}) {
    let state = getMiningState(api);
    if (debugAsteroid) {
        console.log(asteroidToString(state.currentContract));
    }
    let grid = state.currentContract.grid;
    let rows = grid.length;
    let columns = grid[0].length;
    const resourceCoords = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            if (grid[y][x]?.resourceType) {
                resourceCoords.push({x, y});
            }
        }
    }
    while (api.getMiningTool('basicDiggingDrill')?.remainingUses) {
        state = getMiningState(api);
        const diggingDrill = api.getMiningTool('basicDiggingDrill');
        const harvestingDrill = api.getMiningTool('basicHarvestingDrill');
        grid = state.currentContract.grid;
        const diggingPower = diggingDrill.miningPower;
        const harvestingPower = harvestingDrill?.miningPower || diggingPower;
        const {
            path, miningDigs, harvestDigs
        } = findBestPathToDig(grid, resourceCoords, 5, diggingPower, harvestingPower);
        attemptPlan(api, api => {
            // Apply the dig
            for (const {x, y} of path) {
                digCell(api, x, y, 'basicDiggingDrill', 'basicHarvestingDrill');
            }
        });
    }
    // Set the amount high to make sure we load it all.
    for (const resourceType of resouceTypes) {
        api.loadCargo(resourceType, 10000);
    }
    state = getState(api);
    if (debugAsteroid) {
        console.log(asteroidToString(state.currentContract));
    }
    if (debugCargo) {
        console.log(storageToString(state.currentShip));
    }
}
function findBestPathToDig(grid, resourceCoords, maxDigs, diggingPower, harvestingPower) {
    let bestValue = 0, bestPath = null, bestMiningDigs = 0, bestHarvestDigs = 0;
    for (const {x, y} of resourceCoords) {
        const cell = grid[y][x];
        const { path, digs } = findShortestPathToCell(grid, x, y, maxDigs, diggingPower);
        const harvestDigs = Math.ceil(cell.durability / harvestingPower);
        const totalDigs = digs + harvestDigs;
        const totalValuePerMassPerDigs
            = cell.resourceUnits * resourceMap[cell.resourceType].unitCost / cell.unitMass / totalDigs;
        if (totalValuePerMassPerTime > bestValue) {
            bestPath = [...path, {x, y}];
            bestValue = totalValuePerMassPerDigs;
            bestMiningDigs = digs;
            bestHarvestDigs = harvestDigs;
        }
    }
    return {
        path: bestPath,
        miningDigs: bestMiningDigs,
        harvestDigs: bestHarvestDigs,
    };
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
    mineAsteroidBetter(simulation);
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
    mineAsteroidBetter(api, { debugCargo, debugAsteroid });
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
