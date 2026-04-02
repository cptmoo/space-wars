<template>
  <NewGameScreen
    v-if="gamePhase === 'new-game'"
    :maps="MAPS"
    :initial-map-id="selectedMapId"
    :can-close="hasPausedGame"
    @start="handleStartFromNewGame"
    @close="handleCloseNewGame"
  />

  <StatsScreen
    v-else-if="gamePhase === 'stats'"
    :players="players"
    :winner-id="winner"
    :map-name="map.name"
    :win-type="map.winCondition?.type ?? 'elimination'"
    :match-history="matchHistory"
    :player1-final-stats="player1Stats"
    :player2-final-stats="player2Stats"
    @new-game="handleReturnToNewGame"
  />

  <div v-else class="app-shell">
    <PlayerConsole
      class="console-top"
      :player="players[1]"
      :planet-buttons="planetButtonsForPlayer(2)"
      :selected-source-id="playerSelections[2]"
      :planet-states="planetStates"
      :stats="playerStats(2)"
      mirrored
      @planet-press="handleConsolePlanetPress(2, $event)"
      @planet-long-press="handleConsolePlanetLongPress(2, $event)"
      @set-mode="({ planetId, mode }) => setPlanetMode(2, planetId, mode)"
    />

    <main class="board-stage">
      <div class="board-wrap">
        <GameBoard
          :map-data="map"
          :planet-states="planetStates"
          :fleets="fleets"
        />

      <MenuButton
        :open="menuOpen"
        @toggle="handleToggleMenu"
        @new-game="handleOpenNewGame"
        @restart="handleResetGame"
        @end-game="handleEndGame"
        @help="handleToggleHelp"
      />

        <div v-if="showHelp" class="help-panel card">
          <h2>How this prototype works</h2>
          <p>All control happens through the player consoles.</p>
          <p>First press: select one of your planets that can send.</p>
          <p>Second press: choose any linked planet to send.</p>
          <p>Press the selected planet again to cancel.</p>
          <p>B builds ships. U upgrades the planet.</p>
        </div>
    <!--    <div v-if="winner !== 0" class="win-panel card">
          <h2>{{ winnerName() }} wins</h2>
          <p>Win condition: {{ map.winCondition?.type ?? 'elimination' }}</p>
          <button class="menu-item" @click="handleEndGame">Stats</button>
        </div>-->
      </div>
    </main>

    <PlayerConsole
      class="console-bottom"
      :player="players[0]"
      :planet-buttons="planetButtonsForPlayer(1)"
      :selected-source-id="playerSelections[1]"
      :planet-states="planetStates"
      :stats="playerStats(1)"
      @planet-press="handleConsolePlanetPress(1, $event)"
      @planet-long-press="handleConsolePlanetLongPress(1, $event)"
      @set-mode="({ planetId, mode }) => setPlanetMode(1, planetId, mode)"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import GameBoard from './components/GameBoard.vue'
import MenuButton from './components/MenuButton.vue'
import PlayerConsole from './components/PlayerConsole.vue'
import NewGameScreen from './components/NewGameScreen.vue'
import StatsScreen from './components/StatsScreen.vue'
import { MAPS } from './game/maps/index.js'

import {
  canBuild,
  canSelectOwnedPlanet,
  canSelectSource,
  getBuildRate,
  getConnectedPlanetIds,
  getSendableShips,
} from './game/rules.js'
import { isAttackingBattleOnPlanet } from './game/selectors.js'
import { useGame } from './game/useGame.js'

const players = [
  { id: 1, name: 'South', short: 'S', colourClass: 'player-1' },
  { id: 2, name: 'North', short: 'N', colourClass: 'player-2' },
]

const menuOpen = ref(false)
const showHelp = ref(false)
const gamePhase = ref('new-game')
const hasPausedGame = ref(false)
const selectedMapId = ref(MAPS[0]?.id ?? '')

const {
  map,
  matchState,
  planetStates,
  fleets,
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
  matchHistory,
  captureHistoryNow,
} = useGame(MAPS[0])

const player1StatsForScreen = computed(() => player1Stats.value)
const player2StatsForScreen = computed(() => player2Stats.value)

function buildPer10sForPlayer(playerId) {
  let total = 0

  for (const planet of map.value.planets) {
    const state = planetStates.value[planet.id]
    if (!state) continue
    if (state.owner !== playerId) continue
    if (state.mode !== 'B') continue
    if (state.battle) continue
    if (!canBuild(map.value, planetStates.value, planet.id)) continue

    total += getBuildRate(map.value, planetStates.value, planet.id) * 10
  }

  return total.toFixed(1)
}

function winnerName() {
  if (winner.value === 1) return players[0].name
  if (winner.value === 2) return players[1].name
  return ''
}

function playerStats(playerId) {
  const mine = playerId === 1 ? player1Stats.value : player2Stats.value
  const opp = playerId === 1 ? player2Stats.value : player1Stats.value

  return {
    totalShips: mine.ships,
    totalLevels: mine.levels,
    totalPlanets: mine.planets,
    buildPer10s: mine.buildPer10s,
    buildPlanets: mine.buildPlanets,
    upgradePlanets: mine.upgradePlanets,
    averageLevel: mine.averageLevel,

    shipsDelta: mine.ships - opp.ships,
    buildDelta: mine.buildPer10s - opp.buildPer10s,
    levelsDelta: mine.levels - opp.levels,
  }
}

function decoratePlanetButtons(playerId, baseButtons) {
  const selectedSourceId = playerSelections[playerId]
  const selectedPlanetState = selectedSourceId
    ? planetStates.value[selectedSourceId]
    : null

  const selectedIsAttackingBattle =
    Boolean(
      selectedPlanetState?.battle &&
      selectedPlanetState?.battle.attackerOwner === playerId &&
      selectedPlanetState?.battle.attackers > 0
    )

  const selectedCanSendNormally =
    Boolean(selectedSourceId && canSelectSource(planetStates.value, playerId, selectedSourceId))

  const validTargets =
    selectedSourceId && (selectedIsAttackingBattle || selectedCanSendNormally)
      ? getConnectedPlanetIds(map.value, selectedSourceId)
      : []

  return baseButtons.map((planet) => {
    let actionMode = 'disabled'

    if (!selectedSourceId) {
      if (canSelectActionSource(playerId, planet.id)) {
        actionMode = 'source'
      }
    } else {
      if (planet.id === selectedSourceId) {
        actionMode = 'cancel'
      } else if (validTargets.includes(planet.id)) {
        actionMode = 'target'
      }
    }

    return {
      ...planet,
      ships: Math.round(planet.ships),
      actionMode,
      selected: planet.id === selectedSourceId,
    }
  })
}

function planetButtonsForPlayer(playerId) {
  const baseButtons = playerId === 1
    ? player1PlanetButtons.value
    : player2PlanetButtons.value

  return decoratePlanetButtons(playerId, baseButtons)
}

function handleConsolePlanetPress(playerId, planetId) {
  const selectedSourceId = playerSelections[playerId]

  if (!selectedSourceId) {
    if (canSelectActionSource(playerId, planetId)) {
      setPlayerSelection(playerId, planetId)
    }
    return
  }

  if (planetId === selectedSourceId) {
    clearPlayerSelection(playerId)
    return
  }

  const selectedPlanetState = planetStates.value[selectedSourceId]

  const isBattleRetreatSource =
    selectedPlanetState?.battle?.attackerOwner === playerId &&
    selectedPlanetState?.battle?.attackers > 0

  const canSendNormally =
    canSelectSource(planetStates.value, playerId, selectedSourceId)

  const canActThroughMovement = isBattleRetreatSource || canSendNormally
  if (!canActThroughMovement) {
    return
  }

  const validTargets = getConnectedPlanetIds(map.value, selectedSourceId)
  if (!validTargets.includes(planetId)) {
    return
  }

  if (isBattleRetreatSource) {
    retreatSelectedBattle(playerId, planetId)
    return
  }

  sendSelectedFleet(playerId, planetId)
}

function handleConsolePlanetLongPress(playerId, planetId) {
  if (!canSelectActionSource(playerId, planetId)) {
    return
  }

  setPlayerSelection(playerId, planetId)
}


function setPlanetMode(playerId, planetId, mode) {
  setPlanetModeForPlayer(playerId, planetId, mode)
}

function canSelectActionSource(playerId, planetId) {
  const planet = planetStates.value[planetId]

  return (
    canSelectOwnedPlanet(planetStates.value, playerId, planetId) ||
    isAttackingBattleOnPlanet(planetStates.value, playerId, planetId) ||
    Boolean(
      planet &&
      planet.owner === playerId &&
      planet.battle &&
      getSendableShips(planetStates.value, planetId) > 0
    )
  )
}

function handleResetGame() {
  resetGame()
  menuOpen.value = false
  showHelp.value = false
  gamePhase.value = 'playing'
  start()
}

function buildRuntimeMap(baseMap, settings) {
  return {
    ...baseMap,
    rules: {
      ...(baseMap.rules ?? {}),
      maxShips: settings.maxShips,
      maxLevel: settings.maxLevel,
      shipTimeFactor: settings.shipTimeFactor,
      upgradeTimeFactor: settings.upgradeTimeFactor,
      flightTimeFactor: settings.flightTimeFactor,
      capitalBonus: settings.capitalBonus,
      battleRate: settings.battleRate,
    },
    winCondition: {
      ...(baseMap.winCondition ?? {}),
      type: settings.winType,
    },
  }
}

function handleStartFromNewGame(payload) {
  const selectedBaseMap =
    MAPS.find((mapItem) => mapItem.id === payload.mapId) ?? MAPS[0]

  const runtimeMap = buildRuntimeMap(selectedBaseMap, payload.settings)

  selectedMapId.value = selectedBaseMap.id
  hasPausedGame.value = false

  setMap(runtimeMap)
  start()

  menuOpen.value = false
  showHelp.value = false
  gamePhase.value = 'playing'
}

function handleCloseNewGame() {
  if (!hasPausedGame.value) {
    return
  }

  menuOpen.value = false
  showHelp.value = false
  gamePhase.value = 'playing'
  start()
  hasPausedGame.value = false
}

function handleOpenNewGame() {
  if (gamePhase.value === 'playing' && winner.value === 0) {
    stop()
    hasPausedGame.value = true
    selectedMapId.value = map.value.id
  }

  gamePhase.value = 'new-game'
  menuOpen.value = false
  showHelp.value = false
}

function handleReturnToNewGame() {
  stop()
  hasPausedGame.value = false
  selectedMapId.value = map.value.id

  menuOpen.value = false
  showHelp.value = false
  gamePhase.value = 'new-game'
}

function handleToggleMenu() {
  menuOpen.value = !menuOpen.value

  if (menuOpen.value) {
    stop()
  } else if (gamePhase.value === 'playing' && winner.value === 0 && !showHelp.value) {
    start()
  }
}

function handleToggleHelp() {
  showHelp.value = !showHelp.value
  menuOpen.value = false
}

watch(winner, (nextWinner, previousWinner) => {
  if (gamePhase.value !== 'playing') return
  if (previousWinner !== 0) return
  if (nextWinner === 0) return

  handleEndGame()
})

function handleEndGame() {
  stop()
  captureHistoryNow()
  menuOpen.value = false
  showHelp.value = false
  hasPausedGame.value = false
  gamePhase.value = 'stats'
}
</script>