import { CANVAS_WIDTH, CANVAS_HEIGHT, FRAME_LENGTH } from 'app/gameConstants';
import { createAnimation, drawFrame, getFrame } from 'app/utils/animations';
import { areAllImagesLoaded } from 'app/utils/images';
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
        animationTime: 0,
        isWalking: false,
    }
};

// 18x26, 4 frames: down - right - up - left
const [standDown, standRight, standUp, standLeft] = createAnimation('gfx/monkey/facing.png', {w: 18, h: 26}, { cols: 4}).frames;
const walkingGeometry = {w: 20, h: 28};
const walkUpAnimation = createAnimation('gfx/monkey/mcwalking.png', walkingGeometry, { cols: 8, y: 2, duration: 4});
const walkDownAnimation = createAnimation('gfx/monkey/mcwalking.png', walkingGeometry, { cols: 8, y: 0, duration: 4});
const walkLeftAnimation = createAnimation('gfx/monkey/mcwalking.png', walkingGeometry, { cols: 8, y: 3, duration: 4});
const walkRightAnimation = createAnimation('gfx/monkey/mcwalking.png', walkingGeometry, { cols: 8, y: 1, duration: 4});
function getMonkeyFrame(monkey: typeof state.monkey) {
    if (!monkey.isWalking) {
        return {
            up: standUp,
            down: standDown,
            left: standLeft,
            right: standRight,
        }[monkey.direction];
    }
    let animation = {
        up: walkUpAnimation,
        down: walkDownAnimation,
        left: walkLeftAnimation,
        right: walkRightAnimation,
    }[monkey.direction]!;
    return getFrame(animation, monkey.animationTime);
}

// Update function advances the state of the game every FRAME_LENGTH milliseconds.
function update() {
    state.time += FRAME_LENGTH;
    state.monkey.animationTime += FRAME_LENGTH;
    if (isKeyboardKeyDown(KEY.UP)) {
        state.monkey.direction = 'up';
        state.monkey.y--;
        if (!state.monkey.isWalking) {
            state.monkey.isWalking = true;
            state.monkey.animationTime = 0;
        }
    } else if (isKeyboardKeyDown(KEY.DOWN)) {
        state.monkey.y++;
        state.monkey.direction = 'down';
        if (!state.monkey.isWalking) {
            state.monkey.isWalking = true;
            state.monkey.animationTime = 0;
        }
    } else if (isKeyboardKeyDown(KEY.LEFT)) {
        state.monkey.x--;
        state.monkey.direction = 'left';
        if (!state.monkey.isWalking) {
            state.monkey.isWalking = true;
            state.monkey.animationTime = 0;
        }
    } else if (isKeyboardKeyDown(KEY.RIGHT)) {
        state.monkey.x++;
        state.monkey.direction = 'right';
        if (!state.monkey.isWalking) {
            state.monkey.isWalking = true;
            state.monkey.animationTime = 0;
        }
    } else {
        state.monkey.isWalking = false;
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

    const frame = getMonkeyFrame(state.monkey);
    let {x, y} = state.monkey;
    // The standing frames and walking frames are slightly out of alignment,
    // so offset the standing frames by 1 pixel to smooth switching between the two.
    if (!state.monkey.isWalking) {
        x += 1;
        y += 1;
    }
    drawFrame(mainContext, frame, {...frame, x, y});
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
