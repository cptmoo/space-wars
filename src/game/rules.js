export const DEFAULT_RULES = {
  maxShips: 50,
  maxLevel: 5,
  shipTimeFactor: 1,
  upgradeTimeFactor: 1,
  battleRate: 2,
}

/**
 * Return the effective rules for a map by merging defaults with map overrides.
 *
 * @param {object} map
 * @returns {{
 *   maxShips: number,
 *   maxLevel: number,
 *   shipTimeFactor: number,
 *   upgradeTimeFactor: number,
 * }}
 */
export function getMapRules(map) {
  return {
    ...DEFAULT_RULES,
    ...(map.rules ?? {}),
  }
}

/**
 * Get a planet definition by id from the map.
 *
 * @param {object} map
 * @param {string} planetId
 * @returns {object | null}
 */
export function getPlanetDef(map, planetId) {
  return (map.planets ?? []).find((planet) => planet.id === planetId) ?? null
}

/**
 * Get the effective rules for a specific planet, including per-planet overrides.
 *
 * @param {object} map
 * @param {string} planetId
 * @returns {{
 *   maxShips: number,
 *   maxLevel: number,
 *   shipTimeFactor: number,
 *   upgradeTimeFactor: number,
 * }}
 */
export function getPlanetRules(map, planetId) {
  const mapRules = getMapRules(map)
  const planetDef = getPlanetDef(map, planetId)

  return {
    ...mapRules,
    ...(planetDef?.overrides ?? {}),
  }
}

/**
 * True if the map contains the given planet id.
 *
 * @param {object} map
 * @param {string} planetId
 * @returns {boolean}
 */
export function hasPlanet(map, planetId) {
  return getPlanetDef(map, planetId) !== null
}

/**
 * Return true if two planets are directly connected by an edge.
 * Edges are treated as bidirectional.
 *
 * @param {object} map
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function areConnected(map, a, b) {
  return (map.edges ?? []).some(
    (edge) =>
      (edge.from === a && edge.to === b) ||
      (edge.from === b && edge.to === a)
  )
}

/**
 * Return the edge object between two connected planets, or null if none exists.
 * Edges are treated as bidirectional.
 *
 * @param {object} map
 * @param {string} a
 * @param {string} b
 * @returns {object | null}
 */
export function getEdge(map, a, b) {
  return (
    (map.edges ?? []).find(
      (edge) =>
        (edge.from === a && edge.to === b) ||
        (edge.from === b && edge.to === a)
    ) ?? null
  )
}

/**
 * Get all directly connected planet ids.
 *
 * @param {object} map
 * @param {string} planetId
 * @returns {string[]}
 */
export function getConnectedPlanetIds(map, planetId) {
  const result = []

  for (const edge of map.edges ?? []) {
    if (edge.from === planetId) {
      result.push(edge.to)
    } else if (edge.to === planetId) {
      result.push(edge.from)
    }
  }

  return result
}

/**
 * Return the owning player of a planet from runtime state.
 *
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 * @returns {number}
 */
export function getPlanetOwner(planetStates, planetId) {
  return planetStates[planetId]?.owner ?? 0
}

/**
 * Return true if this planet is currently owned by the given player.
 *
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @param {string} planetId
 * @returns {boolean}
 */
export function isOwnedByPlayer(planetStates, playerId, planetId) {
  return getPlanetOwner(planetStates, planetId) === playerId
}

/**
 * Return true if a planet can be selected as a source by the player.
 *
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @param {string} planetId
 * @returns {boolean}
 */
export function canSelectSource(planetStates, playerId, planetId) {
  const planet = planetStates[planetId]
  if (!planet) return false
  return planet.owner === playerId && planet.ships > 1
}

/**
 * Return true if this planet is currently owned by the given player.
 *
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @param {string} planetId
 * @returns {boolean}
 */
export function canSelectOwnedPlanet(planetStates, playerId, planetId) {
  const planet = planetStates[planetId]
  if (!planet) return false
  return planet.owner === playerId
}

/**
 * Return true if the player can send from one planet to another.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @param {string} fromId
 * @param {string} toId
 * @returns {boolean}
 */
export function canSendFleet(map, planetStates, playerId, fromId, toId) {
  if (!fromId || !toId) return false
  if (fromId === toId) return false
  if (!hasPlanet(map, fromId) || !hasPlanet(map, toId)) return false
  if (!canSelectSource(planetStates, playerId, fromId)) return false
  if (!areConnected(map, fromId, toId)) return false
  return true
}

/**
 * Number of ships available to send from a planet.
 * Current rule: send half, rounded down. 
 *
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 * @returns {number}
 */
export function getSendableShips(planetStates, planetId) {
  const ships = planetStates[planetId]?.ships ?? 0
  return Math.max(0, Math.floor(ships / 2))
}

/**
 * Return the effective flight time between two connected planets.
 *
 * @param {object} map
 * @param {string} fromId
 * @param {string} toId
 * @returns {number}
 */
export function getFlightTime(map, fromId, toId) {
  const edge = getEdge(map, fromId, toId)
  if (!edge) return Infinity

  const fromRules = getPlanetRules(map, fromId)
  return (edge.flightTime ?? 1) * fromRules.shipTimeFactor
}

/**
 * True if the planet is allowed to build more ships.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 * @returns {boolean}
 */
export function canBuild(map, planetStates, planetId) {
  const planet = planetStates[planetId]
  if (!planet) return false

  const rules = getPlanetRules(map, planetId)
  return planet.ships < rules.maxShips
}

/**
 * True if the planet is allowed to upgrade.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 * @returns {boolean}
 */
export function canUpgrade(map, planetStates, planetId) {
  const planet = planetStates[planetId]
  if (!planet) return false

  const rules = getPlanetRules(map, planetId)
  return planet.level < rules.maxLevel
}

/**
 * Return true if the given mode string is valid.
 *
 * @param {string} mode
 * @returns {boolean}
 */
export function isValidPlanetMode(mode) {
  return mode === 'B' || mode === 'U'
}

/**
 * Return true if a player may change the mode of this planet.
 *
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @param {string} planetId
 * @param {string} mode
 * @returns {boolean}
 */
export function canSetPlanetMode(planetStates, playerId, planetId, mode) {
  const planet = planetStates[planetId]
  if (!planet) return false
  if (planet.owner !== playerId) return false
  if (!isValidPlanetMode(mode)) return false
  return true
}

/**
 * Build speed in "progress units per second".
 * You can tune this later to match your existing behaviour exactly.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 * @returns {number}
 */
export function getBuildRate(map, planetStates, planetId) {
  const planet = planetStates[planetId]
  if (!planet) return 0

  if (!canBuild(map, planetStates, planetId)) return 0

  const rules = getPlanetRules(map, planetId);

  const minRate = 0.30;
  const maxRate = 0.85;
  const k = 0.55;

  let rate = minRate + (maxRate - minRate) * (1 - Math.exp(-k * planet.level));
  // Faster at higher levels. Adjust later if needed.
  return rate / rules.shipTimeFactor
}

/**
 * Upgrade speed in "progress units per second".
 * You can tune this later to match your existing behaviour exactly.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {string} planetId
 * @returns {number}
 */
export function getUpgradeRate(map, planetStates, planetId) {
  const planet = planetStates[planetId]
  if (!planet) return 0
  if (!canUpgrade(map, planetStates, planetId)) return 0

  const rules = getPlanetRules(map, planetId)

  const baseTime = 6
  const linearTerm = 2
  const quadraticTerm = 0.4

  const timeToUpgrade =
    baseTime +
    linearTerm * planet.level +
    quadraticTerm * planet.level * planet.level

  return (1 / timeToUpgrade) / rules.upgradeTimeFactor
}

/**
 * Count planets currently owned by a player.
 *
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @returns {number}
 */
export function countOwnedPlanets(planetStates, playerId) {
  let count = 0

  for (const planet of Object.values(planetStates)) {
    if (planet.owner === playerId) {
      count += 1
    }
  }

  return count
}

/**
 * Sum total ships currently owned by a player.
 *
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @returns {number}
 */
export function countOwnedShips(planetStates, playerId) {
  let total = 0

  for (const planet of Object.values(planetStates)) {
    if (planet.owner === playerId) {
      total += planet.ships
    }
  }

  return total
}

/**
 * Sum total levels currently owned by a player.
 *
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @returns {number}
 */
export function countOwnedLevels(planetStates, playerId) {
  let total = 0

  for (const planet of Object.values(planetStates)) {
    if (planet.owner === playerId) {
      total += planet.level
    }
  }

  return total
}



/**
 * Return all planet ids that are capitals.
 *
 * @param {object} map
 * @returns {string[]}
 */
export function getCapitalPlanetIds(map) {
  return (map.planets ?? [])
    .filter((planet) => planet.specialType === 'capital')
    .map((planet) => planet.id)
}

/**
 * Return true if the player currently owns at least one planet.
 *
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @returns {boolean}
 */
export function playerHasAnyPlanets(planetStates, playerId) {
  return Object.values(planetStates).some((planet) => planet.owner === playerId)
}

/**
 * Return true if the player currently owns at least one capital.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @returns {boolean}
 */
export function playerHasAnyCapitals(map, planetStates, playerId) {
  const capitalIds = getCapitalPlanetIds(map)

  return capitalIds.some((planetId) => planetStates[planetId]?.owner === playerId)
}

/**
 * Determine whether the game has been won.
 *
 * Supported types:
 * - elimination
 * - capital-loss
 *
 * Returns:
 * - 1 or 2 for winner
 * - 0 for no winner yet
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @returns {0 | 1 | 2}
 */
export function getWinner(map, planetStates) {
  const winType = map.winCondition?.type ?? 'elimination'

  if (winType === 'capital-loss') {
    const p1HasCapital = playerHasAnyCapitals(map, planetStates, 1)
    const p2HasCapital = playerHasAnyCapitals(map, planetStates, 2)

    if (p1HasCapital && !p2HasCapital) return 1
    if (p2HasCapital && !p1HasCapital) return 2
    return 0
  }

  // Default: elimination
  const p1Alive = playerHasAnyPlanets(planetStates, 1)
  const p2Alive = playerHasAnyPlanets(planetStates, 2)

  if (p1Alive && !p2Alive) return 1
  if (p2Alive && !p1Alive) return 2

  return 0
}

