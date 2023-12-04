import restockdb from "./restockdb.js";
import User from "./models/user.js";
import Group from "./models/group.js"
import GroupMember from "./models/group_member.js";
import Item from "./models/item.js";
import Action_log from "./models/action_log.js";

import Api from "./api.js";

export default class {

    /** @type {string} The string token for the current user's session. Found as 'token' in localStorage */
    static #session;

    /** @type {User} */
    static #user;

    /** @type {Array<Group>} */
    static #groups;

    /** @type {number} The id for the last viewed Group. */
    static #last_used_group_id;

    static async init() {
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
        console.log("DEBUG: Restock.init -- Initialized application state")
        return true;
    }

    /*
    Login
    Check if user session is stored in localstorage
    hit authtest endpoint, initialize static properties
        if authtest fails, log out -- clear session info and redirect to login page
    hit get user groups endpoint
    if the localstorage value for last-used-group_id matches one of the groups, set it in this class - this is the default group to show
        otherwise pick the lowest group_id
     */

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
        const response = await Api.logout();
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
     * Retrieve an array of all groups this user is a member of.
     *
     * @returns {Promise<void>}
     */
    static async #getGroups() {
        const response = await Api.getGroups();
        if (!response.ok) {
            // Bad response from server
            // TODO: Figure out why
            const body = await response.text();
            console.log("DEBUG: Restock.getGroups -- Failed to get groups", body);
        }
        console.log("DEBUG: Restock.getGroups -- Fetched user groups");
        const data = await response.json(); // Array of data
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
        this.#session = this.#user = this.#groups = this.#last_used_group_id = false;
        localStorage.clear();
    }
}