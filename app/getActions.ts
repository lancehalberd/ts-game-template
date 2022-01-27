import {
    copyContract, copyState, copyMiningState, copyStationState, getTotalShipFuel,getCargoByType
} from 'app/state';

export function getGetActions(state: State) {
    return {
        getState() {
            return copyState(state);
        },
        getMiningState() {
            return copyMiningState(state);
        },
        getTotalShipFuel(ship: Ship) {
            return getTotalShipFuel(ship);
        },
        getMiningCell(x: number, y: number) {
            return {...state.currentContract?.grid?.[y]?.[x]};
        },
        getMiningTool(toolType: ToolType) {
            return {...state.currentShip?.cargo.find(cargo => cargo.cargoType === toolType)};
        },
        getStationState() {
            return copyStationState(state);
        },
        getAvailableContracts() {
            return state.station.availableContracts.map(copyContract);
        },
        getContract(index: number) {
            return copyContract(state.station.availableContracts[index]);
        },
        getCargoByType(cargoType: CargoType) {
            return {...getCargoByType(state, cargoType)};
        }
    };
}
