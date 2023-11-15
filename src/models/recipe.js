export default class {

    /** @type {number} */
    #id;

    /** @type {number} */
    #user_id;

    /** @type {string} */
    #name;

    /** @type {Array<string>} */
    #ingredients;

    /** @type {string} */
    #instructions;

    constructor(obj) {
        this.#id = obj['id'];
        this.#user_id = obj['user_id'];
        this.#name = obj['name'];
        this.#ingredients = obj['ingredients'];
        this.#instructions = obj['instructions'];
    }

    get ['id']() {
        return this.#id;
    }

    get ['user_id']() {
        return this.#user_id;
    }

    get ['name']() {
        return this.#name;
    }

    set ['name'](value) {
        this.#name = value;
    }

    get ['ingredients']() {
        return this.#ingredients;
    }

    set ['ingredients'](value) {
        this.#ingredients = value;
    }

    get ['instructions']() {
        return this.#instructions;
    }

    set ['instructions'](value) {
        this.#instructions = value;
    }
}