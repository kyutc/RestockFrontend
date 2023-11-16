export default class Api {
    _base_url = "api.cpsc4900.local/api/v1/";
    _headers = {
        "Accept": "application/json",
        "X-RestockApiToken": "anything"
    };

    // Todo: Constructor to initialize class properties

    /**
     * Attempt to log a user into the server.
     *
     * @param username
     * @param password
     * @returns {Promise<Response>}
     */
    static async login(email, password) {
        let url = this._base_url + "session";
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
     * @param {string} username
     * @param {string} password
     * @returns {Promise<Response>}
     */
    static async register(email, username, password) {
        let url = this._base_url + "user";
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
     * @returns {Promise<Response>}
     */
    static async authTest() {
        const url = this._base_url + "authtest";
        const options = {
            method: "GET",
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Log user out of the server.
     * 
     * @returns {Promise<Response>}
     */
    static async logout() {
        const url = this._base_url + "session";
        const options = {
            method: "DELETE",
            headers: this._headers
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
     * @param {object} userDetails
     * @returns {Promise<Response>}
     */
    static async updateUserAccount(userId, userDetails) {
        const url = this._base_url + "user/" + userId;
        const options = {
            method: "PUT",
            body: JSON.stringify(userDetails),
            headers: {
                ...this._headers,
                "Content-Type": "application/json"
            }
        };
        return fetch(url, options);
    }

    /**
     * Delete a user account.
     * 
     * @param {number} userId
     * @returns {Promise<Response>}
     */
    static async deleteUserAccount(userId) {
        const url = this._base_url + "user/" + userId;
        const options = {
            method: "DELETE",
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Retrieve details of a specific group.
     * 
     * @param {number} groupId
     * @returns {Promise<Response>}
     */
    static async getGroupDetails(groupId) {
        const url = this._base_url + "group/" + groupId;
        const options = {
            method: "GET",
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Create a new group on the server.
     * 
     * @param {number} groupId
     * @param {object} groupDetails
     * @returns {Promise<Response>}
     */
    static async createGroup(groupId, groupDetails) {
        const url = this._base_url + "group/" + groupId;
        const options = {
            method: "POST",
            body: JSON.stringify(groupDetails),
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Update details of a specific group.
     * 
     * @param {number} groupId
     * @param {object} groupDetails
     * @returns {Promise<Response>}
     */
    static async updateGroup(groupId, groupDetails) {
        const url = this._base_url + "group/" + groupId;
        const options = {
            method: "PUT",
            body: JSON.stringify(groupDetails),
            headers: {
                ...this._headers,
                "Content-Type": "application/json"
            }
        };
        return fetch(url, options);
    }

    /**
     * Delete a specific group from the server.
     * 
     * @param {number} groupId
     * @returns {Promise<Response>}
     */
    static async deleteGroup(groupId) {
        const url = this._base_url + "group/" + groupId;
        const options = {
            method: "DELETE",
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Retrieves details of a specific group member.
     * 
     * @param {number} memberId
     * @returns {Promise<Response>}
     */
    static async getGroupMemberDetails(memberId) {
        const url = this._base_url + "groupmember/" + memberId;
        const options = {
            method: "GET",
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Add a new member to a specific group.
     * 
     * @param {number} groupId
     * @param {object} memberDetails
     * @returns {Promise<Response>}
     */
    static async addGroupMember(groupId, memberDetails) {
        const url = this._base_url + "group/" + groupId + "/addmember";
        const options = {
            method: "POST",
            body: JSON.stringify(memberDetails),
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Update details of a specifc group member.
     * 
     * @param {number} memberId
     * @param {object} memberDetails
     * @returns {Promise<Response>}
     */
    static async updateGroupMember(memberId, memberDetails) {
        const url = this._base_url + "groupmember/" + memberId;
        const options = {
            method: "PUT",
            body: JSON.stringify(memberDetails),
            headers: {
                ...this._headers,
                "Content-Type": "application/json"
            }
        };
        return fetch(url, options);
    }

    /**
     * Remove a member from a group.
     * 
     * @param {number} memberId
     * @returns {Promise<Response>}
     */
    static async deleteGroupMember(memberId) {
        const url = this._base_url + "groupmember/" + memberId;
        const options = {
            method: "DELETE",
            headers: this._headers
        };
        return fetch(url, options);
    }
}