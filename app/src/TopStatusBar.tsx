import * as React from 'react';

import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArticleIcon from '@mui/icons-material/Article';

import { GameContext } from './App';
import MuiPopover from './MuiPopover';
import { formatNumber } from 'app/utils/string';

type RentalColor = 'default' | 'primary' | 'error' | 'warning';

const ShipElement = ({
    color,
    shipName,
    rentalTime,
}: {
    color: RentalColor;
    shipName: string;
    rentalTime: string;
}) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Badge badgeContent={rentalTime} color={color}>
                <RocketLaunchIcon />
            </Badge>
            <span className="ship-name">{shipName}</span>
        </div>
    );
};

export default function TopStatusBar() {
    const { gameState } = React.useContext(GameContext);

    const currentShip = gameState.station.ships[0];
    const shipName = currentShip?.name || 'None';
    let rentalTime = '-',
        rentalColor: RentalColor = 'default';
    if (currentShip?.isRented) {
        const days = currentShip.returnTime! - Math.floor(gameState.time);
        rentalTime = `${days}`;
        if (days <= 0) {
            rentalColor = 'error';
        } else if (days < 10) {
            // Most mining trips take at least 10 days, so warn the user.
            rentalColor = 'warning';
        } else {
            rentalColor = 'primary';
        }
    } else if (currentShip?.isOwned) {
        rentalTime = '-';
        rentalColor = 'primary';
    }
    const contractName = gameState.currentContract
        ? gameState.currentContract.name
        : 'None';

    const shipPopover = (
        <div className="ship-stats">
            <span>Cargo Space: {formatNumber(currentShip?.cargoSpace)}</span>
            <span>Cost: {formatNumber(currentShip?.cost)}</span>
            <span>Fuel Type: {currentShip?.fuelType}</span>
            <span>Mass: {formatNumber(currentShip?.mass)}</span>
            <span>Ship Type: {currentShip?.shipType}</span>
            {currentShip?.isRented && (
                <span>Return Time: {currentShip?.returnTime! + 1}</span>
            )}
        </div>
    );

    const getShipIcon = () => {
        const shipEl = (
            <ShipElement
                shipName={shipName}
                rentalTime={rentalTime}
                color={rentalColor}
            />
        );
        return currentShip ? (
            <MuiPopover popoverContent={shipPopover}>{shipEl}</MuiPopover>
        ) : (
            shipEl
        );
    };

    const vertDivider = <Divider orientation="vertical" flexItem />;

    return (
        <div className="top-status-bar">
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '20px',
                    width: 'fit-content',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    '& svg': {
                        m: 1.5,
                    },
                    '& hr': {
                        mx: 0.5,
                    },
                }}
            >
                <span>
                    <strong>Day: </strong>
                    {(1 + gameState.time).toFixed(1)}
                </span>
                {vertDivider}
                <span>
                    <strong>Credits: </strong>
                    {formatNumber(gameState.credits, true)}
                </span>
                {vertDivider}
                <span>
                    <strong>Credit Limit: </strong>
                    {formatNumber(gameState.creditLimit, true)}
                </span>
                {vertDivider}
                <span>
                    <strong>Debt: </strong>
                    {formatNumber(gameState.debt, true)}
                </span>
                {vertDivider}
                {getShipIcon()}
                {vertDivider}
                <ArticleIcon />: <span>{contractName}</span>
            </Box>
        </div>
    );
}
