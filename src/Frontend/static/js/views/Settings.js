import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Settings");
    }

    async getHtml() {
        return `
            <h1>Settings</h1>
            <p>Manage your privacy and configuration.</p>

            <section id="group-management">
                <h3>Group Management</hh3>

                <!-- Form to create a new group -->
                <form id="create-group-form">
                    <input type="text" id="group-name" placeholder="Group Name" required />
                    <button type="submit" id="create-group">Create Group</button>
                </form>
                    
                <!-- List of Existing groups -->
                <div id="groups-list">
                    <!-- TODO: Groups will be populated here -->
                </div>
            </section>

            <section id="account-managemnt">
                <h3>Account Management</h3>
                <button id="delete-account">Delete Account</button>
            </section>
        `;
    }
}