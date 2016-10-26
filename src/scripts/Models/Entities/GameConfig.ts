interface IEntityConfig
{
    DisplayName: string,
    type: GAME_OBJECT_TYPE,
    Model3d: string,
    BBox: IBoundingBox,
    // Health Point
    HP: number;
    STR?: number;
    // Loots
    Loots?: ILootableDescription,
    RessourceInside?: GAME_RESSOURCE_TYPE
    // Build requirements
    BuildConfig?: IBuildConfig
}

interface IRessourceConfig
{
    name: string,
    type: GAME_RESSOURCE_TYPE,
    icon: string
}

interface IBoundingBox
{
    offset?: { x: number, y: number }
    height: number,
    width: number
}

interface ILootableDescription
{
    minRange: number,
    maxRange: number,
    LootObjects: Array<ILoot>
}

interface ILoot
{
    type: GAME_RESSOURCE_TYPE,
    min: number,
    max: number
}

interface IBuildConfig
{
    Needs: Array<IBuildNeed>,
    IconColor: string
}

interface IBuildNeed
{
    type: GAME_RESSOURCE_TYPE,
    count: number
}

namespace GameConfig
{
    export const DEBUG = {
        GAMEOBJECTS: {
            TRANSPARENT: false,
            BBOX_VISIBLE: false,
            POSITION_VISIBLE: false
        }
    }

    var playerSize = 3;
    export const PLAYER = {
        INTERACTIONS: {
            ATTACK_RANGE: Math.sqrt(playerSize / 2) + 4,
            BUILD_RANGE: Math.sqrt(playerSize / 2) + 10,
        },
        LOOT_ATTRACTION_RANGE: Math.sqrt(playerSize / 2) + 3,
        ATTACK_SPEED: 500, // ms between 2 attacks
    }

    export function GetEntityConf(type: GAME_OBJECT_TYPE): IEntityConfig
    {
        return Entities[GetEntityRef(type)];
    }

    export function GetRessourceConf(type: GAME_RESSOURCE_TYPE): IRessourceConfig
    {
        return Ressources[GetRessourceRef(type)];
    }

    export function GetEntities()
    {
        return Entities;
    }

    export function GetRessources()
    {
        return Ressources;
    }

    const Ressources: { [key: string]: IRessourceConfig } = {
        "wood": {
            name: "Wood",
            type: GAME_RESSOURCE_TYPE.WOOD,
            icon: "wood.png"
        },
        "rock": {
            name: "Stone",
            type: GAME_RESSOURCE_TYPE.STONE,
            icon: "rock.png"
        }
    }

    const Entities: { [key: string]: IEntityConfig } = {
        "player": {
            DisplayName: "Player",
            type: GAME_OBJECT_TYPE.PLAYER,
            Model3d: "player",
            BBox: {
                height: 3.5,
                width: 3.5
            },
            HP: 100,
            STR: 25
        },
        /* ------------------------------------------- DECOR */
        "tree": {
            DisplayName: "Tree",
            type: GAME_OBJECT_TYPE.TREE,
            Model3d: "tree",
            BBox: {
                height: 2,
                width: 2
            },
            HP: 50,
            Loots: {
                minRange: Math.sqrt(2),
                maxRange: 3,
                LootObjects: [
                    {
                        type: GAME_RESSOURCE_TYPE.WOOD,
                        min: 2,
                        max: 5
                    }
                ]
            }
        },
        "tree_cut": {
            DisplayName: "Trunk",
            type: GAME_OBJECT_TYPE.TREE_CUT,
            Model3d: "tree_cut",
            BBox: {
                height: 2,
                width: 2
            },
            HP: 100,
            Loots: {
                minRange: 0,
                maxRange: 3,
                LootObjects: [
                    {
                        type: GAME_RESSOURCE_TYPE.WOOD,
                        min: 0,
                        max: 2
                    }
                ]
            }
        },
        "rock": {
            DisplayName: "Rock",
            type: GAME_OBJECT_TYPE.ROCK,
            Model3d: "rock",
            BBox: {
                height: 3,
                width: 6
            },
            HP: 150,
            Loots: {
                minRange: 0,
                maxRange: 5,
                LootObjects: [
                    {
                        type: GAME_RESSOURCE_TYPE.STONE,
                        min: 3,
                        max: 6
                    }
                ]
            }
        },
        /* ------------------------------------------- BUILDINGS */
        "wall": {
            DisplayName: "Wall",
            type: GAME_OBJECT_TYPE.WALL,
            Model3d: "wall",
            BBox: {
                height: 1,
                width: 4
            },
            HP: 300,
            BuildConfig: {
                IconColor: "#940",
                Needs: [
                    {
                        type: GAME_RESSOURCE_TYPE.WOOD,
                        count: 5
                    }
                ]
            }
        },
        "tower": {
            DisplayName: "Tower",
            type: GAME_OBJECT_TYPE.TOWER,
            Model3d: "tower",
            BBox: {
                height: 5,
                width: 5
            },
            HP: 1000,
            BuildConfig: {
                IconColor: "#490",
                Needs: [
                    {
                        type: GAME_RESSOURCE_TYPE.WOOD,
                        count: 20
                    },
                    {
                        type: GAME_RESSOURCE_TYPE.STONE,
                        count: 10
                    }
                ]
            }
        },
        /* ------------------------------------------- LOOTS */
        "wood_loot": {
            DisplayName: "Wood",
            type: GAME_OBJECT_TYPE.WOOD_LOOT,
            Model3d: "wood_loot",
            BBox: {
                height: 1.5,
                width: 1.5
            },
            HP: 0,
            RessourceInside: GAME_RESSOURCE_TYPE.WOOD
        },
        "rock_loot": {
            DisplayName: "Stone",
            type: GAME_OBJECT_TYPE.ROCK_LOOT,
            Model3d: "rock_loot",
            BBox: {
                height: 1.5,
                width: 1.5
            },
            HP: 0,
            RessourceInside: GAME_RESSOURCE_TYPE.STONE
        }
    }

    // MAPPING
    var ressource_mapping: { [key: number]: string };
    var entity_mapping: { [key: number]: string };

    // Init
    ressource_mapping = Object.create(null);
    for (let key in Ressources) {
        let o = Ressources[key];
        ressource_mapping[o.type] = key;
    }
    entity_mapping = Object.create(null);
    for (let key in Entities) {
        let o = Entities[key];
        entity_mapping[o.type] = key;
    }
    // -- end Init

    function GetEntityRef(type: GAME_OBJECT_TYPE): string
    {
        return entity_mapping[type];
    }

    function GetRessourceRef(type: GAME_RESSOURCE_TYPE): string
    {
        return ressource_mapping[type];
    }
}
