export default class {
    /** @type {number} */
    #id;

    #group_id

    /** @type {string} */
    #code;

    constructor(obj) {
        this.#id = obj.id;
        this.#group_id = obj.group_id;;
        this.#code = obj.code;
    }

    get id() {
        return this.#id;
    }

    get group_id() {
        return this.#group_id;
    }

    get code() {
        return this.#code;
    }
}