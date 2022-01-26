import * as React from 'react';
import {
    Box,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Tab,
    Tabs,
} from '@mui/material';

import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DiamondIcon from '@mui/icons-material/Diamond';

import { GameContext } from '../App';
import { DetailItem } from './StationStepper';

type CargoItem = DiggingTool | Fuel | Ore;

const CargoPicker = () => {
    const [value, setValue] = React.useState(0);
    const { gameState } = React.useContext(GameContext);

    const [selectedItem, setSelectedItem] = React.useState<CargoItem>();
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        setSelectedItem(null);
    };

    const handleItemClick = (item: CargoItem) => {
        setSelectedItem(item);
    };

    const handleItemSelect = (item: CargoItem) => {
        // gameApi.purchaseShip(ship.shipType, { spendCredit: true });
        // gameApi.rentShip(ship.shipType, 1, { spendCredit: true });
        // setGameState(gameApi.getState());
        console.log('Adding item to cargo...TODO');
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

    return (
        <div style={{ margin: '20px' }}>
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Tabs value={value} onChange={handleTabChange} centered>
                    <Tab label="Digging Tools" />
                    <Tab label="Fuels" />
                    <Tab label="Ores" />
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
                {selectedItem && (
                    <>
                        <div className="item-details">
                            <Stack spacing={2}>
                                {Object.keys(selectedItem).map((keyStr) => {
                                    return (
                                        <DetailItem
                                            key={keyStr}
                                            label={camelToSpaces(keyStr)}
                                            value={
                                                selectedItem[
                                                    keyStr as keyof CargoItem
                                                ]
                                            }
                                        />
                                    );
                                })}
                            </Stack>
                        </div>
                        <div className="select-item-pane">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleItemSelect(selectedItem)}
                            >
                                Add to Cargo
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CargoPicker;
