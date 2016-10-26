class Tree extends RessourceObject
{
    constructor(x: number, y: number)
    {
        super(x, y, GAME_OBJECT_TYPE.TREE);
    }

    public AfterDeath()
    {
        super.AfterDeath();
        GameController.RegisterGameObject(
            new TreeCut(this.coord.x, this.coord.y)
        );
    }
}
