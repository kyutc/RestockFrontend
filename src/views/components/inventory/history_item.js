import ActionLog from "../../../models/action_log.js";
/**
 * @param {ActionLog} action_log
 * @return {string}
 */
export default function historyItem(action_log) {
    return `
        <ion-item button="true" id="h-${action_log.id}">
            <ion-label color="medium">${action_log.log_message}</ion-label>
            <ion-chip color="darm">${new Date(action_log.timestamp * 1000).toDateString()}</ion-chip>
        </ion-item>
    `;
}