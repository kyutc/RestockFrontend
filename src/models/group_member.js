export default class GroupMember {
    /** @type {number} */
    #id;

    /** @type {number} */
    #user_id;

    /** @type {number} */
    #name;

    /** @type {number} */
    #group_id;

    /** @type {string} */
    #role;

    constructor(obj) {
        this.#id = obj['id'];
        this.#user_id = obj['user_id'];
        this.#name = obj['name'];
        this.#group_id = obj['group_id'];
        this.#role = obj['role'];
    }

    toJSON() {
        return JSON.stringify({
            id: this.id,
            group_id: this.#group_id,
            user_id: this.user_id,
            role: this.role
        });
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