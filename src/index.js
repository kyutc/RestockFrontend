import Login from "./views/Login.js";
import History from "./views/History.js";
import Recipes from "./views/Recipes.js";
import Settings from "./views/Settings.js";
import Pantry from "./views/Pantry.js";
import Shopping_List from "./views/Shopping_List.js";
import Manage_Groups from "./views/Manage_Groups.js";
import Restock from "./restock.js";

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

// Todo: document this and its purpose
const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

// Invoke router to initialize and render page
const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    const routes = [
        { path: "/", view: Login },
        { path: "/pantry", view: Pantry },
        { path: "/shopping_list", view: Shopping_List },
        { path: "/recipes", view: Recipes },
        { path: "/history", view: History },
        { path: "/settings", view: Settings },
        { path: "/manage_groups", view: Manage_Groups },
    ];

    // Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    // Default page if URL does not match any known routes
    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname]
        };
    }

    // Check if a group_id is selected before rendering "Pantry" and "Shopping_List" views
    const isGroupSelected = (localStorage.getItem('selectedGroupId') != null);

    if ((match.route.path === "/pantry" || match.route.path === "/shopping_list") && !isGroupSelected) {
        // Redirect to the default view or another view of your choice
        navigateTo("/");
        return;
    }

    const view = new match.route.view(getParams(match));

    document.querySelector("#app").innerHTML = await view.getHtml();

    if (view.attachEventListeners) {
        view.attachEventListeners();
    }

    // Get the "Pantry" and "Shopping List" links by their data-link attribute
    const pantryLink = document.querySelector('[data-link="/pantry"]');
    const shoppingListLink = document.querySelector('[data-link="/shopping_list"]');

    // Update the visibility of the links based on whether a group is selected
    if (!isGroupSelected) {
        // If no group is selected, hide the links
        pantryLink.style.display = "none";
        shoppingListLink.style.display = "none";
    } else {
        // Otherwise, show the links
        pantryLink.style.display = "block";
        shoppingListLink.style.display = "block";
    }

    const navLinks = document.querySelectorAll(".nav__link");
    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.href === window.location.href) {
            link.classList.add("active");
        }
    });
};
window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });


    const navLinks= document.querySelectorAll(".nav__link");
    navLinks.forEach(link => {
        link.addEventListener("click", function() {
            navLinks.forEach(link => link.classList.remove("active"));
            this.classList.add("active");
        });
    });

});

Restock.init().then(resuming_session => { // Attempt to resume last session
    router(); // Moved into promise resolution to give time for state to be loaded before attempting to render pages
});

//For letting pages navigate to other pages
export {navigateTo};

