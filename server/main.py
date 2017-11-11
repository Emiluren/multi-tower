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
import uuid
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

castles = {}
board = {}
players = {}

def timer_tick():
    board_lock.acquire()
    print(board)
    board_lock.release()


def generate_castle_position():
    if not castles:
        return (0, 0)
    while True:
        r1 = random.randint(-1, 1)
        r2 = random.randint(-1, 1)
        direction = (r1*SPAWN_DISTANCE, r2*SPAWN_DISTANCE)
        for pos in castles:
            new_pos = vec.add(direction, pos)
            if not new_pos in castles:
                return new_pos


async def assign_castle(player):
    pos = generate_castle_position()
    castle = entities.Castle(player, uuid.uuid4().hex)
    castles[pos] = castle
    board[pos] = castle
    x, y = pos
    await broadcast_message('entity_created', [castle.uid, x, y, 'castle', 100, 1, player.name])


async def broadcast_message(message_type, data, sid=None):
    await sio.emit(message_type, data=json.dumps(data), room=sid)


async def index(request):
    """Serve the client-side application."""
    with open('../public/index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')


async def send_world_to_player(sid):
    for ((x, y), castle) in castles.items():
        data = [
            castle.uid,
            x,
            y,
            "castle",
            castle.health,
            castle.level,
            castle.player.name
        ]
        await broadcast_message('entity_created', data, sid)
        print("sent world to", sid)


@sio.on('connect')
async def connect(sid, environ):
    board_lock.acquire()
    query = urllib.parse.parse_qs(environ['QUERY_STRING'])
    print("connect ", sid, query)
    name = query['name'][0]

    if name in players:
        players[name].sids.append(sid)
    else:
        players[name] = entities.Player(name, [sid])
        await assign_castle(players[name])
        await broadcast_message('new_player', name)
    await send_world_to_player(sid)
    board_lock.release()


@sio.on('chat message')
async def message(sid, data):
    print("message ", data)
    await sio.emit('chat message', data=data, room=sid)


@sio.on('disconnect')
def disconnect(sid):
    board_lock.acquire()
    remove_player_sid(sid)
    board_lock.release()
    print('disconnect ', sid)


def remove_player_sid(sid):
    for player in players.values():
        if sid in player.sids:
            player.sids.remove(sid)
            return


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

