import { baseMarkdown, baseRentalRate } from 'app/gameConstants';
import {
    attemptTravel,
    getCargoByType,
    getEmptyCargoSpace,
    getFuelByType,
    getToolByType,
    getTotalCargoUnits,
    moveCargo,
    requireMyShipByType,
    spendCredits,
} from 'app/state';


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
function sellAllCargo(state: State, storage: CargoStorage) {
    while (storage.cargo.length) {
        const cargo = storage.cargo.pop()!;
        if (cargo.type === 'tool') {
            const toolDefinition = getToolByType(state, cargo.cargoType);
            // Sell each tool one at a time, and pro-rate it based on remaining uses.
            gainCredits(state, cargo.unitCost * cargo.remainingUses / toolDefinition.remainingUses);
        } else {
            gainCredits(state, cargo.unitCost * cargo.units);
        }
    }
}

function returnShip(state: State, ship: Ship, liquidateCargo = false) {
    if (ship.cargo.length) {
        if (!liquidateCargo) {
            throw { warningType: 'shipIsNotEmpty', errorMessage: `
                The '${ship.name}' still has cargo in it.
                Remove cargo or call with liquidateCargo=true to automatically sell all cargo.
            `}
        }
        sellAllCargo(state, ship);
    }
    state.station.ships.splice(state.station.ships.indexOf(ship), 1);
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
        sellShip(shipType: ShipType, { liquidateCargo = false } = {}) {
            requireAtStation(state);
            const ship = getShipByType(state, shipType);
            const myShip = getMyShipByType(state, shipType);
            if (!myShip?.isOwned) {
                throw { errorType: 'shipNotOwned', errorMessage: `
                    You do not have a ${ship.name} to sell.
                `};
            }
            returnShip(state, myShip, liquidateCargo);
            gainCredits(state, ship.cost);
        },
        rentShip(shipType: ShipType, days: number, { extendRental = false, rentMultiple = false, spendCredit = false } = {}) {
            requireAtStation(state);
            const ship = getShipByType(state, shipType);
            const myShip = getMyShipByType(state, shipType);
            const cost = Math.ceil(ship.cost * baseRentalRate * days);
            if (myShip) {
                if (myShip.isOwned) {
                    throw { errorType: 'duplicateShip', errorMessage: `
                        You already own a ${myShip.name}.
                    `}
                }
                if (myShip.returnTime || 0 <= state.time) {
                    throw { errorType: 'duplicateShip', errorMessage: `
                        You already have a ${myShip.name} rented.
                        Ship is overdue and must be returned before renting again.
                    `};
                }
                if (!extendRental) {
                    throw { warningType: 'duplicateShip', errorMessage: `
                        You already have a ${myShip.name} rented.
                        Call with extendRental = true to add additional days.
                    `};
                }
                myShip.returnTime = (myShip.returnTime || state.time) + days;
                spendCredits(state, cost, { spendCredit });
                return
            }
            if (!rentMultiple && state.station.ships.length) {
                throw { warningType: 'multipleRentals', warningMessage: `
                    You already have a shipped rented.
                    Return it first or call with rentMultiple=true to complete this transaction.
                `};
            }
            spendCredits(state, cost, { spendCredit });
            state.station.ships.push({
                ...ship,
                isRented: true,
                returnTime: Math.floor(state.time + days),
            });
        },
        returnShip(shipType: ShipType, { liquidateCargo = false } = {}) {
            requireAtStation(state);
            const myShip = requireMyShipByType(state, shipType);
            if (!myShip.isRented) {
                throw { errorType: 'shipOwned', errorMessage: `
                    The '${myShip.name}' is not a rental.
                `}
            }
            returnShip(state, myShip, liquidateCargo);
            const daysOverdue = Math.floor(state.time) - Math.floor(myShip.returnTime || 0);
            if (daysOverdue > 0) {
                // Overdue charge must be spent so it is allowed to exceed debt limit.
                // Charge is 2x base rental price per day.
                spendCredits(state, daysOverdue * myShip.cost * baseRentalRate * 2, {force: true})
            } else if (daysOverdue < 0) {
                // Returning a ship early refunds 1/2 base rental price per day.
                gainCredits(state, -daysOverdue * myShip.cost * baseRentalRate / 2);
            }
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
        // Sell all cargo of a specific type from a specific storage source.
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
        sellAllOre(source?: ShipType) {
            requireAtStation(state);
            const storage = requireStationStorage(state, source);
            for (let i = 0; i < storage.cargo.length; i++) {
                const cargo = storage.cargo[i];
                if (cargo.type === 'ore') {
                    storage.cargo.splice(i--, 1);
                    gainCredits(state, cargo.unitCost * cargo.units);
                }
            }
        },
        // Sell all cargo located in a specific storage source.
        sellAllCargo(source?: ShipType) {
            requireAtStation(state);
            const storage = requireStationStorage(state, source);
            sellAllCargo(state, storage);
        },
        moveCargo(cargoType: CargoType, units: number, source?: ShipType, target?: ShipType) {
            requireAtStation(state);
            const storageSource = requireStationStorage(state, source);
            const storageTarget = requireStationStorage(state, target);
            moveCargo(state, cargoType, units, storageSource, storageTarget);
        },
        travelToContract(shipType: ShipType, maxFuelToBurn: number, { ignoreDebtInterest = false, ignoreLongTravelTime = false } = {}) {
            requireAtStation(state);
            if (!state.currentContract) {
                throw { errorType: 'noContract', errorMessage: `
                    You need to purchase a contract before traveling.
                `};
            }
            const myShip = requireMyShipByType(state, shipType);
            for (const ship of state.station.ships) {
                if (ship.isRented && (ship.returnTime || 0) <= state.time) {
                    throw { errorType: 'rentalOverdue', errorMessage: `
                        You have an overdue '${ship.name}' that must be returned before you can leave the station.
                    `};
                }
            }
            if (!myShip.cargo.some(cargo => cargo.type === 'tool')) {
                throw { errorType: 'noTools', errorMessage: `
                    The selected ship has no digging tools in its cargo.
                `};
            }
            attemptTravel(state, myShip, state.currentContract.distance, maxFuelToBurn, { ignoreDebtInterest, ignoreLongTravelTime } );
            state.currentShip = myShip;
            state.atStation = false;
        },
    };
}
