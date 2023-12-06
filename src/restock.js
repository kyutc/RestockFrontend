import restockdb from "./restockdb.js";
import User from "./models/user.js";
import Group from "./models/group.js"
import GroupMember from "./models/group_member.js";
import Item from "./models/item.js";
import ActionLog from "./models/action_log.js";

import Api from "./api.js";

export default class Restock {

    /** @type {boolean} */
    static #initialized = false;

    /** @type {string} The string token for the current user's session. Found as 'token' in localStorage */
    static #session;

    /** @type {User} */
    static #user;

    /** @type {Array<Group>} */
    static #groups = [];

    /** @type {Array<Array<GroupMember>>} */
    static #group_members = [];

    /** @type {Array<Array<Item>>} indexed by group_id*/
    static #items = [];

    /** @type {Array<Array<ActionLog>>} */
    static #action_logs = [];

    /** @type {Group} The id for the last viewed Group. Defaults to  */
    static #current_group = null;

    /** @type {Array<Item>} The array of items for this group. */
    static #current_items = [];

    /** @type {Array<boolean>} */
    static #loaded_groups = [];

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
     * Attempt to get a group by its ID
     * @param group_id
     * @return {Group|null}
     */
    static getGroupById(group_id) { return this.#groups.find( g => g.id == group_id ) ?? null; }

    /**
     * Returns the last group selected by this user or null if none found.
     * @return {Group|null}
     */
    static getCurrentGroup() {
        return this.#current_group;
    }


    /**
     * Attempt to set the current group for this application.
     * @param {string|number|null} group_id
     * @return {Promise<boolean>}
     */
    static async setCurrentGroup(group_id) {
        const group = this.#groups.find( g => g.id == group_id) ?? this.#groups.find( () => true);
        if (!group) return false; // No group matching that id, or user is not in any groups
        localStorage.setItem('last_used_group_id', `${group.id}`)
        this.#current_group = group;
        if (!this.#isLoaded(group_id)) await this.#populateDetailsForGroupById(group.id);
        return true;
    }

    /**
     * Returns an array of all the groups for this user.
     * @return {Array<Group>}
     */
    static getGroups() { return this.#groups; }

    static async init() {
        if (this.#initialized) return true; // Don't initialize twice
        const session = this.#session = localStorage.getItem('token') ?? false;
        if (!session) {
            // No active session
            console.log("DEBUG: Restock.init -- No active session");
            this.#reset();
            return false;
        }
        const valid_session = await Api.authTest(session).then(response => response.ok);
        if (!valid_session) {
            // The current session is invalid.
            console.log("DEBUG: Restock.init -- Invalid session")
            this.#reset();
            return false;
        }
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
        return this.#initialized = await this.#populateGroupsForThisUser()
            .then(() => {
                this.#groups.forEach( g => this.#populateDetailsForGroupById(g.id))
            })
            .then( () => {
                return this.setCurrentGroup(
                    localStorage.getItem('last_used_group_id')
                    ?? this.#groups.find( () => true )?.id
                );
            })
        ;
    }

    /**
     * Get the current list of items for the described group
     * @return {Promise<Array<Item>>}
     */
    static getItemsForGroupById(group_id) {
        const group = this.#current_group.id == group_id ?
            this.getCurrentGroup() :
            this.getGroupById(group_id)
        ;
        console.log("DEBUG: restock.js -- getting items for current group", group, this.#items[group.id])
        return this.#items[group.id];
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
        const group = this.#groups.find(group => group.id == data.id);
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
        const index_to_remove = this.#groups.findIndex( group => group.id == id);
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

    /**
     * Get a full disclosure of a group's associated tables.
     * @param {number|string} group_id
     * @return {Promise<boolean>}
     */
    static async #populateDetailsForGroupById(group_id)  {
        const isLoaded = this.#isLoaded;
        const setLoaded = this.#setLoaded;
        const setUnloaded = this.#setUnloaded;
        if (this.#isLoaded(group_id)) return false; // Block subsequent attempts
        this.#setLoaded()
        if (!group_id) {
            setUnloaded(group_id);
            return false;
        }

        const response = await Api.getGroupDetails(this.#session, group_id);
        if (!response.ok) {
            // Failed to connect to server or user is not a part of this group
            setUnloaded(group_id);
            const body = await response.text();
            console.log("DEBUG: Restock.getGroupDetails -- Failed to retrieve details", body, {group_id: group_id});
            return false;
        }
        console.log(`DEBUG: Restock.getGroupDetails -- Successfully retrieved details for ${group_id}`);
        // User is a part of this group
        // Ensuring each array is instantiated so values can be read by reference immediately
        this.#group_members[group_id] = this.#group_members[group_id] ?? [];
        this.#items[group_id] = this.#items[group_id] ?? [];
        this.#action_logs[group_id] = this.#action_logs[group_id] ?? [];
        
        const data = await response.json();
        const group = this.getGroupById(group_id) ?? new Group(data);
        if (group['name'] !== data.name) {
            group['name'] = data.name;
            // group.save()
        }
        const index = this.#groups.findIndex( g => g.id == group.id );
        if (index === -1 ) this.#groups.push(group);
        // group.save()
        
        this.#group_members[group_id].length = 0;
        data.group_members.forEach(group_member_data => {
            const group_member = new GroupMember(group_member_data);
            // group_member.save()
            this.#group_members[group_id].push(group_member);
        });
        this.#items[group_id].length = 0;
        data.items.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })); // Alphabetical sort
        data.items.forEach((item_data) => {
            const item = new Item(item_data)
            // item.save()
            this.#items[group_id].push(item);
        });

        
        this.#action_logs[group.id].length = 0;
        data.action_logs.forEach(action_log_data => {
            const action_log = new ActionLog(action_log_data);
            // action_log.save()
            return action_log;
        });
        console.log(`DEBUG: Restock.getGroupDetails -- Populated entries for current group`,
            group,
            this.#group_members[group_id],
            this.#items[group_id],
            this.#action_logs[group_id]);
        return true;
    }

    static #isLoaded(group_id) { return this.#loaded_groups[group_id]; }
    static #setLoaded(group_id) { this.#loaded_groups[group_id] = true; }
    static #setUnloaded(group_id)   { this.#loaded_groups[group_id] = false; }

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
        this.#current_group = null;
        localStorage.clear();
    }
}