import { defaultState } from 'app/content';
import { createContext } from 'react';

const GameContext = createContext(defaultState);

export default GameContext;
