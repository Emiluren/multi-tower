#!/usr/bin/env python3
from aiohttp import web
import vec
import entities
import socketio
import threading
import time
import urllib.parse
import random
import json
import pdb

TICK_TIME = 1

SPAWN_DISTANCE = 50

class MainThread(threading.Thread):

    def __init__(self):
        super(MainThread, self).__init__()
        self.stop_flag = False

    def run(self):
        while not self.stop_flag:
            timer_tick()
            time.sleep(TICK_TIME)

sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)

board_lock = threading.Lock()

# player_name -> Entity
castles = {}
# uuid -> Entity
board_entities = {}
# name -> Player
players = {}

def timer_tick():
    board_lock.acquire()
    print(board_entities)
    board_lock.release()


def is_castle_position_free(pos):
    x, y = pos
    for castle in castles.values():
        if x == castle.x and y == castle.y:
            return False
    return True


def generate_castle_position():
    if not castles:
        return (0, 0)
    while True:
        r1 = random.randint(-1, 1)
        r2 = random.randint(-1, 1)
        direction = (r1*SPAWN_DISTANCE, r2*SPAWN_DISTANCE)
        for castle in castles.values(): 
            pos = castle.position_tuple()
            new_pos = vec.add(direction, pos)
            if is_castle_position_free(pos):
                return new_pos


async def assign_castle(player_name):
    x, y = generate_castle_position()
    castle = entities.Entity(x, y, 'castle', player_name)
    castles[player_name] = castle
    board_entities[castle.uid] = castle
    await broadcast_message('entity_created', [castle.uid, x, y, 'castle', 100, 1, player_name])


async def broadcast_message(message_type, data, sid=None):
    await sio.emit(message_type, data=json.dumps(data), room=sid)


async def index(request):
    """Serve the client-side application."""
    with open('../public/index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')


async def send_world_to_player(sid):
    for castle in castles.values():
        await broadcast_message('entity_created', castle.to_list(), sid)
        print("sent world to", sid)


@sio.on('connect')
async def connect(sid, environ):
    board_lock.acquire()
    query = urllib.parse.parse_qs(environ['QUERY_STRING'])
    print("connect ", sid, query)
    name = query['name'][0]

    if name not in players.values():
        await assign_castle(name)
        await broadcast_message('new_player', name)
    players[sid] = name
    await send_world_to_player(sid)
    board_lock.release()


@sio.on('request_tower')
async def on_request_tower(sid, data):
    print("Tower requested: ", data)

    x, y, typ = data

    player_name = players[sid]

    tower = entities.Entity(x, y, typ, player_name)
    await broadcast_message('entity_created', tower.to_list())


@sio.on('disconnect')
def disconnect(sid):
    board_lock.acquire()
    del players[sid]
    board_lock.release()
    print('disconnect ', sid)


app.router.add_get('/', index)
app.router.add_static('/', '../public')

def start_server():
    t = MainThread()
    try:
        t.start()
        web.run_app(app, handle_signals=False)
    except KeyboardInterrupt:
        t.stop_flag = True

if __name__ == '__main__':
    start_server()

