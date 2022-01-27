import * as React from 'react';

import { GameContext } from '../App';
import { MuiHeader } from '../mui';
import TopStatusBar from '../TopStatusBar';
import AsteroidPane from '../mining/AsteroidPane';

const Asteroid = () => {
    const { gameState } = React.useContext(GameContext);
    return (
        <div className="space-station">
            <div className="header">
                <MuiHeader variant="h1">Eve Offline</MuiHeader>
                <TopStatusBar />
            </div>

            <AsteroidPane
                contract={gameState.currentContract!}
            />
        </div>
    );
};

export default Asteroid;
