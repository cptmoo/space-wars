import {
  canBuild,
  canSendFleet,
  canSetPlanetMode,
  canUpgrade,
  getBattleSpeedMultiplier,
  getBuildRate,
  getFlightTime,
  getMapRules,
  getSendableShips,
  getUpgradeRate,
  areConnected,
} from './rules.js'

/**
 * Create a fleet object.
 *
 * @param {number} playerId
 * @param {string} fromId
 * @param {string} toId
 * @param {number} ships
 * @param {number} flightTime
 * @returns {{
 *   owner: number,
 *   from: string,
 *   to: string,
 *   ships: number,
 *   progress: number,
 *   duration: number,
 * }}
 */
export function createFleet(playerId, fromId, toId, ships, flightTime) {
  return {
    owner: playerId,
    from: fromId,
    to: toId,
    ships,
    progress: 0,
    duration: flightTime,
  }
}

/**
 * Change the mode of a planet if valid.
 *
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @param {string} planetId
 * @param {string} mode
 * @returns {boolean}
 */
export function setPlanetMode(planetStates, playerId, planetId, mode) {
  if (!canSetPlanetMode(planetStates, playerId, planetId, mode)) {
    return false
  }

  const planet = planetStates[planetId]

  if (planet.mode !== mode) {
    planet.mode = mode
    planet.progress = 0
  }

  return true
}

/**
 * Send a fleet if valid.
 *
 * Mutates:
 * - planetStates
 * - fleets
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {any[]} fleets
 * @param {number} playerId
 * @param {string} fromId
 * @param {string} toId
 * @returns {boolean}
 */
export function sendFleet(map, planetStates, fleets, playerId, fromId, toId) {
  if (!canSendFleet(map, planetStates, playerId, fromId, toId)) {
    return false
  }

  const shipsToSend = getSendableShips(planetStates, fromId)
  if (shipsToSend <= 0) {
    return false
  }

  const flightTime = getFlightTime(map, fromId, toId)
  if (!Number.isFinite(flightTime) || flightTime <= 0) {
    return false
  }

  planetStates[fromId].ships -= shipsToSend
  planetStates[fromId].progress = 0

  fleets.push(createFleet(playerId, fromId, toId, shipsToSend, flightTime))
  return true
}

/**
 * Retreat the attacking side from a battle to a connected planet.
 *
 * Mutates:
 * - planetStates
 * - fleets
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {any[]} fleets
 * @param {number} playerId
 * @param {string} fromPlanetId
 * @param {string} toPlanetId
 * @returns {boolean}
 */
export function retreatBattle(map, planetStates, fleets, playerId, fromPlanetId, toPlanetId) {
  const planet = planetStates[fromPlanetId]
  if (!planet?.battle) return false
  if (planet.battle.attackerOwner !== playerId) return false
  if (!toPlanetId || fromPlanetId === toPlanetId) return false
  if (!areConnected(map, fromPlanetId, toPlanetId)) return false

  const shipsToRetreat = planet.battle.attackers
  if (!shipsToRetreat || shipsToRetreat <= 0) return false

  const flightTime = getFlightTime(map, fromPlanetId, toPlanetId)
  if (!Number.isFinite(flightTime) || flightTime <= 0) return false

  fleets.push(createFleet(playerId, fromPlanetId, toPlanetId, shipsToRetreat, flightTime))
  clearBattle(planetStates, fromPlanetId)

  return true
}


/**
 * Apply build progress to a single planet.
 *
 * Current behaviour:
 * - progress increases according to build rate
 * - each whole progress point creates 1 ship
 * - capped by max ships through canBuild()
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 * @param {number} dtSeconds
 */
export function updatePlanetBuild(map, planetStates, planetId, dtSeconds) {
  const planet = planetStates[planetId]
  if (!planet) return
  if (planet.owner === 0) return
  if (planet.mode !== 'B') return
  if (!canBuild(map, planetStates, planetId)) return
  if (planet.battle) return

  planet.progress += getBuildRate(map, planetStates, planetId) * dtSeconds

  while (planet.progress >= 1 && canBuild(map, planetStates, planetId)) {
    planet.ships += 1
    planet.progress -= 1
  }

  if (!canBuild(map, planetStates, planetId) && planet.progress > 1) {
    planet.progress = 1
  }
}

/**
 * Apply upgrade progress to a single planet.
 *
 * Current behaviour:
 * - progress increases according to upgrade rate
 * - each whole progress point creates 1 level
 * - capped by max level through canUpgrade()
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 * @param {number} dtSeconds
 */
export function updatePlanetUpgrade(map, planetStates, planetId, dtSeconds) {
  const planet = planetStates[planetId]
  if (!planet) return
  if (planet.owner === 0) return
  if (planet.mode !== 'U') return
  if (!canUpgrade(map, planetStates, planetId)) return
  if (planet.battle) return

  planet.progress += getUpgradeRate(map, planetStates, planetId) * dtSeconds

  while (planet.progress >= 1 && canUpgrade(map, planetStates, planetId)) {
    planet.level += 1
    planet.progress -= 1
  }

  if (!canUpgrade(map, planetStates, planetId) && planet.progress > 1) {
    planet.progress = 1
  }
}

/**
 * Update all planets for one tick.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {number} dtSeconds
 */
export function updatePlanets(map, planetStates, dtSeconds) {
  for (const planetId of Object.keys(planetStates)) {
    const planet = planetStates[planetId]

    if (planet.mode === 'B') {
      updatePlanetBuild(map, planetStates, planetId, dtSeconds)
    } else if (planet.mode === 'U') {
      updatePlanetUpgrade(map, planetStates, planetId, dtSeconds)
    }
  }
}

/**
 * Start a new battle on a planet.
 *
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 * @param {number} attackerOwner
 * @param {number} attackerShips
 */
export function startBattle(planetStates, planetId, attackerOwner, attackerShips) {
  const planet = planetStates[planetId]
  if (!planet) return
  planet.progress = 0;
  planet.battle = {
    attackerOwner,
    attackers: attackerShips,
  }
}

/**
 * Add attacking ships to an existing battle.
 *
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 * @param {number} attackerShips
 */
export function reinforceBattle(planetStates, planetId, attackerShips) {
  const planet = planetStates[planetId]
  if (!planet?.battle) return

  planet.battle.attackers += attackerShips
}

/**
 * Clear the current battle from a planet.
 *
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 */
export function clearBattle(planetStates, planetId) {
  const planet = planetStates[planetId]
  if (!planet) return

  planet.battle = null
}

/**
 * Resolve the end state of a battle after losses have been applied.
 *
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 */
export function resolveBattleOutcome(planetStates, planetId) {
  const planet = planetStates[planetId]
  if (!planet?.battle) return

  const defenders = planet.ships
  const attackers = planet.battle.attackers
  const attackerOwner = planet.battle.attackerOwner

  // Both sides destroyed.
  if (defenders <= 0 && attackers <= 0) {
    planet.owner = 0
    planet.ships = 0
    planet.progress = 0
    planet.mode = 'B'
    clearBattle(planetStates, planetId)
    return
  }

  // Defenders destroyed, attackers survive and capture.
  if (defenders <= 0 && attackers > 0) {
    planet.owner = attackerOwner
    planet.ships = attackers
    planet.progress = 0
    planet.mode = 'B'
    planet.level = 0
    clearBattle(planetStates, planetId)
    return
  }

  // Attackers destroyed, defenders hold.
  if (attackers <= 0 && defenders > 0) {
    clearBattle(planetStates, planetId)
  }
}

/**
 * Advance a single battle over time.
 *
 * Current rule:
 * - each side loses battleRate ships per second
 * - losses are symmetric
 * - lopsided battles resolve faster via a capped logarithmic multiplier
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 * @param {number} dtSeconds
 */
export function updatePlanetBattle(map, planetStates, planetId, dtSeconds) {
  const planet = planetStates[planetId]
  if (!planet?.battle) return
  if (!dtSeconds || dtSeconds <= 0) return

  const defenders = planet.ships
  const attackers = planet.battle.attackers

  const { battleRate } = getMapRules(map)
  const battleSpeedMultiplier = getBattleSpeedMultiplier(map, attackers, defenders)
  const losses = battleRate * battleSpeedMultiplier * dtSeconds

  planet.ships = Math.max(0, planet.ships - losses)
  planet.battle.attackers = Math.max(0, planet.battle.attackers - losses)

  resolveBattleOutcome(planetStates, planetId)
}

/**
 * Advance all battles on all planets.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {number} dtSeconds
 */
export function updateBattles(map, planetStates, dtSeconds) {
  for (const planetId of Object.keys(planetStates)) {
    updatePlanetBattle(map, planetStates, planetId, dtSeconds)
  }
}

/**
 * Resolve a fleet arriving at its destination.
 *
 * Rules for this stage:
 * - friendly arrival adds ships
 * - enemy arrival starts a battle if none exists
 * - enemy arrival reinforces the battle if the same attacker is already present
 * - third-party arrival into an existing battle is ignored for now
 *
 * @param {Record<string, any>} planetStates
 * @param {{
 *   owner: number,
 *   from: string,
 *   to: string,
 *   ships: number,
 *   progress: number,
 *   duration: number,
 * }} fleet
 */
export function resolveFleetArrival(planetStates, fleet) {
  const target = planetStates[fleet.to]
  if (!target) return

  // Friendly arrival reinforces the planet directly.
  if (target.owner === fleet.owner) {
    target.ships += fleet.ships
    return
  }

  // No battle yet: start one.
  if (!target.battle) {
    startBattle(planetStates, fleet.to, fleet.owner, fleet.ships)
    return
  }

  // Same attacker: reinforce the current battle.
  if (target.battle.attackerOwner === fleet.owner) {
    reinforceBattle(planetStates, fleet.to, fleet.ships)
    return
  }
  // Special 2-player neutral case:
  // a second player arriving at a neutral planet under attack
  // becomes the defender/claimant side.
  if (target.owner === 0) {
    target.owner = fleet.owner
    target.level = 0
    target.ships += fleet.ships
    return
  }
  /*
  // Alternative neutral contested-arrival rule:
  // a second player arriving at a neutral planet under attack does NOT
  // inherit the neutral defenders for free.
  //
  // Instead, resolve the arriving fleet instantly against the current
  // neutral defenders. Only the surviving difference, if any, becomes
  // the new defender side.
  if (target.owner === 0) {
    if (fleet.ships > target.ships) {
      // Arriving fleet beats the neutral defenders and becomes the new defender side.
      target.owner = fleet.owner
      target.ships = fleet.ships - target.ships
    } else if (fleet.ships === target.ships) {
      // Mutual destruction leaves the planet neutral and empty.
      target.owner = 0
      target.ships = 0
    } else {
      // Neutral defenders survive with reduced numbers.
      target.ships -= fleet.ships
    }

    return
  }
  */
  // Different player arriving at an already contested non-neutral planet:
  // not supported yet.

}

/**
 * Advance all fleets and resolve arrivals.
 *
 * Removes fleets that have arrived.
 *
 * @param {Record<string, any>} planetStates
 * @param {any[]} fleets
 * @param {number} dtSeconds
 */
export function updateFleets(planetStates, fleets, dtSeconds) {
  for (const fleet of fleets) {
    fleet.progress += dtSeconds
  }

  for (let i = fleets.length - 1; i >= 0; i -= 1) {
    const fleet = fleets[i]
    if (fleet.progress >= fleet.duration) {
      resolveFleetArrival(planetStates, fleet)
      fleets.splice(i, 1)
    }
  }
}

/**
 * Advance the game simulation by one tick.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {any[]} fleets
 * @param {number} dtSeconds
 */
export function stepGame(map, planetStates, fleets, dtSeconds) {
  if (!dtSeconds || dtSeconds <= 0) return

  updatePlanets(map, planetStates, dtSeconds)
  updateFleets(planetStates, fleets, dtSeconds)
  updateBattles(map, planetStates, dtSeconds)
}