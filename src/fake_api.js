export default class Api {
    static _base_url = 'http://localhost:3000/';
    static _headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-RestockUserApiToken': '{token}',
        'X-RestockApiToken': 'anything'
    };

    /**
     * Register a new user on the server.
     *
     * @param {string} email
     * @param {string} username
     * @param {string} password
     * @returns {Promise<Response>}
     */
    static async register(email, username, password) {
        const url = this._base_url + 'user';
        const acct_exists = await fetch(url + `?email=${encodeURIComponent(email)}`, {
            method: "GET",
            headers: this._headers
        }).then(response => {
            return response.json()
        }).then(arr => arr.length > 0);

        if (acct_exists) {
            alert("Email already in use!");
            return new Response(JSON.stringify({
                result: "error",
                message: "email already exists"
            }));
        }

        return fetch(url, {
            method: 'POST',
            headers: this._headers,
            body: JSON.stringify({
                email: email,
                name: username,
                password: password
            }),
        });
    }
    /**
     * Attempt to log a user into the server.
     *
     * @param email
     * @param password
     * @returns {Promise<Response>}
     */
    static async login(email, password) {
        // Fetch user by email/password
        const getUserURL = this._base_url
            + 'user'
            + `?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        ;
        let user = await fetch(getUserURL, {
            method: "GET",
            headers: this._headers
        }).then( (response) => response.json());

        if (user.length === 0) {
            alert('Incorrect email or password.');
            return new Response(JSON.stringify({
                result: "error",
                message: "Incorrect email or password"
            }));
        }
        user = user[0];

        // Create and post fake session
        const sessionURL = this._base_url + 'session';
        let session = await fetch(sessionURL, {
            method: "POST",
            headers: this._headers,
            body: JSON.stringify({
                user_id: user.id,
                token: Math.random().toString(20).substring(2)
            })
        }).then( (response) => {
            if (response.ok) {
                return response.json();
            } else {
                return false;
            }
        });

        // Retrieve session we just posted
        session = await fetch(sessionURL + `/${session.id}`, {
            method: "GET",
            headers: this._headers
        }).then( (response) => {
            if (response.ok) {
                return response.json();
            } else {
                return false;
            }
        });

        if (session === false) {
            alert('Login failed. failed to generate session');
            return new Response(JSON.stringify({
                result: "error",
                message: "Failed to generate session"
            }));
        }
        console.log("raa")
        // return fake response with id/name/session
        return Promise.resolve(
            new Response(JSON.stringify({
                id: user.id,
                name: user.name,
                session: session.token
            })
        ));
    }

    /**
     * Test authentication.
     *
     * @param {string} session
     * @returns {Promise<Response>}
     */
    static async authTest(session) {
        const url = this._base_url + `session?token=${encodeURIComponent(session)}`;
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
        // Get current session
        const token = localStorage.getItem('token');
        // Need the ID for this session
        const getSessionByTokenUrl = this._base_url + `session?token=${token}`;
        const session = await fetch(getSessionByTokenUrl, {
            method: "GET",
            headers: this._headers
        }).then(response => response.json());

        const deleteSessionUrl = this._base_url + `session/${session.id}`;
        return fetch(deleteSessionUrl, {
            method: "DELETE",
            headers: this._headers
        });
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
     * @param {string?} userDetails.new_name
     * @param {string?} userDetails.new_password
     * @param {string?} userDetails.password
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
        const token = localStorage.getItem('token');
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
     * Retrieve details of a specific group.
     *
     * @param {number} groupId
     * @returns {Promise<Response>}
     */
    static async getGroupDetails(groupId) {
        // Get group
        const getGroupUrl = this._base_url + "group/" + groupId;
        const group = fetch(getGroupUrl, {
            method: "GET",
            headers: this._headers
        }).then(response => response.json());

        // Get group members
        const getGroupMembersUrl = this._base_url + `group_member?group_id=${groupId}`;
        const group_members = fetch(getGroupMembersUrl, {
            method: "GET",
            headers: this._headers
        }).then(response => response.json());

        // Get items
        const getItemsUrl = this._base_url + `item?group_id=${groupId}`;
        const items = fetch(getItemsUrl, {
            method: "GET",
            headers: this._headers
        }).then(response => response.json());

        return Promise.resolve(
            new Request({
                ...group,
                group_members: group_members,
                items: items
            })
        )
    }

    /**
     * Create a new group on the server.
     *
     * @param {string} name
     * @returns {Promise<Response>}
     */
    static async createGroup(name) {
        // Create group
        const groupDetails = {name: name};
        const createGroupUrl = this._base_url + "group";
        const group = await fetch(createGroupUrl, {
            method: "POST",
            body: JSON.stringify(groupDetails),
            headers: this._headers
        }).then(response => response.json());
        group.name = groupDetails.name;

        // Get session to get current user_id
        const token = localStorage.getItem('token');
        const session = await fetch(sessionURL + `?token=${token}`, {
            method: "GET",
            headers: this._headers
        }).then( (response) => response.json());
        const user_id = session.user_id;

        // Create groupmember
        const groupMemberDetails = {
            group_id: group.id,
            user_id: user_id,
            role: 'owner'
        }
        const createGroupMemberUrl = this._base_url + "group_member";
        const group_member = await fetch(createGroupMemberUrl, {
            method: "POST",
            headers: this._headers,
            body: JSON.stringify(groupMemberDetails)
        });
        group_member.group_id = groupMemberDetails.group_id;
        group_member.user_id = groupMemberDetails.user_id;
        group_member.role = groupMemberDetails.role;

        return Promise.resolve(
            new Response(JSON.stringify({
                    ...group,
                    group_member: group_member
                })
            ));
    }

    /**
     * Update details of a specific group.
     *
     * @param {number} groupId
     * @param {object} groupDetails
     * @param {string} groupDetails.name
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