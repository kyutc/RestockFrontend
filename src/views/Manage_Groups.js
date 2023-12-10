import AddGroupModal from "./components/manage_groups/add_group_modal.js";
import Group from "../models/group.js";
import GroupOptionsMenu from "./components/manage_groups/group_options_menu.js";
import Restock from "../restock.js";
import {loadingController, modalController, popoverController} from "@ionic/core";
import {raiseToast} from "../utility.js";
import Invite from "../models/invite.js";
import Item from "../models/item.js";
import createRenameGroupModal from "./components/manage_groups/create_group_modal.js";
import createGroupAccordion from "./components/manage_groups/create_group_accordion.js";
import createGroupMemberItem from "./components/manage_groups/create_group_member_item.js";
import createInviteCodeModal from "./components/manage_groups/create_invite_modal.js";

export default class ManageGroups extends HTMLElement {
    /** @type {Array<Group>} */
    #groups;

    connectedCallback() {
        console.log("DEBUG: Loading Manage Groups page")
        this.#fetchDetails();
        this.render();
    }

    #fetchDetails() {
        this.#groups = Restock.getGroups();
        return !!this.#groups;
    }

    render() {
        this.innerHTML = `
            <ion-content>
                <ion-grid>
                    <ion-row>
                        <ion-header>
                            <ion-toolbar>
                                <ion-title>Manage Groups</ion-title>
                            </ion-toolbar>
                        </ion-header>
                    </ion-row>
                    
                    <ion-row>
                        <ion-button type="submit" id="add-group-button">Add Group<ion-icon slot="end" name="add"></ion-icon></ion-button>
                    </ion-row>
                    
                    <ion-row>
                        <ion-accordion-group style="width:100%" id="group-list"></ion-accordion-group>
                    </ion-row>
                        <!-- Form to create a new group -->
<!--                        <ion-input label="Enter Group Name" label-placement="floating" fill="solid" id="group-name" required></ion-input>-->
<!--                        <ion-button shape="square" size="medium" type="submit" clear id="submit-group">Submit</ion-button>-->
                </ion-grid>
            </ion-content>
        `;
        this.#attachAddGroupListener();
        this.renderGroups();
    }

    #attachAddGroupListener() {
        const add_group_button = document.querySelector('#add-group-button');
        add_group_button.addEventListener('click',  async(e) => {
            this.#displayAddGroupModal();
        })
    }

    renderGroups() {
        const group_list = document.querySelector('#group-list');
        group_list.innerHTML = this.#groups.reduce((html, group) => html + createGroupAccordion(group), '');
        this.#attachModifyGroupListeners()
        this.renderGroupMembers();
    }

    #attachModifyGroupListeners() {
        const group_options = document.querySelectorAll('.group-options');
        group_options.forEach( go => {
            go.addEventListener('click' , (e) => {
                e.stopPropagation();
                const group = this.#getGroupReferencedByEvent(e);
                const popover = this.#presentGroupOptionsPopover(e).then( popover => {
                    document.querySelector('#create-invite-button').addEventListener('click', () => {
                        // TODO
                        Restock.createGroupInvite(group.id).then( invite => this.#displayInviteCodeModal(invite));
                        popover.dismiss();
                    });
                    document.querySelector('#rename-group-button').addEventListener('click', () => {
                        // display edit item form modal
                        this.#displayRenameGroupModal(group);
                        popover.dismiss();
                    });
                    document.querySelector('#leave-group-button').addEventListener('click', () => {
                        const alert = document.createElement('ion-alert');
                        alert.header = "Warning";
                        alert.message = `Are you sure you want to leave ${group.name}? This action cannot be undone.`;
                        alert.buttons = [
                            {
                                text: 'Cancel',
                                role: 'cancel',
                            },
                            {
                                text: 'Leave',
                                role: 'leave',
                                handler: () => {
                                    this.#leaveGroup(group);
                                }
                            }
                        ];
                        document.body.appendChild(alert);
                        alert.present();
                        popover.dismiss();
                    });
                });
            });
        });
    }

    renderGroupMembers() {
        this.#groups.forEach( group => {
            const current_user_group_member = Restock.getCurrentUserGroupMemberForGroup(group);
            if (!current_user_group_member) return;
            const group_member_list = document.querySelector(`#group-member-list-for-${group.id}`);
            const group_members = Restock.getGroupMembersForGroupById(group.id);
            if (!group_members) return;
            group_member_list.innerHTML = group_members.reduce((html, group_member) => {
                return html + createGroupMemberItem(group_member, current_user_group_member);
            }, '');
        });
        this.#attachModifyGroupMembersListeners();
    }

    #attachModifyGroupMembersListeners() {
        const set_as_owner_buttons = document.querySelectorAll('.set-as-owner-button');
        const remove_from_group_buttons = document.querySelectorAll('.remove-from-group-buttons');

        set_as_owner_buttons.forEach(saob => {
            saob.addEventListener('click', (e) => {
                console.log('ife')
                const group_member = this.#getGroupMemberReferencedByEvent(e);
                this.#setAsOwner(group_member);
            });
        });
        remove_from_group_buttons.forEach( rfgb => {
            rfgb.addEventListener('click', (e) => {
                const group_member = this.#getGroupMemberReferencedByEvent(e);
                const alert = document.createElement('ion-alert');
                alert.header = "Warning";
                alert.message = `Are you sure you want to remove ${group_member.name} from your group? This action cannot be undone.`;
                alert.buttons = [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                    },
                    {
                        text: 'Remove',
                        role: 'remove',
                        handler: () => {
                            this.#removeGroupMember(group_member)
                        }
                    }
                ];
                document.body.appendChild(alert);
                alert.present();
            });
        });
    }

    /**
     * @param {Event} e
     */
    #getGroupReferencedByEvent(e) {
        const element_id = e.currentTarget.parentNode.id; // Should be an <ion-item> element
        const group_id = element_id.substr(element_id.indexOf('g-')+2);
        const group = this.#groups.find(g => g.id == group_id);
        if (!group) return null;
        return group;
    }

    #getGroupMemberReferencedByEvent(e) {
        const element_id = e.currentTarget.parentNode.id;
        console.log(element_id)
        const group_member_id = element_id.substr(element_id.indexOf('gm-')+3);
        console.log(element_id, group_member_id)
        const group_member = Restock.getGroupMemberById(group_member_id);
        if (!group_member) return null;
        return group_member;
    }

    /** Dunno why, this method is firing twice after a group is created. */
    #add_group_modal_is_open = false;

    async #displayAddGroupModal() {
        if(this.#add_group_modal_is_open) return;
        this.#add_group_modal_is_open = true;

        const modal = await modalController.create({
            backdropDismiss: false,
            component: 'add-group-modal'
        });

        const dismissModal = (role) => {
            modalController.dismiss(null, role);
            this.#add_group_modal_is_open = false;
        }

        modal.present().then(() => {
            document.querySelector('#close-add-group-modal').addEventListener('click', () => {
                dismissModal('close')
            });

            const add_group_segment = document.querySelector('#add-group-segment');
            const create_group_row = document.querySelector('#create-group-row');
            const group_name_input = document.querySelector('#group-name-input');
            const create_group_button = document.querySelector('#create-group-button');

            const join_group_row = document.querySelector('#join-group-row');
            const invite_code_input = document.querySelector('#invite-code-input');
            const join_group_button = document.querySelector('#join-group-button');


            add_group_segment.addEventListener('ionChange', (e) => {
                const segment = e.detail.value;
                switch (segment) {
                    case "join":
                        join_group_row.classList.remove('hidden');
                        create_group_row.classList.add('hidden');
                        break;
                    case "create":
                    default:
                        create_group_row.classList.remove('hidden');
                        join_group_row.classList.add('hidden');
                }
            });

            group_name_input.addEventListener('ionInput', () => {
                const input = group_name_input.value; // get name
                if (input === '') { // Name is empty
                    create_group_button.disabled = true;
                    return;
                }
                const group_already_exists = !!this.#groups.find(group => group.name === input);
                create_group_button.disabled = group_already_exists; // Don't create duplicate group
            });
            create_group_button.addEventListener('click', () => {
                this.#createGroup(group_name_input.value);
                dismissModal('create');
            });

            const joinGroupGuard = () => {
                const code = invite_code_input.value;
                if (code.length != 24) { // Invalid code
                    console.log('not rite', code.length)
                    join_group_button.disabled = true;
                    join_group_button.fill = "outline";
                    return
                }

                Restock.getGroupByInviteCode(code).then( group => {
                    if (group && !this.#groups.find( g => g.id == group.id)) {
                        invite_code_input.classList.remove('danger-border');
                        invite_code_input.classList.add('success-border');
                        join_group_button.disabled = false;
                        join_group_button.fill = "solid";
                    } else {
                        invite_code_input.classList.remove('success-border');
                        invite_code_input.classList.add('danger-border');
                        join_group_button.disabled = true;
                        join_group_button.fill = "outline";
                    }
                });
            }

            invite_code_input.addEventListener('ionInput', () => {
                joinGroupGuard();
            });
            invite_code_input.addEventListener('paste', () => {
                joinGroupGuard();
            });

            join_group_button.addEventListener('click', () => {
                this.#joinGroup(invite_code_input.value);
                dismissModal('join')
            });
        });
    }

    /**
     * Popup menu that shows up next to the item element's kebab button when it's pressed.
     * @param {Event} e
     * @return {Promise<HTMLIonPopoverElement>}
     */
    async #presentGroupOptionsPopover(e) {
        //TODO:
        // const group = this.#getGroupReferencedByEvent(e);
        // const user_is_owner = Restock.getCurrentUserGroupMemberForGroup(group).role === 'owner';
        // Delete if user is owner, leave otherwise
        const popover = await popoverController.create({
            component: 'group-options-menu',
            event: e
        });
        await popover.present();
        return popover;
    }

    /**
     * @param {Invite} invite
     */
    async #displayInviteCodeModal(invite) {
        if (!invite) return;
        console.log(invite);

        const div = document.createElement('div');
        div.innerHTML = createInviteCodeModal(invite);

        const modal = await modalController.create({
            backdropDismiss: false,
            component: div
        });

        modal.present().then(() => {
            const new_invite_code_input = document.querySelector('#new-invite-code-input');
            const copy_to_clipboard_button = document.querySelector('#copy-invite-code-to-clipboard-button');
            document.querySelector('#close-invite-modal-button').addEventListener('click', () => {
                modalController.dismiss(null, 'cancel');
            });
            copy_to_clipboard_button.addEventListener('click', () => {
                new_invite_code_input.classList.add('success-border');
                navigator.clipboard.writeText(new_invite_code_input.value);
                raiseToast(`Copied ${new_invite_code_input.value} to clipboard`);
            })
        });
    }

    /**
     * Display group modal overlay
     * @param group
     * @return {Promise<void>}
     */
    async #displayRenameGroupModal(group) {
        group = group ??  new Group({id: 0, name: ''});

        const div = document.createElement('div');
        div.innerHTML = createRenameGroupModal(group);

        const modal = await modalController.create({
            backdropDismiss: false,
            component: div
        });

        modal.present().then(() => {
            const old_group_name = group.name ?? '';
            const rename_group_input = document.querySelector('#group-name-input');
            const rename_group_button = document.querySelector('#rename-group-button')
            document.querySelector('#modal-close').addEventListener('click', () => {
                modalController.dismiss(null, 'cancel');
            });
            rename_group_input.addEventListener('ionInput', () => {
                const input = rename_group_input.value; // get name
                if (input === '' || input === old_group_name) { // Name is empty
                    rename_group_button.disabled = true;
                    return;
                }
                const group_already_exists = !!this.#groups.find(group => group.name === input);
                rename_group_button.disabled = group_already_exists; // Don't create duplicate group
            });

            document.querySelector('#rename-group-button').addEventListener('click', () => {
                // todo: guard against bad input and incoplete fields
                this.#renameGroup(group.id, rename_group_input.value);
                modalController.dismiss(null, 'submit');
            })
        });
    }

    #createGroup(name) {
        let group_was_created;
        loadingController.create({
            message: 'Creating group...',
            spinner: 'bubbles'
        }).then((loading) => {
            loading.present();
            const transaction = Restock.createGroup(name);
            transaction.then(transaction_was_successful => {
                if (!transaction_was_successful) {
                    raiseToast('Something went wrong. Please try again later.', 'danger');
                    group_was_created = false;
                    return;
                }
                group_was_created = true;
                raiseToast(`Group ${name} was created`);
                // Pulls all changes
                if (this.#fetchDetails()) {
                    this.renderGroups();
                }
            }).then(() => {
                loading.dismiss();
            });
        });
        return group_was_created;
    }

    #renameGroup(id, name) {
        loadingController.create({
            message: 'Renaming group...',
            spinner: 'bubbles'
        }).then((loading) => {
            loading.present();
            const transaction = Restock.updateGroup(id, name);
            transaction.then(transaction_was_successful => {
                if (!transaction_was_successful) {
                    raiseToast('Something went wrong. Please try again later.', 'danger');
                    return;
                }
                raiseToast(`Group renamed to ${name}`);
                // Pulls all changes
                if (this.#fetchDetails()) {
                    this.renderGroups();
                }
            }).then(() => {
                loading.dismiss();
            });
        });
    }

    #setAsOwner(group_member) {
        const old_role = group_member.role;
        group_member.role = 'owner';
        loadingController.create({
            message: 'Changing role...',
            spinner: 'bubbles'
        }).then((loading) => {
            loading.present();
            const transaction = Restock.updateGroupMember(group_member);
            transaction.then(transaction_was_successful => {
                if (!transaction_was_successful) {
                    group_member.role = old_role; // Todo: Make a dedicated method in Restock for this logic
                    raiseToast('Something went wrong. Try again later.', 'danger');
                    return;
                }
                const group = Restock.getGroupById(group_member.group_id);
                const current_user_group_member = Restock.getCurrentUserGroupMemberForGroup(group);
                current_user_group_member.role = old_role;
                raiseToast(`Set ${group_member.name} as the owner.`)
                if (this.#fetchDetails()) {
                    this.renderGroups();
                }
            }).then(() => {
                loading.dismiss();
            });
        });
    }

    #joinGroup(invite_code) {
        loadingController.create({
            message: 'Joining group...',
            spinner: 'bubbles'
        }).then((loading) => {
            loading.present();
            const transaction = Restock.joinGroupByInviteCode(invite_code);
            transaction.then(transaction_was_successful => {
                if (!transaction_was_successful) {
                    raiseToast('Something went wrong. Please try again later.', 'danger');
                    return;
                }
                raiseToast(`You have joined ${this.#groups[this.#groups.length-1].name}`); // New groups are pushed
                // Pulls all changes
                if (this.#fetchDetails()) {
                    this.renderGroups();
                }
            }).then(() => {
                loading.dismiss();
            });
        });
    }

    #leaveGroup(group) {
        const group_member = Restock.getCurrentUserGroupMemberForGroup(group);
        const user_is_owner = group_member.role === 'owner';

        loadingController.create({
            message: user_is_owner ? 'Deleting group...' : 'Leaving group...',
            spinner: 'bubbles'
        }).then((loading) => {
            loading.present();
            const transaction = user_is_owner ?
                Restock.deleteGroup(group.id) :
                Restock.deleteGroupMember(group_member)
            ;
            transaction.then(transaction_was_successful => {
                if (!transaction_was_successful) {
                    raiseToast('Something went wrong. Please try again later.', 'danger');
                    return;
                }
                // Todo: change message depending on if group was left or dleeted
                raiseToast(`You have left ${group.name}`);
                // Pulls all changes
                if (this.#fetchDetails()) {
                    this.renderGroups();
                }
            }).then(() => {
                loading.dismiss();
            });
        });
    }

    #removeGroupMember(group_member) {
        const group = Restock.getGroupById(group_member.group_id);
        loadingController.create({
            message: `Removing ${group_member.name} from group...`,
            spinner: 'bubbles'
        }).then((loading) => {
            loading.present();
            const transaction = Restock.deleteGroupMember(group_member);
            transaction.then(transaction_was_successful => {
                if (!transaction_was_successful) {
                    raiseToast('Something went wrong. Please try again later.', 'danger');
                    return;
                }
                // Todo: change message depending on if group was left or dleeted
                raiseToast(`You have removed ${group_member.name} from ${group.name}`);
                // Pulls all changes
                if (this.#fetchDetails()) {
                    this.renderGroups();
                }
            }).then(() => {
                loading.dismiss();
            });
        });
    }
}

customElements.define('manage-groups-page', ManageGroups);