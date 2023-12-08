import ActionLog from "../../../models/action_log.js";
/**
 * @param {ActionLog} action_log
 * @return {string}
 */
export default function historyItem(action_log) {
    return `
        <ion-item id="h-${action_log.id}">
            <ion-label color="medium">${action_log.log_message}</ion-label>
        </ion-item>
    `;
}