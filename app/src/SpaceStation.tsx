import * as React from 'react';
import GameContext from './context';

const SpaceStation = () => {
    const state = React.useContext(GameContext);

    return (
        <div className="space-station">
            <h1>Eve Offline</h1>
            <h3>You're at the Station.</h3>

            <div className="card">
                <p>Credits: {state.credits}</p>
                <p>Credit Limit: {state.creditLimit}</p>
                <p>Current Ship: {state.currentShip}</p>
            </div>
        </div>
    );
};

export default SpaceStation;
