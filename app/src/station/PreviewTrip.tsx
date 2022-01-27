import * as React from 'react';
import { GameContext } from '../App';

const PreviewTrip = () => {
    const { gameState, gameApi } = React.useContext(GameContext);
    const contract = gameState.currentContract;
    const ship = gameState.station.ships[0];
    const diggingTool = ship?.cargo.find(
        (cargoItem) => cargoItem.type === 'tool'
    );
    if (!contract || !ship || !diggingTool) {
        return (
            <div style={{ padding: '40px' }}>
                Please purchase a Contract, rent a Ship. and purchase a Digging
                Tool.
            </div>
        );
    }
    const simulateApi = gameApi.simulate();
    const startTime = simulateApi!.state!.time;
    const fuelUnits =
        (ship &&
            ship.cargo.find((cargo) => cargo.cargoType === ship.fuelType)
                ?.units) ||
        0;
    simulateApi.travelToContract(ship.shipType, fuelUnits);
    const timeToTravel = Math.ceil(simulateApi!.state!.time - startTime);

    return (
        <div className="preview-trip">
            <h3>Distance to Asteroid:</h3>
            {contract.distance} meters
            <h3>Fuel:</h3>
            {fuelUnits} units
            <h3>Time to Arrive:</h3>
            {timeToTravel} ?
        </div>
    );
};

export default PreviewTrip;
