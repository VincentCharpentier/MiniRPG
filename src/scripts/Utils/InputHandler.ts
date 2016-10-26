

/// Catch native DOM inputs
namespace InputHandler
{
    interface Bindings
    {
        keydown: { [key: number]: Array<number> },
        keyup: { [key: number]: Array<number> },
        [key: string]: any
    }

    const DefaultBindings: { [key: string]: any } = {
        keydown: [
            [KEY.UP_ARROW, PLAYER_INPUT.PLAYER_MOVE_UP],
            [KEY.DOWN_ARROW, PLAYER_INPUT.PLAYER_MOVE_DOWN],
            [KEY.LEFT_ARROW, PLAYER_INPUT.PLAYER_MOVE_LEFT],
            [KEY.RIGHT_ARROW, PLAYER_INPUT.PLAYER_MOVE_RIGHT],
            [KEY.Z, PLAYER_INPUT.PLAYER_MOVE_UP],
            [KEY.S, PLAYER_INPUT.PLAYER_MOVE_DOWN],
            [KEY.Q, PLAYER_INPUT.PLAYER_MOVE_LEFT],
            [KEY.D, PLAYER_INPUT.PLAYER_MOVE_RIGHT]
        ],
        keyup: [
            [KEY.UP_ARROW, PLAYER_INPUT.PLAYER_STOP_UP],
            [KEY.DOWN_ARROW, PLAYER_INPUT.PLAYER_STOP_DOWN],
            [KEY.LEFT_ARROW, PLAYER_INPUT.PLAYER_STOP_LEFT],
            [KEY.RIGHT_ARROW, PLAYER_INPUT.PLAYER_STOP_RIGHT],
            [KEY.Z, PLAYER_INPUT.PLAYER_STOP_UP],
            [KEY.S, PLAYER_INPUT.PLAYER_STOP_DOWN],
            [KEY.Q, PLAYER_INPUT.PLAYER_STOP_LEFT],
            [KEY.D, PLAYER_INPUT.PLAYER_STOP_RIGHT],
            [KEY.B, PLAYER_INPUT.PLAYER_TOGGLE_BUILD_MODE],
            [KEY.E, PLAYER_INPUT.PLAYER_BUILD_ROTATE_CLOCK],
            [KEY.A, PLAYER_INPUT.PLAYER_BUILD_ROTATE_ANTICLOCK],
        ]
    };

    var bindings: Bindings;

    export function Init()
    {
        var defaultToCurrent = (binding_type: string) =>
        {
            bindings[binding_type] = DefaultBindings[binding_type].reduce((p: { [key: number]: Array<number> }, c: { [key: number]: number }) =>
            {
                if (!p[c[0]]) {
                    p[c[0]] = [];
                }
                p[c[0]].push(c[1]);
                return p;
            }, Object.create(null));
        }
        bindings = Object.create(null);
        defaultToCurrent("keydown");
        defaultToCurrent("keyup");

        window.addEventListener("keydown", Keydown);
        window.addEventListener("keyup", Keyup);
        AppController.view.canvas.addEventListener("mousedown", ClickStart);
        AppController.view.canvas.addEventListener("mouseup", ClickEnd);
        window.addEventListener("mousemove", MouseMove);
        window.addEventListener("contextmenu", (e) =>
        {
            e.preventDefault();
            return false;
        });
        window.addEventListener("wheel", (e) =>
        {
            if (e.deltaY < 0) {
                AppController.view.ZoomIn();
            } else {
                AppController.view.ZoomOut();
            }
        });
        window.addEventListener('resize', () =>
        {
            AppController.view.onWindowResize();
        }, false);
    }

    function Keydown(ev: KeyboardEvent)
    {
        var input: Array<PLAYER_INPUT> = bindings.keydown[ev.which];
        if (typeof (input) !== "undefined") {
            for (var i = 0; i < input.length; i++) {
                AppController.OnPlayerInput(input[i]);
            }
            ev.preventDefault();
            return false;
        }
    }

    function Keyup(ev: KeyboardEvent)
    {
        var input: Array<PLAYER_INPUT> = bindings.keyup[ev.which];
        if (typeof (input) !== "undefined") {
            for (var i = 0; i < input.length; i++) {
                AppController.OnPlayerInput(input[i]);
            }
            ev.preventDefault();
            return false;
        }
    }

    function ClickStart(ev: KeyboardEvent)
    {
        // console.log(ev);
    }

    function ClickEnd(ev: KeyboardEvent)
    {
        switch (ev.which) {
            case 1:
                LeftClick(ev);
                break;
            case 2:
                MiddleClick(ev);
                break;
            case 3:
                RightClick(ev);
                break;
        }
    }

    function LeftClick(ev: Event)
    {
        AppController.OnClick();
    }

    function MiddleClick(ev: Event)
    {

    }

    function RightClick(ev: Event)
    {
        AppController.OnRightClick();
    }

    function MouseMove(ev: MouseEvent)
    {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        AppController.OnMouseMove(new THREE.Vector2(
            (ev.clientX / window.innerWidth) * 2 - 1,
            -(ev.clientY / window.innerHeight) * 2 + 1
        ));
    }
}
