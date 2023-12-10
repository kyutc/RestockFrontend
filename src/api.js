import Item from "./models/item.js";
import Invite from "./models/invite.js"

export default class Api {
    static _base_url = "https://api.pantrysync.pro/api/v1/";
    static _headers = {
        "Accept": "application/json",
        "X-RestockApiToken": "anything",
        "X-RestockUserApiToken" : localStorage.getItem("token")
    };
    static _get_headers(){
        return {
            "Accept": "application/json",
            "X-RestockApiToken": "anything",
            "X-RestockUserApiToken" : localStorage.getItem("token")
        }
    }

    // Todo: Constructor to initialize class properties

    /**
     * Attempt to log a user into the server.
     *
     * @param email
     * @param password
     * @returns {Promise<Response>}
     */
    static async login(email, password) {
        const url = this._base_url + "session";
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        return fetch(url, {
            method: "POST",
            body: formData,
            headers: this._headers
        });
    }

    /**
     * Register a new user on the server.
     * 
     * @param {string} email
     * @param {string} username
     * @param {string} password
     * @returns {Promise<Response>}
     */
    static async register(email, username, password) {
        const url = this._base_url + "user";
        const formData = new FormData();
        formData.append('email', email);
        formData.append('username', username);
        formData.append('password', password);

        return fetch(url, {
            method: "POST",
            body: formData,
            headers: this._headers
        });
    }

    /**
     * Check if a username is available.
     * 
     * @param {string} username
     * @returns {Promise<Response>}
     */
    static async checkUsernameAvailable(username) {
        const url = this._base_url + "user/" + username;
        const options = {
            method: "HEAD",
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Test authentication.
     *
     * @param {string} token
     * @returns {Promise<Response>}
     */
    static async authTest(token) {
        const url = this._base_url + "authtest";
        const options = {
            method: "GET",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken" : token
            }
        };
        return fetch(url, options);
    }

    /**
     * Log user out of the server.
     *
     * @param {string} token
     * @returns {Promise<Response>}
     */
    static async logout(token) {
        const url = this._base_url + "session";
        const options = {
            method: "DELETE",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken" : token
            }
        };
        return fetch(url, options);
    }

    /**
     * Retrieve details of a user account.
     * 
     * @param {number} userId
     * @returns {Promise<Response>}
     */
    static async getUserAcccount(userId) {
        const url = this._base_url + "user/" + userId;
        const options = {
            method: "GET",
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Update details of a user account.
     * 
     * @param {number} userId
     * @param {User} user
     * @returns {Promise<Response>}
     */
    static async updateUserAccount(token, user) {
        const url = this._base_url + "user/" + user.id;
        const userObj = {
            new_username: user.name
        }
        const options = {
            method: "PUT",
            body: JSON.stringify(userObj),
            headers: {
                ...this._headers,
                "Content-Type": "application/json"
            }
        };
        return fetch(url, options);
    }

    /**
     * Delete a user account.
     * @param {string} token
     * @param {number} userId
     * @returns {Promise<Response>}
     */
    static async deleteUserAccount(token, userId) {
    const url = this._base_url + "user/" + userId;
        const options = {
            method: "DELETE",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken" : token
            }
        };
        return fetch(url, options);
    }

    /**
     * Retrieve details of a specific group.
     * @param {string} token
     * @param {number} groupId
     * @returns {Promise<Response>}
     */
    static async getGroupDetails(token, groupId) {
        const url = this._base_url + "group/" + groupId;
        const options = {
            method: "GET",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken" : token
            }
        };
        return fetch(url, options);
    }

    /**
     * Get the list of groups from the server.
     * @param {string} token
     * @returns {Promise<Response>}
     */
    static async getGroups(token) {
        const url = this._base_url + "group";
        const options = {
            method: "GET",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Create a new group on the server.
     *
     * @param {string} token
     * @param {String} name
     * @returns {Promise<Response>}
     */
    static async createGroup(token, name) {
        const url = this._base_url + "group";
        const formData = new FormData();
        formData.append('name', name)

        const options = {
            method: "POST",
            body: formData,
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Update details of a specific group.
     *
     * @param {string} token
     * @param {number} groupId
     * @param {String} groupDetails
     * @returns {Promise<Response>}
     */
    static async updateGroup(token, groupId, groupDetails) {
        const groupObj =
        {
            "group_id": groupId,
            "name": groupDetails,
        };
        const url = this._base_url + "group/" + groupId;
        const options = {
            method: "PUT",
            body: JSON.stringify(groupObj),
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token,
                "Content-Type": "application/json"
            }
        };
        return fetch(url, options);
    }

    /**
     * Delete a specific group from the server.
     *
     * @param {string} token
     * @param {number} groupId
     * @returns {Promise<Response>}
     */
    static async deleteGroup(token, groupId) {
        const url = this._base_url + "group/" + groupId;
        const options = {
            method: "DELETE",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Retrieves details of a specific group member.
     * @param token
     * @param {GroupMember} group_member
     * @returns {Promise<Response>}
     */
    static async getGroupMemberDetails(token, group_member) {
        const url = this._base_url + `group/${group_member.group_id}member/${group_member.id}`;
        const options = {
            method: "GET",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Add a new member to a specific group.
     * @param token
     * @param {string} groupId
     * @param {GroupMember} group_member
     * @returns {Promise<Response>}
     */
    static async addGroupMember(token, groupId, group_member) {
        const url = this._base_url + `group/${group_member.group_id}/member`;
        const formData = new FormData();
        formData.append('user_id', group_member.user_id);
        formData.append('role', group_member.role);
        const options = {
            method: "POST",
            body: formData,
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Update details of a specifc group member.
     * @param token
     * @param {GroupMember} group_member
     * @returns {Promise<Response>}
     */
    static async updateGroupMember(token, group_member) {
        console.log(group_member.toJSON())
        const url = this._base_url + `group/${group_member.group_id}/member/${group_member.id}`;
        const options = {
            method: "PUT",
            body: group_member.toJSON(),
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Remove a member from a group.
     * @param token
     * @param {GroupMember} group_member
     * @returns {Promise<Response>}
     */
    static async deleteGroupMember(token, group_member) {
        const url = this._base_url + `group/${group_member.group_id}/member/${group_member.id}`;
        const options = {
            method: "DELETE",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Create a new item
     * @param token
     * @param {Item} item
     * @return {Promise<void>}
     */
    static async createItem(token, item) {
        const url = this._base_url + `group/${item.group_id}/item`;
        const formData = new FormData();
        formData.append('group_id', item.group_id);
        formData.append('name', item.name);
        formData.append('description', item.description);
        formData.append('category', item.category);
        formData.append('pantry_quantity', item.pantry_quantity);
        formData.append('minimum_threshold', item.minimum_threshold);
        formData.append('auto_add_to_shopping_list', item.auto_add_to_shopping_list);
        formData.append('shopping_list_quantity', item.shopping_list_quantity);
        formData.append('add_to_pantry_on_purchase', item.add_to_pantry_on_purchase);

        const options = {
            method: "POST",
            body: formData,
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Update item
     * @param token
     * @param {Item} item
     * @return {Promise<Response>}
     */
    static async updateItem(token, item) {
        const url = this._base_url + `group/${item.group_id}/item/${item.id}`;
        const options = {
            method: "PUT",
            body: item.toJSON(),
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Delete item
     * @param token
     * @param {Item} item
     * @return {Promise<Response>}
     */
    static async deleteItem(token, item) {
        const url = this._base_url + `group/${item.group_id}/item/${item.id}`;
        const options = {
            method: "DELETE",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Fetch history
     * @param token
     * @param {string|number} group_id
     * @return {Promise<Response>}
     */
    static async getGroupHistory(token, group_id) {
        const url = this._base_url + `group/${group_id}/history`;
        const options = {
            method: "GET",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Get all active invitation codes for this group
     * @param token
     * @param group_id
     * @return {Promise<Response>}
     */
    static async getGroupInvites(token, group_id) {
        const url = this._base_url + `group/${group_id}/invite`;
        const options = {
            method: "GET",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Generate a new invitation for a group
     * @param token
     * @param group_id
     * @return {Promise<Response>}
     */
    static async createGroupInvite(token, group_id){
        const url = this._base_url + `group/${group_id}/invite`;
        const options = {
            method: "POST",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Delete an existing invitation
     * @param token
     * @param {Invite} invite
     * @return {Promise<Response>}
     */
    static async deleteGroupInvite(token, invite){
        const url = this._base_url + `group/${invite.group_id}/invite/${invite.id}`;
        const options = {
            method: "DELETE",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Check if a group invitation is valid
     * @param token
     * @param {string} invite_code
     * @return {Promise<Response>}
     */
    static async getGroupInviteDetails(token, invite_code){
        const url = this._base_url + `invite/${invite_code}`;
        const options = {
            method: "GET",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }

    /**
     * Join a group by invitation
     * @param token
     * @param {string} invite_code
     * @return {Promise<Response>}
     */
    static async acceptGroupInvite(token, invite_code){
        const url = this._base_url + `invite/${invite_code}`;
        const options = {
            method: "POST",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        return fetch(url, options);
    }
}