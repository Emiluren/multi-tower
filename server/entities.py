import random

MAX_HEALTH = 100

class Player:
    
    pass 


class Castle:

    def __init__(self, player):
        self.player = player
        self.health = MAX_HEALTH
    

    def __repr__(self):
        return 'Castle with health: {}'.format(self.health)


class Minion:

    def __init__(self):
        self.health = MAX_HEALTH
        self.level = 1
    
