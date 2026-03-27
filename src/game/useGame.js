import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import map01 from './maps/map01.js'
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
 */
export function useGame() {
  const map = map01

  const matchState = reactive(createMatchState(map))
  const winner = computed(() => getWinner(map, matchState.planetStates))
  const playerSelections = reactive({
    1: null,
    2: null,
  })

  const running = ref(false)
  const lastFrameTime = ref(0)
  let animationFrameId = 0

  /**
   * Reset the current match to its initial state.
   */
  function resetGame() {
    const freshState = createMatchState(map)

    matchState.planetStates = freshState.planetStates
    matchState.fleets = freshState.fleets

    playerSelections[1] = null
    playerSelections[2] = null
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

    stepGame(map, matchState.planetStates, matchState.fleets, dtSeconds)
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
   * This is intentionally simple for now.
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
   * If successful, clear the selection.
   *
   * @param {number} playerId
   * @param {string} toId
   * @returns {boolean}
   */
  function sendSelectedFleet(playerId, toId) {
    const fromId = playerSelections[playerId]
    if (!fromId) return false

    const success = sendFleet(
      map,
      matchState.planetStates,
      matchState.fleets,
      playerId,
      fromId,
      toId
    )


    // clear selection (commented out, so keep selection)
    /*if (success) {
      playerSelections[playerId] = null
    } */

    return success
  }

/**
 * Retreat the attacking side from a selected battle planet.
 *
 * If successful, clear the selection.
 *
 * @param {number} playerId
 * @param {string} toId
 * @returns {boolean}
 */
function retreatSelectedBattle(playerId, toId) {
  const fromId = playerSelections[playerId]
  if (!fromId) return false

  const success = retreatBattle(
    map,
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
    getPlayerStats(matchState.planetStates, 1)
  )

  const player2Stats = computed(() =>
    getPlayerStats(matchState.planetStates, 2)
  )

  const player1PlanetButtons = computed(() =>
    getPlanetButtonsForPlayer(map, matchState.planetStates, 1)
  )

  const player2PlanetButtons = computed(() =>
    getPlanetButtonsForPlayer(map, matchState.planetStates, 2)
  )

  onMounted(() => {
    start()
  })

  onBeforeUnmount(() => {
    stop()
  })

  return {
    map,
    matchState,

    planetStates: computed(() => matchState.planetStates),
    fleets: computed(() => matchState.fleets),

    playerSelections,

    running,
    start,
    stop,
    resetGame,
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