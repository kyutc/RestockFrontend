export default class {
    /** @type {number} */
    #id;

    /** @type {number} */
    #group_id;

    /** @type {string} */
    #name;

    /** @type {string} */
    #description;

    /** @type {string} */
    #category;

    /** @type {number} */
    #pantry_quantity;

    /** @type {number} */
    #minimum_threshold;

    /** @type {boolean} */
    #auto_add_to_shopping_list;

    /** @type {number} */
    #shopping_list_quantity;

    /** @type {boolean} */
    #dont_add_to_pantry_on_purchase;

    constructor(obj) {
        this.#id = obj.id;
        this.#group_id = obj.group_id;
        this.#name = obj.name;
        this.#description = obj.description;
        this.#category = obj.category;
        this.#pantry_quantity = obj.pantry_quantity;
        this.#minimum_threshold = obj.minimum_threshold;
        this.#auto_add_to_shopping_list = obj.auto_add_to_shopping_list;
        this.#shopping_list_quantity = obj.shopping_list_quantity;
        this.#dont_add_to_pantry_on_purchase = obj.dont_add_to_pantry_on_purchase;
    }

    get id() {
        return this.#id;
    }

    get group_id() {
        return this.#group_id;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        this.#name = value;
    }

    get description() {
        return this.#description;
    }

    set description(value) {
        this.#description = value;
    }

    get category() {
        return this.#category;
    }

    set category(value) {
        this.#category = value;
    }

    get pantry_quantity() {
        return this.#pantry_quantity;
    }

    set pantry_quantity(value) {
        this.#pantry_quantity = value;
    }

    get minimum_threshold() {
        return this.#minimum_threshold;
    }

    set minimum_threshold(value) {
        this.#minimum_threshold = value;
    }

    get auto_add_to_shopping_list() {
        return this.#auto_add_to_shopping_list;
    }

    set auto_add_to_shopping_list(value) {
        this.#auto_add_to_shopping_list = value;
    }

    get shopping_list_quantity() {
        return this.#shopping_list_quantity;
    }

    set shopping_list_quantity(value) {
        this.#shopping_list_quantity = value;
    }

    get dont_add_to_pantry_on_purchase() {
        return this.#dont_add_to_pantry_on_purchase;
    }

    set dont_add_to_pantry_on_purchase(value) {
        this.#dont_add_to_pantry_on_purchase = value;
    }

    /**
     * @return {boolean}
     */
    addOneToPantry() {
        this.pantry_quantity = this.pantry_quantity+1;
        return this.subtractOneFromShoppingList() || true; // No explicit max cap, always returns true
    }

    /**
     * @return {boolean} true if change took place
     */
    subtractOneFromPantry() {
        const previous_pantry_quantity = this.pantry_quantity;
        this.pantry_quantity = Math.max(0, this.pantry_quantity-1);
        if (this.pantry_quantity == previous_pantry_quantity) return false;
        if (this.isPantryBelowMinimumThreshold() && this.auto_add_to_shopping_list && this.isShoppingListBelowMinimumThreshold()) {
            this.shopping_list_quantity = this.minimum_threshold;
        }
        return true;
    }

    /**
     * @return {boolean}
     */
    addOneToShoppingList() {
        this.shopping_list_quantity = this.shopping_list_quantity+1;
        return true;
    }

    /**
     * @return {boolean} true if change took place
     */
    subtractOneFromShoppingList() {
        const previous_shopping_list_quantity = this.shopping_list_quantity;
        this.shopping_list_quantity = Math.max(0, this.shopping_list_quantity-1);
        return this.shopping_list_quantity != previous_shopping_list_quantity;
    }



    /**
     * @return {boolean}
     */
    isPantryBelowMinimumThreshold() {
        return (this.minimum_threshold > this.pantry_quantity);
    }

    /**
     * @return {boolean}
     */
    isShoppingListBelowMinimumThreshold() {
        return (this.minimum_threshold > this.shopping_list_quantity);
    }
}