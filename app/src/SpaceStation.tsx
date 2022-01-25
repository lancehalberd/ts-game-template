import { Card, CardContent } from '@mui/material';
import * as React from 'react';
import { GameContext } from './App';
import { MuiHeader } from './mui';

const SpaceStation = () => {
    const { gameState } = React.useContext(GameContext);

    return (
        <div className="space-station">
            <div className="header">
                <MuiHeader variant="h1">Eve Offline</MuiHeader>
                <MuiHeader variant="h2">You're at the Station.</MuiHeader>
            </div>

            <div
                className="status-board"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'end',
                }}
            >
                <div className="info-pane">
                    <Card>
                        <CardContent>
                            <h3>The Bank</h3>
                            <p>Credits: {gameState.credits}</p>
                            <p>Credit Limit: {gameState.creditLimit}</p>
                            <p>Debt: {gameState.debt}</p>
                        </CardContent>
                    </Card>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}
                >
                    <div className="info-pane">
                        <Card>
                            <CardContent>
                                <h3>Current Ship</h3>
                                <p>{gameState.currentShip || 'None'}</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="info-pane">
                        <Card>
                            <CardContent>
                                <h3>Current Contract</h3>
                                <p>{gameState.currentContract || 'None'}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpaceStation;
