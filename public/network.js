const TYPE_CASTLE = "castle";
const TYPE_TOWER_ARROWS = "tower_arrows";
const TYPE_MINION = "minion";

var socket = null;

// uuid -> Entity
var entities = {};

// pos -> [uuid]
var board = {};

var players = [];

var cash = 0;

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

    let index = board[pos].indexOf(id)
    board[pos].splice(index, 1);
    if (board[pos].length == 0) {
        delete board[pos];
    }
}

function board_move_entity(id, x, y) {
    board_remove_entity(id);
    board_add_entity(id, x, y);
}

function player_cash_changed(json_msg){
    cash = JSON.parse(json_msg)[1];
    $('#indicator_money').text(cash);
}

function handle_entity_created(json_msg) {
    //console.log('Entity created: ' + json_msg)
    let msg = JSON.parse(json_msg);
    entity_created(msg)
}

function entity_created(msg) {

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
    m.entity = id;
    entities[id] = entity;
    board_add_entity(id, x, y);

    if (entity.type == 'castle' && entities[id].player_name == me) {
        setHealthbar(entity.health);
        my_castle = entity;
        goToCastle();
    }
}

function handle_tower_fired(json_msg) {
    let msg = JSON.parse(json_msg);
    tower_fired(msg)
}

function tower_fired(msg) {
    let towerId = msg[0];
    let targetId = msg[1];
    drawProjectile(towerId, targetId);
}

function handle_entity_destroyed(msg) {
    console.log('Entity destroyed: ' + msg)
    let id = JSON.parse(msg);
    entity_destroyed(id);
}

function entity_destroyed(id) {
    let entity = entities[id];
    if (selected.id == id) deselect();

    scene.remove(entity.mesh);
    delete entities[id];
}


function handle_entity_changed(json_msg) {
    //console.log('Entity changed: ' + json_msg)
    let msg = JSON.parse(json_msg);
    entity_changed(msg);
}

function entity_changed(msg) {
    let id = msg[0];
    let kind = msg[1];
    let data = msg[2];
    if (kind == 'health') {
        entities[id].health = data;
        if (entities[id].type == 'castle' && entities[id].player_name == me) setHealthbar(data);
    } else if (kind == 'position') {
        board_move_entity(id, data[0], data[1]);
        entities[id].x = data[0];
        entities[id].y = data[1];
        if (entities[id].type == "minion") {
          var dir = new THREE.Vector2(Math.sign(data[0] - entities[id].mesh.position.x), Math.sign(data[1] - entities[id].mesh.position.z));
          movingMinions.push([id, dir]);
        }
    } else if (kind == 'level') {
        entities[id].level = data;
    }
}

function entities_changed(json_msg) {
    //console.log('Entites changed: ' + json_msg)
    let entities = JSON.parse(json_msg);
    entities.forEach(entity_changed);
}

function towers_fired(json_msg) {
    let towers = JSON.parse(json_msg);
    towers.forEach(tower_fired);
}

function entities_destroyed(json_msg) {
    let entities = JSON.parse(json_msg);
    entities.forEach(entity_destroyed);
}

function entities_created(json_msg) {
    console.log('Entites created: ' + json_msg)
    let entities = JSON.parse(json_msg);
    entities.forEach(entity_created);
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

function request_delete(entity_id) {
    socket.emit('request_delete', entity_id);
}

function request_upgrade(entity_id) {
    socket.emit('request_upgrade', entity_id);
}

function connect_to_server() {
    me = $('#player_name_text').val();
    console.log('I am: ' + me);
    socket = io({ query: { name:  me} });
    socket.on('entity_created', handle_entity_created);
    socket.on('entity_destroyed', handle_entity_destroyed);
    socket.on('entity_changed', handle_entity_changed);
    socket.on('entities_destroyed', entities_destroyed);
    socket.on('entities_created', entities_created);
    socket.on('entities_changed', entities_changed);
    socket.on('towers_fired', towers_fired);
    socket.on('new_player', new_player);
    socket.on('tower_fired', handle_tower_fired);
    socket.on('player_cash_changed', player_cash_changed);
    socket.on('tick', tick);
}
