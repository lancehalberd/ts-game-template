import * as React from 'react';
import {
    Box,
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

type CargoItem = DiggingTool | Fuel | Ore;

const CargoPicker = () => {
    const [value, setValue] = React.useState(0);
    const { gameState } = React.useContext(GameContext);

    const [selectedItem, setSelectedItem] = React.useState<CargoItem>();
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleItemClick = (item: CargoItem) => {
        setSelectedItem(item);
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
        <div className="item-picker">
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Tabs value={value} onChange={handleTabChange} centered>
                    <Tab label="Digging Tools" />
                    <Tab label="Fuels" />
                    <Tab label="Ores" />
                </Tabs>
            </Box>
            <div className="picker-interior">
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
            </div>
        </div>
    );
};

export default CargoPicker;
