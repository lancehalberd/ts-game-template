
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

gameApi.purchaseContract(0)
gameApi.rentShip('basicShip', 20)
gameApi.purchaseFuel('basicShip', 60, { spendCredit: true });
gameApi.purchaseTool('basicDiggingDrill', 1, 'basicShip', { spendCredit: true });
gameApi.purchaseTool('basicHarvestingDrill', 2, 'basicShip', { spendCredit: true });
simulation = gameApi.simulate();
let state = simulation.state;
console.log('time', state.time);
console.log('debt', state.debt);
console.log('distance', state.currentContract.distance);
simulation.travelToContract('basicShip', 30);
console.log('time', state.time);

console.log(asteroidToString(state.currentContract));
let rows = state.currentContract.grid.length
let columns = state.currentContract.grid[0].length
let x = 0, y = 0;
function getTool(toolType) {
    return state.currentShip.cargo.find(cargo => cargo.cargoType === toolType);
}
while (getTool('basicDiggingDrill')?.remainingUses) {
    if (state.currentContract.grid[y][x]?.durability) {
        try {
            // Use the harvesting drill for resources if any uses are left.
            if (getTool('basicHarvestingDrill')?.remainingUses
                && state.currentContract.grid[y][x].resourceType
            ) {
                simulation.dig(x, y, 'basicHarvestingDrill');
            } else {
                simulation.dig(x, y, 'basicDiggingDrill');
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
console.log(asteroidToString(state.currentContract));
// Set the amount high to make sure we load it all.
simulation.loadCargo('iron', 10000);
console.log(storageToString(state.currentShip));
simulation.returnToStation(30);
console.log('Credit/Debt', state.credits, '/', state.debt);
simulation.sellAllOre('basicShip');
console.log('Credit/Debt', state.credits, '/', state.debt);
console.log('Time/Rental Due', state.time, '/', state.station.ships[0].returnTime);
simulation.returnShip('basicShip', { liquidateCargo: true });
refreshReact(simulation);
