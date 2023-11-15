export default class GroupMember {
    /** @type {number} */
    #id;

    /** @type {number} */
    #user_id;

    /** @type {number} */
    #group_id;

    /** @type {string} */
    #role;

    constructor(obj) {
        this.#id = obj['id'];
        this.#user_id = obj['user_id'];
        this.#group_id = obj['group_id'];
        this.#role = obj['role'];
    }

    get ['id']() {
        return this.#id;
    }

    get ['user_id']() {
        return this.#user_id;
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