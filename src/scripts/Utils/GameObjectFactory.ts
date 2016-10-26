
/// Factory Game Objects
abstract class GameObjectFactory
{
    static GetNewObject(type: GAME_OBJECT_TYPE): GameObject
    {
        var result: GameObject;
        switch (type) {
            case GAME_OBJECT_TYPE.TREE:
                result = new Tree(0, 0);
                break;
            case GAME_OBJECT_TYPE.ROCK:
                result = new Rock(0, 0);
                break;
            case GAME_OBJECT_TYPE.WALL:
                result = new Wall(0, 0);
                break;
            case GAME_OBJECT_TYPE.TOWER:
                result = new Tower(0, 0);
                break;
            default:
                console.error("Unknown GameObject Type : " + GAME_OBJECT_TYPE[type]);
        }
        return result;
    }
}
