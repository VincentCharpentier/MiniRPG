abstract class GameObject
{
    private static NextId: number = 0;

    public currentChunk: Chunk;

    public coord: THREE.Vector2;
    public rotation: number;
    public object3D: THREE.Object3D;

    private type: GAME_OBJECT_TYPE;
    private id: number;

    // BBOX
    public BBox: THREE.Box2;

    // Caracteristiques
    public health: number;
    public is_loot: boolean = false;
    public is_built: boolean = false;

    // ------- DEBUG
    public positionInd: THREE.Object3D;
    public bboxInd: THREE.Object3D;
    // ------- END DEBUG

    constructor(x: number, y: number, type: GAME_OBJECT_TYPE)
    {
        this.type = type;
        this.id = GameObject.NextId++;
        var config = this.GetConfig();
        // Position
        this.coord = new THREE.Vector2(x, y);
        this.rotation = 0;
        if (!config.BBox.offset) {
            config.BBox.offset = { x: 0, y: 0 };
        }
        this.UpdateBBox();
        // Caracteristiques
        this.health = config.HP;

        // ------- DEBUG
        // POSITION INDICATOR
        if (GameConfig.DEBUG.GAMEOBJECTS.POSITION_VISIBLE) {
            let plane = new THREE.PlaneGeometry(1, 1);
            this.positionInd = new THREE.Mesh(
                plane,
                new THREE.MeshBasicMaterial({
                    color: 0xff0000
                })
            );
            this.positionInd.position.x = this.coord.x;
            this.positionInd.position.z = this.coord.y;
            this.positionInd.position.y = 0.05;
            this.positionInd.rotation.x = -Math.PI / 2;
        }

        // BBOX INDICATOR
        if (GameConfig.DEBUG.GAMEOBJECTS.BBOX_VISIBLE) {
            let plane = new THREE.PlaneGeometry(config.BBox.width, config.BBox.height);
            this.bboxInd = new THREE.Mesh(
                plane,
                new THREE.MeshBasicMaterial({
                    wireframe: true
                })
            );
            this.bboxInd.position.x = this.coord.x;
            this.bboxInd.position.z = this.coord.y;
            this.bboxInd.position.y = 0.1;
            this.bboxInd.rotation.x = -Math.PI / 2;
        }
        // ------- END DEBUG
        // 3D
        this.Reset3dModel();

        if (GameConfig.DEBUG.GAMEOBJECTS.TRANSPARENT) {
            Object3dFactory.ToTransparentObject(this.object3D);
        }
    }


    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PUBLIC ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    public GetId()
    {
        return this.id;
    }

    public Tick(dt: number) { }

    public Reset3dModel()
    {
        if (this.object3D) {
            this.RemoveFromScene();
        }
        this.object3D = Object3dFactory.GetNewObject(this.GetType());
        this.object3D.userData["reference"] = this;
        this.AddInScene();
        this.PositionUpdated();
    }

    public Rotate(angle: number)
    {
        this.rotation = (this.rotation + angle) % (Math.PI * 2);
        this.UpdateBBox();
    }

    public PositionUpdated()
    {
        ChunkController.UpdateChunk(this);
        this.UpdateBBox();
        var size = this.BBox.size();
        this.object3D.position.x = this.coord.x + size.width / 2;
        this.object3D.position.z = this.coord.y + size.height / 2;
        this.object3D.rotation.y = this.rotation;
        // ------- DEBUG
        if (GameConfig.DEBUG.GAMEOBJECTS.POSITION_VISIBLE) {
            this.positionInd.position.x = this.coord.x + 0.5;
            this.positionInd.position.z = this.coord.y + 0.5;
        }
        if (GameConfig.DEBUG.GAMEOBJECTS.BBOX_VISIBLE) {
            this.bboxInd.position.x = this.coord.x + size.width / 2;
            this.bboxInd.position.z = this.coord.y + size.height / 2;
            this.bboxInd.rotation.z = this.rotation;
        }
        // ------- END DEBUG

    }

    public RemoveFromScene()
    {
        AppController.view.scene.remove(this.object3D);
        // ------- DEBUG
        if (GameConfig.DEBUG.GAMEOBJECTS.POSITION_VISIBLE) {
            AppController.view.scene.remove(this.positionInd);
        }
        if (GameConfig.DEBUG.GAMEOBJECTS.BBOX_VISIBLE) {
            AppController.view.scene.remove(this.bboxInd);
        }
        // ------- END DEBUG
    }

    public AddInScene()
    {
        AppController.view.scene.add(this.object3D);
        // ------- DEBUG
        if (GameConfig.DEBUG.GAMEOBJECTS.POSITION_VISIBLE) {
            AppController.view.scene.add(this.positionInd);
        }
        if (GameConfig.DEBUG.GAMEOBJECTS.BBOX_VISIBLE) {
            AppController.view.scene.add(this.bboxInd);
        }
        // ------- END DEBUG
    }

    public IsHit(force: number)
    {
        this.health -= force;
        this.Blink();
        if (this.health <= 0) {
            this.Die();
        }
    }

    public Die()
    {
        this.AfterDeath();
        this.Destroy();
    }

    public UnBuild()
    {
        this.AfterUnBuild();
        this.Destroy();
    }


    public DistanceTo(obj: GameObject): number
    {
        if (this.BBox.intersectsBox(obj.BBox)) {
            return 0;
        }
        var points = obj.GetBoundingPoints();
        var min = 1e50;
        for (let p of points) {
            let dist = this.BBox.distanceToPoint(p);
            if (dist < min) {
                min = dist;
            }
        }
        return min;
    }

    public GetCenter(): THREE.Vector2
    {
        return this.BBox.center();
    }

    public GetConfig(): IEntityConfig
    {
        return GameConfig.GetEntityConf(this.type);
    }

    public GetType(): GAME_OBJECT_TYPE
    {
        return this.type;
    }


    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PROTECTED ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    protected Destroy()
    {
        this.RemoveFromScene();
        GameController.UnRegisterGameObject(this);
    }

    protected AfterDeath() { }
    protected AfterUnBuild() { }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PRIVATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    private UpdateBBox()
    {
        switch (this.rotation) {
            case 0:
            case -Math.PI:
            case Math.PI:
                this.BBox = new THREE.Box2(
                    this.coord,
                    new THREE.Vector2(
                        this.coord.x + this.GetConfig().BBox.width,
                        this.coord.y + this.GetConfig().BBox.height
                    )
                );
                break;
            case -3 * Math.PI / 2:
            case Math.PI / 2:
            case -Math.PI / 2:
            case 3 * Math.PI / 2:
                this.BBox = new THREE.Box2(
                    this.coord,
                    new THREE.Vector2(
                        this.coord.x + this.GetConfig().BBox.height,
                        this.coord.y + this.GetConfig().BBox.width
                    )
                );
                break;
            default:
                console.error("rotation unknown", this.rotation);
                break;
        }
    }

    private GetBoundingPoints(): Array<THREE.Vector2>
    {
        var size = this.BBox.size();
        return [
            this.BBox.min, this.BBox.max,
            new THREE.Vector2(
                this.BBox.min.x + size.width,
                this.BBox.min.y
            ),
            new THREE.Vector2(
                this.BBox.min.x,
                this.BBox.min.x + size.height
            )
        ];
    }

    private blink_elements: Array<IBlinking> = new Array();
    private blink_timer: number;
    private blink_time: number = 200;
    private Blink()
    {
        var me = this;
        clearTimeout(this.blink_timer);
        this.blink_timer = setTimeout(function() { me.RevertBlink(); }, this.blink_time);
        this.object3D.traverse(function(node: THREE.Mesh)
        {
            var material = <THREE.MeshLambertMaterial>node.material;
            if (material && material.emissive) {
                me.blink_elements.push({
                    element: node,
                    baseMaterial: node.material

                });
                var newMaterial = material.clone();
                newMaterial.emissive.setRGB(255, 0, 0);
                node.material = newMaterial;
            }
        });
    }

    private RevertBlink()
    {
        var e: IBlinking;
        while (e = this.blink_elements.pop()) {
            e.element.material = e.baseMaterial;
        }
    }
}

interface IBlinking
{
    element: THREE.Mesh,
    baseMaterial: THREE.Material
}
