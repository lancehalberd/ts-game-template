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
    Slider,
} from '@mui/material';

import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DiamondIcon from '@mui/icons-material/Diamond';

import { GameContext } from '../App';
import { DetailItem } from './StationStepper';
import YourCargo from './YourCargo';
import { baseMarkup } from 'app/gameConstants';
import { getTotalShipFuel } from 'app/state';
import { formatNumber } from 'app/utils/string';

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

const FuelSlider = ({
    fuelItem,
    onChange,
    defaultAmount = 20,
}: {
    fuelItem: Cargo;
    onChange: (units: number) => void;
    defaultAmount?: number;
}) => {
    const { gameState } = React.useContext(GameContext);
    const [fuelUnits, setFuelUnits] = React.useState<number>(defaultAmount);
    const currentShip = gameState.station.ships[0];
    const totalFuelUnits = getTotalShipFuel(currentShip);
    const handleChange = (event: Event, newValue: number | number[]) => {
        const newUnits = newValue as number;
        setFuelUnits(newUnits);
        onChange(newUnits);
    };

    const totalCost =
        (fuelUnits + totalFuelUnits) * fuelItem.unitCost * baseMarkup;

    return (
        <div className="fuel-slider">
            <div className="unit-count">
                <strong>Fuel Units:</strong>
                {` ${fuelUnits}`}
            </div>
            <div className="total-cost">
                <strong>Total Cost:</strong>
                {` ${formatNumber(totalCost, true)}`}
            </div>
            <Slider
                aria-label="Fuel Units"
                value={fuelUnits}
                max={100}
                min={5}
                marks
                step={5}
                valueLabelDisplay="auto"
                onChange={handleChange}
            />
        </div>
    );
};

const CargoPicker = () => {
    const DEFAULT_FUEL_AMOUNT = 20;
    const [tabIndex, setTabIndex] = React.useState(0);
    const { gameState, gameApi, refreshGameState, setStationStep } =
        React.useContext(GameContext);
    const [selectedItem, setSelectedItem] = React.useState<Cargo | undefined>(gameState.content.diggingTools[0]);
    const currentShip = gameState.station.ships[0];
    const [fuelUnits, setFuelUnits] =
        React.useState<number>(DEFAULT_FUEL_AMOUNT);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
        switch (newValue) {
            case 0:
                setSelectedItem(gameState.content.diggingTools[0]);
                break;
            case 1:
                if (currentShip) {
                    setSelectedItem(gameState.content.fuels.find(fuel => fuel.cargoType === currentShip.fuelType));
                } else {
                    setSelectedItem(undefined);
                }
                break;
            case 2:
                setSelectedItem(gameState.content.ores[0]);
                break;
            default:
                setSelectedItem(undefined);
        }
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
                    gameApi.purchaseTool(item.cargoType, 1, shipType, {
                        spendCredit: true,
                    });
                    refreshGameState();
                    return;
                case 'fuel':
                    gameApi.purchaseFuel(shipType, fuelUnits, {
                        spendCredit: true,
                    });
                    const diggingTool = currentShip?.cargo.find(
                        (cargoItem) => cargoItem.type === 'tool'
                    );
                    if (diggingTool) {
                        setStationStep('previewTrip');
                    }
                    refreshGameState();
                    return;
                case 'ore':
                    console.log('ERROR: Cannot purchase Ore');
                    return;
            }
        }
    };

    const handleFuelChange = (fuelUnits: number) => {
        setFuelUnits(fuelUnits);
    };

    const camelToSpaces = (str: string): string => {
        const result = str.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    };

    const visibleItems = () => {
        const { diggingTools, fuels, ores } = gameState.content;
        switch (tabIndex) {
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

    const isItemDisabled = (cargoItem: Cargo) => {
        if (cargoItem.type === 'fuel' && currentShip) {
            return cargoItem.cargoType !== currentShip.fuelType;
        }
        return false;
    };

    const formattedValue = (key: string, value: string | number): string => {
        const asNum = Number(value);
        const isCurrency = key.toLowerCase().includes('cost');

        if (isNaN(asNum)) return String(value);
        else {
            if (asNum > 1) {
                return formatNumber(asNum, isCurrency);
            } else return String(value);
        }
    };

    return (
        <div style={{ margin: '20px' }}>
            <Box sx={{ width: '100%' }}>
                <Tabs value={tabIndex} onChange={handleTabChange} centered>
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
                                        disabled={isItemDisabled(item)}
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
                                    value={formattedValue(
                                        keyStr,
                                        selectedItem[keyStr as keyof Cargo]
                                    )}
                                />
                            );
                        })}
                </div>
                <div className="select-item-pane">
                    {tabIndex === 1 && canAddItem && (
                        <FuelSlider
                            fuelItem={selectedItem}
                            onChange={handleFuelChange}
                            defaultAmount={DEFAULT_FUEL_AMOUNT}
                        />
                    )}

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
