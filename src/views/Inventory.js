import Group from "../models/group.js";
import Item from "../models/item.js";
import Restock from "../restock.js";
import {navigateTo} from "../index.js";
import {loadingController, modalController, popoverController} from "@ionic/core";
import inventoryContentFrame from "./components/inventory/inventory_content_frame.js";
import pantryItemComponent from "./components/inventory/pantry_item.js";
import shoppingListItemComponent from "./components/inventory/shopping_list_item.js";
import createItemModal from "./components/inventory/create_item_modal.js";
import groupSelectComponent from "./components/inventory/group_select_component.js";
import {raiseToast} from "../utility.js";
import ItemOptionsMenu from "./components/inventory/item_options_menu.js";

/**
 * TODO:
 *  Options kebab -
 *      update item
 *      Delete item
 *  Update item after incr/decr
 *  Group history
 *  Shopping list
 *      If an item is added to the shopping list wihle it exists in the pantry list, it should become visible
 *      Action button to mark item as purchased
 *  Pantry
 *      Warning color on items that are at the minimum threshold
 *      Danger color on items that are at 0
 */
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
        }).then((loading) => {
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
        this.innerHTML = inventoryContentFrame(); //
        this.renderGroupSelectors();
        this.renderContent();
    }

    /**
     *
     * @param {Array<Item>} filtered_items
     */
    renderContent(filtered_items = null) {
        const items = filtered_items ?? this.#items;
        this.renderPantryContent(items);
        this.renderShoppingListContent(items);
    }

    /**
     * Generates a select component that allows the user to change their current group.
     * There are 3 group selector buttons that contain the generated HTML, but only one should be visibleat any time.
     */
    renderGroupSelectors() {
        const group_selects = document.querySelectorAll('.group-select-button');
        const select_component = groupSelectComponent(this.#current_group, Restock.getGroups());
        group_selects.forEach(gs => {
            gs.innerHTML = select_component
            gs.querySelector('.group-select').interfaceOptions = {header: 'Selected group'};
        });
    }

    /**
     * Render all items in the pantry context
     */
    renderPantryContent(items) {
        const pantry_content = document.querySelector('#pantry-content');
        pantry_content.innerHTML = items.reduce((html, item) => html + pantryItemComponent(item), '');
    }

    /**
     * Render all items in the shopping list context
     */
    renderShoppingListContent(items) {
        const shopping_list_content = document.querySelector('#shopping-list-content');
        if (!shopping_list_content) return;
        shopping_list_content.innerHTML = items.reduce((html, item) => html + shoppingListItemComponent(item), '');
    }

    #attachEventListeners() {
        this.#attachGroupSelectFieldListeners();
        this.#attachSearchFilterListeners();
        this.#attachItemListeners();
        this.#attachNewItemButtonListener();
    }

    /**
     * When the selector is changed, update all selectors to display the right group, fetch details for the new group,
     * and then re-render the page content.
     */
    #attachGroupSelectFieldListeners() {
        const select_component_buttons = document.querySelectorAll('.group-select-button');
        const updateGroupSelection = (group_id) => {
            Restock.setCurrentGroup(group_id).then((group_was_changed) => {
                if (!group_was_changed) return; // The described group was not found for this user
                // Load the selected group's data
                this.#fetchDetails().then((details_were_retrieved) => {
                    if (!details_were_retrieved) return;
                    this.renderGroupSelectors();
                    this.renderContent();
                    this.#attachItemListeners();
                });
            });
        }
        select_component_buttons.forEach(select => {
            select.addEventListener('ionChange', e => { // Listening for the event bubbling from the select component
                const group_id = e.target.value; // New group id
                updateGroupSelection(group_id);
            })
        });
        /**
         * Changing groups using directional buttons requires having an "order" of options and a "position" to move
         * from. The order of these options is determined by mapping the options for our select component to an array
         * of values. Each value is a group's id. We can find our position by indexing the current group's id in this
         * array, and then traversing by (+/-) one element, wrapping if it's a lower or upper bound.
         */
        const option_values = Array.from(select_component_buttons[0].querySelectorAll('ion-select-option'))
            .map(option => option.value);
        const selectRelativeOption = (offset) => {
            const wrap = (pos, limit) => (pos < 0) ? (limit + pos % limit) : pos % limit; // e.g.: (4, 3) = 1 and (-1, 3) = 2
            const current_index = option_values.findIndex(group_id => group_id == this.#current_group.id);
            const next_index = wrap(current_index + offset, option_values.length);
            const selected_group_id = option_values[next_index];
            updateGroupSelection(selected_group_id);
        }

        const prev_group_buttons = document.querySelectorAll('.change-group-back');
        prev_group_buttons.forEach(prev_group_button => {
            prev_group_button.addEventListener('click', () => {
                selectRelativeOption(-1)
            })
        });
        const next_group_buttons = document.querySelectorAll('.change-group-forward');
        next_group_buttons.forEach(next_group_button => {
            next_group_button.addEventListener('click', () => {
                selectRelativeOption(1)
            })
        });
    }

    /**
     * Filter the items of this group to elements whose name contains the search query.
     * Re-renders the content using only the filtered items.
     */
    #attachSearchFilterListeners() {
        const searchbars = document.querySelectorAll('.item-searchbar');
        searchbars.forEach(searchbar => {
            searchbar.addEventListener('ionInput', (e) => {
                const needle = e.target.value;
                const filtered_items = this.#items.filter(item => item.name.indexOf(needle) !== -1);
                this.renderContent(filtered_items);
                this.#attachItemListeners();
            });
        })
    }

    #attachItemListeners() {
        const add_pantry_buttons = document.querySelectorAll('.add-pantry');
        const subtract_pantry_buttons = document.querySelectorAll('.subtract-pantry');
        const add_shopping_list_buttons = document.querySelectorAll('.add-shopping-list');
        const subtract_shopping_list_buttons = document.querySelectorAll('.subtract-shopping-list');
        const pantry_options = document.querySelectorAll('.pantry-options');
        const shopping_list_options = document.querySelectorAll('.shopping-list-options');
        const edit_item_buttons = document.querySelectorAll('.edit-item-button');
        const delete_item_buttons = document.querySelectorAll('.delete-item-button');
        // Todo: shopping-list option add-all-to-pantry
        add_pantry_buttons.forEach(apb => apb.addEventListener('click', this.#addOneToPantry));
        subtract_pantry_buttons.forEach(spb => spb.addEventListener('click', this.#subtractOneFromPantry));
        add_shopping_list_buttons.forEach(aslb => aslb.addEventListener('click', this.#addOneToShoppingList));
        subtract_shopping_list_buttons.forEach(sslb => sslb.addEventListener('click', this.#subtractOneFromShoppingList));

        pantry_options.forEach( po => {
            po.addEventListener('click' , (e) => {
                const item_id = e.currentTarget.parentNode.id;
                const item = this.#items.find( i => i.id == item_id);
                const popover = this.#presentItemOptionsPopover(e).then( popover => {
                    document.querySelector('#edit-item-button').addEventListener('click', () => {
                        // display edit item form modal
                        console.log("Finish implementing edit item!")
                        this.#displayItemModal(item);
                    });
                    document.querySelector('#delete-item-button').addEventListener('click', () => {
                        // ask "are u sure"
                        // delete item
                        console.log("Finish implementing delete item!");
                    });

                });


                    // const { role } = await popover.onDidDismiss();
                    // console.log(`Popover dismissed with role: ${role}`);
                // }


            })
        })

        edit_item_buttons.forEach( eib => {
            eib.addEventListener('click', (e) => {
                // Get item id
                // pop up prefilled item modal form
            });
        });
        delete_item_buttons.forEach( dib => {
            dib.addEventListener('click', (e) => {
                // pop up "are u sure?"
                //
            })
        })
    }


    #attachNewItemButtonListener() {
        const new_item_fab = document.querySelector('#create-item-button');

        /**
         * Semaphore to prevent double opening of create-item form
         * @type {boolean}
         */
        let modal_is_already_open = false;

        new_item_fab.addEventListener('click', () => {
            if (modal_is_already_open) return;
            modal_is_already_open = true;
            this.#displayItemModal().then( () => modal_is_already_open = false );

        });
    }

    /**
     * Load the currently selected group, it's items, and logs.
     * @return {Promise<boolean>}
     */
    async #fetchDetails() {
        this.#current_group = Restock.getCurrentGroup();
        if (!this.#current_group) return false;
        this.#items = Restock.getItemsForGroupById(this.#current_group.id);
        // this.#action_logs = Restock.getActionLogsForGroupById(this.#current_group.id);
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
        return true;
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
        if (!item) return null;
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

    /**
     * Popup menu that shows up next to the item element's kebab button when it's pressed.
     * @param {Event} e
     * @return {Promise<HTMLIonPopoverElement>}
     */
    async #presentItemOptionsPopover(e) {
        const popover = await popoverController.create({
            component: 'item-options-menu',
            event: e
        });
        await popover.present();
        return popover;
    }

    /**
     * @param {Item} item
     * @return {Promise<void>}
     */
    async #displayItemModal(item = null) {
        const div = document.createElement('div');
        div.innerHTML = createItemModal(item);

        const modal = await modalController.create({
            backdropDismiss: false,
            component: div
        });

        modal.present().then(() => {
            const captureModalInputAsItem = () => {
                item.name = document.querySelector('#create-item-name').value;
                item.description = document.querySelector('#create-item-description').value;
                // category: document.querySelector('#create-item-category').value,
                item.category = "default#000000";
                item.pantry_quantity = document.querySelector('#create-item-pantry-quantity').value;
                item.minimum_threshold = document.querySelector('#create-item-minimum-threshold').value;
                item.auto_add_to_shopping_list = document.querySelector('#create-item-auto-add-to-shopping-list').checked;
                item.shopping_list_quantity = document.querySelector('#create-item-shopping-list-quantity').value;
                item.dont_add_to_pantry_on_purchase = document.querySelector('#create-item-dont-add-to-pantry-on-purchase').checked;
            };

            if (!item) {
                item = new Item({
                    id: 0,
                    group_id: this.#current_group.id
                });
            }

            document.querySelector('#modal-close').addEventListener('click', () => {
                captureModalInputAsItem();
                modalController.dismiss(null, 'cancel');
            })
            document.querySelector('#modal-confirm').addEventListener('click', () => {
                // todo: guard against bad input and incoplete fields
                captureModalInputAsItem();
                modalController.dismiss(null, 'submit');
            })
        });

        const {data, role} = await modal.onWillDismiss();
        if (role === 'submit' /* && TODO: item.isValidItem */) {
            loadingController.create({
                message: 'Submitting form...',
                spinner: 'bubbles'
            }).then((loading) => {
                loading.present();
                const transaction = item.id == 0 ?
                    Restock.createItem(item) :
                    Restock.updateItem(item)
                ;
                transaction.then(transaction_was_successful => {
                    if (!transaction_was_successful) {
                        raiseToast('Something went wrong. Please try again later.', 'danger');
                        return;
                    }
                    raiseToast(`${item.name} was successfully ${item.id == 0 ? 'created' : 'updated'}`);
                    // Pulls all changes
                    this.#fetchDetails();
                    // Only update items
                    this.renderContent();
                    this.#attachItemListeners();
                }).then(() => {
                    loading.dismiss();
                })
            })
        }
    }


}
customElements.define('inventory-page', Inventory);
