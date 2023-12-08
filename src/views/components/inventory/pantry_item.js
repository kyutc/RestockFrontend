import Item from "../../../models/item.js";

/**
 * Each <ion-item> found in the <ion-list id="pantry-content"> element (of inventory_content_frame.js) is generated
 * using this component.
 * @param {Item} item
 * @return
 */
export default function pantryItemComponent(item) {
    const attribute = item.pantry_quantity == 0 ? `class="out-of-stock"` : '';
    const chip_color = item.isInPantryAtMinimumThreshold() ? "warning":
        item.isInPantryBelowMinimumThreshold() ? "danger":
        "default";
    return `
    <ion-item ${attribute} id="p-${item.id}">
        <ion-button class="add-pantry"><ion-icon name="add-outline"></ion-icon></ion-button>
        <ion-label>${item.name}</ion-label>
        <ion-chip class="ion-float-right" color="${chip_color}">${item.pantry_quantity}</ion-chip>
        <ion-button class="subtract-pantry"><ion-icon name="remove-outline"></ion-icon></ion-button>
        <ion-button class="pantry-options"><ion-icon name="ellipsis-vertical-outline"></ion-icon></ion-button>
    </ion-item>`;
}