module.exports = function(game) {
    game.sounds.masterVolume = 0;
    game.sounds.AddBackgroundMusic('main_theme', 'files/music/01-main-theme-overworld.mp3', 0.5);
    game.sounds.AddBackgroundMusic('underworld', 'files/music/02-underworld.mp3', 0.5);
    game.sounds.AddBackgroundMusic('starman', 'files/music/05-starman.mp3', 0.5);
    game.sounds.AddBackgroundMusic('hurry', 'files/music/13-hurry.mp3', 0.5);
    game.sounds.AddBackgroundMusic('hurry-starman', 'files/music/17-hurry-starman-.mp3', 0.5);
    game.sounds.AddBackgroundMusic('hurry-underground', 'files/music/14-hurry-underground-.mp3', 0.5);
    game.sounds.PlayBackground('main_theme');

    game.sounds.AddSound('coin', 'files/sounds/Coin.wav');
    game.sounds.AddSound('break', 'files/sounds/Break.wav');
    game.sounds.AddSound('item', 'files/sounds/Item.wav');
    game.sounds.AddSound('vine', 'files/sounds/Vine.wav');
    game.sounds.AddSound('powerup', 'files/sounds/Powerup.wav');
    game.sounds.AddSound('jump', 'files/sounds/Jump.wav');
    game.sounds.AddSound('bump', 'files/sounds/Bump.wav');
    game.sounds.AddSound('die', 'files/sounds/Die.wav');
    game.sounds.AddSound('squish', 'files/sounds/Squish.wav');
    game.sounds.AddSound('1up', 'files/sounds/1up.wav');
    game.sounds.AddSound('bullet', 'files/sounds/Fire Ball.wav');

    game.sounds.AddSound('game-over', 'files/music/09-game-over.mp3');
    game.sounds.AddSound('hurry-start', 'files/music/13-hurry-start.mp3');
};