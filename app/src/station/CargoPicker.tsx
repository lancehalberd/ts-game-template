import * as React from 'react';
import {
    Box,
    Button,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tab,
    Tabs,
} from '@mui/material';

import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DiamondIcon from '@mui/icons-material/Diamond';

import { GameContext } from '../App';
import { DetailItem } from './StationStepper';
import YourCargo from './YourCargo';

export const getCargoItemIcon = (cargoType: string) => {
    switch (cargoType) {
        case 'tool':
            return <BuildIcon />;
            break;
        case 'fuel':
            return <LocalGasStationIcon />;
            break;
        case 'ore':
            return <DiamondIcon />;
            break;
    }
};

const CargoPicker = () => {
    const [value, setValue] = React.useState(0);
    const { gameState, gameApi, setGameState } = React.useContext(GameContext);
    const [selectedItem, setSelectedItem] = React.useState<Cargo>();
    const currentShip = gameState.station.ships[0];

    console.log('CargoPicker gameState: ', gameState);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        setSelectedItem(undefined);
    };

    const handleItemClick = (item: Cargo) => {
        setSelectedItem(item);
    };

    const handleItemSelect = (item: Cargo | undefined) => {
        if (!item) return;

        const shipType = currentShip?.shipType;
        if (shipType) {
            switch (item.type) {
                case 'tool':
                    gameApi.purchaseTool(
                        item.cargoType,
                        1,
                        gameState?.currentShip?.shipType,
                        { spendCredit: true }
                    );
                    break;
                case 'fuel':
                    gameApi.purchaseFuel(shipType, 1, { spendCredit: true });
                    break;
                case 'ore':
                    console.log('ERROR: Cannot purchase Ore');
                    break;
            }
            setGameState(gameApi.getState());
        }
    };

    const camelToSpaces = (str: string): string => {
        const result = str.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    };

    const visibleItems = () => {
        const { diggingTools, fuels, ores } = gameState.content;
        switch (value) {
            case 0:
                return diggingTools;
                break;
            case 1:
                return fuels;
                break;
            case 2:
                return ores;
                break;
            default:
                return [];
        }
    };

    const canAddItem = !!(currentShip && selectedItem);

    return (
        <div style={{ margin: '20px' }}>
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Tabs value={value} onChange={handleTabChange} centered>
                    <Tab label="Digging Tools" />
                    <Tab label="Fuels" />
                    <Tab label="Ores" disabled />
                </Tabs>
            </Box>
            <div className="item-picker">
                <div className="item-list">
                    <List>
                        {visibleItems().map((item) => {
                            return (
                                <ListItem disablePadding key={item.cargoType}>
                                    <ListItemButton
                                        onClick={() => handleItemClick(item)}
                                        selected={
                                            selectedItem?.cargoType ===
                                            item.cargoType
                                        }
                                    >
                                        <ListItemIcon>
                                            {getCargoItemIcon(item.type)}
                                        </ListItemIcon>
                                        <ListItemText primary={item.name} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </div>

                <div className="item-details">
                    {selectedItem &&
                        Object.keys(selectedItem).map((keyStr) => {
                            return (
                                <DetailItem
                                    key={keyStr}
                                    label={camelToSpaces(keyStr)}
                                    value={selectedItem[keyStr as keyof Cargo]}
                                />
                            );
                        })}
                </div>
                <div className="select-item-pane">
                    <Button
                        variant="contained"
                        size="large"
                        className="item-select-button"
                        disabled={!canAddItem}
                        onClick={() => handleItemSelect(selectedItem)}
                    >
                        Add to Cargo
                    </Button>

                    {!currentShip && <p>Please purchase a Ship first.</p>}
                    {!selectedItem && <p>Please select a Cargo item.</p>}

                    <Divider />

                    <YourCargo />
                </div>
            </div>
        </div>
    );
};

export default CargoPicker;
