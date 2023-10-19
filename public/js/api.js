export class Api {
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
    login(username, password) {
        let url = this._base_url + "session"
        let data = {
            "username": username,
            "password": password,
        };
        const options = {
            method: "POST",
            body: JSON.stringify(data),
            headers: this._headers
        }
        return fetch(url, options);
    }

    /**
     * Register a new user on the server.
     * 
     * @param {string} username
     * @param {string} password
     * @returns {Promise<Response>}
     */
    register(username, password) {
        let url = this._base_url + "user";
        let data = {
            "username": username,
            "password": password,
        };
        const options = {
            method: "POST",
            body: JSON.stringify(data),
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Check if a username is available.
     * 
     * @param {string} username
     * @returns {Promise<Response>}
     */
    async checkUsernameAvailable(username) {
        let url = this._base_url + "user/" + username;
        const options = {
            method: "HEAD",
            headers: this._headers
        };
        const response = await fetch(url, options);
        return response.status === 200;
    }

    /**
     * Test authentication.
     * 
     * @returns {Promise<Response>}
     */
    async authTest() {
        let url = this._base_url + "authtest";
        const options = {
            method: "GET",
            headers: this._headers
        };
        const response = await fetch(url, options);
        return response;
    }

    /**
     * Log user out of the server.
     * 
     * @returns {Promise<Response>}
     */
    async logout() {
        let url = this._base_url + "session";
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
    async getUserAcccount(userId) {
        let url = this._base_url + "user/" + userId;
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
    async updateUserAccount(userId, userDetails) {
        let url = this._base_url + "user/" + userId;
        const options = {
            method: "PUT",
            body: JSON.stringify(userDetails),
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Delete a user account.
     * 
     * @param {number} userId
     * @returns {Promise<Response>}
     */
    async deleteUserAccount(userId) {
        let url = this._base_url + "user/" + userId;
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
    async getGroupDetails(groupId) {
        let url = this._base_url + "group/" + groupId;
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
    async createGroup(groupId, groupDetails) {
        let url = this._base_url + "group/" + groupId;
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
    async updateGroup(groupId, groupDetails) {
        let url = this._base_url + "group/" + groupId;
        const options = {
            method: "PUT",
            body: JSON.stringify(groupDetails),
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Delete a specific group from the server.
     * 
     * @param {number} groupId
     * @returns {Promise<Response>}
     */
    async deleteGroup(groupId) {
        let url = this._base_url + "group/" + groupId;
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
    async getGroupMemberDetails(memberId) {
        let url = this._base_url + "groupmember/" + memberId;
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
    async addGroupMember(groupId, memberDetails) {
        let  url = this._base_url + "group/" + groupId + "/addmember";
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
    async updateGroupMember(memberId, memberDetails) {
        let url = this._base_url + "groupmember/" + memberId;
        const options = {
            method: "PUT",
            body: JSON.stringify(memberDetails),
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Remove a member from a group.
     * 
     * @param {number} memberId
     * @returns {Promise<Response>}
     */
    async deleteGroupMember(memberId) {
        let url = this._base_url + "groupmember/" + memberId;
        const options = {
            method: "DELETE",
            headers: this._headers
        };
        return fetch(url, options);
    }
}