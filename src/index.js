import Login from "./views/Login.js";
import History from "./views/History.js";
import Recipes from "./views/Recipes.js";
import Settings from "./views/Settings.js";
import Pantry from "./views/Pantry.js";
import Shopping_List from "./views/Shopping_List.js";

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

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
        { path: "/settings", view: Settings }
    ];

    // Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname]
        };
    }

    const view = new match.route.view(getParams(match));

    document.querySelector("#app").innerHTML = await view.getHtml();

    if (view.attachEventListeners) {
        view.attachEventListeners();
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

    router();
});

