import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import { retreatBattle, sendFleet, setPlanetMode, stepGame } from './engine.js'
import { getPlayerStats, getPlanetButtonsForPlayer } from './selectors.js'
import { createMatchState } from './state.js'
import { getWinner } from './rules.js'

/**
 * Main Vue bridge for the game system.
 *
 * Owns:
 * - current map
 * - reactive match state
 * - animation loop
 * - simple player selections
 *
 * Exposes:
 * - state for rendering
 * - derived stats/button data
 * - game actions for UI
 *
 * @param {object} initialMap
 */
export function useGame(initialMap) {
  const currentMap = ref(initialMap)

  const freshState = createMatchState(currentMap.value)

  const matchState = reactive({
    planetStates: freshState.planetStates,
    fleets: freshState.fleets,
  })

  const winner = computed(() =>
    getWinner(currentMap.value, matchState.planetStates)
  )

  const playerSelections = reactive({
    1: null,
    2: null,
  })

  const running = ref(false)
  const lastFrameTime = ref(0)
  let animationFrameId = 0

  function applyFreshState(map) {
    const nextState = createMatchState(map)
    matchState.planetStates = nextState.planetStates
    matchState.fleets = nextState.fleets

    playerSelections[1] = null
    playerSelections[2] = null
  }

  /**
   * Reset the current match using the current map.
   */
  function resetGame() {
    applyFreshState(currentMap.value)

    if (!running.value) {
      start()
    }
  }

  /**
   * Change to a new map and create a fresh match from it.
   *
   * @param {object} nextMap
   */
  function setMap(nextMap) {
    if (!nextMap) return

    currentMap.value = nextMap
    applyFreshState(nextMap)

    if (!running.value) {
      start()
    }
  }

  /**
   * Advance one animation frame.
   *
   * @param {number} nowMs
   */
  function frame(nowMs) {
    if (!running.value) return

    if (!lastFrameTime.value) {
      lastFrameTime.value = nowMs
    }

    const dtSeconds = Math.max(0, (nowMs - lastFrameTime.value) / 1000)
    lastFrameTime.value = nowMs

    stepGame(
      currentMap.value,
      matchState.planetStates,
      matchState.fleets,
      dtSeconds
    )

    if (winner.value !== 0) {
      stop()
      return
    }

    animationFrameId = requestAnimationFrame(frame)
  }

  /**
   * Start the simulation loop.
   */
  function start() {
    if (running.value) return

    running.value = true
    lastFrameTime.value = 0
    animationFrameId = requestAnimationFrame(frame)
  }

  /**
   * Stop the simulation loop.
   */
  function stop() {
    running.value = false
    lastFrameTime.value = 0

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }
  }

  /**
   * Toggle a player's selected source planet.
   *
   * @param {number} playerId
   * @param {string | null} planetId
   */
  function setPlayerSelection(playerId, planetId) {
    playerSelections[playerId] = planetId
  }

  /**
   * Clear a player's current selection.
   *
   * @param {number} playerId
   */
  function clearPlayerSelection(playerId) {
    playerSelections[playerId] = null
  }

  /**
   * Try to send a fleet from the selected source to a destination.
   *
   * @param {number} playerId
   * @param {string} toId
   * @returns {boolean}
   */
  function sendSelectedFleet(playerId, toId) {
    const fromId = playerSelections[playerId]
    if (!fromId) return false

    const success = sendFleet(
      currentMap.value,
      matchState.planetStates,
      matchState.fleets,
      playerId,
      fromId,
      toId
    )

    return success
  }

  /**
   * Retreat the attacking side from a selected battle planet.
   *
   * @param {number} playerId
   * @param {string} toId
   * @returns {boolean}
   */
  function retreatSelectedBattle(playerId, toId) {
    const fromId = playerSelections[playerId]
    if (!fromId) return false

    const success = retreatBattle(
      currentMap.value,
      matchState.planetStates,
      matchState.fleets,
      playerId,
      fromId,
      toId
    )

    if (success) {
      playerSelections[playerId] = null
    }

    return success
  }

  /**
   * Set a planet's mode for a player.
   *
   * @param {number} playerId
   * @param {string} planetId
   * @param {'B' | 'U'} mode
   * @returns {boolean}
   */
  function setPlanetModeForPlayer(playerId, planetId, mode) {
    return setPlanetMode(matchState.planetStates, playerId, planetId, mode)
  }

const player1Stats = computed(() =>
  getPlayerStats(currentMap.value, matchState.planetStates, matchState.fleets, 1)
)

const player2Stats = computed(() =>
  getPlayerStats(currentMap.value, matchState.planetStates, matchState.fleets, 2)
)

  const player1PlanetButtons = computed(() =>
    getPlanetButtonsForPlayer(currentMap.value, matchState.planetStates, 1)
  )

  const player2PlanetButtons = computed(() =>
    getPlanetButtonsForPlayer(currentMap.value, matchState.planetStates, 2)
  )

  onMounted(() => {
    start()
  })

  onBeforeUnmount(() => {
    stop()
  })

  return {
    map: computed(() => currentMap.value),
    matchState,

    planetStates: computed(() => matchState.planetStates),
    fleets: computed(() => matchState.fleets),

    playerSelections,

    running,
    start,
    stop,
    resetGame,
    setMap,
    winner,

    setPlayerSelection,
    clearPlayerSelection,
    sendSelectedFleet,
    setPlanetModeForPlayer,

    player1Stats,
    player2Stats,
    player1PlanetButtons,
    player2PlanetButtons,
    retreatSelectedBattle,
  }
}