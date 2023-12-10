/**
 * @param {Group|null} group
 * @return {string}
 */
export default function createRenameGroupModal(group = null) {
    return `
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button id="modal-close"><ion-icon name="close-outline"></ion-icon></ion-button>
                </ion-buttons>
                <ion-title class="ion-text-center">${group ? "Rename group" : "Create new group"}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <div class="collapse-hidden" style="display: flex; justify-content: center;">
                <div style="justify-content: center; padding-top: 4em; width: 80%;" id="create-group-row">
                    <ion-list lines="none">
                        <ion-item>
                            <ion-input label="Group name" label-placement="floating" type="text" id="group-name-input" value="${group?.name ?? ''}">
                        </ion-item>
                    </ion-list>
                    <ion-button expand="block" disabled="true" fill="outline" id="rename-group-button">${group ? 'Rename group' : 'Create group'}</ion-button>
                </div>
            </div>
        </ion-content>
    `;
}