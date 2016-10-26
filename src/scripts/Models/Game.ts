class Game
{
    // public objects: { [key: number]: GameObject };
    public player: Player;
    public paused: boolean;

    constructor()
    {
        this.paused = true;
        // this.objects = Object.create(null);
        this.player = new Player(
            Config.Chunk.NB_PER_EDGE * Config.Chunk.SIZE / 2,
            Config.Chunk.NB_PER_EDGE * Config.Chunk.SIZE / 2
        );
    }

    public Tick(dt: number)
    {
        // for (var i in this.objects) {
        //     this.objects[i].Tick(dt);
        // }
    }

    public Start()
    {
        this.paused = false;
    }

    public Pause()
    {
        this.paused = true;
    }
}
