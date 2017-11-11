var config = {
    width: 300,
    height: 400,
    renderer: Phaser.AUTO,
    state: {
        preload: preload,
        create: create,
        update: update
    }
}

var game = new Phaser.Game(config);

var socket = io({ query: { name: "malcolm" } });

socket.on('entity_created', function(msg) {
    console.log(msg);
});


function preload() {
    game.load.image('tower', 'assets/tower.png')
}

function create() {
    game.stage.backgroundColor = "#eed85d";
    game.add.sprite(0, 0, 'tower');
    game.camera.bounds = null;
    game.camera.focusOnXY(0, 0);
}

var origDragPoint = null;

console.log('nej');
function update() {
    //socket.emit('chat message', "test");
    console.log('nej');
    if (game.input.activePointer.isDown) {
        if (origDragPoint) {
            game.camera.x += origDragPoint.x - game.input.activePointer.position.x;
            game.camera.y += origDragPoint.y - game.input.activePointer.position.y;
        }
        origDragPoint = game.input.activePointer.position.clone();
    }
    else {
        origDragPoint = null;
    }
}
