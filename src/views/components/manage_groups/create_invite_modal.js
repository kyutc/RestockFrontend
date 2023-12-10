/**
 * @param {Invite} invite
 * @return {string}
 */
export default function createInviteCodeModal(invite) {
    return `
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button id="close-invite-modal-button"><ion-icon name="close-outline"></ion-icon></ion-button>
                </ion-buttons>
                <ion-title class="ion-text-center">Group Invite Code</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <div style="display: flex; justify-content: center;">
                <div style="justify-content: center; padding-top: 4em; width: 80%;">
                    <ion-list lines="none">
                        <ion-item>
                            <ion-input class="ion-text-center" fill="solid" disabled="true" value="${invite.code}" id="new-invite-code-input"></ion-input>
                        </ion-item>
                    </ion-list>
                    <ion-button expand="block" fill="solid" id="copy-invite-code-to-clipboard-button">Copy to clipboard</ion-button>
                </div>
            </div>
        </ion-content>
    `;
}