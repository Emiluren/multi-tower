import random
import uuid

MAX_HEALTH = 100
SPAWN_INTERVAL = 10

CASTLE_DAMAGE_REWARD = 1

MINION_KILL_REWARD = 5

MINION_DAMAGE = 5

# Controls how fast each type of tower fires

TOWER_FREQUENCIES = {
    'tower_arrows' : 10
}

# Controls the range of each tower
TOWER_RANGES = {
    'tower_arrows': 5
}

TOWER_DAMAGES = {
    'tower_arrows': 10
}

TOWER_BUILD_COSTS = {
    'tower_arrows': 15
}

TOWER_UPGRADE_COSTS = {
    'tower_arrows': 10
}

class Player:

    def __init__(self, name, sids):
        self.name = name
        self.sids = sids
        self.spawn_timer = SPAWN_INTERVAL
        self.cash = 100


class Entity:

    def __init__(self, x, y, typ, player_name):
        self.x = x
        self.y = y
        self.typ = typ
        self.player_name = player_name
        self.health = MAX_HEALTH
        self.uid = uuid.uuid4().hex
        self.level = 1

    def is_tower(self):
        return self.typ in TOWER_FREQUENCIES

    def is_minion(self):
        return self.typ == 'minion'

    def to_list(self):
        return [self.uid, self.x, self.y,
                self.typ, self.health, self.level, self.player_name]

    def position_tuple(self):
        return (self.x, self.y)

    def __repr__(self):
        return '{} with health: {}'.format(self.typ, self.health)
