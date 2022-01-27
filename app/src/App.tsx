import * as React from 'react';
import Asteroid from './mining/Asteroid';
import SpaceStation from './station/SpaceStation';

import 'app/styles/App.scss';

export const GameContext = React.createContext({} as IGameContext);
export const useGameContext = (): IGameContext => {
    return React.useContext(GameContext);
}

const App = () => {
    const [gameApi, setGameApi] = React.useState(window.gameApi!);
    const [gameState, setGameState] = React.useState(gameApi.getState());
    // This takes `newGameApi` as an argument to allow attaching a simulated state to the UI.
    window.refreshReact = (newGameApi?: GameApi) => {
        if (newGameApi) {
            setGameApi(newGameApi);
            setGameState(newGameApi.getState());
        } else {
            setGameState(gameApi.getState());
        }
    };
    const refreshGameState = React.useCallback(() => {
        setGameState(gameApi.getState());
    }, [gameApi]);

    return (
        <GameContext.Provider value={{ gameState, gameApi, refreshGameState }}>
            {gameState.atStation ? <SpaceStation /> : <Asteroid />}
        </GameContext.Provider>
    );
};

export default App;
