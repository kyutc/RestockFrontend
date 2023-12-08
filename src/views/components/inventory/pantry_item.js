import itemOptionsMenu from "./item_options_menu.js";

/**
 * Each <ion-item> found in the <ion-list id="pantry-content"> element (of inventory_content_frame.js) is generated
 * using this component.
 * @param {Item} item
 * @return
 */
export default function pantryItemComponent(item) {
    let attribute = '';
    if (item.pantry_quantity == 0) attribute = `class="out-of-stock"`;
    return `
    <ion-item ${attribute} id="${item.id}">
        <ion-button class="add-pantry"><ion-icon name="add-outline"></ion-icon></ion-button>
        <ion-label>${item.name}</ion-label>
        <ion-chip class="ion-float-right" id="p-${item.id}">${item.pantry_quantity}</ion-chip>
        <ion-button class="subtract-pantry"><ion-icon name="remove-outline"></ion-icon></ion-button>
        <ion-button class="pantry-options"><ion-icon name="ellipsis-vertical-outline"></ion-icon></ion-button>
    </ion-item>`;
}