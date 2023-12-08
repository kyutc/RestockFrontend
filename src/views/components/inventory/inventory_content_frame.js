/**
 * Generates the Inventory page which displays in the <ion-router-outlet> element.
 * Located here are the components for:
 * group selection/switching,
 * search filtering,
 * item lists (unpopulated),
 * group history
 */
export default function inventoryContentFrame() {
    return `
    <ion-content>
        <ion-grid class="item-ui-container">
            <ion-row class="ion-hide-md-down">
                <ion-header>
                    <ion-toolbar class="ion-align-items-center">
                        <ion-buttons> <!-- Group selector buttons -->
                            <ion-button class="change-group-back"><ion-icon name="chevron-back-outline"></ion-icon></ion-button>
                            <ion-button class="group-select-button"></ion-button>
                            <ion-button class="change-group-forward"><ion-icon name="chevron-forward-outline"></ion-icon></ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                    <ion-toolbar>
                        <ion-searchbar class="item-searchbar" placeholder="Search" show-clear-button="always"></ion-searchbar>
                    </ion-toolbar>
                </ion-header>
            </ion-row>
            <ion-row>
                <ion-col size="6">
                    <ion-header>
                        <ion-toolbar>
                            <ion-title>Pantry</ion-title>
                        </ion-toolbar>
                        <ion-toolbar class="ion-hide-md-up">
                            <ion-buttons> <!-- Group selector buttons -->
                                <ion-button class="change-group-back"><ion-icon name="chevron-back-outline"></ion-icon></ion-button>
                                <ion-button class="group-select-button"></ion-button>
                                <ion-button class="change-group-forward"><ion-icon name="chevron-forward-outline"></ion-icon></ion-button>
                            </ion-buttons>
                        </ion-toolbar>
                        <ion-toolbar class="ion-hide-md-up">
                            <ion-searchbar class="item-searchbar" placeholder="Search" show-clear-button="always"></ion-searchbar>
                        </ion-toolbar>
                    </ion-header>
                    <ion-list id="pantry-content"></ion-list> <!-- Item list (pantry fields) -->
                </ion-col>
                <ion-col size="6">
                    <ion-header>
                        <ion-toolbar>
                            <ion-title>Shopping List</ion-title>  <!-- Item list (shopping list fields) -->
                        </ion-toolbar>
                        <ion-toolbar class="ion-hide-md-up">
                            <ion-buttons> <!-- Group selector buttons -->
                                <ion-button class="change-group-back"><ion-icon name="chevron-back-outline"></ion-icon></ion-button>
                                <ion-button class="group-select-button"></ion-button>
                                <ion-button class="change-group-forward"><ion-icon name="chevron-forward-outline"></ion-icon></ion-button>
                            </ion-buttons>
                        </ion-toolbar>
                        <ion-toolbar class="ion-hide-md-up">
                            <ion-searchbar class="item-searchbar" placeholder="Search" show-clear-button="always"></ion-searchbar>
                        </ion-toolbar>
                    </ion-header>
                    <ion-list id="shopping-list-content" class="collapse-hidden"></ion-list>
                </ion-col>
            </ion-row>
        </ion-grid>
        <div class="history-container">
            <ion-header>
                <ion-toolbar><ion-title>History</ion-title></ion-toolbar>
            </ion-header> 
            <ion-list id="history-content"></ion-list>
        </div>
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
            <ion-fab-button id="create-item-button"><ion-icon name="add"></ion-icon></ion-fab-button>
        </ion-fab>
    </ion-content>
    `;
}
