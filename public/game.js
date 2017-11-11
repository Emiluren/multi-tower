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

var board = {};
var castles = {};
var players = [];

function new_player(msg) {
    console.log('New player: ' + msg)
    players.push(msg)
}

function entity_created(msg) {
    console.log('Entity created: ' + msg)
    id = msg[0];
    type = msg[3];
    entity = {id: id, x: msg[1], y: msg[2], type: type, health: msg[4],
        level: msg[5], player_name: msg[6]};
    board[id] = entity;
    if (type == 'castle') {
        castles[name] = id;
    }
}

function entity_destroyed(msg) {
    console.log('Entity destroyed: ' + msg)
    id = msg;
    entity = board[id];
    if (entity.type == 'castle') {
        delete castles[entity.player_name];
    }
    delete board[id];
}

function entity_changed(msg) {
    console.log('Entity changed: ' + msg)
    id = msg[0];
    kind = msg[1];
    data = msg[2];
    if (kind == 'health') {
        board[id].health = data;
    } else if (kind == 'position') {
        board[id].x = data[0];
        board[id].y = data[1];
    } else if (kind == 'level') {
        board[id].level = data;
    }
}

function preload() {
    game.load.image('tower', 'assets/tower.png')
}

function create() {
    game.stage.backgroundColor = "#eed85d";
    Object.values(castles).forEach(function(castle) {
        game.add.sprite(castle.x, castle.y, 'tower');
    });
    game.camera.bounds = null;
    game.camera.focusOnXY(0, 0);
}

var origDragPoint = null;
socket.on('entity_created', entity_created);
socket.on('entity_destroyed', entity_destroyed);
socket.on('entity_changed', entity_created);
socket.on('new_player', new_player);

function update() {
    //socket.emit('chat message', "test");
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
