abstract class RessourceObject extends GameObject
{
    constructor(x: number, y: number, type: GAME_OBJECT_TYPE)
    {
        super(x, y, type);
    }

    protected AfterDeath()
    {
        var config = this.GetConfig();
        for (let loot of config.Loots.LootObjects) {
            let nb = Math.round(Math.random() * (loot.max - loot.min)) + loot.min;
            for (var i = 0; i < nb; i++) {
                // random position
                let a = Math.random() * Math.PI * 2;
                let d = Math.random() * (config.Loots.maxRange - config.Loots.minRange) + config.Loots.minRange;
                let x = this.coord.x + d * Math.cos(a),
                    y = this.coord.y + d * Math.sin(a);
                // create object
                let obj: GameObject;
                switch (loot.type) {
                    case GAME_RESSOURCE_TYPE.WOOD:
                        obj = new WoodLoot(x, y);
                        break;
                    case GAME_RESSOURCE_TYPE.STONE:
                        obj = new RockLoot(x, y);
                        break;
                    default:
                        console.error("Loot type not configured in RessourceObject");
                        break;
                }
                GameController.RegisterGameObject(obj);
            }
        }
    }
}
