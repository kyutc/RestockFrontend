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
        const token = localStorage.getItem('token');
        const options = {
            method: "DELETE",
            headers: this._get_headers()
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
        const userObj =
            {
                "new_username": userDetails.new_username,
                "new_password": userDetails.new_password,
            };
        const url = this._base_url + "user/" + userId;
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
     * 
     * @param {number} userId
     * @returns {Promise<Response>}
     */
    static async deleteUserAccount(userId) {
        const url = this._base_url + "user/" + userId;
        const token = localStorage.getItem('token');
        const options = {
            method: "DELETE",
            headers: {
                ...this._get_headers(),
            }
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
     * Get the list of groups from the server.
     *
     * @returns {Promise<Response>}
     */
    static async getGroups() {
        const url = this._base_url + "group";
        const token = localStorage.getItem('token');
        const options = {
            method: "GET",
            headers: {
                ...this._headers,
                "X-RestockUserApiToken": token
            }
        };
        const response = await fetch(url, options);
        const responseData = await response.json();
        console.log(response, responseData);

        return responseData;
    }

    /**
     * Create a new group on the server.
     * 
     * @param {String} name
     * @returns {Promise<Response>}
     */
    static async createGroup(name) {
        const url = this._base_url + "group";
        const formData = new FormData();
        formData.append('name', name)

        console.log(formData);
        console.log(JSON.stringify(formData));
        const options = {
            method: "POST",
            body: formData,
            headers: this._headers
        };
        return fetch(url, options);
    }

    /**
     * Update details of a specific group.
     * 
     * @param {number} groupId
     * @param {String} groupDetails
     * @returns {Promise<Response>}
     */
    static async updateGroup(groupId, groupDetails) {
        const groupObj =
        {
            "group_id": groupId,
            "name": groupDetails,
        };
        const url = this._base_url + "group/" + groupId;
        console.log("new name:", groupObj);
        console.log("json version of new name:", JSON.stringify(groupObj))
        const options = {
            method: "PUT",
            body: JSON.stringify(groupObj),
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