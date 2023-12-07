/**
 * Unobtrusive visual notification
 *
 * @param message
 * @param {"primary"|"secondary"|"tertiary"|"success"|"warning"|"danger"|"light"|"medium"|"dark"} color
 * @return {Promise<*>}
 */
export async function raiseToast(message, color = 'success') {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 2000;
    toast.color = color;
    document.body.appendChild(toast);
    return toast.present();
}