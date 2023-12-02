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

    isGroupSelected() {
        return this.selectedGroupId !== null;
    }

    // TODO Implement means of selecting group id
    setSelectedGroupId(groupId){
        this.selectedGroupId = groupId;
        localStorage.setItem('selectedGroupId', groupId);
    }

    async getHtml() {
        const groups = await this.fetchGroups();
        const groupsHtml = this.renderGroups(groups);

        return `
        <h1>Manage Groups</h1>

        <ion-button size="small" type="submit" id="create-group">Create Group</ion-button>
        
        <!-- Form to create a new group -->          
        <ion-grid id="group-creation" style="display: none">
            <ion-row>
                <ion-col><ion-input label="Enter Group Name" label-placement="floating" fill="solid" id="group-name" required></ion-input></ion-col>
                <ion-col><ion-button shape="square" size="medium" type="submit" clear id="submit-group">Submit</ion-button></ion-col>
            </ion-row>
        </ion-grid>
        
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
            const groups = await Api.getGroups();
            return groups;
        } catch (error) {
            console.error('Unable to display groups: ', error);
            return [];
        }
    }

    renderGroups(groups) {
        return '<ion-accordion-group>' + groups.map((group) => `
            <ion-accordion value="${group.id}" data-group-id="${group.id}" id="group${group.id}">
                <ion-item slot="header" color="light">
                    <ion-label>${group.name}</ion-label>
                    <ion-button size="small" class="rename-group" data-group-id="${group.id}">Rename</ion-button>
                    <ion-button size="small" color="danger" class="delete-group" data-group-id="${group.id}">Delete</ion-button>
                </ion-item>
                <div class="ion-padding" slot="content" id="content-${group.id}">${group.id} Content</div>
            </ion-accordion>
    `).join('') + '</ion-accordion-group>';
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
                const groupId = group.id;
                // Set the currently selected group to the new group.
                this.setSelectedGroupId(groupId);
                // Instantiate a GroupMember object
                const group_member = new GroupMember(responseData.group_member)
                // Save the group and group member information to the DB
                await restockdb.putGroup(group);
                await restockdb.putGroupMember(group_member);
            }



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

    // TODO: Have method display user's name rather than their id.
    // TODO: Add delete button to remove users from groups.
    renderGroupDetails(details) {
        // Implement rendering logic for group details here
        try {
            return `<ion-list>` + details.group_members.map((member) => `<ion-item>
                <ion-label>
                    id: <ion-badge color="warning">${member.user_id}</ion-badge>
                    <span style="font-variant: small-caps; font-weight: bold">(${member.role.charAt(0).toUpperCase()}${member.role.slice(1)})</span>
                </ion-label>
           </ion-item>`).join('\n') + `</ion-list>`;
        } catch(ex) {
            console.log(ex);
            return '';
        }
    }

    async renameGroup(groupId, newName) {
        try {
            // Update the group name through the API
            const response = await Api.updateGroup(groupId, newName);
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message);
            }
            if (responseData.result === 'success') {
                // Update the group object in the local storage
                const group = new Group(responseData.group);
                await restockdb.putGroup(group);
            }

            alert("Group renamed successfully");
            return response;
        } catch (error) {
            console.error('Unable to rename group: ', error);
            alert(`Unable to rename group: ${error.message}`);
        }
    }

    async deleteGroup(groupId) {
        try {
            // Delete the group through the API
            const response = await Api.deleteGroup(groupId);
            const responseData = await response.json();

            if (responseData.result === 'success') {
                // Remove the group and all members from the DB
                await restockdb.deleteGroup(groupId);
            }

            alert("Group deleted successfully");
            return response;
        } catch (error) {
            console.error('Unable to delete group: ', error);
        }
    }

    async refreshView() {
        // Fetch and render the updated list of groups
        const groups = await this.fetchGroups();
        const groupsHtml = this.renderGroups(groups);

        // Update the groups list container
        const groupsListContainer = document.getElementById('groups-list');
        groupsListContainer.innerHTML = groupsHtml;

        // Reattach event listeners for the updated elements
        await this.attachEventListeners();
    }

    async attachEventListeners() {
        document.getElementById('create-group').addEventListener('click', () => {
            const formContainer = document.getElementById('group-creation');
            document.getElementById('create-group').style.display = 'none';
            formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        });

        // Handle form submission
        document.getElementById('submit-group').addEventListener('click', async (e) => {
            e.preventDefault();
            const response = await this.createGroup();
            await this.refreshView();
            document.getElementById('create-group').style.display = 'inline-block';
            document.getElementById('group-creation').style.display = 'none';
            return response;
        });

        // Handle click on "Rename" Button
        const renameButtons = document.querySelectorAll('.rename-group');
        renameButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const groupId = event.target.dataset.groupId;
                const newName = prompt("Enter the new name for the group:");
                if (newName !== null) {
                    await this.renameGroup(groupId, newName);
                    // Refresh the view after renaming
                    await this.refreshView();
                }
            });
        });

        // Handle click on "Delete" button
        const deleteButtons = document.querySelectorAll('.delete-group');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const groupId = event.target.dataset.groupId;
                const confirmDelete = confirm("Are you sure you want to delete this group?");
                if (confirmDelete) {
                    await this.deleteGroup(groupId);
                    // Refresh the view after deleting
                    await this.refreshView();
                }
            });
        });

        // Handle click on arrow to show/hide details
        const groupList = document.querySelectorAll('ion-accordion');
        groupList.forEach(groupTab => {
            groupTab.addEventListener('click', async (event) => {
                //console.log(arrow);
                const groupId = groupTab.value;
                //console.log('groupId: ' + groupId);
                const groupDetailsContainer = document.getElementById(`content-${groupId}`);
                //console.log(groupDetailsContainer);

                // Fetch and display group details when expanding
                const detailsResponse = await this.getGroupDetails(groupId);
                const detailsJson = await detailsResponse.json();
                console.log(detailsJson);
                // Render and append group details to the container
                groupDetailsContainer.innerHTML = this.renderGroupDetails(detailsJson);
            });
        });


    }
}