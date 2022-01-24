import * as React from 'react';
import GameContext from './context';
import { defaultState } from '../content';
import SpaceStation from './SpaceStation';

const App = () => {
    return (
        <GameContext.Provider value={defaultState}>
            {defaultState.atStation ? <SpaceStation /> : <h1>TBD!</h1>}
        </GameContext.Provider>
    );
};

export default App;
