import * as React from 'react';

import { Badge, Button } from '@mui/material';

import { getTotalShipFuel, isToolType } from 'app/state';

import { GameContext } from '../App';
import { MuiHeader } from '../mui';
import TopStatusBar from '../TopStatusBar';
import ToolPicker from './ToolPicker';
import AsteroidPane from './AsteroidPane';
import { getCargoItemIcon } from '../station/CargoPicker';

interface CargoItemProps {
    label: string;
    count: number;
    itemType: string;
    onClick?: () => void;
}

const CargoItem = ({ label, count, itemType, onClick }: CargoItemProps) => {
    const icon = getCargoItemIcon(itemType);
    return (
        <div className="cargo-agg-item" onClick={onClick}>
            <Badge
                badgeContent={Math.round(count * 10) / 10}
                color="primary"
                max={99999}
            >
                {icon}
            </Badge>

            <span className="label">{label}</span>
        </div>
    );
};

interface Props {
    label: string;
    storage: CargoStorage;
    onSelectCargoType?: (cargoType: CargoType) => void;
    showDetails?: boolean;
    baseMass?: number;
}

const Storage = ({
    label,
    storage,
    onSelectCargoType,
    showDetails,
    baseMass = 0,
}: Props) => {
    const { gameState } = React.useContext(GameContext);
    let cargo: Cargo[] = storage.cargo;

    // Each aggregate item is an icon, name of item, and count badge
    const uniqCargoTypes = new Set(cargo.map((item) => item.cargoType));
    let cargoVolume: number = 0;
    let cargoMass: number = 0;
    const aggItems = [...uniqCargoTypes].map((cargoType) => {
        const items = cargo.filter((item) => item.cargoType === cargoType);
        let total = 0;
        for (const item of items) {
            if (isToolType(gameState, item.cargoType)) {
                total += 1;
            } else {
                total += item.units;
            }
            cargoVolume += item.units * item.unitVolume;
            cargoMass += item.units * item.unitMass;
        }
        const label = items[0].name;

        return (
            <CargoItem
                label={label}
                count={total}
                itemType={items[0].type}
                key={label}
                onClick={() => onSelectCargoType?.(items[0].cargoType)}
            />
        );
    });

    return (
        <div className="your-cargo">
            <MuiHeader variant="h5">{label}</MuiHeader>
            {showDetails && (
                <>
                    <div className="storage-volume">
                        <strong>space:</strong>
                        {` ${Math.round(cargoVolume)} / ${storage.cargoSpace}`}
                    </div>
                    <div className="storage-mass">
                        <strong>mass:</strong>
                        {` ${(baseMass + cargoMass).toFixed(1)}kg`}
                    </div>
                </>
            )}
            <div className="cargo-items">{aggItems}</div>
        </div>
    );
};

const Asteroid = () => {
    const { gameApi, gameState, refreshGameState, setStationStep } =
        React.useContext(GameContext);
    const tools = gameState.currentShip!.cargo.filter(cargo => cargo.type === 'tool') as DiggingTool[];
    const [selectedToolType, setSelectedToolType] = React.useState<ToolType | undefined>(tools[0]?.cargoType);

    const { fuelToBurn, travelTime } = React.useMemo(() => {
        const fuelToBurn = getTotalShipFuel(gameState.currentShip!);
        const startTime = gameState.time;
        const simulateApi = gameApi.simulate();
        simulateApi.returnToStation(fuelToBurn, { ignoreLongTravelTime: true });
        return {
            travelTime: Math.floor(simulateApi!.state!.time - startTime),
            fuelToBurn,
        };
    }, [gameApi, gameState]);

    return (
        <div className="space-station">
            <div className="header">
                <MuiHeader variant="h1">Eve Offline</MuiHeader>
                <TopStatusBar />
            </div>
            <div className="station-stepper">
                <div className="item-picker">
                    <ToolPicker
                        selectedToolType={selectedToolType}
                        onSelectTool={setSelectedToolType}
                    />
                    <div className="item-details">
                        <AsteroidPane
                            contract={gameState.currentContract!}
                            onClickCell={(x, y, event) => {
                                if (selectedToolType) {
                                    if (event.shiftKey) {
                                        try {
                                            for (let i = 0; i < 100; i++) {
                                                gameApi.dig(x, y, selectedToolType);
                                            }
                                        } catch {

                                        }
                                    } else {
                                        gameApi.dig(x, y, selectedToolType);
                                    }
                                    refreshGameState();
                                }
                            }}
                        />
                    </div>
                    <div className="select-item-pane">
                        <Storage
                            label="Ship Cargo"
                            storage={gameState.currentShip!}
                            onSelectCargoType={(cargoType: CargoType) => {
                                gameApi.unloadCargo(cargoType, 10000);
                                refreshGameState();
                            }}
                            showDetails
                            baseMass={gameState.currentShip!.mass}
                        />
                        <Storage
                            label="Unloaded Cargo"
                            storage={gameState.currentContract!}
                            onSelectCargoType={(cargoType: CargoType) => {
                                gameApi.loadCargo(cargoType, 10000);
                                refreshGameState();
                            }}
                        />
                        <div>
                            <h2>Time to Return: {travelTime} days</h2>
                            <div className="action-buttons">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        gameApi.returnToStation(fuelToBurn);
                                        refreshGameState();
                                        setStationStep('rentShip');
                                    }}
                                >
                                    Return to Station
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Asteroid;
