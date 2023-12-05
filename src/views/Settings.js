import Restock from "../restock.js";
import {navigateTo} from "../index.js";

export default class SettingsPage extends HTMLElement {

    connectedCallback() {
        console.log("DEBUG: Loading Settings")
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.innerHTML = `
            <ion-header>
                <ion-toolbar>
                    <ion-title>Settings</ion-title>
                    <ion-subtitle>Manage your privacy and configuration.</ion-subtitle>
                </ion-toolbar>
            </ion-header>
            <ion-content>
                <ion-list>
                    <ion-item>
                        <ion-button shape="round" size="small" fill="outline" id="manage-group" href="/manage_groups">Manage Groups</ion-button>
                    </ion-item>
                    <ion-item>
                        <ion-label>Account Management</ion-label>
                        <!-- Logout Button -->
                        <ion-button shape="round" size="small" color="primary" fill="outline" id="logout-button">Logout</ion-button>
        
                        <!-- Change Username Button -->
                        <ion-button shape="round" size="small" color="primary" fill="outline" id="rename-button">Change Username</ion-button>
                    </ion-item>
                    <ion-item>
                        <ion-label>Danger Zone</ion-label>
                        <ion-button shape="round" size="small" color="danger" fill="outline" id="delete-account">Delete Account</ion-button>
                    </ion-item>
                </ion-list>
            </ion-content>`;
    }

    async logout() {
        const successfully_logged_out = await Restock.logout();
        if (!successfully_logged_out) {
            // Something went wrong
            alert("Unable to contact server. Please try again later.");
            return;
        }
        navigateTo("/");
        // const router = document.querySelector('ion-router');
        // if (router) {
        //     router.push("/");
        // }
        // window.location.replace("/login");
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
            const response = await Api.updateUserAccount(userId, { new_username: newName, new_password: ''});
            const responseData = await response.json();
            console.log(responseData);

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
            const userId = localStorage.getItem('userId');
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

customElements.define('settings-page', SettingsPage)