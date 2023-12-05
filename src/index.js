import Login from "./views/Login.js";
// import History from "./views/History.js";
// import Recipes from "./views/Recipes.js";
import Settings from "./views/Settings.js";
import Pantry from "./views/Pantry.js";
// import Shopping_List from "./views/Shopping_List.js";
import Manage_Groups from "./views/Manage_Groups.js";
import Restock from "./restock.js";

Restock.init();
let router;
/**
 * On index.html, this is the <app-root></app-root> component.
 * When initialized, the [connectedCallback] method is invoked once.
 * Logic dependent on subsequent accesses to the page must be set in motion
 * using an event listener.
 */
class AppRoot extends HTMLElement {
    animated = false;

    /**
     * Invoked when this element is embedded into the DOM
     */
    connectedCallback() {
        console.log("DEBUG: Loading AppRoot");
        this.render();
        this.updateRoutes();
    }

    render() {
        // Todo: mobile/desktop
        const default_page = "login-page";
        // const default_component = active_session ? "pantry" : "login"

        this.innerHTML = `
            <ion-app>
                <ion-router use-hash="false"></ion-router>

                <ion-split-pane content-id="menu-content" when="md">
                    <ion-menu content-id="menu-content">
                        <ion-toolbar>
                            <ion-title>Menu</ion-title>
                        </ion-toolbar>
                        <ion-content class="ion-padding">
                            <ion-list>
                                <ion-item button href="/">Home</ion-item>
                                <ion-item button href="/settings">Settings</ion-item>
                            </ion-list>
                        </ion-content>
                    </ion-menu>
                    <ion-router-outlet id="menu-content" animated="${this.animated}"></ion-router-outlet>
                </ion-split-pane>
                    
<!--                <ion-nav id="main"></ion-nav>-->
            </ion-app>`;
        router = document.querySelector('ion-router');
    }

    /**
     * The Ionic router will automatically load content into the <ionic-router-outlet> after matching
     * the URL to an existing <ion-route>.
     * Depending on whether the user is logged in, all routes will redirect to the login page.
     * If the user is logged in and attempts to load the login page, they'll be redirected to the 'home' page.
     * @return {string}
     */
    updateRoutes() {
        const active_session = Restock.hasActiveSession();
        const default_page = "pantry"; // TODO: Conditional desktop/mobile
        let routes;
        if (!active_session) {
            // user is not logged in
            routes = `
                    <ion-route url="/login" component="login-page"></ion-route>
                    <ion-route-redirect from="/*" to="/login"></ion-route-redirect>
                `;
        } else {
            routes = `
                    <ion-route url="/" component="${default_page}"></ion-route>
                    <ion-route-redirect from="/login" to="/"></ion-route-redirect>
                    <ion-route url="/settings" component="settings-page"></ion-route>
                    <ion-route url="/manage_groups" component="manage-groups-page"></ion-route>
                `;
        }

        if (!router) {
            // Router isn't in the page
            window.location.replace("/");
            return;
        }
        router.innerHTML = routes;
    }
}

/**
 * Links the element tag to this class.
 */
customElements.define('app-root', AppRoot);

/**
 * Updates the routes defined in the router before attempting to push a new route.
 * @param href
 */
function navigateTo(href) {
    const app_root = document.querySelector('app-root');
    app_root.updateRoutes();
    router.push(href);
}

export {navigateTo}

