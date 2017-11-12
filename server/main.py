#!/usr/bin/env python3
from aiohttp import web
import vec
import entities
import pathfinding

import socketio
import asyncio
import threading
import time
import urllib.parse
import random
import json
import traceback
import pdb

TICK_TIME = 0.1

SPAWN_DISTANCE = 50

async def run(app):
    try:
        slow_counter = 10
        while True:
            try:
                await fast_timer_tick()
                await asyncio.sleep(TICK_TIME, loop=app.loop)
                slow_counter -= 1
                if slow_counter <= 0:
                    slow_counter = 10
                    await slow_timer_tick()
            except asyncio.CancelledError:
                raise
            except Exception:
                traceback.print_exc()

    except asyncio.CancelledError:
        pass

sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)

board_lock = threading.Lock()

# player_name -> Entity
castles = {}

# uuid -> Entity
board_entities = {}

# pos -> [uuid]
board = {}

# name -> Player
players = {}

# uuid -> (Entity, ticks since last fired)
towers = {}

# uuid -> (Path)
minions = {}


async def fast_timer_tick():
    # board_lock.acquire()
    towers_fired = []
    entities_changed = []
    entities_destroyed = []
    for uid in towers:
        tower, ticks = towers[uid]
        ticks += TICK_TIME * \
                entities.TOWER_FREQUENCIES[tower.typ] / tower.level
        if ticks >= 1 / TICK_TIME:
            tower_fired, entity_changed, entity_destroyed =\
                    fire_tower_if_in_range(tower)
            if tower_fired is not None:
                towers_fired.append(tower_fired)
                if entity_changed is not None:
                    entities_changed.append(entity_changed)
                if entity_destroyed is not None:
                    entities_destroyed.append(entity_destroyed)

            ticks = 0
        towers[uid] = (tower, ticks)
    if towers_fired:
        await broadcast_message('towers_fired', towers_fired)
    if entities_changed:
        await broadcast_message('entities_changed', entities_changed)
    if entities_destroyed:
        await broadcast_message('entities_destroyed', entities_destroyed)
    # board_lock.release()


solid_types = ["tower_arrows"]


def is_obstructed(x, y):
    if (x, y) not in board:
        return False

    for eid in board[(x, y)]:
        if board_entities[eid].typ in solid_types:
            return True

    return False


async def update_player(player):
    player.spawn_timer -= 1
    if player.spawn_timer <= 0:
        player.spawn_timer = entities.SPAWN_INTERVAL

        castle = castles[player.name]
        enemy_castle = None
        for player_name in players:
            if player_name != player.name:
                enemy_castle = castles[player_name]
                break

        if enemy_castle is not None:

            # TODO: find optimal side to spawn on given target
            spawn_x = castle.x + 2
            spawn_y = castle.y

            minion = entities.Entity(spawn_x, spawn_y, "minion", player.name)
            board_add_entity(minion)
            path = pathfinding.find_path(
                (spawn_x, spawn_y), (enemy_castle.x, enemy_castle.y), is_obstructed)
            minions[minion.uid] = path[1:]

            await broadcast_message('entity_created', minion.to_list())


def update_minion(minion_id):
    path = minions[minion_id]
    if path:
        new_pos = path.pop(0)
        board_move_entity(minion_id, new_pos)
        return [minion_id, 'position', new_pos]
        # await broadcast_message('entity_changed', )
    return None


async def slow_timer_tick():
    # board_lock.acquire()
    await send_tick()
    for player_name in players:
        await update_player(players[player_name])
    entities_changed = []
    for minion in minions:
        entity_changed = update_minion(minion)
        if entity_changed is not None:
            entities_changed.append(entity_changed)
    if entities_changed:
        await broadcast_message('entities_changed', entities_changed)

    # board_lock.release()


def fire_tower_if_in_range(tower):
    tower_pos = tower.position_tuple()
    tower_range = entities.TOWER_RANGES[tower.typ] * tower.level
    for minion_id in minions.keys():
        minion_pos = board_entities[minion_id].position_tuple()
        if vec.is_within_bounds(minion_pos, tower_pos, tower_range):
            # print('FIRE!')
            return actually_fire_the_damn_tower(minion_id, tower)
    return None, None, None


def actually_fire_the_damn_tower(minion_id, tower):
    board_entities[minion_id].health -= tower.level * \
            entities.TOWER_DAMAGES[tower.typ]

    tower_fired = [tower.uid, minion_id]
    entity_destroyed = None
    entity_changed = None

    if board_entities[minion_id].health <= 0:
        kill_minion_locally(minion_id)
        entity_destroyed = minion_id
    else:
        entity_changed = [minion_id, 'health',
                          board_entities[minion_id].health]

    return tower_fired, entity_changed, entity_destroyed


def kill_minion_locally(minion_id):
    board_try_remove_entity(minion_id)
    del minions[minion_id]


def is_castle_position_free(pos):
    x, y = pos
    for castle in castles.values():
        if x == castle.x and y == castle.y:
            return False
    return True


def find_player(sid):
    for player in players.values():
        if sid in player.sids:
            return player


def board_add_entity(entity):
    pos = entity.position_tuple()
    uid = entity.uid
    if pos in board:
        board[pos].append(uid)
    else:
        board[pos] = [uid]
    board_entities[uid] = entity


def board_move_entity(uid, dest_pos):
    x, y = dest_pos
    entity = board_entities[uid]
    entity.x = x
    entity.y = y
    board_try_remove_entity(uid)
    board_add_entity(entity)


def board_try_remove_entity(uid):
    """
    Returns True if successful, false if not
    """
    found_pos = None
    for pos, ids in board.items():
        if uid in ids:
            found_pos = pos
            break
    if found_pos is None:
        raise Exception("ID: ", uid)
        return False
    board[found_pos].remove(uid)
    if not board[found_pos]:
        del board[found_pos]
    del board_entities[uid]
    return True


def generate_castle_position():
    if not castles:
        return (0, 0)
    it = 0
    while True:
        r1 = random.randint(-1 - it, 1 + it)
        r2 = random.randint(-1 - it, 1 + it)
        direction = (r1*SPAWN_DISTANCE, r2*SPAWN_DISTANCE)
        for castle in castles.values():
            pos = castle.position_tuple()
            new_pos = vec.add(direction, pos)
            if is_castle_position_free(new_pos):
                # print('FOUND!')
                return new_pos
        it += 1


async def send_tick():
    await broadcast_message('tick', '')


async def assign_castle(player_name):
    x, y = generate_castle_position()
    castle = entities.Entity(x, y, 'castle', player_name)
    castles[player_name] = castle
    board_add_entity(castle)
    await broadcast_message('entity_created',
                            [castle.uid, x, y, 'castle', 100, 1, player_name])


async def broadcast_message(message_type, data, sid=None):
    await sio.emit(message_type, data=json.dumps(data), room=sid)


async def index(request):
    """Serve the client-side application."""
    with open('../public/index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')


async def send_world_to_player(sid):
    entities_created = []
    for entity in board_entities.values():
        entities_created.append(entity.to_list())
    await broadcast_message('entities_created', entities_created, sid)


@sio.on('connect')
async def connect(sid, environ):
    # board_lock.acquire()
    query = urllib.parse.parse_qs(environ['QUERY_STRING'])
    # print("connect ", sid, query)
    name = query['name'][0]

    if name not in players:
        players[name] = entities.Player(name, [sid])
        await assign_castle(name)
        await broadcast_message('new_player', name)
        await broadcast_message('player_cash_changed', 
                                [name, players[name].cash])
    else:
        players[name].sids.append(sid)
    await send_world_to_player(sid)
    # board_lock.release()


@sio.on('request_tower')
async def on_request_tower(sid, data):
    # print("Tower requested: ", data)

    x, y, typ = data
    player = find_player(sid)
    cost = entities.TOWER_BUILD_COSTS[typ]
    if cost <= player.cash:
        tower = entities.Entity(x, y, typ, player.name)
        board_add_entity(tower)
        towers[tower.uid] = (tower, 0)
        players[player.name].cash -= cost
        await broadcast_message('entity_created', tower.to_list())
        await broadcast_message('player_cash_changed',
                                [player.name, player.cash])
    else:
        print(player.name + ' cannot afford to build ' + typ)


@sio.on('request_upgrade')
async def on_request_upgrade(sid, data):
    # print("Upgrade requested: ", data)
    entity_id = data
    entity = board_entities[entity_id]
    player = find_player(sid)
    if entity.is_tower():
        cost = entities.TOWER_UPGRADE_COSTS[entity.typ]
        if cost <= player.cash:
            players[player.name].cash -= cost
            entity.level += 0.5
            await broadcast_message('entity_changed',
                                   [entity_id, 'level', entity.level])
            await broadcast_message('player_cash_changed',
                                    [player.name, player.cash])
        else:
            print(player.name + ' cannot afford this upgrade!')


@sio.on('request_delete')
async def on_request_delete(sid, data):
    entity_id = data
    entity = board_entities[entity_id]
    if entity.is_tower():
        del towers[entity_id]
    elif entity.is_minion():
        del minions[entity_id]
    del board_entities[entity_id]
    await broadcast_message('entity_destroyed', entity_id)


@sio.on('disconnect')
def disconnect(sid):
    # board_lock.acquire()
    player = find_player(sid)
    player.sids.remove(sid)
    # board_lock.release()
    print('disconnect ', sid)


app.router.add_get('/', index)
app.router.add_static('/', '../public')


async def start_background_tasks(app):
    app['ticker'] = app.loop.create_task(run(app))


async def cleanup(app):
    app['ticker'].cancel()
    await app['ticker']


def start_server():
    app.on_startup.append(start_background_tasks)
    app.on_cleanup.append(cleanup)
    web.run_app(app)


if __name__ == '__main__':
    start_server()
