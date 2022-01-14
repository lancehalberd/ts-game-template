import { CANVAS_WIDTH, CANVAS_HEIGHT, FRAME_LENGTH } from 'app/gameConstants';
import { areAllImagesLoaded, requireImage } from 'app/utils/images';
import { bindKeyboardListeners,isKeyboardKeyDown, KEY } from 'app/utils/keyboard';


const mainCanvas = document.getElementById('mainCanvas') as HTMLCanvasElement;
// `!` here is the "Non-null assertion operator", which we need to use here if we have strict null checks enabled.
const mainContext = mainCanvas.getContext('2d')!;
mainContext.imageSmoothingEnabled = false;

// Bind keyboard listeners to keep track of which keys are pressed.
bindKeyboardListeners();

type Direction = 'up' | 'down' | 'left' | 'right';

// Object to store the game state on.
const state = {
    time: 0,
    lastRender: -1,
    monkey: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        direction: 'down' as Direction,
    }
};

// 18x26, 4 frames: down - right - up - left
const monkeyImage = requireImage('gfx/monkey/facing.png');

// Update function advances the state of the game every FRAME_LENGTH milliseconds.
function update() {
    state.time += FRAME_LENGTH;
    if (isKeyboardKeyDown(KEY.UP)) {
        state.monkey.y--;
        state.monkey.direction = 'up';
    }
    if (isKeyboardKeyDown(KEY.DOWN)) {
        state.monkey.y++;
        state.monkey.direction = 'down';
    }
    if (isKeyboardKeyDown(KEY.LEFT)) {
        state.monkey.x--;
        state.monkey.direction = 'left';
    }
    if (isKeyboardKeyDown(KEY.RIGHT)) {
        state.monkey.x++;
        state.monkey.direction = 'right';
    }
}

// Render will display the current state of the game.
function render() {
    if (!areAllImagesLoaded()) {
        return;
    }
    // Only render if the state has been updated since the last render.
    if (state.lastRender >= state.time) {
        return;
    }
    state.lastRender = state.time;

    // Draw an off-white background:
    mainContext.fillStyle = '#EEE';
    mainContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const {x, y} = state.monkey;
    const offset = {down: 0, right: 18, up: 36, left: 54}[state.monkey.direction];
    mainContext.drawImage(monkeyImage,
        offset, 0, 18, 26,
        x, y, 18, 26
    );
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
