
export const images: {[key: string]: HTMLImageElement & { originalSource?: string}} = {};

function loadImage(source: string, callback: () => void) {
    images[source] = new Image();
    images[source].onload = () => callback();
    images[source].src = source;
    return images[source];
}

let startedLoading = false;
let numberOfImagesLeftToLoad = 0;
export function requireImage(source: string) {
    if (images[source]) {
        return images[source];
    }
    startedLoading = true;
    numberOfImagesLeftToLoad++;
    return loadImage(source, () => numberOfImagesLeftToLoad--);
}

let allImagesAreLoaded = false;
export function areAllImagesLoaded() {
    return allImagesAreLoaded;
}
const allImagesLoadedPromise = new Promise(resolve => {
    const intervalId = setInterval(() => {
        if (startedLoading && numberOfImagesLeftToLoad <= 0) {
            clearInterval(intervalId);
            resolve(true);
        }
    }, 50);
});
export async function allImagesLoaded() {
    return allImagesLoadedPromise;
}
allImagesLoaded().then(() => allImagesAreLoaded = true);
