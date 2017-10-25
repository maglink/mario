module.exports = function(game) {
    var _self = this;

    _self.game = game;

    _self.bodyIdCointer = 0;
    _self.bodies = {};

    _self.AddBody = function(options) {
        var id = "body_" + _self.bodyIdCointer++;
        var body = {
            id: id,
            physics: {
                isStatic: options.isStatic,
                x: options.x || 0,
                y: options.y || 0,
                vx: options.vx || 0,
                vy: options.vy || 0,
                width: options.width || 1,
                height: options.height || 1
            },
            renderer: {
                image: options.image,
                flip: options.flip
            }
        };
        _self.bodies[id] = body;
        return body;
    };

    _self.LoadMap = function (mapData, texturePrefix) {
        try {
            if(mapData["renderorder"] !== "left-up") {
                return new Error("the order of tiles map not acceptable");
            }

            var map = {};
            var tiles = _self.loadTilePacks(mapData);
            for(var i=0;i<mapData.layers.length;i++) {
                var layer = mapData.layers[i];
                if(layer.type === "tilelayer"){
                    _self.loadGrid(map, layer, tiles, texturePrefix)
                }
            }
            map.tileheight = mapData.tileheight;
            map.tilewidth = mapData.tilewidth;

            _self.map = map;
        } catch (err) {
            return err;
        }
    };

    _self.loadTilePacks = function(data) {
        var tiles = {};

        for(var i=0;i<data.tilesets.length;i++) {
            var tileset = data.tilesets[i];
            var start = tileset.firstgid;
            Object.keys(tileset.tiles).forEach(function(key){
                var tile = tileset.tiles[key];
                key = Number(key);
                tiles[start+key] = tile;
            })
        }

        return tiles;
    };

    _self.loadGrid = function(map, layer, tiles, imagePrefix) {
        map.grid = [];

        var count = 0;
        for(var i=0;i<layer.height;i++) {
            map.grid[i] = [];
            for(var j=0;j<layer.width;j++) {
                var tileType = layer.data[count++];
                if(tileType === 0) {
                    map.grid[i][j] = null;
                    continue;
                }

                var imageUrl = imagePrefix + tiles[tileType].image;
                _self.game.renderer.LoadImage(imageUrl);

                map.grid[i][j] = {
                    image: imageUrl
                };
            }
        }
    };


    return _self;
};