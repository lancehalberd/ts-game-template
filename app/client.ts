import { CANVAS_WIDTH, CANVAS_HEIGHT, FRAME_LENGTH } from 'app/gameConstants';
import { bindKeyboardListeners,isKeyboardKeyDown, KEY } from 'app/utils/keyboard';


const mainCanvas = document.getElementById('mainCanvas') as HTMLCanvasElement;
// `!` here is the "Non-null assertion operator", which we need to use here if we have strict null checks enabled.
const mainContext = mainCanvas.getContext('2d')!;
mainContext.imageSmoothingEnabled = false;

// Bind keyboard listeners to keep track of which keys are pressed.
bindKeyboardListeners();

// Object to store the game state on.
const state = {
    time: 0,
    lastRender: -1,
    square: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
    }
};

// Update function advances the state of the game every FRAME_LENGTH milliseconds.
function update() {
    state.time += FRAME_LENGTH;
    if (isKeyboardKeyDown(KEY.UP)) {
        state.square.y--;
    }
    if (isKeyboardKeyDown(KEY.DOWN)) {
        state.square.y++;
    }
    if (isKeyboardKeyDown(KEY.LEFT)) {
        state.square.x--;
    }
    if (isKeyboardKeyDown(KEY.RIGHT)) {
        state.square.x++;
    }
}

// Render will display the current state of the game.
function render() {
    // Only render if the state has been updated since the last render.
    if (state.lastRender >= state.time) {
        return;
    }
    state.lastRender = state.time;

    // Draw an off-white background:
    mainContext.fillStyle = '#EEE';
    mainContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw a green square to the screen that oscillates back and forth over time.
    mainContext.fillStyle = 'green';
    const size = 50;
    const {x, y} = state.square;
    mainContext.fillRect(x, y, size, size);
}

// Start update loop:
update();
setInterval(update, FRAME_LENGTH);

function renderLoop() {
    try {
        render();
        window.requestAnimationFrame(renderLoop);
    } catch (error: unknown) {
        console.error(error);
    }
}
renderLoop();
