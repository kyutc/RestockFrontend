import AbstractView from "./AbstractView.js";
import Api from "../api.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Manage Groups");
        this.api = new Api();
    }

    async getHtml() {
        return `
            <h1>Manage Groups</h1>

            <ion-button shape="round" size="small" fill="outline" type="submit" id="create-group">Create Group</ion-button>
            
            <section id="group-creation">
                <!-- Form to create a new group -->
                <div id="create-group-form-container" style="display: none;">
                    <input type="text" id="group-name" class="custom-input" placeholder="Enter Group name" required />
                    <br>              
                    <ion-button shape="round" size="small" fill="outline" type="submit" id="submit-group">Submit</ion-button>
                </div>

            </section>
            
            <section id="group-management">
                <!-- List of Existing groups -->
                <div id="groups-list">
                    <!-- TODO: Groups will be populated here -->
                </div>
            </section>

        `;
    }

    /** async createGroup() {
        const name = document.getElementById('group-name').value;
        try {
            const response = await Api.createGroup(name);
            if (response.ok) {
                console.log('Group created successfully');
            } else {
                console.error('Unable to create group: ', response);
            }
        } catch (error) {
            console.error('Error during logout: ', error);
        }
    }
     */

    async attachEventListeners() {
        document.getElementById('create-group').addEventListener('click', () => {
            const formContainer = document.getElementById('create-group-form-container');
            formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        });

        // Handle form submission
        document.getElementById('submit-group').addEventListener('click', async (e) => {
            e.preventDefault();
            await this.createGroup();
        });
    }
}