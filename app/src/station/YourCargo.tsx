import { Badge } from '@mui/material';
import * as React from 'react';
import { GameContext } from '../App';
import { MuiHeader } from '../mui';
import { getCargoItemIcon } from './CargoPicker';

interface AggItemProps {
    label: string;
    count: number;
    itemType: string;
}

const CargoAggregateItem: React.FC<AggItemProps> = ({
    label,
    count,
    itemType,
}) => {
    const icon = getCargoItemIcon(itemType);
    return (
        <div className="cargo-agg-item">
            <Badge badgeContent={count} color="primary">
                {icon}
            </Badge>

            <span className="label">{label}</span>
        </div>
    );
};

const YourCargo = () => {
    const { gameState } = React.useContext(GameContext);
    const cargo = [
        ...gameState.station.cargo,
        ...(gameState.station.ships[0]?.cargo || []),
    ];

    const calculateFuelCount = (fuelCargoItems: Cargo[]): number => {
        return fuelCargoItems.reduce((total, item) => total + item.units, 0);
    };

    // Each aggregate item is an icon, name of item, and count badge
    const uniqCargoTypes = new Set(cargo.map((item) => item.cargoType));
    const aggItems = [...uniqCargoTypes].map((cargoType) => {
        const items = cargo.filter((item) => item.cargoType === cargoType);

        const count =
            items[0].type === 'fuel' ? calculateFuelCount(items) : items.length;
        const label = items[0].name;

        return (
            <CargoAggregateItem
                label={label}
                count={count}
                itemType={items[0].type}
                key={label}
            />
        );
    });

    return (
        <div className="your-cargo">
            <MuiHeader variant="h5">Your Cargo</MuiHeader>
            <div className="cargo-items">{aggItems}</div>
        </div>
    );
};

export default YourCargo;
