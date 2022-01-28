const resouceTypes = [];
const resourceMap = {};
const shipMap = {};
const content = gameApi.getState().content;
for (const fuel of content.fuels) {
    resouceTypes.push(fuel.cargoType);
    resourceMap[fuel.cargoType] = fuel;
}
for (const ore of content.ores) {
    resouceTypes.push(ore.cargoType);
    resourceMap[ore.cargoType] = ore;
}
for (const ship of content.ships) {
    shipMap[ship.shipType] = ship;
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
function attemptPlan(api, plan) {
    try {
        plan(api.simulate());
        plan(api);
        return true;
    } catch {
        // Do nothing if the simulation throws an error.
    }
    return false;
}
// Gets the state, quickly if the api is a simulation.
function getState(api) {
    return api.state || api.getState();
}
function getMiningState(api) {
    return api.state || api.getMiningState();
}
function digCell(api, x, y, {debugMining} = {}) {
    cell = api.getMiningCell(x, y);
    if (debugMining) {
        console.log(`Digging at ${x},${y}`, cell.durability, cell.resourceType, cell.resourceUnits);
    }
    while (cell?.durability) {
        // Choose the most appropriate available tool to dig with.
        const tool = cell.resourceType ? getHarvestingTool(api) : getDiggingTool(api);
        api.dig(x, y, tool.cargoType);
        cell = api.getMiningCell(x, y);
    }
}
function getDiggingTool(api) {
    return api.getMiningTool('magicDiggingDrill')
        || api.getMiningTool('magicDiggingLaser')
        || api.getMiningTool('advancedDiggingDrill')
        || api.getMiningTool('advancedDiggingLaser')
        || api.getMiningTool('basicDiggingDrill')
        || api.getMiningTool('basicDiggingLaser')
        || api.getMiningTool('magicHarvestingDrill')
        || api.getMiningTool('advancedHarvestingDrill')
        || api.getMiningTool('basicHarvestingDrill')
        || api.getMiningTool('smallExplosives')
        || api.getMiningTool('largeExplosives');
}
function getHarvestingTool(api) {
    return api.getMiningTool('magicHarvestingDrill')
        || api.getMiningTool('advancedHarvestingDrill')
        || api.getMiningTool('basicHarvestingDrill')
        || api.getMiningTool('magicDiggingLaser')
        || api.getMiningTool('advancedDiggingLaser')
        || api.getMiningTool('basicDiggingLaser')
        || api.getMiningTool('magicDiggingDrill')
        || api.getMiningTool('advancedDiggingDrill')
        || api.getMiningTool('basicDiggingDrill')
        || api.getMiningTool('smallExplosives')
        || api.getMiningTool('largeExplosives');
}
function mineAsteroidBetter(api, {debugCargo, debugAsteroid, debugMining} = {}) {
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
    while (getDiggingTool(api)?.remainingUses) {
        if (api.getMiningState().currentContract.cargo.length) {
            if (debugMining) {
                console.log('Stopping early, out of cargo space');
            }
            break;
        }
        state = getMiningState(api);
        const diggingDrill = getDiggingTool(api);
        const harvestingDrill = getHarvestingTool(api);
        grid = state.currentContract.grid;
        const diggingPower = diggingDrill.miningPower;
        const harvestingPower = harvestingDrill?.miningPower || diggingPower;
        const {
            path, miningDigs, harvestDigs
        } = findBestPathToDig(grid, resourceCoords, 8, diggingPower, harvestingPower);
        if (!path) {
            if (debugMining) {
                console.log('No good paths left, stopping mining');
            }
        }
        if (!attemptPlan(api, (api, dryRun) => {
            // Dig the described path to harvest from the cell.
            for (const {x, y} of path) {
                digCell(api, x, y, {debugMining: !dryRun && debugMining});
            }
        })) {
            // If the plan failed, we are done digging.
            if (debugMining) {
                console.log('Could not complete path, stopping mining');
            }
            break;
        }
        // Set the amount high to make sure we load it all.
        for (const resourceType of resouceTypes) {
            api.loadCargo(resourceType, 10000);
        }
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
function findShortestPathToCell(grid, x, y, sx, sy, maxDigs, diggingPower, isGoal = false) {
    const cell = grid[y]?.[x];
    // Do not allow shortest path to go through a cell with resources.
    if (!isGoal && cell?.resourceType) {
        return null;
    }
    // If we reach the surface we are done.
    if (!cell?.durability) {
        return {path: [], digs: 0};
    }
    const currentDigs = isGoal ? 0 : Math.ceil(cell.durability / diggingPower);
    // Stop once we have exceeded the max dig allowance for this path.
    if (currentDigs > maxDigs) {
        return null;
    }
    let bestPath;
    let neighbors;
    const T = {x, y: y - 1}, B = {x, y: y + 1}, L = {x: x - 1, y}, R = {x: x + 1, y};
    const t = y, b = grid.length - 1 - y, l = x, r = grid[0].length - 1 - x;
    const min = Math.min(t, b, l, r);
    if (t === min) {
        if (l <= r) {
            neighbors = [T, L, R];
        } else {
            neighbors = [T, R, L];
        }
    } else if (b === min) {
        if (l <= r) {
            neighbors = [B, L, R];
        } else {
            neighbors = [B, R, L];
        }
    } else if (l === min) {
        if (t <= b) {
            neighbors = [L, T, B];
        } else {
            neighbors = [L, B, T];
        }
    } else {
        if (t <= b) {
            neighbors = [R, T, B];
        } else {
            neighbors = [R, B, T];
        }
    }
    for (const neighbor of neighbors) {
        // Skip the cell we just came from.
        if (neighbor.x === sx && neighbor.y === sy) {
            continue;
        }
        const { path, digs } = findShortestPathToCell(
            grid, neighbor.x, neighbor.y, x, y, maxDigs - currentDigs, diggingPower
        ) || {};
        if (path) {
            if (digs + currentDigs <= maxDigs) {
                bestPath = path;
                maxDigs = digs + currentDigs;
            } else {

            }
        }
    }
    if (bestPath) {
        return { path: [...bestPath, {x, y}], digs: maxDigs };
    }
}
function findBestPathToDig(grid, resourceCoords, maxDigs, diggingPower, harvestingPower) {
    let bestValue = 0, bestPath = null, bestMiningDigs = 0, bestHarvestDigs = 0;
    for (const {x, y} of resourceCoords) {
        const cell = grid[y][x];
        if (!cell?.durability) {
            continue;
        }
        const harvestDigs = Math.ceil(cell.durability / harvestingPower);
        const { path, digs } = findShortestPathToCell(grid, x, y, x, y, maxDigs, diggingPower, true) || {};
        if (path) {
            const totalDigs = digs + harvestDigs;
            const { unitCost, unitMass } = resourceMap[cell.resourceType];
            const totalValuePerMassPerDigs
                = cell.resourceUnits * unitCost / unitMass / totalDigs;
            if (totalValuePerMassPerDigs > bestValue) {
                bestPath = path;
                bestValue = totalValuePerMassPerDigs;
                bestMiningDigs = digs;
                bestHarvestDigs = harvestDigs;
            }
        }
    }
    return {
        path: bestPath,
        miningDigs: bestMiningDigs,
        harvestDigs: bestHarvestDigs,
    };
}
function travelToContract(api, shipType) {
    const state = api.state || api.getStationState();
    const ship = state.station.ships.find(ship => ship.shipType === shipType);
    const fuelAmount = ship.cargo.find(cargo => cargo.cargoType === ship.fuelType).units;
    api.travelToContract(ship.shipType, Math.floor(fuelAmount / 2));
}
function returnToStation(api) {
    const state = api.state || api.getMiningState();
    const ship = state.currentShip;
    const fuelAmount = ship.cargo.find(cargo => cargo.cargoType === ship.fuelType).units;
    api.returnToStation(Math.floor(fuelAmount));
}
function getRentalTime(simulation, shipType) {
    const startTime = simulation.state.time;
    travelToContract(simulation, shipType);
    mineAsteroidBetter(simulation);
    returnToStation(simulation);
    return Math.ceil(simulation.state.time - startTime);
}
function purchaseShip(api, rentalTime, { debugActions } = {}) {
    const state = api.getStationState();
    const credits = state.credits;
    for (const shipType of ['magicSmallShip', 'advancedSmallShip', 'basicSmallShip']) {
        const myShip = state.station.ships.find(ship => ship.shipType === shipType);
        if (myShip?.isOwned) {
            if (debugActions) {
                console.log(`Using own ${shipType}`);
            }
            return shipType;
        }
        if (credits > 50000 + shipMap[shipType].cost * 1.05) {
            if (debugActions) {
                console.log(`Buying ${shipType}`);
            }
            api.purchaseShip(shipType, { spendCredit: true });
            return shipType;
        }
        /*if (credits > 200000 + shipMap[shipType].cost * 0.005 * rentalTime * 1.05) {
            if (debugActions) {
                console.log(`Renting ${shipType} for ${rentalTime} days`);
            }
            api.rentShip(shipType, rentalTime, { spendCredit: true });
            return shipType;
        }*/
    }
    api.rentShip('basicSmallShip', rentalTime, { spendCredit: true });
    return 'basicSmallShip';
}
function purchaseBasicLoadout(api, rentalTime, { debugActions } = {}) {
    const shipType = purchaseShip(api, rentalTime, { debugActions });
    if (debugActions) {
        console.log('Purchasing 60 units of fuel, 1 basic digging drill and 2 basic harvesting drills.');
    }
    api.purchaseFuel(shipType, 60, { spendCredit: true });
    api.purchaseTool('basicHarvestingDrill', 2, shipType, { spendCredit: true });
    api.purchaseTool('basicDiggingDrill', 1, shipType, { spendCredit: true });
    return shipType;
}

function startContract(api, contractIndex, {debugActions, debugCargo, debugAsteroid} = {}) {
    if (debugActions) {
        console.log('Purchasing contract ', contractIndex)
    }
    api.purchaseContract(contractIndex, { spendCredit: true });
    const rentalSimulation = api.simulate();
    let shipType = purchaseBasicLoadout(rentalSimulation, 20);
    const rentalTime = getRentalTime(rentalSimulation, shipType);
    shipType = purchaseBasicLoadout(api, rentalTime, {debugActions});
    if (debugActions) {
        console.log('Traveling to contract ');
    }
    travelToContract(api, shipType);
    return shipType;
}
function runContract(api, contractIndex, {debugActions, debugCargo, debugAsteroid} = {}) {
    const shipType = startContract(api, contractIndex, {debugActions, debugCargo, debugAsteroid});
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

    const ship = api.getShip(shipType);
    //console.log(api.getStationState().credits - api.getStationState().debt);
    if (ship.isRented) {
        api.returnShip(shipType, { liquidateCargo: true });
    } else {
        api.sellAllCargo(shipType);
    }
    //console.log('=> ' + (api.getStationState().credits - api.getStationState().debt));
}
function getShipValues(api) {
    return api.getStationState().station.ships.reduce((sum, ship) => sum + ship.cost * 1.05, 0);
}
function getBestContract(api, maxContractIndex, { debugAsteroid, debugCargo, debugResults } = {}) {
    let bestContract = -1, bestResult = 1000, bestRentalTime = 20;
    const startState = gameApi.getStationState();
    const startTime = startState.time;

    const startCredits = startState.credits - startState.debt + getShipValues(api);
    for (let i = 0; i < maxContractIndex; i++) {
        try {
            const simulation = gameApi.simulate();
            runContract(simulation, i, { debugAsteroid, debugCargo });
            const deltaCredits = (simulation.state.credits - simulation.state.debt) - startCredits + getShipValues(simulation);
            const deltaTime = simulation.state.time - startTime;
            const result = deltaCredits / deltaTime;
            if (result > bestResult) {
                if (debugResults) {
                    console.log('New PR :) ', result, i, deltaTime);
                }
                bestResult = result;
                bestContract = i;
                bestRentalTime = Math.ceil(deltaTime);
            } else if (debugResults) {
                console.log('Worse :( ', result, i, deltaTime);
            }
        } catch (e) {
            if (debugResults) {
                console.log('Failed on', i, e);
            }
        }
    }
    return bestContract;
}

function runBestContract(api, maxContractIndex, { debugActions, debugAsteroid, debugCargo, debugResults } = {}) {
    const bestContract = getBestContract(api, maxContractIndex, { debugAsteroid, debugCargo, debugResults });
    if (bestContract < 0) {
        if (debugActions) {
            console.log('No profitable contracts, resting');
        }
        gameApi.rest();
        return;
    }
    runContract(gameApi, bestContract, {debugActions});
}

//const bestContract = getBestContract(gameApi, 5, { debugAsteroid: false, debugCargo: false });
//startContract(gameApi, 0, { debugAsteroid: false, debugCargo: false });refreshReact();

//runBestContract(gameApi, 10, { debugAsteroid: false, debugCargo: false });refreshReact();
runBestContract(gameApi, 10, { debugActions: true, debugResults: false, debugAsteroid: false, debugCargo: false });refreshReact();
