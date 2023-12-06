import Group from "../models/group.js";
import Item from "../models/item.js";
import Restock from "../restock.js";
import {navigateTo} from "../index.js";
import {loadingController} from "@ionic/core";

export default class Inventory extends HTMLElement {
    /** @type {Group} */
    #current_group;
    /** @type {Array<Item>} */
    #items;

    connectedCallback() {
        console.log("DEBUG: pantry.js -- Initializing pantry page")
        loadingController.create({
            message: 'Building items...',
            spinner: 'bubbles'
        }).then( (loading) => {
            loading.present();
            this.#fetchDetails();
            this.render();
            this.#attachEventListeners();
            loading.dismiss();
        })
    }

    render() {
        // get current group name
        // get items
        /**
         * Todo: Determine if
         */
        if (!this.#current_group) {
            // No group selected, so nothing to render. User needs to create a group first.
            // Todo redirect or pop up create group form
            navigateTo("/manage_groups");
            return;
        }
        const group_name  = this.#current_group['name'];
        this.innerHTML = `
                <ion-content>
                    <ion-grid class="item-ui-container">
                        <ion-row class="ion-hide-md-down">
                            <ion-header>
                                <ion-toolbar>
                                    <ion-button><ion-icon name="chevron-back-outline" class="change-group-back"></ion-icon></ion-button>
                                    <ion-button class="group-selector-button"></ion-button>
                                    <ion-button><ion-icon name="chevron-forward-outline" class="change-group-forward"></ion-icon></ion-button>
                                </ion-toolbar>
                                <ion-toolbar>
                                    <ion-searchbar show-clear-button="always"></ion-searchbar>
                                </ion-toolbar>
                            </ion-header>
                        </ion-row>
                        <ion-row>
                            <ion-col size="6">
                                <ion-header>
                                    <ion-toolbar>
                                        <ion-title>Pantry</ion-title>
                                    </ion-toolbar>
                                    <ion-toolbar class="ion-hide-md-up">
                                        <ion-button><ion-icon name="chevron-back-outline" class="change-group-back"></ion-icon></ion-button>
                                        <ion-select class="group-selector-button"></ion-select>
                                        <ion-button><ion-icon name="chevron-forward-outline" class="change-group-forward"></ion-icon></ion-button>
                                    </ion-toolbar>
                                    <ion-toolbar class="ion-hide-md-up">
                                        <ion-searchbar show-clear-button="always"></ion-searchbar>
                                    </ion-toolbar>
                                </ion-header>
                                <ion-list id="pantry-content"></ion-list>
                            </ion-col>
                            <ion-col size="6">
                                <ion-header>
                                    <ion-toolbar>
                                        <ion-title>Shopping List</ion-title>
                                    </ion-toolbar>
                                    <ion-toolbar class="ion-hide-md-up">
                                        <ion-button><ion-icon name="chevron-back-outline" id="change-group-back"></ion-icon></ion-button>
                                        <ion-button class="group-selector-button"></ion-button>
                                        <ion-button><ion-icon name="chevron-forward-outline" id="change-group-forward"></ion-icon></ion-button>
                                    </ion-toolbar>
                                    <ion-toolbar class="ion-hide-md-up">
                                        <ion-searchbar show-clear-button="always"></ion-searchbar>
                                    </ion-toolbar>
                                </ion-header>
                                <ion-list id="shopping-list-content"></ion-list>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                    <ion-fab slot="fixed" vertical="bottom" horizontal="end">
                        <ion-fab-button id="create-item-button"><ion-icon name="add"></ion-icon></ion-fab-button>
                    </ion-fab>
                    <ion-row class="history-box"> History will go here</ion-row>
                </ion-content>
            `;
        this.renderContent();
    }

    renderContent() {
        console.log('ITEMS', this.#items);
        this.renderGroupSelector();
        this.renderPantryContent();
        this.renderShoppingListContent();
    }

    renderGroupSelector() {
        const group_selectors = document.querySelectorAll('.group-selector-button');
        const selector_template = `<ion-select aria-label="Selected group" value="${this.#current_group.id}" class="group-selector">`
            + Restock.getGroups().map(g => `<ion-select-option value="${g.id}">${g.name}</ion-select-option>`).join('')
            + `</ion-select>`
        ;
        group_selectors.forEach(gs => gs.innerHTML = selector_template)

    }

    /**
     * Render all items in the pantry context
     */
    renderPantryContent() {
        const pantry_content = document.querySelector('#pantry-content');
        const items = this.#items.reduce( (arr, i) => {
            let attribute = '';
            if (i.pantry_quantity == 0) attribute = `class="out-of-stock"`;
            arr.push(`
                <ion-item ${attribute} id="${i.id}">
                    <ion-button class="add-pantry"><ion-icon name="add-outline"></ion-icon></ion-button>
                    <ion-label>${i.name}<ion-chip class="ion-float-right" id="p-${i.id}">${i.pantry_quantity}</ion-label>
                    <ion-button class="subtract-pantry"><ion-icon name="remove-outline"></ion-icon></ion-button>
                    <ion-button class="options"><ion-icon name="ellipsis-vertical-outline"></ion-icon></ion-button>
                </ion-item>
            `);
            return arr;
        }, []).join('');
        pantry_content.innerHTML = items;
    }

    /**
     * Render all items in the shopping list context
     */
    renderShoppingListContent() {
        const shopping_list_content = document.querySelector('#shopping-list-content');
        if (!shopping_list_content) return;
        const items = this.#items.reduce( (arr, i) => {
            if (i.shopping_list_quantity == 0) return arr;
            arr.push(`
                <ion-item id="${i.id}">
                    <ion-button class="add-shopping_list"><ion-icon name="add-outline"></ion-icon></ion-button>
                    <ion-label>${i.name}<ion-chip class="ion-float-right" id="sl-${i.id}">${i.shopping_list_quantity}</ion-chip></ion-label>
                    <ion-button class="subtract-shopping_list"><ion-icon name="remove-outline"></ion-icon></ion-button>
                    <ion-button class="options"><ion-icon name="ellipsis-vertical-outline"></ion-icon></ion-button>
                </ion-item>
            `);
            return arr;
        }, []).join('');
        shopping_list_content.innerHTML = items;
    }

    #attachEventListeners() {
        this.#attachGroupSelectorListeners();
        // attachSearchFilterListeners();
        this.#attachItemListeners();
    }

    /**
     * When the selector is changed, update all selectors to display the right group, fetch details for the new group,
     * and then re-render the page content.
     */
    #attachGroupSelectorListeners() {
        const selects = document.querySelectorAll('.group-selector');
        selects.forEach( select => {
            select.addEventListener('ionChange', e => {
                const group_id = e.target.value; // New group id
                Restock.setCurrentGroup(group_id).then( (group_was_changed) => {
                    if (!group_was_changed) return; // The described group was not found for this user
                    document.querySelectorAll('.group-selector')
                        .forEach( gs => gs.value = e.target.value);
                    this.renderContent();
                    this.attachItemListeners();
                })
            })

        })
    }

    #attachSearchFilterListeners() {
        //todo
    }

    #attachItemListeners() {
        const add_pantry_buttons = document.querySelectorAll('.add-pantry');
        const subtract_pantry_buttons = document.querySelectorAll('.subtract-pantry');
        const add_shopping_list_buttons = document.querySelectorAll('.add-shopping_list');
        const subtract_shopping_list_buttons = document.querySelectorAll('.subtract-shopping_list');
        // Todo: shopping-list option add-all-to-pantry
        add_pantry_buttons.forEach( apb=> apb.addEventListener('click', this.#addOneToPantry));
        subtract_pantry_buttons.forEach( spb => spb.addEventListener('click', this.#subtractOneFromPantry));
        add_shopping_list_buttons.forEach( aslb => aslb.addEventListener('click', this.#addOneToShoppingList));
        subtract_shopping_list_buttons.forEach( sslb => sslb.addEventListener('click', this.#subtractOneFromShoppingList));
    }

    async #fetchDetails() {
        this.#current_group = Restock.getCurrentGroup();
        if (!this.#current_group) return false;
        this.#items = Restock.getItemsForGroupById(this.#current_group.id);

        if (this.#items.length == 0) { // Debug
            const fake_items = [
                {
                    id: 1,
                    group_id: 15,
                    name: 'ketchup',
                    description: 'tasty',
                    category: 'default#000000',
                    pantry_quantity: 3,
                    minimum_threshold: 2,
                    auto_add_to_shopping_list: true,
                    shopping_list_quantity: 0,
                    dont_add_to_pantry_on_purchase: false
                },
                {
                    id: 3,
                    group_id: 16,
                    name: 'mayonnaise',
                    description: 'A primely whipped concotion of oily vinegar eggs',
                    category: 'default#000000',
                    pantry_quantity: 1,
                    minimum_threshold: 2,
                    auto_add_to_shopping_list: true,
                    shopping_list_quantity: 1,
                    dont_add_to_pantry_on_purchase: false
                },
                {
                    id: 2,
                    group_id: 15,
                    name: 'wrench',
                    description: 'utility',
                    category: 'default#000000',
                    pantry_quantity: 16,
                    minimum_threshold: 1,
                    auto_add_to_shopping_list: true,
                    shopping_list_quantity: 4,
                    dont_add_to_pantry_on_purchase: true
                },
                {
                    id: 5,
                    group_id: 15,
                    name: 'screwdriver',
                    description: 'utility',
                    category: 'default#000000',
                    pantry_quantity: 0,
                    minimum_threshold: 5,
                    auto_add_to_shopping_list: true,
                    shopping_list_quantity: 5,
                    dont_add_to_pantry_on_purchase: true
                }
            ];
            this.#items = fake_items.map(i => new Item(i));
        }
        // this.#action_logs = Restock.getActionLogsForGroupById(this.#current_group.id);
    }

    #nextGroup() {
        this.#current_group = Restock.getNextGroup();
        this.render();
    }

    /**
     * Update display quantity for already rendered items
     * @param {Item} item
     */
    #updateItemQuantities(item) {
        const pantry_item = document.querySelector(`#p-${item.id}`);
        const shopping_list_item = document.querySelector(`#sl-${item.id}`);
        if (pantry_item) pantry_item.innerHTML = item.pantry_quantity;
        if (shopping_list_item) shopping_list_item.innerHTML = item.shopping_list_quantity;
    }

    /**
     * Helper method
     * @param {Event} e
     * @return {Item|null}
     */
    #getItemReferencedByEvent = (e) => {
        const item_id = e.currentTarget.parentNode.id; // Should be an <ion-item> element
        const item = this.#items.find(i => i.id == item_id);
        if (!item) {
            console.log("DEBUG: Inventory.js -- failed to get item by id")
            return null;
        }
        return item;
    }
    #addOneToPantry = (e) => {
        const item = this.#getItemReferencedByEvent(e);
        if (!item) return;
        if (item.addOneToPantry()) this.#updateItemQuantities(item);
    }
    #subtractOneFromPantry = (e) => {
        const item = this.#getItemReferencedByEvent(e);
        if (!item) return;
        if (item.subtractOneFromPantry()) this.#updateItemQuantities(item);
    }
    #addOneToShoppingList = (e) => {
        const item = this.#getItemReferencedByEvent(e);
        if (!item) return;
        if (item.addOneToShoppingList()) this.#updateItemQuantities(item);
    }
    #subtractOneFromShoppingList = (e) => {
        const item = this.#getItemReferencedByEvent(e);
        if (!item) return;
        if (item.subtractOneFromShoppingList()) this.#updateItemQuantities(item);
    }
}
customElements.define('inventory-page', Inventory);
