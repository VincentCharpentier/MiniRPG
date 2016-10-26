namespace GameController
{
    var game: Game;

    export function Init()
    {
        ChunkController.Init();
        game = new Game();
        InterfaceHandler.Init();
        InventoryController.Init();
        RegisterGameObject(game.player);
        PlayerController.Init(game.player);
        InputHandler.Init();
        InterfaceHandler.UpdateInventoryUI();

        // Init all chunks with content
        ChunkController.ForEach((chunk) =>
        {
            InitChunk(chunk);
        })
    }

    function InitChunk(chunk: Chunk)
    {
        var nb_tree = Math.random() * 15;
        var nb_rock = Math.random() * 3;
        for (var i = 0; i < nb_tree; i++) {
            let o = new Tree(0, 0);
            do {
                o.rotation = Math.round(Math.random() * 3) * (Math.PI / 2);
                o.coord.x = chunk.coord.x + Math.floor(Math.random() * Config.Chunk.SIZE);
                o.coord.y = chunk.coord.y + Math.floor(Math.random() * Config.Chunk.SIZE);
                o.PositionUpdated();
            } while (CheckForCollision(o).length > 0);
            RegisterGameObject(o);
        }
        for (var i = 0; i < nb_rock; i++) {
            let o = new Rock(0, 0);
            do {
                o.rotation = Math.round(Math.random() * 3) * (Math.PI / 2);
                o.coord.x = chunk.coord.x + Math.floor(Math.random() * Config.Chunk.SIZE);
                o.coord.y = chunk.coord.y + Math.floor(Math.random() * Config.Chunk.SIZE);
                o.PositionUpdated();
            } while (CheckForCollision(o).length > 0);
            RegisterGameObject(o);
        }
    }

    export function RegisterGameObject(obj: GameObject): void
    {
        ChunkController.RegisterGameObject(obj);
        // game.objects[obj.GetId()] = obj;
    }

    export function UnRegisterGameObject(obj: GameObject): void
    {
        ChunkController.UnRegisterGameObject(obj);
    }

    export function Start(): void
    {
        game.Start();
    }

    export function IsRunning(): boolean
    {
        return !game.paused;
    }

    export function Tick(dt: number): void
    {
        AppController.view.Tick(dt);
        ChunkController.ForEach((chunk) =>
        {
            chunk.Tick(dt);
        })
        ChunkController.UpdateChunkRendering();
        // game.Tick(dt);
    }

    function GetSurroundingObjects(obj: GameObject): Array<GameObject>
    {
        var maxDist = 10;
        var result = new Array();
        var chunks = ChunkController.GetChunksInZone(obj.coord, maxDist);
        for (let c of chunks) {
            c.ForEach((o) =>
            {
                result.push(o);
            })
        }
        return result;
    }

    export function CheckForCollision(obj: GameObject): Array<GameObject>
    {
        var result = new Array();
        for (let o of GetSurroundingObjects(obj)) {
            if (o !== obj) {
                var inter = o.BBox.clone().intersect(obj.BBox).size();
                if (inter.width > 0 && inter.height > 0) {
                    result.push(o);
                }
            }
        }
        return result;
    }
}
