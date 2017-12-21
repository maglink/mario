module.exports.QuestionBlock = function (game) {
    var questionBlockImage = new game.renderer.animation({
        imagesCount: 12,
        imageUrl: function(i) {
            return "files/question_block/" +(i+1)+ ".png"
        },
        playSpeed: 1000/10,
        pauseBetweenLoops: 300
    });
    questionBlockImage.Play();

    var activatedImage = game.renderer.LoadImage("files/question_block/qbb.png");
    var mushroomImage = game.renderer.LoadImage("files/question_block/mushroom.png");
    var levelUpImage = game.renderer.LoadImage("files/question_block/level-up.png");

    var flowerImage = new game.renderer.animation({
        imagesCount: 4,
        imageUrl: function(i) {
            return "files/question_block/flower" +(i+1)+ ".png"
        },
        playSpeed: 1000/10
    });

    game.world.GetGridBlocksByType('question_block').forEach(function (block) {
        if(block.properties.hidden) {
            block.image = null;
            block.noCollideObjects = true;
        } else {
            block.image = questionBlockImage;

        }
        block.onTouch = function(params) {
            params = params || {};

            block.image = activatedImage;
            block.type = 'question_block_activated';
            block.onTouch = function(){
                game.sounds.Play('bump');
            };

            if(block.properties.hidden) {
                block.noCollideObjects = false;
            }

            blockjump(block);

            if(block.properties.prize === '1up') {
                game.sounds.Play('item');
                var mushroom = game.world.AddBody({
                    type: 'level-up',
                    x: block.x,
                    y: block.y + 1,
                    image: levelUpImage
                });
                (function(){
                    var count = 0;
                    mushroom.renderer.yOffset = 12;
                    var interval = setInterval(function () {
                        count++;
                        if(count < 30) {
                            mushroom.renderer.yOffset = ((30-count)/30)*12;
                        } else {
                            clearInterval(interval);
                            mushroom.renderer.yOffset = 0;

                            var side = 1;
                            var runInterval = setInterval(function () {
                                mushroom.physics.vx = side * 3;
                            }, 1000/30);
                            game.world.AddBodyEventListener(mushroom, 'onGridTouch', function (event) {
                                if(event.side === 'left' || event.side === 'right') {
                                    side *= -1;
                                }
                            });
                            game.world.AddBodyEventListener(mushroom, 'onObjectTouch', function (event) {
                                if(event.side === 'left' || event.side === 'right') {
                                    side *= -1;
                                }
                            });
                            game.world.AddBodyEventListener(mushroom, 'onDestroy', function (event) {
                                clearInterval(runInterval);
                            });
                        }
                    }, 1000/30);
                })();
            }

            if(block.properties.prize === 'coin') {
                addCoin(game, block)
            }

            if(block.properties.prize === 'mushroom' && params.marioMode !== 'small') {
                game.sounds.Play('item');
                var flower = game.world.AddBody({
                    type: 'flower',
                    width: 0.9,
                    x: block.x + 0.05,
                    y: block.y + 1,
                    image: flowerImage.Play()
                });
                (function(){
                    var count = 0;
                    flower.renderer.yOffset = 12;
                    var interval = setInterval(function () {
                        count++;
                        if(count < 30) {
                            flower.renderer.yOffset = ((30-count)/30)*12;
                        } else {
                            clearInterval(interval);
                            flower.renderer.yOffset = 0;
                        }
                    }, 1000/30);
                })();
            }
            else if(block.properties.prize === 'mushroom' && params.marioMode === 'small') {
                game.sounds.Play('item');
                var mushroom = game.world.AddBody({
                    type: 'mushroom',
                    x: block.x,
                    y: block.y + 1,
                    image: mushroomImage
                });
                (function(){
                    var count = 0;
                    mushroom.renderer.yOffset = 12;
                    var interval = setInterval(function () {
                        count++;
                        if(count < 30) {
                            mushroom.renderer.yOffset = ((30-count)/30)*12;
                        } else {
                            clearInterval(interval);
                            mushroom.renderer.yOffset = 0;

                            var side = 1;
                            var runInterval = setInterval(function () {
                                mushroom.physics.vx = side * 3;
                            }, 1000/30);
                            game.world.AddBodyEventListener(mushroom, 'onGridTouch', function (event) {
                                if(event.side === 'left' || event.side === 'right') {
                                    side *= -1;
                                }
                            });
                            game.world.AddBodyEventListener(mushroom, 'onObjectTouch', function (event) {
                                if(event.side === 'left' || event.side === 'right') {
                                    side *= -1;
                                }
                            });
                            game.world.AddBodyEventListener(mushroom, 'onDestroy', function (event) {
                                clearInterval(runInterval);
                            });
                        }
                    }, 1000/30);
                })();

            }

        };
    })
};

function blockjump(block, cb) {
    var count = 0;
    var interval = setInterval(function () {
        count++;
        if(count < 4) {
            block.imageOffsetY = (count/8)*10;
        } else if( count < 8) {
            block.imageOffsetY = ((8-count)/8)*10;
        } else if(count === 8) {
            block.imageOffsetY = -1;
        } else {
            clearInterval(interval);
            block.imageOffsetY = 0;
            if(cb) cb();
        }
    }, 1000/30);
}

function addCoin(game, block) {
    game.addGamePoints(100);
    game.sounds.Play('coin');
    var coin = game.world.AddBody({
        type: 'coin',
        height: 0.999,
        x: block.x,
        y: block.y + 0.999,
        vy: 15,
        image: new game.renderer.animation({
            imagesCount: 4,
            imageUrl: function(i) {
                return "files/question_block/coin" +(i+1)+ ".png"
            },
            playSpeed: 1000/10
        }).Play(),
        noCollideObjects: true
    });

    game.world.AddBodyEventListener(coin, 'onGridTouch', function (event) {
        if(event.side === 'bottom') {
            game.world.RemoveBody(coin)
        }
    });
}

module.exports.BreakableWall = function (game) {

    var postBreakImage = game.renderer.LoadImage("files/breakable_wall/post_break.png");
    var particleImage = new game.renderer.animation({
        imagesCount: 2,
        imageUrl: function(i) {
            return "files/breakable_wall/particle" +(i+1)+ ".png"
        },
        playSpeed: 1000/24
    }).Play();

    function addParticle(posX, posY) {
        var particle = game.world.AddBody({
            type: 'wall_particle',
            x:posX,
            y:posY,
            height: 0.5,
            width: 0.5,
            image: particleImage,
            noCollideObjects: true
        });
        particle.physics.vx = 10 - Math.random()*20;
        particle.physics.vy = 10 + Math.random()*10;
        game.world.AddBodyEventListener(particle, 'onGridTouch', function (event) {
            if(event.side === 'bottom') {
                game.world.RemoveBody(particle);
            }
        });
    }

    game.world.GetGridBlocksByType('breakable_wall').forEach(function (block) {
        block.onTouch = function(params) {
            params = params || {};

            if(params.marioMode === 'super' || params.marioMode === 'luigi') {
                game.sounds.Play('break');
                block.image = postBreakImage;
                setTimeout(function () {
                    game.world.RemoveCell(block);
                    addParticle(block.x, block.y);
                    addParticle(block.x+0.5, block.y);
                    addParticle(block.x, block.y-0.5);
                    addParticle(block.x+0.5, block.y-0.5);
                }, 1000/24);
            } else {
                game.sounds.Play('bump');
                blockjump(block)
            }
        }
    })
};



module.exports.Coin = function(game) {
    game.world.GetGridBlocksByType('coin').forEach(function (block) {
        block.noCollideObjects = true;
        block.onTouch = function() {
            game.AddLife();
            game.sounds.Play('coin');
            game.world.RemoveCell(block);
        }
    })
};

module.exports.Multicoin = function(game) {
    var activatedImage = game.renderer.LoadImage("files/question_block/4.png");

    game.world.GetGridBlocksByType('multicoin').forEach(function (block) {

        block.counter = 0;
        block.isTouched = false;
        block.onTouch = function(params) {
            params = params || {};

            if(!block.isTouched) {
                setTimeout(function () {
                    block.onTouch = function() {
                        addCoin(game, block);
                        blockjump(block);

                        block.image = activatedImage;
                        block.type = 'question_block_activated';
                        block.onTouch = function () {
                            game.sounds.Play('bump');
                        };
                    }
                }, 4800);
            }
            block.isTouched = true;
            addCoin(game, block);
            blockjump(block);
        }
    })
};



module.exports.Star = function(game) {

    var activatedImage = game.renderer.LoadImage("files/question_block/4.png");
    var starImage = new game.renderer.animation({
        imagesCount: 4,
        imageUrl: function(i) {
            return "files/question_block/star" +(i+1)+ ".png"
        },
        playSpeed: 1000/10
    });


    game.world.GetGridBlocksByType('star').forEach(function (block) {
        block.onTouch = function() {

            block.image = activatedImage;
            block.type = 'question_block_activated';
            block.onTouch = function(){
                game.sounds.Play('bump');
            };

            blockjump(block);

            game.sounds.Play('item');
            var star = game.world.AddBody({
                type: 'star',
                x: block.x,
                y: block.y + 1,
                image: starImage.Play()
            });
            (function(){
                var count = 0;
                star.renderer.yOffset = 12;
                var interval = setInterval(function () {
                    count++;
                    if(count < 30) {
                        star.renderer.yOffset = ((30-count)/30)*12;
                    } else {
                        clearInterval(interval);
                        star.renderer.yOffset = 0;

                        star.physics.vy = 13;
                        var side = 1;
                        var runInterval = setInterval(function () {
                            star.physics.vx = side * 5;
                        }, 1000/30);
                        game.world.AddBodyEventListener(star, 'onGridTouch', function (event) {
                            if(event.side === 'left' || event.side === 'right') {
                                side *= -1;
                            }
                            if(event.side === 'bottom') {
                                star.physics.vy = 13
                            }
                        });
                        game.world.AddBodyEventListener(star, 'onObjectTouch', function (event) {
                            if(event.side === 'left' || event.side === 'right') {
                                side *= -1;
                            }
                        });
                        game.world.AddBodyEventListener(star, 'onDestroy', function (event) {
                            clearInterval(runInterval);
                            starImage.Stop()
                        });

                        setTimeout(function () {
                            game.world.RemoveBody(star);
                        }, 5000)
                    }
                }, 1000/30);
            })();

        }
    })
};