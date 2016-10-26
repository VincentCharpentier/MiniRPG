abstract class BuildObject extends GameObject
{
    constructor(x: number, y: number, type: GAME_OBJECT_TYPE)
    {
        super(x, y, type);
        this.is_built = true;
    }

    public GetBuildNeeds(): Array<IBuildNeed>
    {
        return this.GetConfig().BuildConfig.Needs;
    }

    private static RessourceCashBackRatio = 0.5;
    protected AfterUnBuild()
    {
        // restore a part of build ressources
        var needs = this.GetBuildNeeds();
        for (let need of needs) {
            InventoryController.AddItem(
                need.type,
                Math.round(need.count * BuildObject.RessourceCashBackRatio)
            );
        }
    }
}
