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

    get ['id']() {
        return this.#id;
    }

    set ['name'](value) {
        this.#name = value;
    }
}