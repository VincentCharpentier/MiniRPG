// var t_Scene = window['THREE']['Scene'],
//     t_PerspectiveCamera = window['THREE']['PerspectiveCamera'],
//     t_WebGLRenderer = window['THREE']['WebGLRenderer'],
//     t_BoxGeometry = window['THREE']['BoxGeometry'],
//     t_MeshLambertMaterial = window['THREE']['MeshLambertMaterial'],
//     t_Mesh = window['THREE']['Mesh'],
//     t_PointLight = window['THREE']['PointLight'];


class AppController
{
    public static view: View;
    // public static game: Game;

    // Mouse position on screen
    public static mouse_screen_position: THREE.Vector2;
    // Mouse position in world
    public static mouse_world_position: THREE.Vector2;
    // Entity targeted by mouse
    public static GetMouseTarget(): GameObject
    {
        return AppController.view.GetTargetedObject();
    }

    // -- Debug
    private static stats_fps: Stats = new Stats();
    private static stats_mem: Stats = new Stats();
    // --

    public static Startup()
    {
        AppController.Load(AppController.Init);
    }

    public static Init()
    {
        /* INIT DEBUG */
        var div_stats = document.getElementById("stats");
        AppController.stats_fps.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        div_stats.appendChild(AppController.stats_fps.dom);
        AppController.stats_mem.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom
        div_stats.appendChild(AppController.stats_mem.dom);
        for (var i = 0; i < div_stats.children.length; i++) {
            var element = <HTMLDivElement>div_stats.children[i];
            element.style.marginTop = i * 48 + "px";
        }

        /* INIT COMPONENTS */
        AppController.mouse_screen_position = new THREE.Vector2();
        AppController.view = new View();
        GameController.Init();

        /* INITIAL TICK */
        GameController.Start();
        AppController.Tick();
    }

    public static Load(onLoadCallback: Function)
    {
        Object3dFactory.Init(onLoadCallback);
    }

    private static time: number;
    public static Tick()
    {
        var now = new Date().getTime(),
            dt = now - (AppController.time || now);
        AppController.time = now;

        AppController.stats_fps.begin();
        AppController.stats_mem.begin();

        if (GameController.IsRunning()) {
            AppController.mouse_world_position = AppController.view.GetMouseWorldCoord();
            GameController.Tick(dt);
        }
        AppController.view.Render();

        AppController.stats_fps.end();
        AppController.stats_mem.end();

        requestAnimationFrame(AppController.Tick);
    }

    public static OnPlayerInput(input: PLAYER_INPUT)
    {
        switch (input) {
            // INPUTS TO FORWARD TO THE GAME
            case PLAYER_INPUT.PLAYER_MOVE_LEFT:
            case PLAYER_INPUT.PLAYER_MOVE_RIGHT:
            case PLAYER_INPUT.PLAYER_MOVE_UP:
            case PLAYER_INPUT.PLAYER_MOVE_DOWN:
            case PLAYER_INPUT.PLAYER_STOP_LEFT:
            case PLAYER_INPUT.PLAYER_STOP_RIGHT:
            case PLAYER_INPUT.PLAYER_STOP_UP:
            case PLAYER_INPUT.PLAYER_STOP_DOWN:
            case PLAYER_INPUT.PLAYER_TOGGLE_BUILD_MODE:
            case PLAYER_INPUT.PLAYER_BUILD_ROTATE_CLOCK:
            case PLAYER_INPUT.PLAYER_BUILD_ROTATE_ANTICLOCK:
                if (GameController.IsRunning()) {
                    PlayerController.OnInput(input);
                }
                break;
        }
    }

    public static OnMouseMove(newCoord: THREE.Vector2)
    {
        AppController.mouse_screen_position = newCoord;
    }

    public static OnClick()
    {
        if (GameController.IsRunning()) {
            PlayerController.OnInput(PLAYER_INPUT.PLAYER_ACTION1);
        }
    }

    public static OnRightClick()
    {
        if (GameController.IsRunning()) {
            PlayerController.OnInput(PLAYER_INPUT.PLAYER_ACTION2);
        }
    }
}
