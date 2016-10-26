abstract class LootObject extends GameObject
{
    static MAX_LIFE_TIME = 60 * 1000;
    private life_time: number = 0;
    private ressource_type: GAME_RESSOURCE_TYPE;

    constructor(x: number, y: number, type: GAME_OBJECT_TYPE)
    {
        super(x, y, type);
        this.defaultHeight = this.object3D.position.y;
        this.is_loot = true;
        this.ressource_type = this.GetConfig().RessourceInside;
    }

    private player_locked = false;
    private speed: number;
    public Tick(dt: number)
    {
        this.life_time += dt;
        if (this.life_time > LootObject.MAX_LIFE_TIME) {
            this.Destroy();
        }
        if (this.player_locked) {
            var factor = dt / 1000;
            var pCoord = PlayerController.GetCoord();
            var diff = {
                x: pCoord.x - this.coord.x,
                y: pCoord.y - this.coord.y,
            };
            var vRatio = Math.abs(diff.x / (Math.abs(diff.x) + Math.abs(diff.y)));
            this.speed = Math.min(Player.MAX_SPEED * 2, this.speed + factor * Player.ACCELERATION * 1.5);
            this.coord.x += factor * this.speed * sign(diff.x) * vRatio;
            this.coord.y += factor * this.speed * sign(diff.y) * (1 - vRatio);
            this.PositionUpdated();
        } else if (PlayerController.DistanceToObject(this) <= GameConfig.PLAYER.LOOT_ATTRACTION_RANGE) {
            this.player_locked = true;
            this.speed = 0;
        }
        this.Animate(dt);
    }

    private rotation_speed = Math.PI / 2;

    private animationDuration: number = 700;
    private updownAmplitude: number = .5;
    private animationDir: number = 1;

    private defaultHeight: number;
    private animationTime: number = 0;
    private Animate(dt: number)
    {
        var factor = dt / 1000;
        // animation
        // -- rotation
        this.object3D.rotateY(this.rotation_speed * factor);
        // -- up & down
        this.animationTime += this.animationDir * dt;
        if (this.animationTime > this.animationDuration || this.animationTime < 0) {
            this.animationDir *= -1;
        }
        this.object3D.position.y = this.defaultHeight + this.updownAmplitude * EasingFunctions.easeInOutQuad(this.animationTime / this.animationDuration);
    }

    public Loot()
    {
        InventoryController.AddItem(this.ressource_type);
        this.Destroy();
    }

    public IsHit(strengh: number)
    {
        // Nothing
    }
}
