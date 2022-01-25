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
                <div>
                    <div className="info-pane">
                        <Card>
                            <CardContent>
                                <h3>The Bank</h3>
                                <p>
                                    <strong>Credits: </strong>
                                    {gameState.credits}
                                </p>
                                <p>
                                    <strong>Credit Limit: </strong>
                                    {gameState.creditLimit}
                                </p>
                                <p>
                                    <strong>Debt: </strong>
                                    {gameState.debt}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
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
