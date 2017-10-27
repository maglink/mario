module.exports = function(game) {
    var _self = this;

    _self.game = game;

    _self.bodyIdCounter = 0;
    _self.bodies = {};

    _self.AddBody = function(options) {
        options = options || {};
        var id = "body_" + _self.bodyIdCounter++;
        var gap = 0.00000000001;
        var body = {
            id: id,
            physics: {
                isStatic: options.isStatic,
                x: options.x || 0,
                y: options.y || 0,
                vx: options.vx || 0,
                vy: options.vy || 0,
                width: options.width-gap || 1-gap,
                height: options.height-gap || 1-gap,
                density: options.density,
                bounce: options.bounce,
                friction: options.friction
            },
            renderer: {
                image: options.image,
                flip: options.flip
            }
        };
        if(options.mass) {
            body.physics.density = body.mass/body.physics.width*body.physics.height;
        }
        _self.bodies[id] = body;
        return body;
    };

    _self.LoadMap = function (mapData, texturePrefix) {
        try {
            if(mapData["renderorder"] !== "left-up") {
                return new Error("the order of tiles map not acceptable");
            }

            var map = {};

            map.tileheight = mapData.tileheight;
            map.tilewidth = mapData.tilewidth;
            map.backgroundcolor = mapData.backgroundcolor;

            var tiles = _self.loadTilePacks(mapData);
            for(var i=0;i<mapData.layers.length;i++) {
                var layer = mapData.layers[i];
                if(layer.type === "tilelayer" && layer.name === "base"){
                    _self.loadGrid(map, layer, tiles, texturePrefix)
                }
                if(layer.type === "tilelayer" && layer.name === "back"){
                    _self.loadBack(map, layer, tiles, texturePrefix)
                }
                if(layer.type === "objectgroup" && layer.name === "zones"){
                    _self.loadZones(map, layer, tiles, texturePrefix)
                }
            }

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

    _self.loadBack = function(map, layer, tiles, imagePrefix) {
        map.back = [];

        var count = 0;
        for(var i=0;i<layer.height;i++) {
            map.back[i] = [];
            for(var j=0;j<layer.width;j++) {
                var tileType = layer.data[count++];
                if(tileType === 0) {
                    map.back[i][j] = null;
                    continue;
                }

                var imageUrl = imagePrefix + tiles[tileType].image;
                _self.game.renderer.LoadImage(imageUrl);

                map.back[i][j] = {
                    image: imageUrl
                };
            }
        }
    };

    _self.loadZones = function(map, layer, tiles, imagePrefix) {
        map.zones = [];

        layer.objects.forEach(function (item) {
            var zone = {
                name: item.name,
                x: item.x/map.tilewidth,
                y: -item.y/map.tileheight,
                width: item.width/map.tilewidth,
                height: item.height/map.tileheight
            };

            zone.centerX = zone.x+zone.width/2;
            zone.centerY = zone.y-zone.height/2;

            map.zones.push(zone);
        })
    };

    _self.SetBodyPositionByZone = function (body, zoneName) {
        var zone = _self.map.zones.filter(function(zone){return zone.name === zoneName;})[0];
        if(zone) {
            body.physics.x = zone.centerX - body.physics.width/2;
            body.physics.y = zone.centerY + body.physics.height/2;
        }
    };


    return _self;
};