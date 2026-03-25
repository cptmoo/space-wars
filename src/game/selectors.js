import {
  countOwnedLevels,
  countOwnedPlanets,
  countOwnedShips,
} from './rules.js'

/**
 * Get a static planet definition by id.
 *
 * @param {object} map
 * @param {string} planetId
 * @returns {object | null}
 */
export function getPlanetDef(map, planetId) {
  return (map.planets ?? []).find((planet) => planet.id === planetId) ?? null
}

/**
 * Return true if this planet is one of the player's capitals planets.
 *
 * A planet counts as a home planet if:
 * - it has specialType 'capital'
 * - and its initial owner matches the player
 *
 * @param {object} map
 * @param {number} playerId
 * @param {string} planetId
 * @returns {boolean}
 */
export function isCapital(map, planetId) {
  const planetDef = getPlanetDef(map, planetId)
  return planetDef?.specialType === 'capital'
}

/**
 * Categorise a planet from the point of view of one player.
 *
 * Categories are intended for UI colour coding.
 *
 * Returns one of:
 * - 'home'
 * - 'owned'
 * - 'enemy'
 * - 'neutral'
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @param {string} planetId
 * @returns {'home' | 'owned' | 'enemy' | 'neutral'}
 */
export function getPlanetPerspective(map, planetStates, playerId, planetId) {
  const planetState = planetStates[planetId]
  if (!planetState) return 'neutral'

  if (planetState.owner === 0) {
    return 'neutral'
  }

    if (planetState.owner === playerId) {
    return 'owned'
    }

  return 'enemy'
}

/**
 * Build summary stats for one player.
 *
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @returns {{
 *   planets: number,
 *   ships: number,
 *   levels: number,
 * }}
 */
export function getPlayerStats(planetStates, playerId) {
  return {
    planets: countOwnedPlanets(planetStates, playerId),
    ships: countOwnedShips(planetStates, playerId),
    levels: countOwnedLevels(planetStates, playerId),
  }
}

/**
 * Create UI-friendly button data for all planets from one player's perspective.
 *
 * This intentionally includes all planets, not just owned planets,
 * so the console can colour-code home / owned / enemy / neutral planets.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @returns {Array<{
 *   id: string,
 *   label: string,
 *   owner: number,
 *   ships: number,
 *   level: number,
 *   mode: string,
 *   progress: number,
 *   hasBattle: boolean,
 *   battleAttackers: number,
 *   battleAttackerOwner: number | null,
 *   perspective: 'home' | 'owned' | 'enemy' | 'neutral',
 *   isCapital: boolean,
 * }>}
 */
export function getPlanetButtonsForPlayer(map, planetStates, playerId) {
  return (map.planets ?? []).map((planetDef) => {
    const planetState = planetStates[planetDef.id]
    const battle = planetState?.battle ?? null

    return {
      id: planetDef.id,
      label: planetDef.label ?? planetDef.id,
      owner: planetState?.owner ?? 0,
      ships: planetState?.ships ?? 0,
      level: planetState?.level ?? 1,
      mode: planetState?.mode ?? 'B',
      progress: planetState?.progress ?? 0,
      hasBattle: Boolean(battle),
      battleAttackers: battle?.attackers ?? 0,
      battleAttackerOwner: battle?.attackerOwner ?? null,
      perspective: getPlanetPerspective(map, planetStates, playerId, planetDef.id),
      isCapital: isCapital(map, planetDef.id),
    }
  })
}

/**
 * Get all player-facing planet button data keyed by planet id.
 *
 * Useful if the UI wants quick lookup instead of arrays.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @returns {Record<string, {
 *   id: string,
 *   label: string,
 *   owner: number,
 *   ships: number,
 *   level: number,
 *   mode: string,
 *   progress: number,
 *   hasBattle: boolean,
 *   battleAttackers: number,
 *   battleAttackerOwner: number | null,
 *   perspective: 'home' | 'owned' | 'enemy' | 'neutral',
 *   isHome: boolean,
 * }>}
 */
export function getPlanetButtonMapForPlayer(map, planetStates, playerId) {
  const result = {}

  for (const button of getPlanetButtonsForPlayer(map, planetStates, playerId)) {
    result[button.id] = button
  }

  return result
}


/**
 * Return true if this player is currently the attacking side in a battle on this planet.
 *
 * @param {Record<string, any>} planetStates
 * @param {number} playerId
 * @param {string} planetId
 * @returns {boolean}
 */
export function isAttackingBattleOnPlanet(planetStates, playerId, planetId) {
  const battle = planetStates[planetId]?.battle
  return Boolean(battle && battle.attackerOwner === playerId && battle.attackers > 0)
}

