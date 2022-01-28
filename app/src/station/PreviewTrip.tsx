import { Button, Card, Slider, Stack } from '@mui/material';
import { getTotalShipFuel } from 'app/state';
import { formatNumber } from 'app/utils/string';
import * as React from 'react';
import { GameContext } from '../App';
import { MuiHeader } from '../mui';

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
    const [fuelBurnUnits, setFuelBurnUnits] = React.useState(
        Math.max(MIN_FUEL_BURN, Math.floor(shipFuelUnits / 2))
    );
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
        requirements.push(
            `Purchase at least ${MIN_FUEL_BURN}L of Fuel for your Ship`
        );
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
                    {requirements.map((text) => (
                        <li key={text}>{text}</li>
                    ))}
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
        timeToTravel = `${Math.floor(
            simulateApi!.state!.time - startTime
        )} days`;
    } catch (e) {
        console.log('PreviewTrip: timeToTravel error: ', e);
        timeToTravel = 'Error, try burning more fuel';
    }

    const handleFuelChange = (units: number) => {
        setFuelBurnUnits(units);
    };

    const handleEmbarkClick = () => {
        gameApi.travelToContract(ship.shipType, fuelBurnUnits, {
            ignoreDebtInterest: true,
            ignoreLongTravelTime: true,
        });
        refreshGameState();
    };

    return (
        <div className="preview-trip">
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                }}
            >
                <Card>
                    <MuiHeader variant="h5">Distance to Asteroid:</MuiHeader>
                    <span>{formatNumber(contract!.distance, false, true)}</span>
                </Card>

                <Card>
                    <MuiHeader variant="h5">Fuel to Burn:</MuiHeader>
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
                        <h3 style={{ color: 'orange' }}>
                            {shipFuelUnits} units
                        </h3>
                    </Stack>
                </Card>

                <Card>
                    <MuiHeader variant="h5">Time to Arrive:</MuiHeader>
                    <span>{timeToTravel}</span>
                </Card>
            </div>
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
