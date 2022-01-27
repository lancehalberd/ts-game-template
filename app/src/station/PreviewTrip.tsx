import { Button, Slider, Stack } from '@mui/material';
import { getTotalShipFuel } from 'app/state';
import * as React from 'react';
import { GameContext } from '../App';

const MIN_FUEL_BURN = 10;

const FuelSlider = ({
    onChange,
    maxAmount,
    amount,
}: {
    onChange: (units: number) => void;
    maxAmount: number;
    amount: number;
}) => {
    const handleChange = (event: Event, newValue: number | number[]) => {
        const newUnits = newValue as number;
        onChange(newUnits);
    };

    return (
        <div className="preview-fuel-slider">
            <Slider
                aria-label="Fuel Units"
                value={amount}
                max={maxAmount}
                min={MIN_FUEL_BURN}
                valueLabelDisplay="auto"
                onChange={handleChange}
            />
        </div>
    );
};


const PreviewTrip = () => {
    const { gameState, gameApi, refreshGameState } =
        React.useContext(GameContext);
    const ship = gameState.station.ships[0];
    const shipFuelUnits = ship ? getTotalShipFuel(ship) : 0;
    const [fuelBurnUnits, setFuelBurnUnits] = React.useState(Math.max(MIN_FUEL_BURN, Math.floor(shipFuelUnits / 2)));
    const contract = gameState.currentContract;
    const diggingTool = ship?.cargo.find(
        (cargoItem) => cargoItem.type === 'tool'
    );

    const requirements: string[] = [];
    if (!contract) {
        requirements.push('Purchase a Contract');
    }
    if (!ship) {
        requirements.push('Purchase or rent a ship');
    }
    if (shipFuelUnits < MIN_FUEL_BURN) {
        requirements.push(`Purchase at least ${MIN_FUEL_BURN}L of Fuel for your Ship`);
    }
    if (!diggingTool) {
        requirements.push('Purchase a Digging Tool');
    }
    if (requirements.length) {
        return (
            <div style={{ padding: '40px' }}>
                <h3>Before you can depart</h3>
                <p>You still need to:</p>
                <ul>
                    { requirements.map(text => (<li key={text}>{text}</li>))}
                </ul>
            </div>
        );
    }

    let timeToTravel: string;
    try {
        const simulateApi = gameApi.simulate();
        const startTime = simulateApi!.state!.time;
        simulateApi.travelToContract(ship.shipType, fuelBurnUnits, {
            ignoreLongTravelTime: true,
        });
        timeToTravel = `${Math.floor(simulateApi!.state!.time - startTime)} days`;
    } catch {
        timeToTravel = 'Error, try burning more fuel';
    }

    const handleFuelChange = (units: number) => {
        setFuelBurnUnits(units);
    };

    const handleEmbarkClick = () => {
        gameApi.travelToContract(ship.shipType, fuelBurnUnits);
        refreshGameState();
    };

    return (
        <div className="preview-trip">
            <h3>Distance to Asteroid:</h3>
            {contract!.distance} meters
            <h3>Fuel to Burn:</h3>
            <Stack
                spacing={2}
                direction="row"
                sx={{ mb: 1 }}
                alignItems="center"
            >
                <h3 style={{ color: 'green' }}>{MIN_FUEL_BURN}</h3>
                <FuelSlider
                    maxAmount={shipFuelUnits}
                    onChange={handleFuelChange}
                    amount={fuelBurnUnits}
                />
                <h3 style={{ color: 'orange' }}>{shipFuelUnits} units</h3>
            </Stack>
            <h3>Time to Arrive:</h3>
            { timeToTravel }
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
