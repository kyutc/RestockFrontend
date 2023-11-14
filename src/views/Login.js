import AbstractView from "./AbstractView.js";
import Api from '../api.js';

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Login");
        this.api = new Api();
    }

    async getHtml() {
        return `
            <h1>Login</h1>
            <p>Enter your username and password:</p>
            <form id="loginForm">
                <label for="login-username">Username:</label><br>
                <input type="text" id="login-username" name="username"><br><br>
                    <label for="login-password">Password:</label><br>
                    <input type="password" id="login-password" name="password"><br><br>
                        <input type="button" id="login-button" value="Submit">
            </form>
            
            <br><hr>
            
            <p>Alternatively, enter a new username and password to register:</p>
            <form id="registrationForm">
                <label for="register-username">Username:</label><br>
                <input type="text" id="register-username" name="username"><br><br>
                    <label for="register-password">Password:</label><br>
                    <input type="password" id="register-password" name="password"><br><br>
                        <input type="button" id="register-button" value="Register">
            </form>
        `;
    }

    async submitLoginForm() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await this.api.login(username, password);
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                window.location.href = '/pantry';
            } else {
                alert('Login failed');

            } 
        } catch (error) {
            console.error('Login error: ' , error);
        }
    }

    async submitRegistrationForm() {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await this.api.register(username, password);
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
        document.getElementById('login-button').addEventListener('click', () => this.submitLoginForm());
        document.getElementById('register-button').addEventListener('click', () => this.submitRegistrationForm());
    }
}


 