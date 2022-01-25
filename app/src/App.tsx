import * as React from 'react';
import SpaceStation from './SpaceStation';

import 'app/styles/App.scss';

interface IGameContext {
    gameState: State;
    gameApi: GameApi;
    setGameState: React.Dispatch<React.SetStateAction<State>>;
}
export const GameContext = React.createContext({} as IGameContext);

const App = () => {
    const gameApi = window!.gameApi!;
    const [gameState, setGameState] = React.useState(gameApi.getState());

    console.log('gameState: ', gameState);

    return (
        <GameContext.Provider value={{ gameState, gameApi, setGameState }}>
            {gameState.atStation ? <SpaceStation /> : <h1>TBD!</h1>}
        </GameContext.Provider>
    );
};

export default App;
