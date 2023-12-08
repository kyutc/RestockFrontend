export default class ItemOptionsMenu extends HTMLElement {

    connectedCallback() {
        this.side="left";
        this.alignment = "end";

        this.innerHTML = `
            <ion-content>
                <ion-list>
                    <ion-item button="true" detail="true" detail-icon="create-outline" id="edit-item-button" >Edit</ion-item>
                    <ion-item color="danger" button="true" detail="true" detail-icon="trash-outline" id="delete-item-button" >Delete</ion-item>
                </ion-list>
            </ion-content>
        `;
    }

}

customElements.define('item-options-menu', ItemOptionsMenu);