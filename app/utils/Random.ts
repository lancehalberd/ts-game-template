type Collection<T> = {[key:string]: T} | Array<T>;

const Random = {
    range(A:number, B:number): number {
        var min = Math.min(A, B);
        var max = Math.max(A, B);
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    },

    element<T>(collection: Record<string, T> | T[]): T {
        if (Array.isArray(collection)) {
            const array = collection as Array<any>;
            return array[Math.floor(Math.random() * array.length)];
        }
        if (collection.constructor === Object) {
            const keys = Object.keys(collection);
            return collection[Random.element(keys)];
        }
        throw "Warning @ Random.element: "+ collection + " is neither Array or Object";
    },

    removeElement<T>(collection: Collection<T>): T {
        if (Array.isArray(collection)) {
            const array = collection as Array<any>;
            return array.splice(Math.floor(Math.random() * (array.length - 1)), 1)[0];
        }
        if (collection.constructor == Object) {
            const keys = Object.keys(collection);
            const key = this.element(keys);
            const value = collection[key];
            delete collection[key];
            return value;
        }
        throw "Warning @ Random.removeElement: "+ collection + " is neither Array or Object";
    },

    /**
     * Knuth algorithm found at:
     * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     */
    shuffle<T>(array: T[]): T[] {
        array = [...array];
        let currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
        return array;
    }
};

export default Random;
