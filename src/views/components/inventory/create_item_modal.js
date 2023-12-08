import Item from "../../../models/item.js";

/**
 * @param {Item|null} item
 * @return {string}
 */
export default function createItemModal(item = null) {
    return `
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button id="modal-close"><ion-icon name="close-outline"></ion-icon></ion-button>
                </ion-buttons>
                <ion-title class="ion-text-center">${item ? "Edit item" : "Create new item"}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-list>
                <ion-item>
                    <ion-input label="Product name" label-placement="floating" type="text" id="create-item-name" value="${item?.name ?? ''}">
                </ion-item>
                <ion-item>
                    <ion-textarea label="Product description" label-placement="floating" auto-grow="true" counter="true" maxlength="255" id="create-item-description" value="${item?.description ?? ''}"></ion-textarea>
                </ion-item>
                <!-- Todo: Category sorting/filtering feature needs to be implemented
                <ion-item>
                    <ion-input label="Category" label-placement="floating" type="text" id="create-item-category"></ion-input>
                </ion-item>
                -->
                <ion-item>
                    <ion-col><ion-input class="ion-text-end" label="Pantry quantity" label-placement="stacked" type="number" value="${item?.pantry_quantity ?? '0'}" id="create-item-pantry-quantity"></ion-input></ion-col>
                    <ion-col><ion-input class="ion-text-end" label="Minimum threshold" label-placement="stacked" type="number" value="${item?.minimum_threshold ?? '0'}" id="create-item-minimum-threshold"></ion-input></ion-col> 
                    <ion-col><ion-input class="ion-text-end" label="Shopping list quantity" label-placement="stacked" type="number" value="${item?.shopping_list_quantity ?? '0'}" id="create-item-shopping-list-quantity"></ion-input></ion-col>
                </ion-item>
                <ion-item>
                    <ion-checkbox label-placement="start" justify="end" fill="outline" id="create-item-auto-add-to-shopping-list" checked="${item?.auto_add_to_shopping_list ?? false}">Automatically add to shopping list</ion-checkbox>
                </ion-item>
                <ion-item>
                    <ion-checkbox label-placement="start" justify="end" fill="outline" id="create-item-dont-add-to-pantry-on-purchase" checked="${item?.dont_add_to_pantry_on_purchase ?? false}">Don't add to pantry on purchase</ion-checkbox>
                </ion-item>
                <ion-item>
                    <ion-grid><ion-row class="ion-justify-content-end"><ion-col size="2">
                        <ion-button fill="clear" item-end id="modal-confirm">Submit</ion-button>
                    </ion-col></ion-row></ion-grid>
                </ion-item>
            </ion-list>
        </ion-content>
    `;
}