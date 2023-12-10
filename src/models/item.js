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
    #add_to_pantry_on_purchase;

    constructor(obj) {
        this.#id = obj.id;
        this.#group_id = obj.group_id;
        this.update(obj);
    }

    /** @param {this} updated_item */
    update(updated_item) {
        this.#name = updated_item.name;
        this.#description = updated_item.description;
        this.#category = updated_item.category;
        this.#pantry_quantity = updated_item.pantry_quantity;
        this.#minimum_threshold = updated_item.minimum_threshold;
        this.#auto_add_to_shopping_list = updated_item.auto_add_to_shopping_list;
        this.#shopping_list_quantity = updated_item.shopping_list_quantity;
        this.#add_to_pantry_on_purchase = updated_item.add_to_pantry_on_purchase;
        this.calculateShoppingListFromMinimumThreshold();
    }

    toJSON() {
        return JSON.stringify({
            id: this.id,
            group_id: this.group_id,
            name: this.name,
            description: this.description,
            category: this.category,
            pantry_quantity: this.pantry_quantity,
            minimum_threshold: this.minimum_threshold,
            auto_add_to_shopping_list: this.auto_add_to_shopping_list,
            shopping_list_quantity: this.shopping_list_quantity,
            add_to_pantry_on_purchase: this.add_to_pantry_on_purchase
        })
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

    get add_to_pantry_on_purchase() {
        return this.#add_to_pantry_on_purchase;
    }

    set add_to_pantry_on_purchase(value) {
        this.#add_to_pantry_on_purchase = value;
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
        if (!(this.pantry_quantity > 0)) return false; // Nothing changed
        this.pantry_quantity = this.pantry_quantity-1;
        if (this.isInPantryBelowMinimumThreshold()) this.addOneToShoppingList();
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
        if (!(this.shopping_list_quantity > 0)) return false;
        this.shopping_list_quantity = this.shopping_list_quantity-1;
        return true;
    }

    addOneFromShoppingList() {
        if (!(this.shopping_list_quantity > 0)) return false;
        this.shopping_list_quantity = this.shopping_list_quantity-1;
        this.pantry_quantity = this.pantry_quantity+1;
        return true;
    }

    addAllFromShoppingList() {
        if (!(this.shopping_list_quantity > 0)) return false;
        this.pantry_quantity = this.pantry_quantity + this.shopping_list_quantity;
        this.shopping_list_quantity = 0;
        return true;
    }

    /**
     * @return {boolean}
     */
    calculateShoppingListFromMinimumThreshold() {
        if (!this.shouldBeAddedToShoppingList()) return false;
        const difference_to_add_to_shopping_list = this.minimum_threshold - this.pantry_quantity;
        if (difference_to_add_to_shopping_list < this.shopping_list_quantity) return false;
        this.shopping_list_quantity = difference_to_add_to_shopping_list;
        return true;
    }

    /**
     * @return {boolean}
     */
    isInPantryAtMinimumThreshold() {
        return (this.minimum_threshold  === this.pantry_quantity);
    }

    /**
     * @return {boolean}
     */
    isInPantryBelowMinimumThreshold() {
        return (this.minimum_threshold > this.pantry_quantity);
    }

    /**
     * @return {boolean}
     */
    shouldBeAddedToShoppingList() {
        return this.auto_add_to_shopping_list && this.isInPantryBelowMinimumThreshold();
    }
}