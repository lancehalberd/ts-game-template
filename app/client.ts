import { generateInitialState } from 'app/content';
import { getStationApi } from 'app/stationActions';

function copyCargo(cargo: Cargo[]) {
    return cargo.map(cargo => ({...cargo}));
}
function copyShip(ship: Ship) {
    return {
        ...ship,
        cargo: copyCargo(ship.cargo),
    }
}
function copyContract(contract: Contract) {
    return {
        ...contract,
        grid: contract.grid.map(row => row.map(cell => ({...cell}))),
    }
}
// If we ever have private data on the state, we could make a PublicState interface and make a copyPublicState function.
function copyState(state: State): State {
    return {
        ...state,
        station: {
            cargoSpace: state.station.cargoSpace,
            cargo: copyCargo(state.station.cargo),
            availableContracts: state.station.availableContracts.map(copyContract),
            ships: state.station.ships.map(copyShip),
        },
        atStation: state.atStation,
        currentContract: state.currentContract ? copyContract(state.currentContract) : undefined,
        currentShip: state.currentShip ? copyShip(state.currentShip) : undefined,
    };
}

window.gameApi = (() => {
    const state: State = generateInitialState();
    return {
        getState() {
            return copyState(state);
        },
        // To use the simulation
        simulate() {
            const simulatedState = copyState(state);
            return {
                simulatedState,
                ...getStationApi(simulatedState),
            };
        },
        ...getStationApi(state),
    };
})();
