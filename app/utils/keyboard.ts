export const KEY = {
    ESCAPE: 27,
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    SPACE: 32,
    SHIFT: 16,
    ENTER: 13,
    BACK_SPACE: 8,
    COMMAND: 91,
    CONTROL: 17,
    A: 'A'.charCodeAt(0),
    C: 'C'.charCodeAt(0),
    D: 'D'.charCodeAt(0),
    E: 'E'.charCodeAt(0),
    F: 'F'.charCodeAt(0),
    G: 'G'.charCodeAt(0),
    I: 'I'.charCodeAt(0),
    J: 'J'.charCodeAt(0),
    K: 'K'.charCodeAt(0),
    L: 'L'.charCodeAt(0),
    M: 'M'.charCodeAt(0),
    P: 'P'.charCodeAt(0),
    Q: 'Q'.charCodeAt(0),
    R: 'R'.charCodeAt(0),
    S: 'S'.charCodeAt(0),
    T: 'T'.charCodeAt(0),
    V: 'V'.charCodeAt(0),
    W: 'W'.charCodeAt(0),
    X: 'X'.charCodeAt(0),
    Z: 'Z'.charCodeAt(0),
};

// Keep track of which keys are pressed here.
const keysDown: number[] = [];

function onKeyDown(event: KeyboardEvent) {
    if (event.repeat) {
        return;
    }
    const keyCode: number = event.which;
    keysDown[keyCode] = 1;
}

function onKeyUp(event: KeyboardEvent) {
    const keyCode: number = event.which;
    keysDown[keyCode] = 0;
}

export function isKeyboardKeyDown(keyCode: number): number {
    if (keysDown[keyCode]) {
        return 1;
    }
    return 0;
}

export function bindKeyboardListeners() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

export function unbindKeyboardListeners() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}
