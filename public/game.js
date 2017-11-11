const TILE_SIZE = 10;

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

var socket = null;

var entities = {};
var board = {};
var players = [];

function new_player(json_msg) {
    msg = JSON.parse(json_msg);
    console.log('New player: ' + msg)
    players.push(msg)
}

function board_add_entity(id, pos) {
    if (pos in board) {
        board[pos].push(id);
    } else {
        board[pos] = [pos];
    }
}

function board_remove_entity(id, pos) {
    board[pos].remove(id);
    if (board[pos].length == 0) {
        delete board[pos];
    }
}

function board_move_entity(id, pos1, pos2) {
    board_remove_entity(id, pos1);
    board_add_entity(id, pos2);
}

function entity_created(json_msg) {
    console.log('Entity created: ' + json_msg)
    msg = JSON.parse(json_msg);

    id = msg[0];
    type = msg[3];
    x = msg[1];
    y = msg[2];
    entity = {id: id, x: x, y: y, type: type, health: msg[4],
        level: msg[5], player_name: msg[6]};
    entities[id] = entity;
    board_add_entity(id, x, y);
    game.add.sprite(entity.x * TILE_SIZE, entity.y * TILE_SIZE, 'tower');
}

function entity_destroyed(msg) {
    console.log('Entity destroyed: ' + msg)
    id = JSON.parse(msg);
    entity = entities[id];

    delete entities[id];
}

function entity_changed(json_msg) {
    console.log('Entity changed: ' + json_msg)
    msg = JSON.parse(json_msg);
    id = msg[0];
    kind = msg[1];
    data = msg[2];
    if (kind == 'health') {
        entities[id].health = data;
    } else if (kind == 'position') {
        entities[id].x = data[0];
        entities[id].y = data[1];
    } else if (kind == 'level') {
        entities[id].level = data;
    }
}

function tick(msg) {
    console.log('TICK')
}

function request_create_tower(pointer, doubleTap) {
    console.log('x: ' + pointer.clientX + ', y: ' + pointer.clientY);
    x = Math.round(pointer.clientX / TILE_SIZE);
    y = Math.round(pointer.clientY / TILE_SIZE);
    socket.emit('request_tower', [x, y, 'tower_arrows']);
}

function preload() {
    game.load.image('tower', 'assets/tower.png')
}

function create() {
    game.stage.backgroundColor = "#eed85d";
    game.camera.bounds = null;
    game.camera.focusOnXY(0, 0);
    game.input.onTap.add(request_create_tower, this);
    socket = io({ query: { name: 'hejhej' } });
    socket.on('entity_created', entity_created);
    socket.on('entity_destroyed', entity_destroyed);
    socket.on('entity_changed', entity_created);
    socket.on('new_player', new_player);
    socket.on('tick', tick);
}

var origDragPoint = null;

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
