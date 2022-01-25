import {
    attemptTravel,
    getCargoByType,
    getEmptyCargoSpace,
    getFuelByType,
    getToolByType,
    getTotalCargoUnits,
    moveCargo,
    requireMyShipByType,
} from 'app/state';

const baseRentalRate = 0.005;
const baseMarkup = 1.05;
const baseMarkdown = 0.95;

function requireAtStation(state: State) {
    if (!state.atStation) {
        throw { errorType: 'notAtStation', errorMessage: `
            You must be at the station to perform this action.
        `};
    }
}
function requireStationStorage(state: State, shipType?: ShipType): Ship | Station {
    return shipType ? requireMyShipByType(state, shipType) : state.station;
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

export function getStationApi(state: State) {
    return {
        purchaseShip(shipType: ShipType, { spendCredit = false } = {}) {
            requireAtStation(state);
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
            requireAtStation(state);
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
            requireAtStation(state);
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
            requireAtStation(state);
            const myShip = requireMyShipByType(state, shipType);
            const fuel = getFuelByType(state, myShip.fuelType);
            const volume = fuel.unitVolume * units;
            const emptyCargoSpace = getEmptyCargoSpace(myShip);
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
            requireAtStation(state);
            const tool = getToolByType(state, toolType);
            const volumeNeeded = tool.unitVolume * units;
            const storage = requireStationStorage(state, target);
            const emptyCargoSpace = getEmptyCargoSpace(storage);
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
            requireAtStation(state);
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
            attemptTravel(state, myShip, state.currentContract.distance, maxFuelToBurn, { ignoreDebtInterest, ignoreLongTravelTime } );
            state.currentShip = myShip;
            state.atStation = false;
        },
        sellCargo(cargoType: CargoType, units: number, source?: ShipType) {
            requireAtStation(state);
            const storage = requireStationStorage(state, source);
            const cargoDefinition = getCargoByType(state, cargoType);
            const total = getTotalCargoUnits(cargoType, storage);
            if (total < units) {
                throw { errorType: 'invalidAmount', errorMessage: `
                    You only have ${total} units available to sell.
                `};
            }
            let unitsRemaining = units;
            const isDiscrete = cargoDefinition.type === 'tool';
            for (let i = 0; i < storage.cargo.length && unitsRemaining > 0; i++) {
                const cargo = storage.cargo[i];
                if (cargo.cargoType === cargoType) {
                    if (unitsRemaining >= cargo.units) {
                        unitsRemaining -= cargo.units;
                        storage.cargo.splice(i--, 1);
                        if (isDiscrete && cargo.type === 'tool') {
                            // Sell each tool one at a time, and pro-rate it based on remaining uses.
                            gainCredits(state, cargo.unitCost * cargo.remainingUses / cargoDefinition.remainingUses);
                        }
                    } else if (!isDiscrete) {
                        cargo.units -= unitsRemaining;
                    }
                }
            }
            // If we weren't selling discrete tools, we gain all the credits at once after removing the cargo.
            if (!isDiscrete) {
                gainCredits(state, cargoDefinition.unitCost * units);
            }
        },
        sellAllCargoByType(cargoType: CargoType, source?: ShipType) {
            requireAtStation(state);
            const storage = requireStationStorage(state, source);
            const cargoDefinition = getCargoByType(state, cargoType);
            let unitsSold = 0;
            for (let i = 0; i < storage.cargo.length; i++) {
                const cargo = storage.cargo[i];
                if (cargo.cargoType === cargoType) {
                    storage.cargo.splice(i--, 1);
                    if (cargoDefinition.type === 'tool' && cargo.type === 'tool') {
                        // Sell each tool one at a time, and pro-rate it based on remaining uses.
                        gainCredits(state, cargo.unitCost * cargo.remainingUses / cargoDefinition.remainingUses);
                    } else {
                        unitsSold += cargo.units;
                    }
                }
            }
            if (unitsSold > 0) {
                gainCredits(state, cargoDefinition.unitCost * unitsSold);
            }
        },
        moveCargo(cargoType: CargoType, units: number, source?: ShipType, target?: ShipType) {
            requireAtStation(state);
            const storageSource = requireStationStorage(state, source);
            const storageTarget = requireStationStorage(state, target);
            moveCargo(state, cargoType, units, storageSource, storageTarget);
        },
    };
}
