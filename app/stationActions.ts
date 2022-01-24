const baseRentalRate = 0.005;

function getFuelByType(state: State, type: FuelType): Fuel {
	const fuel = state.content.fuels.find(fuel => fuel.fuelType === type);
	if (!fuel) {
		throw { errorType: 'invalidRequest', errorMessage: `
			There is no fuel of type '${type}'.
		`};
	}
	return fuel;
}
function getTotalShipFuel(ship: Ship): number {
	let fuel = 0;
	for (const cargo of ship.cargo) {
		if (cargo.type === 'fuel' && cargo.fuelType === ship.fuelType) {
			fuel += cargo.units;
		}
	}
	return fuel;
}
function getShipByType(state: State, type: ShipType): Ship {
	const ship = state.content.ships.find(ship => ship.shipType === type);
	if (!ship) {
		throw { errorType: 'invalidRequest', errorMessage: `
			There is no ship of type '${type}' for rental.
		`};
	}
	return ship;
}
function getMyShipByType(state: State, type: ShipType): Ship | undefined {
	return state.station.ships.find(ship => ship.shipType === type);
}
function requireMyShipByType(state: State, type: ShipType): Ship {
	const myShip = state.station.ships.find(ship => ship.shipType === type);
	if (!myShip) {
		throw { errorType: 'invalidRequest', errorMessage: `
			You do not have a ship of type '${type}' in your possession.
		`};
	}
	return myShip;
}
function spendCredits(state: State, cost: number, { spendCredit = false }) {
	const debtSpending = Math.max(0, cost - state.credits);
	if (state.debt + debtSpending > state.creditLimit) {
		throw { errorType: 'creditExceeded', errorMessage: `
			Your credit limit is $${state.creditLimit}.
			Spending $${cost} would increase your debt to $${state.debt + debtSpending}.
		`};
	}
	if (!spendCredit && debtSpending > 0) {
		throw { warningType: 'spendingCredit', warningMessage: `
			This action will increase your debt to $${state.debt + debtSpending}.
			Call with spendCredit=true to complete this transaction.
		`};
	}
	state.credits = Math.max(0, state.credits - cost);
	state.debt += debtSpending;
}
function getContractById(state: State, id: number): Contract {
	const contract = state.station.availableContracts.find(contract => contract.id === id);
	if (!contract) {
		throw { errorType: 'invalidRequest', errorMessage: `
			There is no contract available with id '${id}'.
		`};
	}
	return contract;
}
function getEmptyCargoSpace(cargoSize: number, cargo: Cargo[]): number {
	let emptyCargoSpace = cargoSize;
	for (const item of cargo) {
		emptyCargoSpace -= item.unitVolume * item.units;
	}
	return emptyCargoSpace;
}

export function getStationApi(state: State) {
	return {
		buyShip(shipType: ShipType, { spendCredit = false } = {}): GameApiResponse {
			const ship = getShipByType(state, shipType);
			const myShip = getMyShipByType(state, shipType);
			if (myShip?.isOwned) {
				throw { errorType: 'duplicateShip', errorMessage: `
					You already own a ${myShip.name}.
				`};
			}
			spendCredits(state, ship.cost, { spendCredit });
			if (myShip) {
				myShip.isRented = false;
				myShip.isOwned = true;
			} else {
				state.station.ships.push({
					...ship,
					isOwned: true,
				});
			}
			return { success: true };
		},
		rentShip(shipType: ShipType, days: number, { rentMultiple = false, spendCredit = false } = {}): GameApiResponse {
			const ship = getShipByType(state, shipType);
			const myShip = getMyShipByType(state, shipType);
			if (myShip) {
				if (myShip.isOwned) {
					throw { errorType: 'duplicateShip', errorMessage: `
						You already own a ${myShip.name}.
					`}
				}
				throw { errorType: 'duplicateShip', errorMessage: `
					You already have a ${myShip.name} rented.
				`};
			}
			if (!rentMultiple && state.station.ships.length) {
				throw { warningType: 'multipleRentals', warningMessage: `
					You already have a shipped rented.
					Return it first or call with force=true to complete this transaction.
				`};
			}
			const cost = Math.ceil(ship.cost * baseRentalRate * days);
			spendCredits(state, cost, { spendCredit });
			state.station.ships.push({
				...ship,
				isRented: true,
				returnTime: Math.floor(state.time + days),
			});
			return { success: true };
		},
		purchaseContract(contractId: number, { replace = false, spendCredit = false } = {}): GameApiResponse {
			if (state.currentContract && !replace) {
				throw { warningType: 'multipleContracts', warningMessage: `
					You already have a contract.
					Complete it first or call with replace=true to replace your current contract.
				`};
			}
			const contract = getContractById(state, contractId);
			spendCredits(state, contract.cost, { spendCredit });
			state.currentContract = contract;
			return { success: true };
		},
		purchaseFuel(shipType: ShipType, units: number, { spendCredit = false } = {}): GameApiResponse {
			const myShip = requireMyShipByType(state, shipType);
			const fuel = getFuelByType(state, myShip.fuelType);
			const volume = fuel.unitVolume * units;
			const emptyCargoSpace = getEmptyCargoSpace(myShip.cargoSpace, myShip.cargo);
			if (emptyCargoSpace < volume) {
				throw { errorType: 'insufficientCargoSpace', errorMessage: `
					You tried to purchase ${volume}L of fuel but you only have space for ${emptyCargoSpace}L.
				`};
			}
			const cost = fuel.unitCost * units;
			spendCredits(state, cost, { spendCredit });
			myShip.cargo.push({
				...fuel,
				units,
			});
			return { success: true };
		},
		travelToContract(shipType: ShipType, maxFuelToBurn: number, { ignoreDebtInterest = false, ignoreLongTravelTime = false } = {}): GameApiResponse {
			if (!state.currentContract) {
				throw { errorType: 'noContract', errorMessage: `
					You need to purchase a contract before traveling.
				`};
			}
			const myShip = requireMyShipByType(state, shipType);
			if (!myShip.cargo.some(cargo => cargo.type === 'tool')) {
				throw { errorType: 'noTools', errorMessage: `
					The selected ship has no digging tools in its cargo.
				`};
			}
			const fuel = getFuelByType(state, myShip.fuelType);
			const fuelAmount = getTotalShipFuel(myShip);
			if (fuelAmount < maxFuelToBurn) {
				throw { errorType: 'insufficientFuel', errorMessage: `
					The selected ship only has ${fuel}L of ${fuel.name}.
				`};
			}

			// Calculate travel days
			// Warn if travel time at max burn is more than 20 days.
			// Warn if 2x[travel days] of interest will bankrupt you.
			state.atStation = false;
			return { success: true };
		},
	};
}
