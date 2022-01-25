import * as React from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArticleIcon from '@mui/icons-material/Article';

import { GameContext } from './App';

export default function TopStatusBar() {
    const { gameState } = React.useContext(GameContext);

    const shipName = gameState.station.ships[0]?.name || 'None';

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
                <Divider orientation="vertical" flexItem />
                <span>
                    <strong>Credit Limit: </strong>
                    {gameState.creditLimit}
                </span>
                <Divider orientation="vertical" flexItem />
                <span>
                    <strong>Debt: </strong>
                    {gameState.debt}
                </span>
                <Divider orientation="vertical" flexItem />
                <RocketLaunchIcon />:<span>{shipName}</span>
                <Divider orientation="vertical" flexItem />
                <ArticleIcon />:{' '}
                <span>{gameState.currentContract?.id || 'None'}</span>
            </Box>
        </div>
    );
}
