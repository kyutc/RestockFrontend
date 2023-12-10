export default class {
    /** @type {number} */
    #id;

    /** @type {string} */
    #name;

    constructor(obj) {
        this.#id = obj['id'];
        this.#name = obj['name'];
    }

    toJSON() {
        return JSON.stringify({
            id: this.id,
            name: this.name
        });
    }

    get ['id']() {
        return this.#id;
    }

    get ['name']() {
        return this.#name;
    }

    set ['name'](value) {
        this.#name = value;
    }
}