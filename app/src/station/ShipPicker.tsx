import {
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import * as React from 'react';
import { GameContext } from '../App';
import { DetailItem } from './StationStepper';

const ShipPicker = () => {
    const { gameState, gameApi, setGameState } = React.useContext(GameContext);
    const [selectedShip, setSelectedShip] = React.useState<Ship>();

    const handleShipClick = (ship: Ship) => {
        setSelectedShip(ship);
    };

    const handleShipSelect = (ship: Ship) => {
        // gameApi.purchaseShip(ship.shipType, { spendCredit: true });
        gameApi.rentShip(ship.shipType, 1, { spendCredit: true });
        setGameState(gameApi.getState());
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
                        <Stack spacing={2}>
                            <DetailItem
                                label="Ship Type"
                                value={selectedShip.shipType}
                            />
                            <DetailItem
                                label="Cost"
                                value={selectedShip.cost}
                            />
                            <DetailItem
                                label="Mass"
                                value={selectedShip.mass}
                            />
                            <DetailItem
                                label="Cargo"
                                value={selectedShip.cargo.join(',')}
                            />
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
                                value={`${selectedShip.isOwned}`}
                            />
                            <DetailItem
                                label="Current Rented?"
                                value={`${selectedShip.isRented}`}
                            />
                        </Stack>
                    </div>
                    <div className="select-item-pane">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => handleShipSelect(selectedShip)}
                        >
                            Select This Ship
                        </Button>
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
