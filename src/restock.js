import restockdb from "./restockdb.js";
import User from "./models/user.js";
import Group from "./models/group.js"
import GroupMember from "./models/group_member.js";
import Invite from "./models/invite.js";
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

    /** @type {Array<Array<Invite>>} */
    static #invites = [];

     /** @type {Array<Array<ActionLog>>} */
    static #action_logs = [];

    /** @type {Array<Array<Item>>} indexed by group_id*/
    static #items = [];

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

    static getCurrentUser() { return this.#user; }

    static getCurrentUserGroupMemberForGroup(group) {
        const gm =  this.#group_members.flat().find( gm => gm.group_id == group.id && gm.user_id == this.#user.id );
        return gm;
    }

    static getGroupMemberById(group_member_id) {
        return this.#group_members.flat().find( group_member => group_member.id == group_member_id);
    }

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
            .then( () => Promise.all(this.#groups.map( g => this.#populateDetailsForGroupById(g.id) )) )
            .then( () => {
                return this.setCurrentGroup(
                    localStorage.getItem('last_used_group_id')
                    ?? this.#groups.find( () => true )?.id
                );
            })
        ;
    }

    /**
     * Get the current list of group members for the described group
     * @param group_id
     * @return {Array<GroupMember>}
     */
    static getGroupMembersForGroupById(group_id) { return this.#group_members[group_id]; }

    /**
     * Get the current list of items for the described group
     * @return {Array<Item>}
     */
    static getItemsForGroupById(group_id) { return this.#items[group_id]; }

    /**
     * Get the current list of items for the described group
     * @return {Array<ActionLog>}
     */
    static getActionLogsForGroupById(group_id) { return this.#action_logs[group_id]; }

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

    static async updateUser(user) {
        const response = await Api.updateUserAccount(this.#session, user);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.updateUser -- Failed to update user", body);
            return false;
        }
        console.log("DEBUG: Restock.updateUser -- Successfully updated user");
        const data = await response.json();
        console.log(user);
        console.log(data);
        this.#user = new User(data);
        // Update group member entries
        this.#group_members.flat().forEach( gm => gm.name = gm.user_id == this.#user.id ? this.#user.name : gm.name );
        // restockdb.deleteGroup
        return true;
    }

    static async deleteUser(id) {
        const response = await Api.deleteUserAccount(this.#session, id);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.deleteUser -- Failed to delete user", body);
            return false;
        }
        console.log("DEBUG: Restock.deleteUser -- Successfully deleted user");
        this.#reset(); // Purge cached data
        // restockdb.deleteUser
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
        const new_group = new Group(data);
        this.#groups.push(new_group);
        await this.#populateDetailsForGroupById(new_group.id);
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
        await this.#populateGroupHistory(id);
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
        return true;
    }

    /**
     * Change member's role
     * @param {GroupMember} group_member
     * @return {Promise<boolean>}
     */
    static async updateGroupMember(group_member) {
        const response = await Api.updateGroupMember(this.#session, group_member);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.updateGroupMember -- Failed to update member's role", body);
            return false;
        }
        console.log("DEBUG: Restock.updateGroupMember -- Successfully updated member's role");
        await this.#populateDetailsForGroupById(group_member.group_id);
        const data = await response.json();
        group_member.role = data.role;
        // group_memer.save()
        return true;
    }

    /**
     * Remove member from group
     * @param {GroupMember} group_member
     * @return {Promise<boolean>}
     */
    static async deleteGroupMember(group_member) {
        const response = await Api.deleteGroupMember(this.#session, group_member);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.deleteGroupMember -- Failed to delete group member", body);
            return false;
        }
        console.log("DEBUG: Restock.deleteGroupMember -- Successfully deleted group member");
        if (group_member.user_id == this.#user.id) {
            const index_to_remove = this.#groups.indexOf(this.getGroupById(group_member.group_id));
            const removed_group = this.#groups.splice(index_to_remove, 1)[0];
            this.#group_members.splice(removed_group.id, 1);
            this.#invites.splice((removed_group.id));
            this.#items.splice(removed_group.id);
            this.#action_logs.splice(removed_group.id);
        }
        await this.#populateDetailsForGroupById(group_member.group_id)
        // const index_to_remove = this.#group_members[group_member.group_id].findIndex( old_group_member => old_group_member.id == group_member.id);
        this.#populateDetailsForGroupById(group_member.group_id); // Todo: quick fix
        // const removed_item = this.#group_members[group_member.group_id].splice(index_to_remove, 1);
        // restockdb.deleteGroupMember
        return true;
    }

    /**
     * Retrieve an array of a group's active invitations
     * @param group_id
     * @return {Promise<boolean>}
     */
    static async getInvitesForGroupById(group_id) {
        const response = await Api.getGroupInvites(this.#session, group_id);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.populateGroupInvites -- Failed to retrieve invites", body);
            return false;
        }
        console.log("DEBUG: Restock.populateGroupInvites -- Successfully retrieved invites");
        const data = await response.json();
        data.slice(this.#invites[group_id].length) // Only copy records that we don't have
            .forEach( invite_data => {
                const invite = new Invite(invite_data);
                // action_log.save()
                this.#invites[group_id].push(invite);
            });
        return true;
    }

    /**
     * Generate a new invitation
     * @param group_id
     * @return {Promise<Invite|false>}
     */
    static async createGroupInvite(group_id) {
        const response = await Api.createGroupInvite(this.#session, group_id);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.createGroupInvite -- Failed to create invite", body);
            return false;
        }
        console.log("DEBUG: Restock.createGroupInvite -- Successfully created invite");
        const data = await response.json();
        const new_invite = new Invite(data);
        // new_invite.save()
        this.#invites[new_invite.group_id].push(new_invite);
        return new_invite;
    }

    /**
     * Delete an active invitation
     * @param {Invite} invite
     * @return {Promise<boolean>}
     */
    static async deleteGroupInvite(invite) {
        const response = await Api.deleteGroupInvite(this.#session, invite);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.deleteGroupInvite -- Failed to delete invite", body);
            return false;
        }
        console.log("DEBUG: Restock.deleteGroupInvite -- Successfully deleted invite");
        const index_to_remove = this.#invites[invite.group_id].findIndex( old_invite => old_invite.id == invite.id);
        const removed_item = this.#invites[invite.group_id].splice(index_to_remove, 1);
        // restockdb.deleteInvite
        return true;
    }

    /**
     * Get the group that issued an invite.
     * @param invite_code
     * @return {Promise<Group|false>} False if expired/doesn't exist
     */
    static async getGroupByInviteCode(invite_code) {
        const response = await Api.getGroupInviteDetails(this.#session, invite_code);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.getGroupByInviteCode -- Failed to retrieve group", body);
            return false;
        }
        console.log("DEBUG: Restock.getGroupByInviteCode -- Successfully retrieved group");
        const data = await response.json();
        const group = new Group(data);
        return group;
    }

    /**
     * Join the group that issued an invite.
     * @param invite_code
     * @return {Promise<Boolean>} False if expired
     */
    static async joinGroupByInviteCode(invite_code) {
        const response = await Api.acceptGroupInvite(this.#session, invite_code);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.acceptGroupByInviteCode -- Failed to join group", body);
            return false;
        }
        console.log("DEBUG: Restock.acceptGroupByInviteCode -- Successfully joined group");
        const data = await response.json();
        const group_member = new GroupMember(data);
        await this.#populateDetailsForGroupById(group_member.group_id);
        return true;
    }

    static async createItem(item) {
        const response = await Api.createItem(this.#session, item);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.createItem -- Failed to create item", body);
            return false;
        }
        console.log("DEBUG: Restock.createItem -- Successfully created item");
        await this.#populateGroupHistory(item.group_id);
        const data = await response.json();
        const new_item = new Item(data);
        // new_item.save();
        this.#items[new_item.group_id].push(new_item);
        return true;
    }

    static async updateItem(item) {
        const response = await Api.updateItem(this.#session, item);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.updateItem -- Failed to update item", body);
            return false;
        }
        console.log("DEBUG: Restock.updateItem -- Successfully updated item");
        await this.#populateGroupHistory(item.group_id);
        const data = await response.json();
        item.update(data);
        // updated_item.save()
        return true;
    }

    static async deleteItem(item) {
        const response = await Api.deleteItem(this.#session, item);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.deleteItem -- Failed to delete item", body);
            return false;
        }
        console.log("DEBUG: Restock.deleteItem -- Successfully deleted item");
        await this.#populateGroupHistory(item.group_id);
        const index_to_remove = this.#items[item.group_id].findIndex( old_item => old_item.id == item.id);
        const removed_item = this.#items[item.group_id].splice(index_to_remove, 1);
        // restockdb.deleteItem
        return true;
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
        const response = await Api.getGroups(this.#session);
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
        if (this.#isLoaded(group_id)) return false; // Block subsequent attempts
        this.#setLoaded(group_id);

        if (!group_id) {
            this.#setUnloaded(group_id);
            return false;
        }

        const response = await Api.getGroupDetails(this.#session, group_id);
        if (!response.ok) {
            // Failed to connect to server or user is not a part of this group
            this.#setUnloaded(group_id);
            const body = await response.text();
            console.log("DEBUG: Restock.getGroupDetails -- Failed to retrieve details", body, {group_id: group_id});
            return false;
        }
        console.log(`DEBUG: Restock.getGroupDetails -- Successfully retrieved details for ${group_id}`);

        if (!this.#groups.find( group => group.id == group_id)) {

        }
        // User is a part of this group
        // Ensuring each array is instantiated so values can be read by reference immediately
        this.#group_members[group_id] = this.#group_members[group_id] ?? [];
        this.#invites[group_id] = this.#invites[group_id] ?? [];
        this.#items[group_id] = this.#items[group_id] ?? [];
        this.#action_logs[group_id] = this.#action_logs[group_id] ?? [];
        
        const data = await response.json();
        console.log(`DEBUG: Restock.populateDetailsForGroupById -- Populated details for group ${group_id}`, data);
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
        data.items.map(String).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })); // Alphabetical sort
        data.items.forEach((item_data) => {
            const item = new Item(item_data)
            // item.save()
            this.#items[group_id].push(item);
        });

        this.#action_logs[group_id].length = 0;
        data.action_logs.forEach(action_log_data => {
            const action_log = new ActionLog(action_log_data);
            // action_log.save()
            this.#action_logs[group_id].push(action_log);
        });
        return true;
    }

    static #isLoaded(group_id) { return this.#loaded_groups[group_id] = this.#loaded_groups[group_id] ?? false; }
    static #setLoaded(group_id) { this.#loaded_groups[group_id] = true; }
    static #setUnloaded(group_id)   { this.#loaded_groups[group_id] = false; }

    /**
     * Retrieve an array of a group's action logs
     * @param group_id
     * @return {Promise<boolean>}
     */
    static async #populateGroupHistory(group_id) {
        const response = await Api.getGroupHistory(this.#session, group_id);
        if (!response.ok) {
            const body = await response.text();
            console.log("DEBUG: Restock.populateGroupHistory -- Failed to retrieve history", body);
            return false;
        }
        console.log("DEBUG: Restock.populateGroupHistory -- Successfully retrieved history");
        const data = await response.json();
        data.slice(this.#action_logs[group_id].length) // Only copy records that we don't have
            .forEach( action_log_data => {
                const action_log = new ActionLog(action_log_data);
                // action_log.save()
                this.#action_logs[group_id].push(action_log);
            });
        return true;
    }

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