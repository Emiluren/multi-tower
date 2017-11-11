import random
import uuid

MAX_HEALTH = 100

class Player:

    def __init__(self, name, sids):
        self.name = name
        self.sids = sids


class Entity:

    def __init__(self, x, y, typ, player_name):
        self.x = x
        self.y = y
        self.typ = typ
        self.player_name = player_name
        self.health = MAX_HEALTH
        self.uid = uuid.uuid4().hex
        self.level = 1

    def to_list(self):
        return [self.uid, self.x, self.y, 
                self.typ, self.health, self.level, self.player_name]

    def position_tuple(self):
        return (self.x, self.y)


    def __repr__(self):
        return 'Castle with health: {}'.format(self.health)


class Minion:

    def __init__(self):
        self.health = MAX_HEALTH
        self.level = 1

