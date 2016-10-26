class Chunk
{
    public static texture = THREE.ImageUtils.loadTexture("assets/textures/grass-texture.jpg");
    public static Base3dModel: THREE.Object3D;

    public coord: THREE.Vector2;
    public center: THREE.Vector2;

    public objects: { [key: number]: GameObject };

    private model3d: THREE.Object3D;
    private isInScene: boolean = false;

    constructor(x: number, y: number)
    {
        this.coord = new THREE.Vector2(x, y);
        this.center = new THREE.Vector2(
            x + Config.Chunk.SIZE / 2,
            y + Config.Chunk.SIZE / 2
        );
        this.model3d = Chunk.Base3dModel.clone();
        this.model3d.position.x = this.center.x;
        this.model3d.position.z = this.center.y;
        this.objects = Object.create(null);
    }

    public Show()
    {
        if (!this.isInScene) {
            this.isInScene = true;
            AppController.view.scene.add(this.model3d);
            this.ForEach((o) =>
            {
                o.AddInScene();
            });
        }
    }

    public Hide()
    {
        if (this.isInScene) {
            this.isInScene = false;
            AppController.view.scene.remove(this.model3d);
            this.ForEach((o) =>
            {
                o.RemoveFromScene();
            });
        }
    }

    public RegisterGameObject(o: GameObject)
    {
        this.objects[o.GetId()] = o;
        if (this.isInScene) {
            o.AddInScene();
        } else {
            o.RemoveFromScene();
        }
    }

    public UnRegisterGameObject(o: GameObject)
    {
        delete this.objects[o.GetId()];
    }

    public Tick(dt: number)
    {
        this.ForEach((o) =>
        {
            o.Tick(dt);
        });
    }

    public DistanceToPoint(point: THREE.Vector2): number
    {
        var d = {
            x: Math.abs(point.x - this.center.x),
            y: Math.abs(point.y - this.center.y)
        };
        var dist = Math.sqrt(d.x * d.x + d.y * d.y);
        // remove chunk radius to the distance
        dist = Math.max(0, dist - Config.Chunk.SIZE * Math.sqrt(2) / 2);
        return dist;
    }

    public ForEach(fct: (o: GameObject) => void)
    {
        for (var id in this.objects) {
            fct(this.objects[id]);
        }
    }
}
