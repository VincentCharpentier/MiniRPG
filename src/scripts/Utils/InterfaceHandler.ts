

namespace InterfaceHandler
{
    // DOM Elements
    var build_ui: HTMLElement;
    var inventory_ui: HTMLElement;

    // Keep refs for performance
    var show_build_ui = false;
    var build_capacity: { [key: number]: IBuildCapacity }

    interface IBuildCapacity
    {
        canBuild: boolean,
        needs: Array<IBuildNeed>
    }

    export function Init()
    {
        build_capacity = Object.create(null);
        // Init Build Interface
        build_ui = document.createElement("div");
        build_ui.id = "build";

        // Destroy button
        var el = document.createElement("div");
        el.style.background = "content-box red";
        el.onclick = function()
        {
            PlayerController.SetupDestroy();
        }
        el.title = "Destroy";
        build_ui.appendChild(el);
        // Build buttons
        var entities = GameConfig.GetEntities();
        for (let type in entities) {
            let config = entities[type];
            if (config.BuildConfig) {
                build_capacity[config.type] = {
                    canBuild: false,
                    needs: config.BuildConfig.Needs
                }
                let el = document.createElement("div");
                el.id = "b_" + config.type;
                el.style.background = "content-box " + config.BuildConfig.IconColor;
                el.onclick = function()
                {
                    PlayerController.SetupBuild(config.type);
                }
                el.title = config.DisplayName;
                let reqEl = document.createElement("div");
                reqEl.className = "requirement";
                for (let need of config.BuildConfig.Needs) {
                    let ressource = GameConfig.GetRessourceConf(need.type);
                    let e = document.createElement("div");
                    e.title = ressource.name;
                    let icon = document.createElement("img");
                    let count = document.createElement("span");
                    icon.src = "assets/icons/" + ressource.icon;
                    count.innerHTML = need.count.toString();
                    e.appendChild(icon);
                    e.appendChild(count);
                    reqEl.appendChild(e);
                }
                el.appendChild(reqEl);
                build_ui.appendChild(el);
            }
        }
        document.body.appendChild(build_ui);
        // Init Inventory interface
        inventory_ui = document.createElement("div");
        inventory_ui.id = "inventory";
        var ressources = GameConfig.GetRessources();
        for (let r in ressources) {
            let o = ressources[r];
            let element = document.createElement("div");
            element.className = "inventory_slot";
            element.id = "inv_" + o.type;
            element.title = o.name;
            let icon = document.createElement("img");
            icon.src = "assets/icons/" + o.icon;
            let counter = document.createElement("span");
            counter.className = "counter";
            element.appendChild(icon);
            element.appendChild(counter);
            inventory_ui.appendChild(element);
        }
        document.body.appendChild(inventory_ui);
    }

    export function ToggleBuildInterface()
    {
        show_build_ui = !show_build_ui;
        if (show_build_ui) {
            build_ui.classList.add("enabled");
            UpdateBuildCapacities();
        } else {
            build_ui.classList.remove("enabled");
        }
    }

    function UpdateBuildCapacities()
    {
        // Update build capacity
        for (let type in build_capacity) {
            build_capacity[type].canBuild = true;
            for (let need of build_capacity[type].needs) {
                if (need.count > InventoryController.GetItemCount(need.type)) {
                    build_capacity[type].canBuild = false;
                    break;
                }
            }
            // Update build interface
            if (build_capacity[type].canBuild) {
                document.getElementById("b_" + type).classList.remove("disabled");
            } else {
                document.getElementById("b_" + type).classList.add("disabled");
            }
        }
    }

    export function UpdateInventoryUI()
    {
        // Update inventory
        var items = InventoryController.UI_GetItemsToUpdate();
        for (let o of items) {
            let e = document.querySelector("#inv_" + o.type + " .counter");
            e.innerHTML = o.count.toString();
        }
        InventoryController.UI_Updated();
        if (show_build_ui) {
            UpdateBuildCapacities();
        }
    }
}
