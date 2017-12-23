module.exports.AddEnimies = function (game, char) {

    var mushroomImage = new game.renderer.animation({
        imagesCount: 2,
        imageUrl: function(i) {
            return "files/enemies/enemy_1-" +(i+1)+ ".png"
        },
        playSpeed: 1000/5
    });

    var mushroomImageStatic = game.renderer.LoadImage("files/enemies/enemy_1-1.png");
    var mushroomDieImage = game.renderer.LoadImage("files/enemies/enemy_1-3.png");

    var turtleImage = new game.renderer.animation({
        imagesCount: 2,
        imageUrl: function(i) {
            return "files/enemies/enemy_2-" +(i+1)+ ".png"
        },
        playSpeed: 1000/5
    });
    var turtleImageCup = game.renderer.LoadImage("files/enemies/enemy_2-3.png");

    function AddEnemyMushroom(zoneName) {
        var enemy = game.world.AddBody({
            type: 'enemy',
            image: mushroomImage.Play()
        });
        game.world.SetBodyPositionByZone(enemy, zoneName);

        var side = -1;
        var runInterval = setInterval(function () {
            enemy.physics.vx = side * 2;
        }, 1000/30);

        function epicDie() {
            game.addGamePoints(100);
            game.sounds.Play('squish');
            clearInterval(runInterval);
            enemy.renderer.front = true;
            enemy.renderer.image = mushroomImageStatic;
            enemy.renderer.flipY = true;
            enemy.physics.noCollideObjects = true;
            enemy.physics.friction = 0.000001;
            enemy.physics.vx *= 3;
            var g = 200;
            var vy = 80;
            var count = 0;
            var interval = setInterval(function () {
                count+=1000/30;
                if(count >= 3000) {
                    clearInterval(interval);
                    game.world.RemoveBody(enemy);
                    return;
                }

                vy += -g/30;
                enemy.renderer.yOffset += vy/30;
            }, 1000/30);
        }

        game.world.AddBodyEventListener(enemy, 'onZoneIn', function (zone) {
            if(zone.name === "kill_zone") {
                game.world.RemoveBody(enemy);
            }
        });
        game.world.AddBodyEventListener(enemy, 'onGridTouch', function (event) {
            if(event.cells[0].dangerous){
                epicDie(enemy.physics.vx);
            }
            if(event.side === 'left' || event.side === 'right') {
                side *= -1;
            }
        });

        enemy.physics.collideObjectsFilter = function(other){
            if(other === char.body && char.isStarman) {
                epicDie(char.body.physics.vx);
                return false;
            }

            if(other.type === 'tbullet') {
                epicDie(char.body.physics.vx);
                return false;
            }
            return true;
        };

        game.world.AddBodyEventListener(enemy, 'onObjectTouch', function (event) {
            if(event.object.type === 'bullet') {
                epicDie(event.object.physics.vx);
                return;
            }


            if(event.side === 'left' || event.side === 'right') {
                side *= -1;
            } else if(event.object === char.body) {
                event.object.physics.vy = 5;
                game.addGamePoints(100);
                game.sounds.Play('squish');
                clearInterval(runInterval);
                enemy.renderer.image = mushroomDieImage;
                enemy.physics.collideObjectsFilter = function(other){
                    return other !== char.body
                };
                enemy.physics.bounce = 0;
                enemy.physics.vx = 0;
                enemy.physics.vy = 0;
                enemy.physics.isStatic = true;

                setTimeout(function () {
                    game.world.RemoveBody(enemy);
                }, 2000);
            }
        });
        game.world.AddBodyEventListener(enemy, 'onDestroy', function (event) {
            clearInterval(runInterval);
        });
    }


    function AddEnemyTurtle(zoneName) {
        var enemy = game.world.AddBody({
            type: 'enemy',
            image: turtleImage.Play()
        });
        game.world.SetBodyPositionByZone(enemy, zoneName);
        enemy.renderer.yOffset = -8;

        var side = -1;
        var runInterval = setInterval(function () {
            enemy.physics.vx = side * 2;
            if(side > 0) {
                enemy.renderer.flip = true;
            } else {
                enemy.renderer.flip = false;
            }
        }, 1000/30);

        function epicDie() {
            game.addGamePoints(100);
            game.sounds.Play('squish');
            clearInterval(runInterval);
            enemy.renderer.front = true;
            enemy.renderer.image = turtleImageCup;
            enemy.renderer.flipY = true;
            enemy.physics.noCollideObjects = true;
            enemy.physics.friction = 0.000001;
            enemy.physics.vx *= 3;
            var g = 200;
            var vy = 80;
            var count = 0;
            var interval = setInterval(function () {
                count+=1000/30;
                if(count >= 3000) {
                    clearInterval(interval);
                    game.world.RemoveBody(enemy);
                    return;
                }

                vy += -g/30;
                enemy.renderer.yOffset += vy/30;
            }, 1000/30);
        }

        game.world.AddBodyEventListener(enemy, 'onZoneIn', function (zone) {
            if(zone.name === "kill_zone") {
                game.world.RemoveBody(enemy);
            }
        });
        game.world.AddBodyEventListener(enemy, 'onGridTouch', function (event) {
            if(event.side === 'left' || event.side === 'right') {
                side *= -1;
            }
        });

        enemy.physics.collideObjectsFilter = function(other){
            if(other === char.body && char.isStarman) {
                epicDie(char.body.physics.vx);
                return false;
            }
            if(other.type === 'tbullet') {
                epicDie(char.body.physics.vx);
                return false;
            }
            return true;
        };

        game.world.AddBodyEventListener(enemy, 'onObjectTouch', function (event) {
            if(enemy.type === "turtle_bullet") {
                game.sounds.Play('squish');
                setTimeout(function () {
                    enemy.type = "tbullet";
                }, 500);

                if(event.object.physics.x > enemy.physics.x) {
                    side = -1
                } else {
                    side = 1
                }
                runInterval = setInterval(function () {
                    enemy.physics.vx = side * 10;
                }, 1000/30);
                return
            }

            if(event.object.type === 'bullet') {
                epicDie(event.object.physics.vx);
                return;
            }

            if(event.side === 'left' || event.side === 'right') {
                side *= -1;
            } else if(event.object === char.body) {
                event.object.physics.vy = 5;
                game.addGamePoints(100);
                game.sounds.Play('squish');
                clearInterval(runInterval);
                enemy.renderer.image = turtleImageCup;
                enemy.physics.vx = 0;
                enemy.physics.vy = 0;
                enemy.type = "turtle_bullet"
            }
        });
        game.world.AddBodyEventListener(enemy, 'onDestroy', function (event) {
            clearInterval(runInterval);
        });
    }

    var Enemies = [];

    for(var i=1;i<=17;i++) {
        if(i === 9) {
            Enemies.push({
                name: "enemy_"+i,
                type: "turtle"
            })
        } else {
            Enemies.push({
                name: "enemy_"+i,
                type: "mushroom"
            })
        }
    }

    game.world.AddBodyEventListener(char.body, 'onZoneIn', function (zone) {
        for(var i in Enemies) {
            var enemy = Enemies[i];
            if(zone.name === enemy.name + '_trigger') {
                game.world.RemoveZoneByName(enemy.name + '_trigger');
                if(enemy.type === "mushroom") {
                    AddEnemyMushroom(enemy.name);
                }
                if(enemy.type === "turtle") {
                    AddEnemyTurtle(enemy.name);
                }
                return;
            }
        }
    });


};