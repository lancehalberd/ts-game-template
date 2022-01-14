export interface ExtraAnimationProperties {
    // The animation will loop unless this is explicitly set to false.
    loop?: boolean
    // Frame to start from after looping.
    loopFrame?: number
}
export type FrameAnimation = {
    frames: Frame[]
    frameDuration: number
    duration: number
} & ExtraAnimationProperties

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}
export interface FrameDimensions {
    w: number
    h: number
}

export interface Frame extends Rect {
    image: HTMLCanvasElement | HTMLImageElement,
}
