/**
 * Select component for designating the current group being worked in.
 * @param {Group} current_group
 * @param {Array<Group>} groups
 * @return {string}
 */
export default function groupSelectComponent(current_group, groups) {
    return `<ion-select aria-label="Selected group" ok-text="Choose" value="${current_group.id}" class="group-select">`
        + groups.reduce((html, group) => html + `<ion-select-option value="${group.id}">${group.name}</ion-select-option>`, '')
        + `</ion-select>`;
}