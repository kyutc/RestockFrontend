import AbstractView from "./AbstractView.js";
import Api from "../api.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Settings");
        this.api = new Api();
    }

    async getHtml() {
        return `
            <h1>Settings</h1>
            <p>Manage your privacy and configuration.</p>

            <section id="group-management">
                <h3>Group Management</hh3>

                <!-- Form to create a new group -->
                <form id="create-group-form">
                    <input type="text" id="group-name" class="custom-input" placeholder="Enter Group name" required />              
                    <ion-button shape="round" size="small" fill="outline" type="submit" id="create-group">Create Group</ion-button>
                </form>
                    
                <!-- List of Existing groups -->
                <div id="groups-list">
                    <!-- TODO: Groups will be populated here -->
                </div>
            </section>

            <section id="account-managemnt">
                <h3>Account Management</h3>

                <!-- Logout Button -->
                <ion-button shape="round" size="small" color="primary" fill="outline" id="logout-button">Logout</ion-button>

                <h5>Danger Zone<h5>
                <ion-button shape="round" size="small" color="danger" fill="outline" id="delete-account">Delete Account</ion-button>
            </section>
        `;
    }

    async logout() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await Api.logout();
                if (response.ok) {
                    console.log('Logged out succcessfully');
                } else {
                    console.error('Logout failed: ', response);
                }
            } catch (error) {
                console.error('Error during logout: ', error);
            }
        }

        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    async deleteAccount() {
        if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await Api.deleteUserAccount();
                if (response.ok) {
                    console.log('Account deleted successfully');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    console.error('Account deletion failed: ', response);
                }
            } catch (error) {
                console.error('Error during account deletion: ', error);
            }
        }
    }
    
    async attachEventListeners() {
        document.getElementById('logout-button').addEventListener('click', e => {
            e.preventDefault();
            this.logout();
        });

        document.getElementById('delete-account').addEventListener('click', e => {
            e.preventDefault();
            this.deleteAccount();
        });
    }
}