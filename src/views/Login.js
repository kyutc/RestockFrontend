import Restock from "../restock.js";
import {navigateTo} from "../index.js";

export default class LoginPage extends HTMLElement {

    connectedCallback() {
        console.log("DEBUG: login.js -- Initializing login page")
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
            <ion-header>
                <ion-toolbar>
                    <ion-title>Login/Registration</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content>
                <ion-card>
                    <ion-row>
                        <ion-card-title>Login</ion-card-title>
                        <ion-card-content>
                            <ion-list>
                                <ion-item>
                                    <ion-input label="E-mail" label-placement="floating" type="email" id="login-email"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Password" label-placement="floating" type="password" id="login-password"></ion-input>
                                </ion-item>
                                <ion-item>
                                <ion-button shape="round" size="small" color="primary" fill="outline" id="login-button">Login</ion-button>
                                </ion-item>
                            </ion-list>
                        </ion-card-content>
                    </ion-row>
                </ion-card>
                <ion-card>
                    <ion-row>
                        <ion-card-title>Register</ion-card-title>
                        <ion-card-content>
                            <ion-list>
                                <ion-item>
                                    <ion-input label="E-mail" label-placement="floating" type="email" id="register-email"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Username" label-placement="floating" type="" id="register-username"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Password" label-placement="floating" type="password" id="register-password"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Confirm password" label-placement="floating" type="password" id="register-password-confirm"></ion-input>
                                </ion-item>
                                <ion-button shape="round" size="small" color="primary" fill="outline" id="register-button">Register</ion-button>
                            </ion-list>
                        </ion-card-content>
                    </ion-row>
                </ion-card>
            </ion-content>
        `;
    }

    async submitLoginForm() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const user_is_logged_in = await Restock.login(email, password);
        if (!user_is_logged_in) {
            await this.errorToast('Login failed');
            return;
        }
        await this.Toast('Login successful');
        navigateTo('/');
    }

    async submitRegistrationForm() {
        const email = document.getElementById('register-email').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;

        if (password !== confirmPassword) {
            await this.errorToast('Passwords do not match');
            return;
        }

        const account_registered = await Restock.register(email, username, password);
        if (account_registered) {
            await this.Toast('Registration successful. Please log in.');
            document.getElementById('register-email').value = '';
            document.getElementById('register-username').value = '';
            document.getElementById('register-password').value = '';
            document.getElementById('register-password-confirm').value = '';
        } else {
            await this.errorToast('Registration failed');
        }
    }

    attachEventListeners() {
        console.log("DEBUG: login.attachEventListeners")
        document.getElementById('login-button').addEventListener('click', (e) => {
            e.preventDefault()
            this.submitLoginForm();
        });
        document.getElementById('register-button').addEventListener('click', (e) => {
            e.preventDefault()
            this.submitRegistrationForm();
        });
    }
}

customElements.define('login-page', LoginPage);


 