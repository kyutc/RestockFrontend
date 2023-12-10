/**
 * group accordion in
 * @param {Group} group
 */
export default function createGroupAccordion(group) {
    return `
            <ion-accordion value="${group.id}" data-group-id="${group.id}">
                <ion-item slot="header" color="light" id="g-${group.id}">
                    <ion-label>${group.name}</ion-label>
                    <ion-button class="group-options" slot="start"><ion-icon name="ellipsis-vertical-outline" id="g-${group.id}"></ion-icon></ion-button>
                </ion-item>
                <div class="ion-padding" slot="content">
                    <ion-list id="group-member-list-for-${group.id}"></ion-list>
                </div>
            </ion-accordion>
        `;
}