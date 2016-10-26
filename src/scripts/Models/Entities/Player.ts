enum PLAYER_STATE
{
    DEFAULT,
    BUILDING
}

class Player extends GameObject
{
    static MAX_SPEED: number = 30;
    static ACCELERATION: number = 100;

    public is_moving: {
        left: boolean,
        right: boolean,
        up: boolean,
        down: boolean
    };
    public speed: THREE.Vector2;
    public max_speed: number;

    private state: PLAYER_STATE;

    // building stuff
    public buildSystem: BuildSystem;

    // Caracteristiques
    private strengh: number;


    // Internal stuff
    private time_before_attack: number = -1;
    private attack_speed: number;

    constructor(x: number, y: number)
    {
        super(x, y, GAME_OBJECT_TYPE.PLAYER);
        var config = this.GetConfig();
        this.strengh = config.STR;
        this.state = PLAYER_STATE.DEFAULT;
        this.is_moving = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        this.speed = new THREE.Vector2();
        this.max_speed = Player.MAX_SPEED;
        this.attack_speed = GameConfig.PLAYER.ATTACK_SPEED;
        this.buildSystem = new BuildSystem();
    }

    public SetupBuild(type: GAME_OBJECT_TYPE)
    {
        this.state = PLAYER_STATE.BUILDING;
        this.buildSystem.SetupBuild(type);
    }

    public SetupDestroy()
    {
        this.state = PLAYER_STATE.BUILDING;
        this.buildSystem.SetupDestroy();
    }

    public CancelBuild()
    {
        this.LeaveBuildMode();
    }

    public GetState(): PLAYER_STATE
    {
        return this.state;
    }

    public Action1()
    {
        switch (this.state) {
            case PLAYER_STATE.DEFAULT:
                // ATTACK
                if (this.time_before_attack < 0) {
                    var target = AppController.GetMouseTarget();
                    if (target != null && target !== this
                        && target.DistanceTo(this) < GameConfig.PLAYER.INTERACTIONS.ATTACK_RANGE) {
                        target.IsHit(this.strengh);
                        this.time_before_attack = this.attack_speed;
                    }
                }
                break;
            case PLAYER_STATE.BUILDING:
                if (this.buildSystem)
                    // BUILD
                    if (this.buildSystem.Validate()) {
                        this.LeaveBuildMode();
                    }
                break;
        }
    }

    public Action2()
    {
        switch (this.state) {
            case PLAYER_STATE.DEFAULT:
                break;
            case PLAYER_STATE.BUILDING:
                this.LeaveBuildMode();
                break;
        }
    }

    private LeaveBuildMode()
    {
        InterfaceHandler.ToggleBuildInterface();
        this.state = PLAYER_STATE.DEFAULT;
        this.buildSystem.Cancel();
    }

    public Tick(dt: number)
    {
        super.Tick(dt);
        var factor = dt / 1000;
        // var drag = Config.Moves.DRAG_FACTOR * factor;
        var drag = 0.7 * factor;
        // var gain = Config.Moves.ACCELERATION * factor;
        var gain = Player.ACCELERATION * factor;
        // re-eval speed
        // 1. apply drag to stop unwanted movements
        if ((this.speed.y < 0 && !this.is_moving.up)
            || (this.speed.y > 0 && !this.is_moving.down)) {
            // up
            this.speed.y *= drag;
            if (Math.abs(this.speed.y) < 1e-3) {
                this.speed.y = 0;
            }
        }
        if ((this.speed.x < 0 && !this.is_moving.left)
            || (this.speed.x > 0 && !this.is_moving.right)) {
            // up
            this.speed.x *= drag;
            if (Math.abs(this.speed.x) < 1e-3) {
                this.speed.x = 0;
            }
        }


        // 2. consider user input
        if (this.is_moving.up) {
            this.speed.y -= gain;
        }
        if (this.is_moving.down) {
            this.speed.y += gain;
        }
        if (this.is_moving.left) {
            this.speed.x -= gain;
        }
        if (this.is_moving.right) {
            this.speed.x += gain;
        }

        // Considerer la vitesse maximale par rapport à
        // l'ensemble des vitesses (indistinctement)
        var combinedSpeed = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
        if (combinedSpeed > this.max_speed) {
            var slow_ratio = this.max_speed / combinedSpeed;
            this.speed.x *= slow_ratio;
            this.speed.y *= slow_ratio;
        }

        // 3. Update coord
        this.coord.x += this.speed.x * factor;
        this.coord.y += this.speed.y * factor;
        // 4. Update 3D Object & BBOX
        this.PositionUpdated();

        this.CheckForCollision();


        // Update Caracteristiques

        // internal stuff
        if (this.time_before_attack >= 0) {
            this.time_before_attack -= dt;
        }
        // ---------------------------------------------
        switch (this.state) {
            case PLAYER_STATE.DEFAULT:
                break;
            case PLAYER_STATE.BUILDING:
                this.buildSystem.Tick();
                break;
        }
    }

    private CheckForCollision()
    {
        let objects = GameController.CheckForCollision(this);
        if (objects.length > 0) {
            for (let obj of objects) {
                if (obj.is_loot) {
                    // Loot
                    (<LootObject>obj).Loot();
                } else {
                    var inter = obj.BBox.clone().intersect(this.BBox);
                    let thisCenter = this.BBox.center();
                    let otherCenter = inter.center();
                    let interSize = inter.size();
                    let collisionDir = new THREE.Vector2(
                        sign(thisCenter.x - otherCenter.x),
                        sign(thisCenter.y - otherCenter.y)
                    );
                    let speedDir = new THREE.Vector2(
                        sign(this.speed.x),
                        sign(this.speed.y)
                    );

                    var factor = .75;
                    if (interSize.height > factor * interSize.width) {
                        if (-speedDir.x === collisionDir.x) {
                            this.speed.x = 0;
                            this.coord.x += collisionDir.x * interSize.width;
                        }
                    }
                    if (interSize.width > factor * interSize.height) {
                        if (-speedDir.y === collisionDir.y) {
                            this.speed.y = 0;
                            this.coord.y += collisionDir.y * interSize.height;
                        }
                    }
                }
            }
            this.PositionUpdated();
        }
    }
}
