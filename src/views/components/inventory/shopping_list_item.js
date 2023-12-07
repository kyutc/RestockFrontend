/**
 * Each <ion-item> found in the <ion-list id="shopping-list-content"> element (of inventory_content_frame.js) is generated
 * using this component.
 * @param {Item} item
 * @return
 */
export default function shoppingListItemComponent(item) {
    return `
        <ion-item id="${item.id}" ${item.shopping_list_quantity == 0 ? 'class="hidden"' : ''}>
            <ion-button class="add-shopping_list"><ion-icon name="add-outline"></ion-icon></ion-button>
            <ion-label>${item.name}</ion-label>
            <ion-chip class="ion-float-right" id="sl-${item.id}">${item.shopping_list_quantity}</ion-chip>
            <ion-button class="subtract-shopping_list"><ion-icon name="remove-outline"></ion-icon></ion-button>
            <ion-button class="options"><ion-icon name="ellipsis-vertical-outline"></ion-icon></ion-button>
        </ion-item>
    `;
}