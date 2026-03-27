<template>
  <div class="app-shell">
    <PlayerConsole
      class="console-top"
      :player="players[1]"
      :planet-buttons="planetButtonsForPlayer(2)"
      :selected-source-id="playerSelections[2]"
      :planet-states="planetStates"
      :stats="playerStats(2)"
      mirrored
      @planet-press="handleConsolePlanetPress(2, $event)"
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
          @toggle="menuOpen = !menuOpen"
          @new-game="handleResetGame"
          @restart="handleResetGame"
          @help="showHelp = !showHelp"
        />

        <div v-if="showHelp" class="help-panel card">
          <h2>How this prototype works</h2>
          <p>All control happens through the player consoles.</p>
          <p>First press: select one of your planets that can send.</p>
          <p>Second press: choose any linked planet to send.</p>
          <p>Press the selected planet again to cancel.</p>
          <p>B builds ships. U upgrades the planet.</p>
        </div>
        <div v-if="winner !== 0" class="win-panel card">
          <h2>{{ winnerName() }} wins</h2>
          <p>Win condition: {{ map.winCondition?.type ?? 'elimination' }}</p>
          <button class="menu-item" @click="handleResetGame">Play again</button>
        </div>
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
      @set-mode="({ planetId, mode }) => setPlanetMode(1, planetId, mode)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

import GameBoard from './components/GameBoard.vue'
import MenuButton from './components/MenuButton.vue'
import PlayerConsole from './components/PlayerConsole.vue'

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

const {
  map,
  planetStates,
  fleets,
  playerSelections,
  resetGame,
  setPlayerSelection,
  clearPlayerSelection,
  sendSelectedFleet,
  retreatSelectedBattle,
  setPlanetModeForPlayer,
  player1Stats,
  player2Stats,
  player1PlanetButtons,
  player2PlanetButtons,
  winner,
} = useGame()

function buildPer10sForPlayer(playerId) {
  let total = 0

  for (const planet of map.planets) {
    const state = planetStates.value[planet.id]
    if (!state) continue
    if (state.owner !== playerId) continue
    if (state.mode !== 'B') continue
    if (state.battle) continue
    if (!canBuild(map, planetStates.value, planet.id)) continue

    total += getBuildRate(map, planetStates.value, planet.id) * 10
  }

  return total.toFixed(1)
}

function winnerName() {
  if (winner.value === 1) return players[0].name
  if (winner.value === 2) return players[1].name
  return ''
}

function playerStats(playerId) {
  const base = playerId === 1 ? player1Stats.value : player2Stats.value

  return {
    totalShips: Math.round(base.ships),
    totalLevels: Math.round(base.levels),
    buildPer10s: buildPer10sForPlayer(playerId),
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
      ? getConnectedPlanetIds(map, selectedSourceId)
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

  const validTargets = getConnectedPlanetIds(map, selectedSourceId)
  if (!validTargets.includes(planetId)) {
    return
  }

  if (isBattleRetreatSource) {
    retreatSelectedBattle(playerId, planetId)
    return
  }

  sendSelectedFleet(playerId, planetId)
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
}
</script>