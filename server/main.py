from aiohttp import web
import player
import socketio
import threading
import time

TICK_TIME = 1

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

board = {}
players = {}

def timer_tick():
    print(players)

async def index(request):
    """Serve the client-side application."""
    with open('../index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

@sio.on('connect')
def connect(sid, environ):
    board_lock.acquire()
    print("connect ", sid)
    p = player.Player()
    players[sid] = p
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

