import * as React from 'react';
import { GameContext } from './App';
import { MuiH1, MuiH2 } from './mui';

const SpaceStation = () => {
    const { gameState } = React.useContext(GameContext);

    return (
        <div className="space-station">
            <div className="header">
                <MuiH1>Eve Offline</MuiH1>
                <MuiH2>You're at the Station.</MuiH2>
            </div>

            <div className="card">
                <p>Credits: {gameState.credits}</p>
                <p>Credit Limit: {gameState.creditLimit}</p>
                <p>Current Ship: {gameState.currentShip}</p>
                <p>Current Contract: {gameState.currentContract}</p>
            </div>
        </div>
    );
};

export default SpaceStation;
