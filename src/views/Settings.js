import Restock from "../restock.js";
import {navigateTo} from "../index.js";
import {raiseToast} from "../utility.js";

export default class SettingsPage extends HTMLElement {

    connectedCallback() {
        console.log("DEBUG: Loading Settings")
        this.render();
        this.attachEventListeners();
    }

    async Toast(message, color = 'success') {
        const toast = document.createElement('ion-toast');
        toast.message = message;
        toast.duration = 2000;
        toast.color = color;
        document.body.appendChild(toast);
        return toast.present();
    }
    async errorToast(message) {
        return this.Toast(message, 'danger');
    }

    render() {
        this.innerHTML = `
            <ion-content>
                <ion-grid>
                    <ion-row>
                        <ion-header>
                            <ion-toolbar>
                                <ion-title>Settings</ion-title>
                                <ion-subtitle>Manage your privacy and configuration.</ion-subtitle>
                            </ion-toolbar>
                        </ion-header>
                    </ion-row>
                </ion-grid>
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
            await this.errorToast("Unable to contact server. Please try again later.");
            return;
        }
        navigateTo("/");
        await this.Toast('Logged out successfully');
        // const router = document.querySelector('ion-router');
        // if (router) {
        //     router.push("/");
        // }
        // window.location.replace("/login");
    }

    async deleteAccount(id) {
        const user = Restock.getCurrentUser();
        const account_was_deleted = await Restock.deleteUser(id);
        if (!account_was_deleted) {
            await raiseToast('Something went wrong. Try again later.', 'danger');
            return;
        }
        await raiseToast('Account was successfully deleted.')
        navigateTo('/login');
    }

    async renameUser(userId, newName) {
        let current_user = Restock.getCurrentUser();
        current_user.name = newName;
        const user_was_updated = Restock.updateUser(current_user);
        if (!user_was_updated) {
            raiseToast('Something went wrong. Try again later.', 'danger');
            return
        }
        raiseToast('Username successfully changed to ' + current_user.name);
    }

    async attachEventListeners() {
        document.getElementById('logout-button').addEventListener('click', e => {
            e.preventDefault();
            this.logout();
        });

        document.getElementById('delete-account').addEventListener('click', e => {
            e.preventDefault();
            const current_user = Restock.getCurrentUser();
            if (!current_user) return;

            const alert = document.createElement('ion-alert');
            alert.header = "Warning";
            alert.message = `You are about to delete your account. This action cannot be undone.`;
            alert.buttons = [
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
                {
                    text: 'Delete Account',
                    role: 'delete',
                    handler: () => {
                        this.deleteAccount(current_user.id)
                    }
                }
            ];
            document.body.appendChild(alert);
            alert.present();
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