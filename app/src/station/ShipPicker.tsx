import {
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import * as React from 'react';
import { GameContext } from '../App';
import { DetailItem } from './StationStepper';

const ShipPicker = () => {
    const { gameState, gameApi, refreshGameState } = React.useContext(GameContext);
    const [selectedShip, setSelectedShip] = React.useState<Ship>();

    const handleShipClick = (ship: Ship) => {
        setSelectedShip(ship);
    };

    const handleShipSelect = (ship: Ship) => {
        // gameApi.purchaseShip(ship.shipType, { spendCredit: true });
        gameApi.rentShip(ship.shipType, 1, { spendCredit: true });
        refreshGameState();
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
                        <DetailItem label="Cost" value={selectedShip.cost} />
                        <DetailItem label="Mass" value={selectedShip.mass} />
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
                    </div>
                    <div className="select-item-pane">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => handleShipSelect(selectedShip)}
                        >
                            Rent This Ship
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
