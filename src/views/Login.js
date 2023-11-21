import AbstractView from "./AbstractView.js";
import Api from '../api.js';
import {navigateTo} from "../index.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Login");
        this.api = new Api();
    }

    async getHtml() {
        return `
            <h1>Login</h1>
            <p>Enter your email and password:</p>
            <form id="loginForm">
                <label for="login-email">Email:</label><br>
                <input type="email" id="login-email" name="email"><br><br>
                    <label for="login-password">Password:</label><br>
                    <input type="password" id="login-password" name="password"><br><br>
                    <ion-button shape="round" size="small" color="primary" fill="outline" id="login-button">Login</ion-button>
            </form>
            
            <br><hr>
            
            <p>Alternatively, you can create an account:</p>
            <form id="registrationForm">
                <label for="email">Email:</label><br>
                <input type="email" id="register-email" name="email" required><br><br>
                <label for="register-username">Username:</label><br>
                <input type="text" id="register-username" name="username"><br><br>
                    <label for="register-password">Password:</label><br>
                    <input type="password" id="register-password" name="password"><br><br>
                    <ion-button shape="round" size="small" color="primary" fill="outline" id="register-button">Register</ion-button>
            </form>
        `;
    }

    async submitLoginForm() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await Api.login(email, password);
            if (response.ok) {
                const data = await response.json();
                const userId = data.id;
                localStorage.setItem('userId', userId);

                const token = data.session;
                localStorage.setItem('token', token);
                navigateTo('/pantry');
            } else {
                alert('Login failed');

            } 
        } catch (error) {
            console.error('Login error: ' , error);
        }
    }

    async submitRegistrationForm() {
        const email = document.getElementById('register-email').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await Api.register(email, username, password);
            if (response.ok) {
                alert('Registration successful. Please log in.');
            } else {
                alert('Registration failed');
            }
        } catch (error) {
            console.error('Registration error: ', error);
        }
    }

    attachEventListeners() {
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


 