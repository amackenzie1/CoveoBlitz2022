import random 

def play(prob_drop, prob_get_killed):
    dropped = False 
    killed = False
    moves = 0
    while not dropped and not killed:
        if random.random() < prob_drop:
            dropped = True
        if random.random() < prob_get_killed:
            killed = True
        moves += 1

    if killed:
        return 0
    if dropped:
        return moves 
    
results = []
for i in range(100000):
    results.append(play(0.1, 0.1))
print(sum(results)/100000)


result = 0 
p = 0.1
q = 0.1
for i in range(1, 1000):
    result = result + i * p*(1-p)**(i-1) * (1-q)**i 

print(result)

result2 = 0 
r = (1-p)*(1-q)

for i in range(1, 1000):
    result2 += i * r**(i-1)

result3 = 1/(1-r)**2
print(result3 * p * (1-q))