import { Button, Slider, Stack } from '@mui/material';
import { getTotalShipFuel } from 'app/state';
import * as React from 'react';
import { GameContext } from '../App';

const FuelSlider = ({
    onChange,
    maxAmount,
    defaultAmount = 20,
}: {
    onChange: (units: number) => void;
    maxAmount: number;
    defaultAmount?: number;
}) => {
    const [fuelUnits, setFuelUnits] = React.useState<number>(defaultAmount);
    const handleChange = (event: Event, newValue: number | number[]) => {
        const newUnits = newValue as number;
        setFuelUnits(newUnits);
        onChange(newUnits);
    };

    return (
        <div className="preview-fuel-slider">
            <Slider
                aria-label="Fuel Units"
                value={fuelUnits}
                max={maxAmount}
                min={2}
                valueLabelDisplay="auto"
                onChange={handleChange}
            />
        </div>
    );
};

const PreviewTrip = () => {
    const { gameState, gameApi, refreshGameState } =
        React.useContext(GameContext);
    const [fuelBurnUnits, setFuelBurnUnits] = React.useState(0);
    const contract = gameState.currentContract;
    const ship = gameState.station.ships[0];
    const diggingTool = ship?.cargo.find(
        (cargoItem) => cargoItem.type === 'tool'
    );
    const shipFuelUnits = ship ? getTotalShipFuel(ship) : 0;

    if (!contract || !ship || !diggingTool || shipFuelUnits === 0) {
        return (
            <div style={{ padding: '40px' }}>
                <h3>Before you can Preview</h3>
                <p>You need to:</p>
                <ul>
                    <li>Purchase a Contract</li>
                    <li>Rent a Ship</li>
                    <li>Purchase Fuel for your Ship</li>
                    <li>Purchase a Digging Tool</li>
                </ul>
            </div>
        );
    }

    const actualFuelBurnUnits =
        fuelBurnUnits > 0 ? fuelBurnUnits : Math.floor(shipFuelUnits / 2);
    const simulateApi = gameApi.simulate();
    const startTime = simulateApi!.state!.time;
    simulateApi.travelToContract(ship.shipType, actualFuelBurnUnits, {
        ignoreLongTravelTime: true,
    });
    const timeToTravel = Math.floor(simulateApi!.state!.time - startTime);

    const handleFuelChange = (units: number) => {
        setFuelBurnUnits(units);
    };

    const handleEmbarkClick = () => {
        gameApi.travelToContract(ship.shipType, actualFuelBurnUnits);
        refreshGameState();
    };

    return (
        <div className="preview-trip">
            <h3>Distance to Asteroid:</h3>
            {contract.distance} meters
            <h3>Fuel to Burn:</h3>
            <Stack
                spacing={2}
                direction="row"
                sx={{ mb: 1 }}
                alignItems="center"
            >
                <h3 style={{ color: 'green' }}>2</h3>
                <FuelSlider
                    maxAmount={shipFuelUnits}
                    onChange={handleFuelChange}
                    defaultAmount={Math.floor(shipFuelUnits / 2)}
                />
                <h3 style={{ color: 'orange' }}>{shipFuelUnits} units</h3>
            </Stack>
            <h3>Time to Arrive:</h3>
            {timeToTravel} days
            <div className="action-buttons">
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleEmbarkClick}
                >
                    Embark on this Contract
                </Button>
            </div>
        </div>
    );
};

export default PreviewTrip;
