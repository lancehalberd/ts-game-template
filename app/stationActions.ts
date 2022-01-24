import { dayLength } from 'app/gameConstants';
import { copyState } from 'app/state';

const baseRentalRate = 0.005;
const baseMarkup = 1.05;
const baseMarkdown = 0.95;
// This is compounded daily.
const debtInterestRate = 1.01;
function requireStorage(state: State, shipType?: ShipType): Ship | Station {
	return shipType ? requireMyShipByType(state, shipType) : state.station;
}
function advanceTimer(state: State, rawDays: number) {
	// Time is only incremented in increments of 0.1 days
	const days = Math.floor(rawDays * 10) / 10;
	const interestTicks = Math.floor(state.time + days) - Math.floor(state.time);
	state.time += days;
	state.debt *= debtInterestRate ** interestTicks;
}
function consumeFuel(state: State, fuelType: FuelType, units: number, storage: Ship | Station) {
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
function getFuelByType(state: State, type: FuelType): Fuel {
	const fuel = state.content.fuels.find(fuel => fuel.fuelType === type);
	if (!fuel) {
		throw { errorType: 'invalidRequest', errorMessage: `
			There is no fuel of type '${type}'.
		`};
	}
	return fuel;
}
function getToolByType(state: State, type: ToolType): DiggingTool {
	const tool = state.content.diggingTools.find(tool => tool.toolType === type);
	if (!tool) {
		throw { errorType: 'invalidRequest', errorMessage: `
			There is no tool of type '${type}'.
		`};
	}
	return tool;
}
function getTotalFuelFromCargo(fuelType: FuelType, storage: Station | Ship): number {
	let fuel = 0;
	for (const cargo of storage.cargo) {
		if (cargo.type === 'fuel' && cargo.fuelType === fuelType) {
			fuel += cargo.units;
		}
	}
	return fuel;
}
function getTotalShipFuel(ship: Ship): number {
	return getTotalFuelFromCargo(ship.fuelType, ship);
}
function getTotalShipMass(ship: Ship): number {
	let mass = ship.mass;
	for (const cargo of ship.cargo) {
		mass += cargo.unitMass * cargo.units;
	}
	return mass;
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
function spendCredits(state: State, baseCost: number, { spendCredit = false }) {
	const cost = Math.ceil(baseCost * baseMarkup);
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
function gainCredits(state: State, baseAmount: number) {
	let amount = Math.floor(baseAmount * baseMarkdown);
	// credits apply to debt first.
	if (state.debt >= amount) {
		state.debt -= amount;
		return;
	}
	amount -= state.debt;
	state.debt = 0;
	state.credits += amount;
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
function travelToContract(state: State, ship: Ship, distance: number, maxFuelToBurn: number) {
	const fuel = getFuelByType(state, ship.fuelType);
	let distanceTraveled = 0, kineticEnergy = 0, fuelBurnt = 0, currentVelocity = 0;
	let mass = getTotalShipMass(ship);
	while (distanceTraveled < distance && kineticEnergy >= 0) {
		// This is in days.
		advanceTimer(state, 0.1);
		// Continue burning fuel if we have not exceeded the max burn constraints
		// or already covered half of the distance.
		if (distanceTraveled < distance / 2 && fuelBurnt < maxFuelToBurn / 2) {
			// Burn fuel to accelerate.
			kineticEnergy += fuel.unitEnergy;
			kineticEnergy *= (mass - fuel.unitMass) / mass;
			mass -= fuel.unitMass;
			fuelBurnt++;
		} else if (distanceTraveled < distance / 2) {
			// Travel at constant speed until we are ready to decelerate
			const cruiseDistance = distance - 2 * distanceTraveled;
			const cruiseTime = cruiseDistance / currentVelocity;
			advanceTimer(state, cruiseTime);
		} else {
			// Burn fuel to decelerate.
			kineticEnergy -= fuel.unitEnergy;
			kineticEnergy *= (mass - fuel.unitMass) / mass;
			mass -= fuel.unitMass;
			fuelBurnt++;
		}
		// E = 1/2 mass * v**2
		const newVelocity = Math.sqrt(2 * kineticEnergy / mass); // m / s
		distanceTraveled += (newVelocity + currentVelocity) / 2 * dayLength / 10;
		currentVelocity = newVelocity;
	}
	consumeFuel(state, ship.fuelType, fuelBurnt, ship);
	return fuelBurnt;
}

export function getStationApi(state: State) {
	return {
		buyShip(shipType: ShipType, { spendCredit = false } = {}) {
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
		},
		rentShip(shipType: ShipType, days: number, { rentMultiple = false, spendCredit = false } = {}) {
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
		},
		purchaseContract(contractId: number, { replace = false, spendCredit = false } = {}) {
			if (state.currentContract && !replace) {
				throw { warningType: 'multipleContracts', warningMessage: `
					You already have a contract.
					Complete it first or call with replace=true to replace your current contract.
				`};
			}
			const contract = getContractById(state, contractId);
			spendCredits(state, contract.cost, { spendCredit });
			state.currentContract = contract;
		},
		purchaseFuel(shipType: ShipType, units: number, { spendCredit = false } = {}) {
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
		},
		purchaseTool(toolType: ToolType, units: number, target?: ShipType, { spendCredit = false } = {}) {
			const tool = getToolByType(state, toolType);
			const volumeNeeded = tool.unitVolume * units;
			const storage = requireStorage(state, target);
			const emptyCargoSpace = getEmptyCargoSpace(storage.cargoSpace, storage.cargo);
			if (emptyCargoSpace < volumeNeeded) {
				throw { errorType: 'insufficientCargoSpace', errorMessage: `
					You tried to purchase ${volumeNeeded}L of tools but you only have space for ${emptyCargoSpace}L.
				`};
			}
			spendCredits(state, tool.unitCost * units, { spendCredit });
			for (let i = 0; i < units; i++) {
				storage.cargo.push({
					...tool,
					units: 1,
				});
			}
		},
		travelToContract(shipType: ShipType, maxFuelToBurn: number, { ignoreDebtInterest = false, ignoreLongTravelTime = false } = {}) {
			if (maxFuelToBurn < 2) {
				throw { errorType: 'invalidAction', errorMessage: `
					You must burn at least 2 units of fuel during travel.
				`};
			}
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

			const simulatedState = copyState(state);
			const simulatedShip = requireMyShipByType(simulatedState, shipType);
			travelToContract(simulatedState, simulatedShip, state.currentContract.distance, maxFuelToBurn);
			const daysTraveled = simulatedState.time - state.time;
			if (daysTraveled > 20 && !ignoreLongTravelTime) {
				throw { warningType: 'longTravel', warningMessage: `
					This trip will take ${daysTraveled} days.
					Increase fuel, decrease weight or call with ignoreLongTravelTime=true.
				`};
			}
			// Increased the debt again assuming a similar return trip time.
			const debt = simulatedState.debt * debtInterestRate ** (Math.ceil(daysTraveled));
			if (debt > state.creditLimit && !ignoreDebtInterest) {
				throw { warningType: 'excessiveDebtInterest', warningMessage: `
					Assuming a similar return flight, your debt will reach $${debt} by the end of this trip,
					which exceeds your credit limit of $${state.creditLimit}.
					Increase fuel, decrease weight or call with ignoreDebtInterest=true.
				`};
			}

			// Calculate travel days
			// Warn if 2x[travel days] of interest will bankrupt you.
			state.atStation = false;
		},
		sellFuel(fuelType: FuelType, units: number, source?: ShipType) {
			const storage = requireStorage(state, source);
			consumeFuel(state, fuelType, units, storage);
			const fuel = getFuelByType(state, fuelType);
			gainCredits(state, fuel.unitCost * units);
		},
		sellOre() {

		},
		sellTool() {

		},
	};
}
