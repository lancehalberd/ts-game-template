import {
    copyContract, copyShip, copyState, copyMiningState, copyStationState, getTotalShipFuel,getCargoByType
} from 'app/state';

export function getGetActions(state: State) {
    return {
        getState() {
            return copyState(state);
        },
        getMiningState() {
            return copyMiningState(state);
        },
        getShip(shipType: ShipType): Ship | undefined {
            const ship = state.station.ships.find(ship => ship.shipType === shipType);
            if (ship) {
                return copyShip(ship);
            }
        },
        getTotalShipFuel(ship: Ship) {
            return getTotalShipFuel(ship);
        },
        getMiningCell(x: number, y: number): MiningCell | null {
            const cell = state.currentContract?.grid?.[y]?.[x] || null;
            return cell ? {...cell} : cell;
        },
        getMiningTool(toolType: ToolType): DiggingTool | null {
            const tool = state.currentShip?.cargo.find(cargo => cargo.cargoType === toolType) as DiggingTool;
            return tool ? {...tool} : null;
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
