
/// Factory for 3D Objects
abstract class Object3dFactory
{
    private static objects: { [key: string]: THREE.Object3D };
    private static buildMaterial: THREE.MeshBasicMaterial;
    private static destroyMaterial: THREE.MeshBasicMaterial;

    static Init(callback: Function)
    {

        var loads_todo = 0,
            loads_done = 0;
        var entities = GameConfig.GetEntities();
        for (var k in entities) {
            loads_todo++;
        }
        var checkIfDone = function()
        {
            if (loads_todo === loads_done) {
                callback();
            }
        }
        Object3dFactory.objects = Object.create(null);
        var loader = new THREE.ObjectLoader();
        for (let k in entities) {
            let key = k;
            loader.load("assets/models/" + entities[key].Model3d + ".json",
                function(o: THREE.Object3D) // onLoad
                {
                    var box = new THREE.Box3().setFromObject(o);
                    o.userData["size"] = {
                        x: box.max.x,
                        y: box.max.z
                    };
                    Object3dFactory.objects[entities[key].type] = o;
                    loads_done++;
                    checkIfDone();
                });
        }

        Object3dFactory.buildMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0.5
        });
        Object3dFactory.destroyMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.5
        });
    }

    static GetNewObject(type: GAME_OBJECT_TYPE): THREE.Object3D
    {
        return Object3dFactory.objects[type].clone();
    }

    static ToBuildObject(obj: THREE.Object3D)
    {
        obj.traverse(function(node: THREE.Mesh)
        {
            if (node.material) {
                node.material = Object3dFactory.buildMaterial;
            }
        });
    }

    static ToDestroyObject(obj: THREE.Object3D)
    {
        obj.traverse(function(node: THREE.Mesh)
        {
            if (node.material) {
                node.material = Object3dFactory.destroyMaterial;
            }
        });
    }

    static ToTransparentObject(obj: THREE.Object3D)
    {
        obj.traverse(function(node: THREE.Mesh)
        {
            if (node.material) {
                node.material.transparent = true;
                node.material.opacity = .5;
            }
        });
    }
}
