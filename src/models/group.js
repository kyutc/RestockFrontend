export default class {

    /** @type {number} */
    #id;

    /** @type {string} */
    #name;

    constructor(obj) {
        this.#id = obj['id'];
        this.#name = obj['name'];
    }

    get ['name']() {
        return this.#name;
    }

    set ['name'](value) {
        this.#name = value;
    }
}