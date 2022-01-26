
function asteroidToString(contract) {
    return contract.grid.map(row => row.map(cell => {
        if (!cell) return ' ';
        if (cell.resourceType === 'iron') {
            return 'I';
        }
        return Math.min(9, Math.round(cell.durability / 100));
    }).join('')).join("\n");
}

gameApi.purchaseContract(0)
gameApi.rentShip('basicShip', 20)
gameApi.purchaseFuel('basicShip', 60, { spendCredit: true });
gameApi.purchaseTool('basicDiggingDrill', 1, 'basicShip', { spendCredit: true });
simulation = gameApi.simulate();
let simulatedState = simulation.simulatedState;
console.log('time', simulatedState.time);
console.log('debt', simulatedState.debt);
console.log('distance', simulatedState.currentContract.distance);
simulation.travelToContract('basicShip', 30);
console.log('time', simulatedState.time);

console.log(asteroidToString(simulatedState.currentContract));
let rows = simulatedState.currentContract.grid.length
let columns = simulatedState.currentContract.grid[0].length
let x = 0, y = 0;
while (simulatedState.currentShip.cargo[1]?.remainingUses) {
    try {
        simulation.dig(x, y, 'basicDiggingDrill');
        continue;
    } catch {

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
console.log(asteroidToString(simulatedState.currentContract));
// Set the amount high to make sure we load it all.
simulation.loadCargo('iron', 10000);
simulation.returnToStation(30);
simulation.sellAllCargoByType('iron', 'basicShip');
console.log('Credit/Debt', simulatedState.credits, '/', simulatedState.debt);
console.log('Time/Rental Due', simulatedState.time, '/', simulatedState.station.ships[0].returnTime);
