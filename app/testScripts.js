gameApi.purchaseContract(0)
gameApi.rentShip('basicShip', 20)
gameApi.purchaseFuel('basicShip', 50, { spendCredit: true });
gameApi.purchaseTool('basicDiggingDrill', 1, 'basicShip', { spendCredit: true });
simulation = gameApi.simulate();
console.log('time', simulation.simulatedState.time);
console.log('debt', simulation.simulatedState.debt);
console.log('distance', simulation.simulatedState.currentContract.distance);
simulation.travelToContract('basicShip', 50);
console.log('time', simulation.simulatedState.time);
