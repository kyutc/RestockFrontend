import restockdb from "./restockdb.js";
import User from "./models/user.js";
import Group from "./models/group.js"
import GroupMember from "./models/group_member.js";
import Item from "./models/item.js";
import ActionLog from "./models/action_log.js";

import Api from "./api.js";

export default class {

    /** @type {boolean} */
    static #initialized = false;

    /** @type {string} The string token for the current user's session. Found as 'token' in localStorage */
    static #session;

    /** @type {User} */
    static #user;

    /** @type {Array<Group>} */
    static #groups = [];

    /** @type {Array<GroupMember>} */
    static #group_members = [];

    /** @type {Array<Item>} indexed by group_id*/
    static #items = [];

    /** @type {Array<ActionLog>} */
    static #action_logs = [];

    /** @type {number} The id for the last viewed Group. Defaults to  */
    static #last_used_group_id;


    ///////////
    // PUBLIC
    ///////////

    /**
     * Check if the app has finished setting up
     * @return {boolean}
     */
    static isInitialized() { return this.#initialized; }

    /**
     * Check if there's an active session.
     * @return {boolean}
     */
    static hasActiveSession() { return !!this.#session; }

    /**
     * Returns the last group selected by this user.
     * @return {number|null}
     */
    static getCurrentGroup() {return this.#groups.find( group => group.id === this.#last_used_group_id) ?? null}

    /**
     * Returns an array of all the groups for this user.
     * @return {Array<Group>}
     */
    static getGroups() { return this.#groups; }

    static async init() {
        if (this.#initialized) return true;
        const session = this.#session = localStorage.getItem('token') ?? false;
        if (!session) {
            console.log("DEBUG: Restock.init -- No active session")
            return false;
        } // No active session
        const valid_session = await Api.authTest(session).then(response => response.ok);
        if (!valid_session) {
            console.log("DEBUG: Restock.init -- Invalid session")
            this.#reset();
            return false;
        } // The current session is invalid.
        const user_data = {
            "id": localStorage.getItem('user_id') ?? "10000", // TODO
            "name": localStorage.getItem('user_name') ?? "MrFakeUserMan" // TODO
        };
        // if (!!user_data.id || !!user_data.name) {
            // Todo: Create endpoint for getting the current user's details
            // user_data = getUserDetails
        // }
        const user = this.#user = new User(user_data);
        // await user.save(); // TODO
        console.log("DEBUG: Restock.init -- Initialized application state")
        await this.#populateGroupsForThisUser();
        console.log("DEBUG: Restock.init -- Populated groups for this user", this.#groups);
        this.#last_used_group_id = localStorage.getItem('last_used_group_id')
            ?? this.#groups.find( g => true).id
            ?? null
        ;
        return this.#initialized = true;
    }

    static async refreshUserData() {
        // hit user details endpoint, update user object
    }

    /**
     * Attempt to register a new user account with the server.
     * Todo: create new user entry in local db
     *
     * @param email
     * @param username
     * @param password
     * @returns {Promise<boolean>}
     */
    static async register(email, username, password) {
        const response = await Api.register(email, username, password);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.register -- Failed registration", body);
            return false;
        }
        console.log("DEBUG: Restock.register -- Successful registration");
        // const data = await response.json();
        // restockdb.putUser
        return true;
    }

    /**
     * Attempt to log into an account. Caches session and user data in localStorage
     * Todo: update user entry in local db
     *
     * @param email
     * @param password
     * @returns {Promise<boolean>} resolves true if a valid login took place
     */
    static async login(email, password) {
        const response = await Api.login(email, password);
        if (!response.ok) {
            // failed to log in
            console.log("DEBUG: Restock.login -- Failed login")
            return false;
        }
        console.log('DEBUG: Restock.login -- Successful login');
        const data = await response.json();
        // restockdb.putUser
        localStorage.setItem('token', data.session); // cache session
        localStorage.setItem('user_id', data.id);
        localStorage.setItem('user_name', data.name);
        await this.init(); // Initialize class properties
        return true; // A valid user is accessing the app
    }

    /**
     * Attempt to hit the server's endpoint to log out.
     * If successful, purge app state.
     *
     * @return {Promise<void>}
     */
    static async logout() {
        const response = await Api.logout(this.#session);
        if (!response.ok) {
            // Failed to logout, don't do anything else
            const body = await response.text();
            console.log("DEBUG: Restock.logout -- Failed logout", body);
            return false;
        }
        console.log("DEBUG: Restock.logout -- Successful logout");
        this.#reset();
        return true;
    }

    /**
     * Get a full disclosure of a group's associated tables.
     * @param id
     * @return {Promise<boolean>}
     */
    static async getGroupDetails(id)  {
        const response = await Api.getGroupDetails(id);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.getGroupDetails -- Failed to retrieve details", body, {group_id: id});
            return false;
        }
        console.log("DEBUG: Restock.getGroupDetails -- Successfully retrieved details");
        const data = await response.json();
        const group = this.#groups.find(group => group.id === id);
        // group.save()
        const group_members = this.#group_members[id] = data.group_members.map(group_member_data => {
            const group_member = new GroupMember(group_member_data);
            // group_member.save()
            return group_member;
        });
        const items = this.#items[id] = data.items
            .map(item_data => {
                const item = new Item(item_data)
                // item.save()
                return item;
            })
            .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
        ;
        const action_logs = this.#action_logs[id] = data.action_logs.map(action_log_data => {
            const action_log = new ActionLog(action_log_data);
            // action_log.save()
            return action_log;
        });
        console.log(`DEBUG: Restock.getGroupDetails -- Populated entries for Group ${id}`, group_members, items, action_logs);
        return true;
    }

    static async createGroup(name) {
        const response = await Api.createGroup(this.#session, name);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.createGroup -- Failed to create group", body);
            return false;
        }
        console.log("DEBUG: Restock.createGroup -- Successfully created group");
        const data = await response.json();
        this.#groups.push(new Group(data));
        return true;
    }

    static async updateGroup(id, name) {
        const response = await Api.updateGroup(this.#session, id, name);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.updateGroup -- Failed to update group", body);
            return false;
        }
        console.log("DEBUG: Restock.updateGroup -- Successfully updated group");
        const data = await response.json();
        // The group should already exist locally before being updated. If a group that hasn't been indexed here is
        // modified, then this will throw an error.
        const group = this.#groups.find(group => group.id === data.id);
        group.name = data.name;
        // putGroup
        return true;
    }

    static async deleteGroup(id) {
        const response = await Api.deleteGroup(this.#session, id);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.deleteGroup -- Failed to delete group", body);
            return false;
        }
        console.log("DEBUG: Restock.deleteGroup -- Successfully deleted group");
        const index_to_remove = this.#groups.findIndex( group => group.id === id);
        const removed_group = this.#groups.splice(index_to_remove, 1);
        // restockdb.deleteGroup
    }

    ////////////
    // PRIVATE
    ////////////

    /**
     * Retrieve an array of all groups this user is a member of.
     *
     * @returns {Promise<void>}
     */
    static async #populateGroupsForThisUser() {
        const response = await Api.getGroups();
        if (!response.ok) {
            // Bad response from server
            // TODO: Figure out why
            const body = await response.text();
            console.log("DEBUG: Restock.getGroups -- Failed to get groups", body);
        }
        console.log("DEBUG: Restock.getGroups -- Fetched user groups");
        const data = await response.json(); // Array of data
        this.#groups.length = 0; // Preserve references to the original array
        data.forEach(group_data => {
            const group = new Group(group_data);
            this.#groups.push(group);
        }); // Sort by id
        // restockdb.putGroup(s)
    }

    /*
    get items
        get items for the last-used-group-id, fail if not set
    create item
    updateitem
     */
    /**
     * Purge application state
     */
    static #reset() {
        console.log("DEBUG: Restock.reset -- Clearing localStorage values");
        this.#initialized = false;
        this.#session = null;
        this.#user = null;
        this.#groups.length = 0;
        this.#last_used_group_id = null;
        localStorage.clear();
    }
}