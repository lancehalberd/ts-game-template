import * as React from 'react';
import GameContext from './context';
import SpaceStation from './SpaceStation';

import 'app/styles/App.scss';

const App = () => {
    const gameState = window.gameApi?.getState()!;
    return (
        <GameContext.Provider value={gameState}>
            {gameState.atStation ? <SpaceStation /> : <h1>TBD!</h1>}
        </GameContext.Provider>
    );
};

export default App;
