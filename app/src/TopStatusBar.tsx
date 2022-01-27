import * as React from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArticleIcon from '@mui/icons-material/Article';

import { GameContext } from './App';
import MuiPopover from './MuiPopover';

const ShipElement = ({ shipName }: { shipName: string }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <RocketLaunchIcon />:<span className="ship-name">{shipName}</span>
    </div>
);

export default function TopStatusBar() {
    const { gameState } = React.useContext(GameContext);

    const currentShip = gameState.station.ships[0];
    const shipName = currentShip?.name || 'None';
    const contractID = gameState.currentContract
        ? gameState.currentContract.id
        : 'None';

    const shipPopover = (
        <div className="ship-stats">
            <span>Cargo Space: {currentShip?.cargoSpace}</span>
            <span>Cost: {currentShip?.cost}</span>
            <span>Fuel Type: {currentShip?.fuelType}</span>
            <span>Mass: {currentShip?.mass}</span>
            <span>Ship Type: {currentShip?.shipType}</span>
            <span>Return Time: {currentShip?.returnTime}</span>
        </div>
    );

    const getShipIcon = () => {
        const shipEl = <ShipElement shipName={shipName} />;
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
                    <strong>Credits: </strong>
                    {gameState.credits}
                </span>
                {vertDivider}
                <span>
                    <strong>Credit Limit: </strong>
                    {gameState.creditLimit}
                </span>
                {vertDivider}
                <span>
                    <strong>Debt: </strong>
                    {gameState.debt}
                </span>
                {vertDivider}
                {getShipIcon()}
                {vertDivider}
                <ArticleIcon />: <span>{contractID}</span>
            </Box>
        </div>
    );
}
