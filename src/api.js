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
        let url = this.base_url + "session"
        let data = {
            "username": username,
            "password": password,
        };
        const options = {
            method: "POST",
            body: JSON.stringify(data),
            headers: this.headers
        }
        return fetch(url, options);
    }

    // Todo: Api calls

}