import { dayLength, debtInterestRate, energyUnit } from 'app/gameConstants';
import {
	advanceTimer,
	consumeFuel,
	copyState,
	getEmptyCargoSpace,
	getFuelByType,
	getToolByType,
	getTotalShipFuel,
} from 'app/state';

const baseRentalRate = 0.005;
const baseMarkup = 1.05;
const baseMarkdown = 0.95;

function requireStationStorage(state: State, shipType?: ShipType): Ship | Station {
    return shipType ? requireMyShipByType(state, shipType) : state.station;
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
			kineticEnergy += fuel.unitEnergy * energyUnit;
			kineticEnergy *= (mass - fuel.unitMass) / mass;
			mass -= fuel.unitMass;
			fuelBurnt++;
		} else if (distanceTraveled < distance / 2) {
			// Travel at constant speed until we are ready to decelerate
			const cruiseDistance = distance - 2 * distanceTraveled;
			const cruiseTime = Math.floor(10 * cruiseDistance / currentVelocity / dayLength) / 10;
			advanceTimer(state, cruiseTime);
			distanceTraveled += cruiseTime * dayLength * currentVelocity;
			// Just in case make sure we get to the back half of the trip, probably not necessary.
			distanceTraveled = Math.max(distanceTraveled, distance / 2);
		} else {
			// Burn fuel to decelerate.
			kineticEnergy -= fuel.unitEnergy * energyUnit;
			kineticEnergy *= (mass - fuel.unitMass) / mass;
			mass -= fuel.unitMass;
			fuelBurnt++;
		}
		// E = 1/2 mass * v**2
		const newVelocity = Math.sqrt(2 * kineticEnergy / mass); // m / s
		distanceTraveled += (newVelocity + currentVelocity) / 2 * dayLength / 10;
		currentVelocity = newVelocity;
		// console.log({ time: state.time, kineticEnergy, currentVelocity, distanceTraveled });
	}
	consumeFuel(state, ship.fuelType, fuelBurnt, ship);
	return fuelBurnt;
}

export function getStationApi(state: State) {
	return {
		purchaseShip(shipType: ShipType, { spendCredit = false } = {}) {
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
			const storage = requireStationStorage(state, target);
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
			// If there are no warnings or errors, actually travel to the contract.
			travelToContract(state, myShip, state.currentContract.distance, maxFuelToBurn);
			state.currentShip = myShip;
			state.atStation = false;
		},
		sellFuel(fuelType: FuelType, units: number, source?: ShipType) {
			const storage = requireStationStorage(state, source);
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
