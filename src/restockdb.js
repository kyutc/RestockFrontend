import Dexie from "dexie";
import ActionLog from "./models/action_log.js";
import Group from "./models/group.js";
import GroupMember from "./models/group_member.js";
import Item from "./models/item.js";
import Recipe from "./models/recipe.js";
import User from "./models/user.js";

const name = "Restock"
const version = 1;

/**
 * @typedef RestockDB
 * @type {Dexie}
 * @property {Dexie.Table} action_logs
 * @property {Dexie.Table} groups
 * @property {Dexie.Table} group_members
 * @property {Dexie.Table} items
 * @property {Dexie.Table} recipes
 * @property {Dexie.Table} users
 *
 */
class RestockDB extends Dexie {
    constructor() {
        super(name);
        this.version(version).stores({ // Describe version and schema
            users: 'id, name',
            groups: 'id, name',
            group_members: 'id, user_id, group_id, role',
            items: 'id, group_id, name, description, category, pantry_quantity, minimum_threshold, auto_add_to_shopping_list, shopping_list_quantity, dont_add_to_pantry_on_purchase',
            recipes: 'id, name, ingredients, instructions',
            action_logs: 'id, group_id, log_message, timestamp'
        });
        // Mapping tables to models so fetches from the DB return
        // their documented class.
        this.users.mapToClass(User);
        this.groups.mapToClass(Group);
        this.group_members.mapToClass(GroupMember);
        this.items.mapToClass(Item);
        this.recipes.mapToClass(Recipe);
        this.action_logs.mapToClass(ActionLog);
    }

    async deleteUser(user_id) {
        return this.users.delete(user_id);
    }

    async getUser(user_id) {
        return this.users.get(user_id);
    }

    /**
     * @param {User} user
     */
    async putUser(user) {
        return this.users.put(user);
    }

    async getGroup(group_id) {
        return this.groups.get(group_id);
    }

    async getGroupsForUser(user_id) {
        return this.group_members
            .where("user_id")
            .equals(user_id)
            .toArray()
            .then(memberships => memberships.map((membership) => this.groups.get(membership.group_id)));
    }

    /**
     * @param {Group} group
     */
    async putGroup(group) {
        return this.groups.put(group);
    }

    /**
     * @param group_id
     */
    async deleteGroup(group_id) {
        this.groups.delete(group_id)
            .then(group_id => this.deleteGroupMembers(group_id));
    }

    async deleteGroupMembers(group_id) {
        return this.group_members
            .where("group_id")
            .equals(group_id)
            .toArray()
            .then(members => members.map(member => this.deleteGroupMember(member['id'])));
    }

    /**
     * @param group_id
     * @param user_id
     */
    async getGroupMember(group_id, user_id) {
        return this.group_members.where({group_id: group_id, user_id: user_id});
    }

    async deleteGroupMember(group_member_id) {
        return this.group_members.delete(group_member_id);
    }

    /**
     * @param {GroupMember} group_member
     */
    async putGroupMember(group_member) {
        return this.group_members.put(group_member);
    }

    async deleteItem(item_id) {
        return this.items.delete(item_id);
    }

    async getItem(item_id) {
        return this.items.get(item_id);
    }

    async getItems(group_id) {
        return this.items.where("group_id").equals(group_id).toArray();
    }

    /**
     * @param {Item} item
     */
    async putItem(item) {
        return this.users.put(item);
    }

    async deleteRecipe(recipe_id) {
        return this.recipes.delete(recipe_id);
    }

    async getRecipe(recipe_id) {
        return this.recipes.get(recipe_id);
    }

    async getRecipes(user_id) {
        return this.recipes.where("user_id").equals(user_id).toArray();
    }

    /**
     * @param {Recipe} recipe
     */
    async putRecipe(recipe) {
        return this.recipes.put(recipe);
    }

    async getActionLogs(group_id) {
        return this.action_logs.where("group_id").equals(group_id).toArray();
    }

}


// Singleton
const restockdb = new RestockDB();

// modify models to enable self-updating
Group.prototype.save = async function () {
    return restockdb.putGroup(this);
}
GroupMember.prototype.save = async function () {
    return restockdb.putGroupMember(this);
}
Item.prototype.save = async function () {
    return restockdb.putItem(this);
}
Recipe.prototype.save = async function () {
    return restockdb.putRecipe(this);
}
User.prototype.save = async function () {
    return restockdb.putUser(this);
}
export default restockdb;


