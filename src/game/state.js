export const DEFAULT_PLANET_MODE = 'B'

/**
 * Create a live runtime planet state from a static planet definition.
 *
 * The map owns static data such as coordinates, labels, special types,
 * and overrides. Runtime state only keeps values that can change during play.
 *
 * @param {object} planetDef
 * @returns {{
 *   owner: number,
 *   ships: number,
 *   level: number,
 *   mode: string,
 *   progress: number,
 *   battle: null | {
 *     attackerOwner: number,
 *     attackers: number,
 *   },
 * }}
 */
export function makePlanetStateFromDefinition(planetDef) {
  return {
    owner: planetDef.initialOwner ?? 0,
    ships: planetDef.initialShips ?? 0,
    level: planetDef.initialLevel ?? 1,
    mode: planetDef.initialMode ?? DEFAULT_PLANET_MODE,
    progress: 0,
    battle: null,
  }
}

/**
 * Build the full planetStates object from a map definition.
 *
 * @param {object} map
 * @returns {Record<string, {
 *   owner: number,
 *   ships: number,
 *   level: number,
 *   mode: string,
 *   progress: number,
 *   battle: null | {
 *     attackerOwner: number,
 *     attackers: number,
 *   },
 * }>}
 */
export function createPlanetStates(map) {
  const planetStates = {}

  for (const planet of map.planets ?? []) {
    planetStates[planet.id] = makePlanetStateFromDefinition(planet)
  }

  return planetStates
}

/**
 * Create a fresh match state from a map definition.
 *
 * This is the live mutable state for one game instance.
 *
 * @param {object} map
 * @returns {{
 *   planetStates: Record<string, {
 *     owner: number,
 *     ships: number,
 *     level: number,
 *     mode: string,
 *     progress: number,
 *     battle: null | {
 *       attackerOwner: number,
 *       attackers: number,
 *     },
 *   }>,
 *   fleets: any[],
 * }}
 */
export function createMatchState(map) {
  return {
    planetStates: createPlanetStates(map),
    fleets: [],
  }
}