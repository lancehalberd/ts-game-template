import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

import { generateInitialState } from 'app/content';
import { getStationApi } from 'app/stationActions';
import { copyState } from 'app/state';


window.gameApi = (() => {
    const state: State = generateInitialState();
    return {
        getState() {
            return copyState(state);
        },
        // To use the simulation
        simulate() {
            const simulatedState = copyState(state);
            return {
                simulatedState,
                ...getStationApi(simulatedState),
            };
        },
        ...getStationApi(state),
    };
})();

ReactDOM.render(
<App />,
  document.getElementById("gameContainer")
);
