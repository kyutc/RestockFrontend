export default class GroupOptionsMenu extends HTMLElement {

    connectedCallback() {
        this.side="right";
        this.alignment = "start";

        this.innerHTML = `
            <ion-content>
                <ion-list>
                    <ion-item button="true" detail="true" detail-icon="person-add-outline" id="create-invite-button">Invite</ion-item>
                    <ion-item button="true" detail="true" detail-icon="create-outline" id="rename-group-button">Rename</ion-item>
                    <ion-item button="true" color="danger" detail="true" detail-icon="exit-outline" id="leave-group-button">Leave</ion-item>
                </ion-list>
            </ion-content>
        `;
    }

}

customElements.define('group-options-menu', GroupOptionsMenu);