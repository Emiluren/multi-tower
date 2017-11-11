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

TICK_TIME = 1

SPAWN_DISTANCE = 50;

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
    r1 = random.randint(-1, 1)
    r2 = random.randint(-1, 1)
    direction = (r1*SPAWN_DISTANCE, r2*SPAWN_DISTANCE)
    for pos in castles:
        new_pos = vec.add(direction, pos)
        if not new_pos in castles:
            return new_pos
    raise Exception('WTF Y U NO GENERATE POS')


async def assign_castle(player):
    pos = generate_castle_position()
    castle = entities.Castle(player, uuid.uuid4().hex)
    castles[pos] = castle
    board[pos] = castle
    x, y = pos
    await broadcast_message('entity_created', [x, y, 'castle', 100, 1, castle.uid])


async def broadcast_message(message_type, data, sid=None):
    await sio.emit(message_type, data=json.dumps(data), room=sid)


async def index(request):
    """Serve the client-side application."""
    with open('../index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

@sio.on('connect')
async def connect(sid, environ):
    board_lock.acquire()
    query = urllib.parse.parse_qs(environ['QUERY_STRING'])
    print("connect ", sid, query)
    p = entities.Player()
    players[sid] = p
    await assign_castle(p)
    board_lock.release()

@sio.on('chat message')
async def message(sid, data):
    print("message ", data)
    await sio.emit('chat message', data=data, room=sid)

@sio.on('disconnect')
def disconnect(sid):
    board_lock.acquire()
    del players[sid]
    board_lock.release()
    print('disconnect ', sid)

app.router.add_get('/', index)
app.router.add_static('/', '../public')

if __name__ == '__main__':
    t = MainThread()
    try:
        t.start()
        web.run_app(app, handle_signals=False)
    except KeyboardInterrupt:
        t.stop_flag = True

