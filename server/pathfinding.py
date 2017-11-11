
def find_path(start_pos, dest_pos, is_obstructed):
    """
    Returns list of coordinates describing a path
    from start_pos to end_pos using the A* algorithm.
    
    is_obstructed :: (x, y) -> Bool
    """
    # nodes that have been evaluated
    evaluated = set()
    # nodes that have been discovered but not evaluated
    discovered = [start_pos]
    # same content as discovered but a set
    discovered_set = {start_pos}
    # map describing each node's previous node
    came_from = {}
    
    # the cost of the discovered arcs
    cost_map = {}
    cost_map[start_pos] = 0

    # distance estimates to nodes
    dist_map = {}
    dist_map[start_pos] = heuristic_cost(start_pos, dest_pos)

    while discovered:
        current = discovered[0]
        discovered.remove(current)
        discovered_set.remove(current)
        if current == dest_pos:
            return reconstruct_path(start_pos, came_from, current)

        evaluated.add(current)

        for neighbor in get_valid_neighbors(current, is_obstructed):
            if neighbor not in evaluated:
                cost = cost_map[current] + 1
                if neighbor in cost_map and cost > cost_map[neighbor]:
                    dist_map[neighbor] = float('inf')
                    add_pos_to_discovered(neighbor, discovered,
                                          discovered_set, dist_map)
                else: 
                    came_from[neighbor] = current
                    cost_map[neighbor] = cost
                    dist_map[neighbor] = cost + heuristic_cost(neighbor, dest_pos)
                    add_pos_to_discovered(neighbor, discovered,
                                          discovered_set, dist_map)

    raise Exception('No path was found!')


def add_pos_to_discovered(pos, discovered, discovered_set, dist_map):
    discovered_set.add(pos)
    cost = dist_map[pos]
    for i in range(len(discovered)):
        if dist_map[discovered[i]] >= cost:
            discovered.insert(i, pos)
            return
    discovered.append(pos)


def reconstruct_path(start, came_from, dest):
    result = []
    curr = dest 
    while curr != start:
        print(came_from)
        print(curr)
        tmp = came_from[curr]
        result.append(tmp)
        del came_from[curr]
        curr = tmp
    result.append(start)
    return list(reversed(result))


def get_valid_neighbors(pos, is_obstructed):
    x, y = pos
    return [(x + i, y + j)
            for i in range(-1, 2) 
            for j in range(-1, 2)
           if abs(i) != abs(j) and not is_obstructed(x + i, y + j)]


def heuristic_cost(pos1, pos2):
    x1, y1 = pos1
    x2, y2 = pos2
    return abs(x2 - x1) + abs(y2 - y1)


if __name__ == '__main__':

    obstructions = [(0, 1), (3, 1), (3, 0), (2, 3), (2, 2), (2, 4), (3, 3)]

    start = (0, 0)
    end = (10, 10)

    is_obstructed = lambda x, y: (x, y) in obstructions

    path = find_path(start, end, is_obstructed)

    board = "#############\n"
    for y in range(11):
        board += "#"
        for x in range(11):
            if (x, y) == start:
                board += 's'
            elif (x, y) == end:
                board += 'e'
            elif (x, y) in obstructions:
                board += 'X'
            elif (x, y) in path:
                board += '·'
            else:
                board += ' '
        board += "#\n"
    board += "#############\n"
    print(board)

