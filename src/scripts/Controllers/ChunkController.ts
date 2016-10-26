namespace ChunkController
{
    var chunks: { [key: string]: Chunk };

    export function Init()
    {
        Chunk.texture.wrapS = THREE.RepeatWrapping;
        Chunk.texture.wrapT = THREE.RepeatWrapping;
        Chunk.texture.repeat.set(4, 4);
        Chunk.Base3dModel = new THREE.Mesh(
            new THREE.PlaneGeometry(Config.Chunk.SIZE, Config.Chunk.SIZE),
            new THREE.MeshLambertMaterial({ map: Chunk.texture })
        );
        Chunk.Base3dModel.rotation.x = -Math.PI / 2;

        chunks = Object.create(null);
        for (var i = 0; i < Config.Chunk.NB_PER_EDGE; i++) {
            for (var j = 0; j < Config.Chunk.NB_PER_EDGE; j++) {
                var coord = {
                    x: i * Config.Chunk.SIZE,
                    y: j * Config.Chunk.SIZE
                };
                chunks[GetChunkId(coord.x, coord.y)] = new Chunk(coord.x, coord.y);
            }
        }
    }

    export function ForEach(fct: (o: Chunk) => void)
    {
        for (var i in chunks) {
            fct(chunks[i]);
        }
    }

    export function RegisterGameObject(o: GameObject)
    {
        try {
            var chk = chunks[GetChunkId(o.coord.x, o.coord.y)];
            chk.RegisterGameObject(o);
            o.currentChunk = chk;
        } catch (e) {
            console.error(e);
            console.info(o);
            console.info(GetChunkId(o.coord.x, o.coord.y), chunks[GetChunkId(o.coord.x, o.coord.y)], chunks);
        }
    }

    export function UnRegisterGameObject(o: GameObject)
    {
        chunks[GetChunkId(o.coord.x, o.coord.y)].UnRegisterGameObject(o);
    }

    export function GetChunksInZone(coord: THREE.Vector2, radius: number): Array<Chunk>
    {
        var result = new Array();
        ForEach((chunk) =>
        {
            if (chunk.DistanceToPoint(coord) < radius) {
                result.push(chunk);
            }
        });
        return result;
    };

    export function UpdateChunk(obj: GameObject)
    {
        var chk = chunks[GetChunkId(obj.coord.x, obj.coord.y)];
        if (obj.currentChunk && obj.currentChunk !== chk) {
            obj.currentChunk.UnRegisterGameObject(obj);
            chk.RegisterGameObject(obj);
            obj.currentChunk = chk;
        }
    }

    export function UpdateChunkRendering()
    {
        ForEach((chunk) =>
        {
            if (chunk.DistanceToPoint(PlayerController.GetCoord(true))
                < Config.RenderDistance) {
                chunk.Show();
            } else {
                chunk.Hide();
            }
        });
    }

    function GetChunkId(x: number, y: number): string
    {
        return Math.floor(x / Config.Chunk.SIZE) + "." + Math.floor(y / Config.Chunk.SIZE);
    }

    function GetChunkForCoord(x: number, y: number): Chunk
    {
        var id = GetChunkId(x, y);
        if (chunks[id]) {
            return chunks[id];
        } else {
            return null;
        }
    }
}
