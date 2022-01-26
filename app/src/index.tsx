import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

import { generateInitialState } from 'app/content';
import { getGetActions } from 'app/getActions';
import { getMiningApi } from 'app/miningActions';
import { getStationApi } from 'app/stationActions';
import { copyState } from 'app/state';

function getGameApi(state: State, isSimulation = false): GameApi {
    const gameApi: GameApi = {
        // To use the simulation
        simulate() {
            const simulatedState = copyState(state);
            return getGameApi(simulatedState, true);
        },
        ...getGetActions(state),
        ...getStationApi(state),
        ...getMiningApi(state),
    };
    if (isSimulation) {
        gameApi.state = state;
    }
    return gameApi;
}

window.gameApi = (() => {
    const state: State = generateInitialState();
    return getGameApi(state);
})();


function renderReactClient() {
    ReactDOM.render(<App />, document.getElementById('gameContainer'));
}
renderReactClient();
