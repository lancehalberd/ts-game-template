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

type CargoItem = DiggingTool | Fuel | Ore;

const CargoPicker = () => {
    const [value, setValue] = React.useState(0);
    const { gameState, gameApi, setGameState } = React.useContext(GameContext);
    const [selectedItem, setSelectedItem] = React.useState<CargoItem>();

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        setSelectedItem(undefined);
    };

    const handleItemClick = (item: CargoItem) => {
        setSelectedItem(item);
    };

    const handleItemSelect = (item: CargoItem | undefined) => {
        if (!item) return;
        // gameApi.purchaseShip(ship.shipType, { spendCredit: true });
        // gameApi.rentShip(ship.shipType, 1, { spendCredit: true });
        // setGameState(gameApi.getState());
        const shipType = gameState.currentShip?.shipType;
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
                    console.log('BLOCKER: Need purchaseOre()');
                    break;
            }
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

    const getItemIcon = () => {
        switch (value) {
            case 0:
                return <BuildIcon />;
                break;
            case 1:
                return <LocalGasStationIcon />;
                break;
            case 2:
                return <DiamondIcon />;
                break;
        }
    };

    const canAddItem = !!(gameState.station.ships.length && selectedItem);

    console.log('canAddItem: ', canAddItem);

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
                                            {getItemIcon()}
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
                                    value={
                                        selectedItem[keyStr as keyof CargoItem]
                                    }
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
                    {!canAddItem && <p>Please purchase a Ship first.</p>}
                    <Divider />
                    <YourCargo />
                </div>
            </div>
        </div>
    );
};

export default CargoPicker;
