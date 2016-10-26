namespace PlayerController
{
    var player: Player;

    export function Init(_player: Player)
    {
        player = _player;
    }

    export function getPlayer()
    {
        return player;
    }

    export function OnInput(input: PLAYER_INPUT)
    {
        switch (input) {
            // PLAYER MOVES
            case PLAYER_INPUT.PLAYER_MOVE_LEFT:
                player.is_moving.left = true;
                player.is_moving.right = false;
                break;
            case PLAYER_INPUT.PLAYER_MOVE_RIGHT:
                player.is_moving.right = true;
                player.is_moving.left = false;
                break;
            case PLAYER_INPUT.PLAYER_MOVE_UP:
                player.is_moving.up = true;
                player.is_moving.down = false;
                break;
            case PLAYER_INPUT.PLAYER_MOVE_DOWN:
                player.is_moving.down = true;
                player.is_moving.up = false;
                break;
            case PLAYER_INPUT.PLAYER_STOP_LEFT:
                player.is_moving.left = false;
                break;
            case PLAYER_INPUT.PLAYER_STOP_RIGHT:
                player.is_moving.right = false;
                break;
            case PLAYER_INPUT.PLAYER_STOP_UP:
                player.is_moving.up = false;
                break;
            case PLAYER_INPUT.PLAYER_STOP_DOWN:
                player.is_moving.down = false;
                break;
            // BUILD INPUTS
            case PLAYER_INPUT.PLAYER_TOGGLE_BUILD_MODE:
                if (player.GetState() === PLAYER_STATE.BUILDING) {
                    player.CancelBuild();
                } else {
                    InterfaceHandler.ToggleBuildInterface();
                }
                break;
            case PLAYER_INPUT.PLAYER_BUILD_ROTATE_CLOCK:
                player.buildSystem.Rotate(true);
                break;
            case PLAYER_INPUT.PLAYER_BUILD_ROTATE_ANTICLOCK:
                player.buildSystem.Rotate(false);
                break;
            // PLAYER ACTIONS
            case PLAYER_INPUT.PLAYER_ACTION1:
                player.Action1();
                break;
            case PLAYER_INPUT.PLAYER_ACTION2:
                player.Action2();
                break;
        }
    }

    export function DistanceToObject(obj: GameObject): number
    {
        return obj.DistanceTo(player);
    }

    export function DistanceToPoint(point: THREE.Vector2): number
    {
        return player.BBox.distanceToPoint(point);
    }

    export function GetCoord(center: boolean = false): THREE.Vector2
    {
        var result = new THREE.Vector2(
            player.coord.x,
            player.coord.y
        );
        if (center) {
            var size = player.BBox.size();
            result.x += size.width / 2;
            result.y += size.height / 2;
        }
        return result;
    }

    export function SetupBuild(type: GAME_OBJECT_TYPE)
    {
        player.SetupBuild(type);
    }

    export function SetupDestroy()
    {
        player.SetupDestroy();
    }

    export function CancelBuild()
    {
        player.CancelBuild();
    }

    export function GetState(): PLAYER_STATE
    {
        return player.GetState();
    }
}
