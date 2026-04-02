import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import { retreatBattle, sendFleet, setPlanetMode, stepGame } from './engine.js'
import { getPlayerStats, getPlanetButtonsForPlayer } from './selectors.js'
import { createMatchState } from './state.js'
import { getWinner } from './rules.js'

const HISTORY_SNAPSHOT_INTERVAL_SECONDS = 1

/**
 * Build one history snapshot for both players.
 *
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {any[]} fleets
 * @param {number} elapsedSeconds
 * @returns {{
 *   t: number,
 *   players: {
 *     1: ReturnType<typeof getPlayerStats>,
 *     2: ReturnType<typeof getPlayerStats>,
 *   },
 * }}
 */
function createHistorySnapshot(map, planetStates, fleets, elapsedSeconds) {
  return {
    t: elapsedSeconds,
    players: {
      1: getPlayerStats(map, planetStates, fleets, 1),
      2: getPlayerStats(map, planetStates, fleets, 2),
    },
  }
}

/**
 * Record a snapshot unless one already exists at this exact time.
 *
 * @param {object} history
 * @param {object} map
 * @param {Record<string, any>} planetStates
 * @param {any[]} fleets
 * @param {number} elapsedSeconds
 */
function recordHistorySnapshot(history, map, planetStates, fleets, elapsedSeconds) {
  const roundedTime = Number(elapsedSeconds.toFixed(3))
  const lastSnapshot = history.snapshots[history.snapshots.length - 1]

  if (lastSnapshot && Math.abs(lastSnapshot.t - roundedTime) < 0.0005) {
    return
  }

  history.snapshots.push(
    createHistorySnapshot(map, planetStates, fleets, roundedTime)
  )
}

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
    history: freshState.history,
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
  let historySnapshotClock = 0

  function resetHistoryClock() {
    historySnapshotClock = 0
  }

  function initialiseHistory() {
    matchState.history.snapshotIntervalSeconds = HISTORY_SNAPSHOT_INTERVAL_SECONDS
    matchState.history.elapsedSeconds = 0
    matchState.history.winner = 0
    matchState.history.snapshots = []

    recordHistorySnapshot(
      matchState.history,
      currentMap.value,
      matchState.planetStates,
      matchState.fleets,
      0
    )

    resetHistoryClock()
  }

  function applyFreshState(map) {
    const nextState = createMatchState(map)
    matchState.planetStates = nextState.planetStates
    matchState.fleets = nextState.fleets
    matchState.history = nextState.history

    playerSelections[1] = null
    playerSelections[2] = null

    initialiseHistory()
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

    if (dtSeconds > 0) {
      matchState.history.elapsedSeconds += dtSeconds
      historySnapshotClock += dtSeconds
    }

    stepGame(
      currentMap.value,
      matchState.planetStates,
      matchState.fleets,
      dtSeconds
    )

    const snapshotInterval =
      matchState.history.snapshotIntervalSeconds || HISTORY_SNAPSHOT_INTERVAL_SECONDS

    while (historySnapshotClock >= snapshotInterval) {
      historySnapshotClock -= snapshotInterval

      recordHistorySnapshot(
        matchState.history,
        currentMap.value,
        matchState.planetStates,
        matchState.fleets,
        matchState.history.elapsedSeconds
      )
    }

    if (winner.value !== 0) {
      matchState.history.winner = winner.value

      recordHistorySnapshot(
        matchState.history,
        currentMap.value,
        matchState.planetStates,
        matchState.fleets,
        matchState.history.elapsedSeconds
      )

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
   * Force a final history snapshot at the current time.
   * Useful for manual end-game / stats screen transitions.
   */
  function captureHistoryNow() {
    recordHistorySnapshot(
      matchState.history,
      currentMap.value,
      matchState.planetStates,
      matchState.fleets,
      matchState.history.elapsedSeconds
    )
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

  const elapsedSeconds = computed(() => matchState.history.elapsedSeconds)
  const matchHistory = computed(() => matchState.history)
  const historySnapshots = computed(() => matchState.history.snapshots)

  onMounted(() => {
    initialiseHistory()
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
    matchHistory,
    historySnapshots,
    elapsedSeconds,

    playerSelections,

    running,
    start,
    stop,
    resetGame,
    setMap,
    winner,
    captureHistoryNow,

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