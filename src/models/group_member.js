export default class GroupMember {
    /** @type {number} */
    #id;

    /** @type {number} */
    #name;

    /** @type {number} */
    #group_id;

    /** @type {string} */
    #role;

    constructor(obj) {
        this.#id = obj['id'];
        this.#name = obj['name'];
        this.#group_id = obj['group_id'];
        this.#role = obj['role'];
    }

    get ['id']() {
        return this.#id;
    }

    get ['name']() {
        return this.#name;
    }

    get ['group_id']() {
        return this.#group_id;
    }

    get ['role']() {
        return this.#role;
    }

    set ['role'](value) {
        this.#role = value;
    }
}