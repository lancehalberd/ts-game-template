import { FRAME_LENGTH } from 'app/gameConstants';
import { requireImage } from 'app/utils/images';
import {
    ExtraAnimationProperties,
    Frame,
    FrameAnimation,
    FrameDimensions,
    Rect,
} from 'app/types';

interface CreateAnimationOptions {
    x?: number
    y?: number
    xSpace?: number
    rows?: number
    cols?: number
    top?: number
    left?: number
    duration?: number
    frameMap?: number[]
}

export function createAnimation(
    source: string | HTMLImageElement | HTMLCanvasElement,
    dimensions: FrameDimensions,
    {x = 0, y = 0, rows = 1, cols = 1, xSpace = 0, top = 0, left = 0, duration = 8, frameMap}: CreateAnimationOptions = {},
    props: ExtraAnimationProperties = {},
): FrameAnimation {
    let frames: Frame[] = [];
    let image: HTMLImageElement | HTMLCanvasElement;
    if (typeof source === 'string') {
        image = requireImage(source);
    } else {
        image = source;
    }
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            frames[row * cols + col] = {
                ...dimensions,
                x: left + (dimensions.w + xSpace) * (x + col),
                y: top + dimensions.h * (y + row),
                image
            };
        }
    }
    // Say an animation has 3 frames, but you want to order them 0, 1, 2, 1, then pass frameMap = [0, 1, 2, 1],
    // to remap the order of the frames accordingly.
    if (frameMap) {
       frames = frameMap.map(originalIndex => frames[originalIndex]);
    }
    return {frames, frameDuration: duration, ...props, duration: FRAME_LENGTH * frames.length * duration};
};

export function getFrame(animation: FrameAnimation, animationTime: number): Frame {
    animationTime = Math.max(animationTime, 0);
    let frameIndex = Math.floor(animationTime / (FRAME_LENGTH * (animation.frameDuration || 1)));
    if (animation.loop === false) { // You can set this to prevent an animation from looping.
        frameIndex = Math.min(frameIndex, animation.frames.length - 1);
    }
    if (animation.loopFrame && frameIndex >= animation.frames.length) {
        frameIndex -= animation.loopFrame;
        frameIndex %= (animation.frames.length - animation.loopFrame);
        frameIndex += animation.loopFrame;
    }
    return animation.frames[frameIndex % animation.frames.length];
};

export function drawFrame(
    context: CanvasRenderingContext2D,
    {image, x, y, w, h}: Frame,
    {x: tx, y: ty, w: tw, h: th}: Rect
): void {
    // (x | 0) is faster than Math.floor(x)
    context.drawImage(image, x | 0, y | 0, w | 0, h | 0, tx | 0, ty | 0, tw | 0, th | 0);
}
