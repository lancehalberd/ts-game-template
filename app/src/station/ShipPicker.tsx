import {
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Slider,
    Stack,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import * as React from 'react';

import { baseMarkup, baseRentalRate } from 'app/gameConstants';

import { GameContext } from '../App';
import { DetailItem } from './StationStepper';
import { getTotalShipFuel, getTotalShipTools } from 'app/state';

const DaySlider = ({
    ship,
    onChange,
    defaultDays = 20,
}: {
    ship: Ship;
    onChange: (days: number) => void;
    defaultDays?: number;
}) => {
    const [days, setDays] = React.useState<number>(defaultDays);
    const handleChange = (event: Event, newValue: number | number[]) => {
        const newDays = newValue as number;
        setDays(newDays);
        onChange(newDays);
    };

    const totalCost = ship.cost * days * baseRentalRate * baseMarkup;

    return (
        <div className="day-slider">
            <div className="unit-count">
                <strong>Rental Period:</strong>
                {` ${days}`}
            </div>
            <div className="total-cost">
                <strong>Total Cost:</strong>
                {` ${totalCost}`}
            </div>
            <Slider
                aria-label="Fuel Units"
                value={days}
                max={100}
                min={5}
                marks
                step={1}
                valueLabelDisplay="auto"
                onChange={handleChange}
            />
        </div>
    );
};

const ShipPicker = () => {
    const { gameState, gameApi, refreshGameState } =
        React.useContext(GameContext);
    const [selectedShip, setSelectedShip] = React.useState<Ship>();
    const [duration, setDuration] = React.useState(20);

    const myShip: Ship | undefined =
        selectedShip &&
        gameState.station.ships.find(
            (ship) => ship.shipType === selectedShip.shipType
        );

    const handleShipClick = (ship: Ship) => {
        setSelectedShip(ship);
    };

    const rentShip = (ship: Ship) => {
        gameApi.rentShip(ship.shipType, duration, {
            extendRental: true,
            spendCredit: true,
        });
        refreshGameState();
    };
    const returnRental = (ship: Ship) => {
        gameApi.returnShip(ship.shipType);
        refreshGameState();
    };
    const buyShip = (ship: Ship) => {
        gameApi.purchaseShip(ship.shipType, { spendCredit: true });
        refreshGameState();
    };
    const sellShip = (ship: Ship) => {
        gameApi.sellShip(ship.shipType);
        refreshGameState();
    };

    const liquidateShip = (ship: Ship) => {
        gameApi.sellAllCargo(ship.shipType);
        refreshGameState();
    };

    const hasSellableCargo = (ship: Ship | undefined): boolean => {
        if (!ship) return false;
        const fuelUnits = getTotalShipFuel(ship);
        const toolCount = getTotalShipTools(ship);
        return fuelUnits > 0 || toolCount > 0;
    };

    const visibleItems = gameState.content.ships;

    return (
        <div className="item-picker">
            <div className="item-list">
                <List>
                    {visibleItems.map((ship) => {
                        return (
                            <ListItem disablePadding key={ship.shipType}>
                                <ListItemButton
                                    onClick={() => handleShipClick(ship)}
                                    selected={
                                        selectedShip?.shipType === ship.shipType
                                    }
                                >
                                    <ListItemIcon>
                                        <RocketLaunchIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={ship.name} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </div>
            {selectedShip && (
                <>
                    <div className="item-details">
                        <DetailItem
                            label="Ship Type"
                            value={selectedShip.shipType}
                        />
                        <DetailItem
                            label="Cost"
                            value={selectedShip.cost * baseMarkup}
                        />
                        <DetailItem
                            label="Daily Rate"
                            value={
                                selectedShip.cost * baseRentalRate * baseMarkup
                            }
                        />
                        <DetailItem label="Mass" value={selectedShip.mass} />
                        <DetailItem
                            label="Cargo Space"
                            value={selectedShip.cargoSpace}
                        />
                        <DetailItem
                            label="Fuel Type"
                            value={selectedShip.fuelType}
                        />
                        <DetailItem
                            label="Current Owned?"
                            value={`${!!myShip?.isOwned}`}
                        />
                        <DetailItem
                            label="Current Rented?"
                            value={`${!!myShip?.isRented}`}
                        />
                    </div>
                    <div className="select-item-pane">
                        <DaySlider
                            ship={selectedShip}
                            onChange={setDuration}
                            defaultDays={duration}
                        />
                        <Stack
                            spacing={2}
                            direction="column"
                            sx={{ mb: 1, marginTop: '10px' }}
                            alignItems="flex-start"
                        >
                            {!myShip && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => rentShip(selectedShip)}
                                >
                                    Rent This Ship
                                </Button>
                            )}
                            {!myShip && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => buyShip(selectedShip)}
                                >
                                    Buy This Ship
                                </Button>
                            )}
                            {myShip?.isRented && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => rentShip(selectedShip)}
                                >
                                    Extend rental
                                </Button>
                            )}
                            {hasSellableCargo(myShip) && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    color="success"
                                    onClick={() => liquidateShip(selectedShip)}
                                >
                                    Liquidate Ship
                                </Button>
                            )}
                            {myShip?.isRented && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    disabled={hasSellableCargo(myShip)}
                                    onClick={() => returnRental(selectedShip)}
                                >
                                    Return rental
                                </Button>
                            )}
                            {myShip?.isOwned && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => sellShip(selectedShip)}
                                >
                                    Sell This Ship
                                </Button>
                            )}
                        </Stack>
                        <p>
                            Choose the desired ship for this Contract. Then,
                            outfit it!
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShipPicker;
