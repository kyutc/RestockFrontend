/**
 * @return {string}
 */
export default class AddGroupModal extends HTMLElement {
    connectedCallback() {
        this.render();
    }
    render() {
        this.innerHTML = `
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button id="close-add-group-modal"><ion-icon name="close-outline"></ion-icon></ion-button>
                </ion-buttons>
                <ion-title class="ion-text-center">Add group</ion-title>
            </ion-toolbar>
        </ion-header>
        
        <ion-content class="ion-padding">
        
             <ion-segment value="create" id="add-group-segment">
                <ion-segment-button value="create">
                    <ion-label>Create<ion-icon name="create-outline"></ion-icon></ion-label>
                </ion-segment-button>
                <ion-segment-button value="join">
                    <ion-label>Join<ion-icon name="people-outline"></ion-icon></ion-label>
                </ion-segment-button>
             </ion-segment>
             
             <div class="collapse-hidden" style="display: flex; justify-content: center;">
             
                <div style="justify-content: center; padding-top: 4em; width: 80%;" id="create-group-row">
                    <ion-list lines="none">
                        <ion-item>
                            <ion-input fill="solid" placeholder="Name your new group" clear-input="true" id="group-name-input"></ion-input>
                        </ion-item>
                    </ion-list>
                    <ion-button expand="block" disabled="true" fill="outline" id="create-group-button">Create group</ion-button>
                </div>
                
                <div class="hidden" style="justify-content: center; padding-top: 4em; width: 60%;" id="join-group-row">
                    <ion-list lines="none">
                        <ion-item>
                            <ion-input fill="solid" placeholder="Enter invite code" clear-input="true" id="invite-code-input"></ion-input>
                        </ion-item>
                    </ion-list>
                    <ion-button expand="block" disabled="true" fill="outline" id="join-group-button">Join group</ion-button>
                </div>
                
             </div>
             
        </ion-content>
    `;
    }
}

customElements.define('add-group-modal', AddGroupModal);
// todo make html class