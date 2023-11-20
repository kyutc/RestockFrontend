import AbstractView from "./AbstractView.js";
import Api from "../api.js";
import Group from "..//models/group.js";
import GroupMember from "..//models/group_member.js";
import restockdb from "../restockdb.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Manage Groups");
        this.api = new Api();
        this.selectedGroupId = null; // Track the currently selected group
    }

    async getHtml() {
        const groups = await this.fetchGroups().then(response=> response.json());
        const groupsHtml = this.renderGroups(groups);

        return `
        <h1>Manage Groups</h1>

        <ion-button shape="round" size="small" fill="outline" type="submit" id="create-group">Create Group</ion-button>
        
        <section id="group-creation">
            <!-- Form to create a new group -->
            <div id="create-group-form-container" style="display: none;">
                <input type="text" id="group-name" class="custom-input" placeholder="Enter Group Name" required />
                <br>              
                <ion-button shape="round" size="small" fill="outline" type="submit" id="submit-group">Submit</ion-button>
            </div>
        </section>
        
        <section id="group-management">
            <!-- List of Existing groups -->
            <div id="groups-list">
                ${groupsHtml}
            </div>
        </section>
    `;
    }

    async fetchGroups() {
        try {
            const response = await Api.getGroups();
            return response;
        } catch (error) {
            console.error('Unable to display groups: ', error);
            return [];
        }
    }

    renderGroups(groups) {
        return groups.map(group => `
            <div class="group-container">
                <div class="group-header">
                    <span class="group-name" data-group-id="${group.id}">${group.name}</span>
                    <ion-icon name="arrow-forward" class="group-arrow" data-group-id="${group.id}"></ion-icon>
                </div>
            </div>
        `).join('');
    }

    async createGroup() {
        const groupNameInput = document.getElementById('group-name');
        const groupName = groupNameInput.value;

        try {
            const response = await Api.createGroup(groupName);
            const responseData = await response.json();

            if (responseData.result === 'success') {
                // Instantiate a Group object
                const group = new Group(responseData.group)
                // Instantiate a GroupMember object
                const group_member = new GroupMember(responseData.group_member)
                // Save the group and group member information to the DB
                await restockdb.putGroup(group);
                await restockdb.putGroupMember(group_member);
            }

            // Set the currently selected group to the new group.
            this.selectedGroupId = group.id;

            alert("Group created successfully");
            return response;
        } catch (error) {
            console.error('Unable to create group: ', error);
        }
    }

    async getGroupDetails(groupId) {
        try {
            const response = await Api.getGroupDetails(groupId);
            return response;
        } catch (error) {
            console.error('Unable to access group details: ', error);
        }
    }

    renderGroupDetails(details) {
        // Implement rendering logic for group details here
        return `<p>${details.description}</p>`;
    }

    async attachEventListeners() {
        document.getElementById('create-group').addEventListener('click', () => {
            const formContainer = document.getElementById('create-group-form-container');
            formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        });

        // Handle form submission
        document.getElementById('submit-group').addEventListener('click', async (e) => {
            e.preventDefault();
            const response = await this.createGroup();
            return response;
        });
        // Handle click on arrow to show/hide details
        const groupArrows = document.querySelectorAll('.group-arrow');
        groupArrows.forEach(arrow => {
            arrow.addEventListener('click', async (event) => {
                const groupId = event.target.dataset.groupId;
                const groupDetailsContainer = document.getElementById(`group-details-${groupId}`);
                groupDetailsContainer.style.display = groupDetailsContainer.style.display === 'none' ? 'block' : 'none';

                if (groupDetailsContainer.style.display === 'block') {
                    // Fetch and display group details when expanding
                    const detailsResponse = await this.getGroupDetails(groupId);
                    const detailsJson = await detailsResponse.json();
                    // Render and append group details to the container
                    groupDetailsContainer.innerHTML = this.renderGroupDetails(detailsJson);
                }
            });
        });
    }
}