import { Unit, Action, Position } from '../GameInterface'
import { Strategy } from '../strategy-coordinator'
import { a_star } from '../search'
import { stringify, areEqual, noop } from '../utils'

const attackDumb: Strategy = (units, team, state) => {
  let enemyUnitPositions = state.teams
    .filter(t => t.id !== team.id)
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned && u.hasDiamond)
    .map(u => u.position)

  return units.map<Action>(unit => {
    const mapped = enemyUnitPositions
      .map<[Position, number, Position] | null>(pos => {
        const result = a_star(unit.position, pos, { state })
        if (!result) { return null }
        return [result.nextTarget, result.distance, pos]
      })
      .filter(result => result !== null)
      .sort((resultA, resultB) => resultA![1] - resultB![1])


    if (!mapped.length) {
      enemyUnitPositions
        .forEach(pos => {
          const result = a_star(unit.position, pos, { state })
          if (!result) {
            console.log(`\n\n\nNO PATH FROM ${stringify(unit.position)} TO ${stringify(pos)}!\n\n\n`)
          }
        })
      return noop(unit)
    }

    const [nextTarget, distance, enemyPosition] = mapped[0]!
    enemyUnitPositions = enemyUnitPositions.filter(pos => !areEqual(pos, enemyPosition))

    return {
      type: 'UNIT',
      action: distance! <= 1 ? 'ATTACK' : 'MOVE',
      target: nextTarget!,
      unitId: unit.id
    }
  })
}

export default attackDumb