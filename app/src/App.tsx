import * as React from 'react';
import SpaceStation from './station/SpaceStation';

import 'app/styles/App.scss';

export const GameContext = React.createContext({} as IGameContext);

const App = () => {
    const FORCE_REFRESH_KEY = 'lastForceRefreshAt';
    const gameApi = window!.gameApi!;
    const [gameState, setGameState] = React.useState(gameApi.getState());
    let lastForceRefreshEpoch = localStorage.getItem(FORCE_REFRESH_KEY);

    setInterval(() => {
        const curForceRefreshEpoch = localStorage.getItem(FORCE_REFRESH_KEY);
        if (lastForceRefreshEpoch != curForceRefreshEpoch) {
            console.log('App: Forcing app refresh');
            lastForceRefreshEpoch = curForceRefreshEpoch;
            setGameState(gameApi.getState());
        }
    }, 1000);

    console.log('gameState: ', gameState);

    return (
        <GameContext.Provider value={{ gameState, gameApi, setGameState }}>
            {gameState.atStation ? <SpaceStation /> : <h1>TBD!</h1>}
        </GameContext.Provider>
    );
};

export default App;
