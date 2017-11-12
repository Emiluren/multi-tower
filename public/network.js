const TYPE_CASTLE = "castle";
const TYPE_TOWER_ARROWS = "tower_arrows";
const TYPE_MINION = "minion";

var socket = null;

// uuid -> Entity
var entities = {};

// pos -> [uuid]
var board = {};

var players = [];

function new_player(json_msg) {
    let msg = JSON.parse(json_msg);
    console.log('New player: ' + msg)
    players.push(msg)
}

function board_add_entity(id, x, y) {
    if ((x + "," + y) in board) {
        board[x + "," + y].push(id);
    } else {
        board[x + "," + y] = [id];
    }
}

function board_remove_entity(id) {
    let entity = entities[id];
    let pos = [entity.x, entity.y];

    board[pos].remove(id);
    if (board[pos].length == 0) {
        delete board[pos];
    }
}

function board_move_entity(id, x, y) {
    board_remove_entity(id);
    board_add_entity(id, x, y);
}

function entity_created(json_msg) {
    //console.log('Entity created: ' + json_msg)
    let msg = JSON.parse(json_msg);

    let id = msg[0];
    let type = msg[3];
    let x = msg[1];
    let y = msg[2];
    let m;
    switch(type) {
    case TYPE_TOWER_ARROWS:
        m = createMesh("tower");
        m.position.set(x, 0, y);
        scene.add(m);
        break;
    case TYPE_CASTLE:
        m = createMesh("castle");
        m.position.set(x, 0, y);
        m.rotation.y = Math.PI / 2;
        scene.add(m);
        break;
    case TYPE_MINION:
        m = createMesh("minion");
        m.position.set(x, 0, y);
        scene.add(m);
        break;
    }

    let entity = {id: id, x: x, y: y, type: type, health: msg[4],
        level: msg[5], player_name: msg[6], mesh: m};
    m.entity = entity;
    entities[id] = entity;
    board_add_entity(id, x, y);
}

function entity_destroyed(msg) {
    console.log('Entity destroyed: ' + msg)
    let id = JSON.parse(msg);
    let entity = entities[id];

    delete entities[id];
}

function entity_changed(json_msg) {
    console.log('Entity changed: ' + json_msg)
    let msg = JSON.parse(json_msg);
    let id = msg[0];
    let kind = msg[1];
    let data = msg[2];
    if (kind == 'health') {
        entities[id].health = data;
    } else if (kind == 'position') {
        entities[id].x = data[0];
        entities[id].y = data[1];
        board_move_entity(id, data[0], data[1]);
    } else if (kind == 'level') {
        entities[id].level = data;
    }
}

function tick(msg) {
    //console.log('TICK')
}

function request_create_tower(tile_x, tile_y) {
    // console.log('x: ' + pointer.clientX + ', y: ' + pointer.clientY);
    // let x = pointer.clientX + game.camera.x;
    // let y = pointer.clientY + game.camera.y;
    // let tile_x = Math.round(x / TILE_SIZE);
    // let tile_y = Math.round(y / TILE_SIZE);
    socket.emit('request_tower', [tile_x, tile_y, 'tower_arrows']);
}

function connect_to_server() {
    console.log($('#player_name_text').val());
    socket = io({ query: { name:  $('#player_name_text').val()} });
    socket.on('entity_created', entity_created);
    socket.on('entity_destroyed', entity_destroyed);
    socket.on('entity_changed', entity_changed);
    socket.on('new_player', new_player);
    socket.on('tick', tick);
}
