/**
 * Group member entry in 'ManageGroups #group-list'
 * @param {GroupMember} group_member
 * @param {GroupMember} current_user_group_member
 */
export default function createGroupMemberItem(group_member, current_user_group_member) {
    const member_is_owner = group_member.role === 'owner';
    const current_user_is_owner = current_user_group_member.role === 'owner';
    const member_is_user = group_member.id === current_user_group_member.id;
    const can_set_owner = current_user_is_owner && !member_is_owner;
    const can_remove = current_user_is_owner && !member_is_owner;
    return `<ion-item id="gm-${group_member.id}" button="true">`
        + (member_is_owner ? member_is_user ? `<ion-icon name="star"></ion-icon>` : `<ion-icon name="star-outline"></ion-icon>` :
            member_is_user ? `<ion-icon name="person"></ion-icon>` : '<ion-icon name="person-outline"></ion-icon>')
        + `<ion-label style="padding-left: 1em">${group_member.name}</ion-label>`
        + (can_set_owner ? `<ion-button class="set-as-owner-button">Set as owner</ion-button>` : '')
        + (can_remove ? `<ion-button class="remove-from-group-button" color="danger">Remove from group</ion-button>` : '')
        + `</ion-item>`;
}
