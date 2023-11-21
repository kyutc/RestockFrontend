import AbstractView from "./AbstractView.js";
import Api from "../api.js";
import {navigateTo} from "../index.js";

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

            <!-- Manage Groups Button -->    
            <ion-button shape="round" size="small" fill="outline" type="submit" id="manage-group">Manage Groups</ion-button>

            <section id="account-management">
                <h3>Account Management</h3>

                <!-- Logout Button -->
                <ion-button shape="round" size="small" color="primary" fill="outline" id="logout-button">Logout</ion-button>
                
                <!-- Change Username Button -->
                <ion-button shape="round" size="small" color="primary" fill="outline" id="rename-button">Change Username</ion-button>

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
                    console.log('Logged out successfully');
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
        const userId = localStorage.getItem('userId');
        if (token && userId) {
            try {
                const response = await Api.deleteUserAccount(userId);
                if (response.ok) {
                    console.log('Account deleted successfully');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    window.location.href = '/login';
                } else {
                    console.error('Account deletion failed: ', response);
                }
            } catch (error) {
                console.error('Error during account deletion: ', error);
            }
        }
    }

    async renameUser(userId, newName) {
        try {
            // Update the group name through the API
            const response = await Api.updateUserAccount(userId, newName);
            const responseData = await response.json();

            alert("User renamed successfully");
            return responseData;
        } catch (error) {
            console.error('Unable to rename user: ', error);
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

        document.getElementById('rename-button').addEventListener('click', e => {
            e.preventDefault();
            const userId = event.target.dataset.userId;
            const newName = prompt("Enter the new username:");
            if (newName !== null) {
                this.renameUser(userId, newName);
            }
        });

        document.getElementById('manage-group').addEventListener('click', e => {
            e.preventDefault();
            // Navigate to the "manage_groups" route
            navigateTo('/manage_groups');
        });
    }
}