namespace InventoryController
{
    interface InventorySlot
    {
        type: GAME_RESSOURCE_TYPE,
        count: number,
        ui_uptodate: boolean
    }

    var objects: { [key: number]: InventorySlot };

    export function Init()
    {
        objects = Object.create(null);
        var ressources = GameConfig.GetRessources();
        for (let r in ressources) {
            let o = ressources[r];
            objects[o.type] = {
                type: o.type,
                count: 0,
                ui_uptodate: false
            };
        }
    }

    function GetSlot(type: GAME_RESSOURCE_TYPE): InventorySlot
    {
        return objects[type];
    }

    export function GetItemCount(type: GAME_RESSOURCE_TYPE): number
    {
        return GetSlot(type).count;
    }

    export function AddItem(type: GAME_RESSOURCE_TYPE, nb: number = 1)
    {
        var o = GetSlot(type);
        o.count += nb;
        o.ui_uptodate = false;
        InterfaceHandler.UpdateInventoryUI();
    }

    export function RemoveItem(type: GAME_RESSOURCE_TYPE, nb: number = 1)
    {
        var o = GetSlot(type);
        o.count -= nb;
        o.ui_uptodate = false;
        InterfaceHandler.UpdateInventoryUI();
    }

    function ForEach(fct: (e: InventorySlot) => void)
    {
        for (let i in objects) {
            fct(objects[i]);
        }
    }

    // UI
    export function UI_GetItemsToUpdate(): Array<InventorySlot>
    {
        var result = new Array();
        ForEach((e) =>
        {
            if (!e.ui_uptodate) {
                result.push(e);
            }
        });
        return result;
    }

    export function UI_Updated()
    {
        ForEach((e) =>
        {
            if (!e.ui_uptodate) {
                e.ui_uptodate = true;
            }
        });
    }
}
