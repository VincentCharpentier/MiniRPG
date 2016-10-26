// Singleton

class View
{
    public canvas: HTMLElement;
    public scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.Camera;
    private raycaster: THREE.Raycaster;

    private ground: THREE.Object3D;

    constructor()
    {
        this.scene = new THREE.Scene();


        this.raycaster = new THREE.Raycaster();
        // add a renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // add a camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        // add the renderer element to the DOM so it is in our page
        this.canvas = this.renderer.domElement;
        document.body.appendChild(this.canvas);
        /* INVISIBLE GROUND */
        this.ground = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(500, 500, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0x248f24, alphaTest: 0, visible: false
            }));
        this.ground.rotation.x = -Math.PI / 2;
        this.scene.add(this.ground);

        // this.cursor = Object3dFactory.GetNewObject(GAME_OBJECT_TYPE.TREE, true);
        // this.cursor = new THREE.Mesh(
        //     new THREE.PlaneGeometry(1, 1),
        //     new THREE.MeshBasicMaterial({
        //         color: 0xff0000, opacity: 0.5, transparent: true
        //     })
        // );
        // this.cursor.rotation.x = -Math.PI / 2;
        // this.cursor.position.y = 0.01;
        // this.scene.add(this.cursor);

        this.sun = new THREE.HemisphereLight(0xffffff, 10);
        this.sun.position.set(0, 50, 0);
        this.scene.add(this.sun);

        // this.moon = new THREE.HemisphereLight(0xffffff, 0);
        // this.moon.position.set(0, -50, 0);
        // this.scene.add(this.moon);
    }
    private sun: THREE.HemisphereLight;
    // private moon: THREE.HemisphereLight;

    public GetMouseWorldCoord(): THREE.Vector2
    {
        var pCoord = PlayerController.GetCoord(true);
        this.ground.position.x = pCoord.x;
        this.ground.position.z = pCoord.y;
        var result = new THREE.Vector2();
        this.raycaster.setFromCamera(AppController.mouse_screen_position, this.camera);
        var inter = this.raycaster.intersectObject(this.ground);
        if (inter.length > 0) {
            result.x = Math.floor(inter[0].point.x) + 0.5;
            result.y = Math.floor(inter[0].point.z) + 0.5;
        }
        return result;
    }

    private _targetedObject: GameObject;
    private targetEvaluated = false;
    public GetTargetedObject(): GameObject
    {
        if (!this.targetEvaluated) {
            var intersects = this.raycaster.intersectObjects(this.scene.children, true);
            if (intersects.length > 0) {
                var result = intersects[0].object;
                while (!result.userData["reference"] && result.parent) {
                    result = result.parent;
                }
                this._targetedObject = result.userData["reference"];
            } else {
                this._targetedObject = null;
            }
            this.targetEvaluated = true;
        }
        return this._targetedObject;
    }

    public static ZOOM_GAP = 5;
    public static ZOOM_MAX = 20;
    public static ZOOM_MIN = 70;

    public ZoomIn()
    {
        if (View.VIEW_DISTANCE > View.ZOOM_MAX) {
            View.VIEW_DISTANCE -= View.ZOOM_GAP;
        }
    }

    public ZoomOut()
    {
        if (View.VIEW_DISTANCE < View.ZOOM_MIN) {
            View.VIEW_DISTANCE += View.ZOOM_GAP;
        }
    }

    public onWindowResize()
    {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
    }

    // distance de la caméra au joueur
    public static VIEW_DISTANCE = 50;
    // inclinaison de la caméra
    public static VIEW_ANGLE = (5 / 8) * (Math.PI / 2);
    public Render(): void
    {
        this.targetEvaluated = false;
        var playerCoord = PlayerController.GetCoord(true);

        // hauteur camera
        this.camera.position.y = View.VIEW_DISTANCE * Math.sin(View.VIEW_ANGLE);
        // décalage au sol
        this.camera.position.x = playerCoord.x;
        this.camera.position.z = playerCoord.y + View.VIEW_DISTANCE * Math.cos(View.VIEW_ANGLE);
        // Look down
        this.camera.rotation.x = -View.VIEW_ANGLE;

        this.renderer.render(this.scene, this.camera);
    }

    private day_length = 10 * 1000;
    private sun_distance = 50;

    private time_from_rising = 0;
    public Tick(dt: number)
    {
        // var coord = PlayerController.GetCoord();
        // this.sun.position.x = coord.x;
        // this.sun.position.z = coord.y;
        // this.time_from_rising += dt;
        // if (this.time_from_rising > this.day_length) {
        //     this.time_from_rising -= this.day_length;
        // }
        // if (this.time_from_rising > this.day_length / 2) {
        //     // night
        //     var factor = Math.abs(Math.abs(this.time_from_rising - this.day_length / 2) / (this.day_length / 2) - 0.5) * 2;
        //     this.sun.intensity = factor;
        //     this.moon.intensity = .05 * (1 - factor);
        // } else {
        //     // this.sun.intensity = 1;
        //     // this.moon.intensity = 0;
        // }
        // var factor = this.time_from_rising / this.day_length;
        // var angle = factor * Math.PI * 2;
        // this.sun.position.x = Math.cos(angle) * this.sun_distance;
        // this.sun.position.y = Math.sin(angle) * this.sun_distance / 2;
        // this.moon.position.x = Math.cos(angle + Math.PI) * this.sun_distance;
        // this.moon.position.y = Math.sin(angle + Math.PI) * this.sun_distance / 2;
    }
}
