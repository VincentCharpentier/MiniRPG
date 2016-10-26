
enum BUILD_STATE
{
    DEFAULT,
    BUILDING,
    DESTROYING
}

class BuildSystem
{
    public object: GameObject;
    private state: BUILD_STATE;

    constructor()
    {
        this.state = BUILD_STATE.DEFAULT;
    }

    private Reset()
    {
        this.canAct = false;
        switch (this.state) {
            case BUILD_STATE.BUILDING:
                this.RemoveBuildObject();
                break;
            case BUILD_STATE.DESTROYING:
                this.destroy_target_init = false;
                if (this.object) {
                    this.object.Reset3dModel();
                }
                break;
        }
        this.state = BUILD_STATE.DEFAULT;
    }

    public SetupBuild(type: GAME_OBJECT_TYPE)
    {
        this.Reset();
        if (this.HasRessourcesToBuild(type)) {
            this.state = BUILD_STATE.BUILDING;
            this.object = GameObjectFactory.GetNewObject(type);
            Object3dFactory.ToBuildObject(this.object.object3D);
        }
    }

    public SetupDestroy()
    {
        this.Reset();
        this.state = BUILD_STATE.DESTROYING;
    }

    public Cancel()
    {
        this.Reset();
    }

    public Validate(): boolean
    {
        switch (this.state) {
            case BUILD_STATE.BUILDING:
                if (this.canAct) {
                    // Consume ressources
                    var needs = GameConfig.GetEntityConf(this.object.GetType()).BuildConfig.Needs;
                    for (let need of needs) {
                        InventoryController.RemoveItem(need.type, need.count);
                    }
                    // Create Object
                    var newObj = GameObjectFactory.GetNewObject(this.object.GetType());
                    newObj.coord = this.object.coord;
                    newObj.rotation = this.object.rotation;
                    newObj.PositionUpdated();
                    GameController.RegisterGameObject(newObj);
                    return true;
                }
                return false;
            case BUILD_STATE.DESTROYING:
                if (this.object && this.canAct) {
                    this.destroy_target_init = false;
                    this.object.UnBuild();
                    delete this.object;
                    return true;
                }
                return false;
        }
    }

    public Rotate(clockwise: boolean)
    {
        if (this.state === BUILD_STATE.BUILDING) {
            if (clockwise) {
                this.object.Rotate(Math.PI / 2);
            } else {
                this.object.Rotate(-Math.PI / 2);
            }
        }
    }

    private IsTooFar(): boolean
    {
        switch (this.state) {
            case BUILD_STATE.BUILDING:
                return PlayerController.DistanceToPoint(AppController.mouse_world_position)
                    > GameConfig.PLAYER.INTERACTIONS.BUILD_RANGE;
            case BUILD_STATE.DESTROYING:
                if (this.object) {
                    return PlayerController.DistanceToPoint(this.object.GetCenter())
                        > GameConfig.PLAYER.INTERACTIONS.BUILD_RANGE;
                }
        }
        return false;
    }

    private Collide(): boolean
    {
        var r = GameController.CheckForCollision(this.object);
        if (r.length > 0) {
            console.log(r);
            console.log(r[0].BBox.intersect(this.object.BBox));
            console.log("");
        }
        return r.length > 0;
    }

    private HasRessourcesToBuild(type: GAME_OBJECT_TYPE): boolean
    {
        var needs = GameConfig.GetEntityConf(type).BuildConfig.Needs;
        for (let need of needs) {
            if (need.count > InventoryController.GetItemCount(need.type)) {
                return false;
            }
        }
        return true;
    }

    private destroy_target_init = false;
    private canAct = false;
    public Tick()
    {
        switch (this.state) {
            case BUILD_STATE.BUILDING:
                if (this.IsTooFar()) {
                    this.canAct = false;
                    this.object.RemoveFromScene();
                } else {
                    // if (this.Collide()) {
                    //     this.object.RemoveFromScene();
                    // } else {
                    this.canAct = true;
                    this.object.AddInScene();
                    // }
                    var size = this.object.BBox.size();
                    this.object.coord.x = Math.floor(AppController.mouse_world_position.x - size.width / 2);
                    this.object.coord.y = Math.floor(AppController.mouse_world_position.y - size.height / 2);
                    this.object.PositionUpdated();
                }
                break;
            case BUILD_STATE.DESTROYING:
                var target = AppController.GetMouseTarget();
                // if target switch
                if (target !== this.object) {
                    // console.log(target, this.object, this.destroy_target_init);
                    if (this.object && this.destroy_target_init) {
                        // reset previous targeted object
                        this.object.Reset3dModel();
                        this.destroy_target_init = false;
                        this.object = null;
                        this.canAct = false;
                    }
                    if (target && target.is_built) {
                        this.object = target;
                    }
                }
                if (this.object) {
                    if (this.IsTooFar()) {
                        if (this.destroy_target_init) {
                            this.object.Reset3dModel();
                            this.destroy_target_init = false;
                            this.canAct = false;
                        }
                    } else if (!this.destroy_target_init) {
                        this.canAct = true;
                        Object3dFactory.ToDestroyObject(this.object.object3D);
                        this.destroy_target_init = true;
                    }
                }
                break;
        }
    }

    private RemoveBuildObject()
    {
        if (this.state === BUILD_STATE.BUILDING) {
            this.object.RemoveFromScene();
            delete this.object;
        }
    }
}
