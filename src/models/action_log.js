export default class {
    /** @type {number} */
    #id;

    /** @type {number} */
    #group_id;

    /** @type {string} */
    #log_message;

    /** @type {number} */
    #timestamp;

    constructor(obj) {
        this.#id = obj['id'];
        this.#group_id = obj['group_id'];
        this.#log_message = obj['log_message'];
        this.#timestamp = obj['timestamp'];
    }


    get ['id']() {
        return this.#id;
    }

    get ['group_id']() {
        return this.#group_id;
    }

    get ['log_message']() {
        return this.#log_message;
    }

    get ['timestamp']() {
        return this.#timestamp;
    }
}