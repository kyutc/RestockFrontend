/**
 * Each <ion-item> found in the <ion-list id="shopping-list-content"> element (of inventory_content_frame.js) is generated
 * using this component.
 * @param {Item} item
 * @return
 */
export default function shoppingListItemComponent(item) {
    return `
        <ion-item class=""${item.shopping_list_quantity == 0 && false ? 'hidden' : ''} button="true" id="sl-${item.id}">
            <ion-button class="add-one-from-shopping-list-to-pantry"><ion-icon name="caret-back"></ion-icon></ion-button>
            <ion-button class="add-all-from-shopping-list-to-pantry" style="margin-right: 1em"><ion-icon name="play-back"></ion-icon></ion-button>
            <ion-label>${item.name}</ion-label>
            <ion-chip class="ion-float-right">${item.shopping_list_quantity}</ion-chip>
            <ion-button class="shopping-list-options"><ion-icon name="ellipsis-vertical-outline"></ion-icon></ion-button>
        </ion-item>
    `;
}