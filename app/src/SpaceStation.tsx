import * as React from 'react';
import GameContext from './context';

const SpaceStation = () => {
    const state = React.useContext(GameContext);

    console.log('state: ', state);

    return (
        <div className="space-station">
            <h3>You're at the Station.</h3>
        </div>
    );
};

export default SpaceStation;
