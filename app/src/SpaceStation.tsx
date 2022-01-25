import * as React from 'react';
import { GameContext } from './App';

const SpaceStation = () => {
    const { gameState } = React.useContext(GameContext);

    return (
        <div className="space-station">
            <h1>Eve Offline</h1>
            <h3>You're at the Station.</h3>

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
