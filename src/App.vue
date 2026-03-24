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
      :map-data="mapData"
      :planet-states="planetStates"
      :fleets="fleets"
    />

    <MenuButton
      :open="menuOpen"
      @toggle="menuOpen = !menuOpen"
      @new-game="resetGame"
      @restart="resetGame"
      @help="showHelp = !showHelp"
    />

    <div v-if="showHelp" class="help-panel card">
      <h2>How this prototype works</h2>
      <p>All control happens through the player consoles.</p>
      <p>First press: select one of your planets that can send.</p>
      <p>Second press: choose any linked planet to send half your ships.</p>
      <p>Press the selected planet again to cancel.</p>
      <p>B builds ships. U upgrades the planet.</p>
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
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import GameBoard from './components/GameBoard.vue'
import PlayerConsole from './components/PlayerConsole.vue'
import MenuButton from './components/MenuButton.vue'

const MAX_SHIPS = 50
const MAX_LEVEL = 5

const mapData = {
  width: 100,
  height: 100,
  planets: [
    { id: 'A', x: 12, y: 82 },
    { id: 'B', x: 76, y: 82 },
    { id: 'C', x: 45, y: 58 },
    { id: 'D', x: 20, y: 40 },
    { id: 'E', x: 80, y: 40 },
    { id: 'F', x: 54, y: 28 },
    { id: 'G', x: 24, y: 12 },
    { id: 'H', x: 86, y: 12 },
  ],
  links: [
    ['A', 'C'],
    ['A', 'D'],
    ['B', 'C'],
    ['B', 'E'],
    ['C', 'D'],
    ['C', 'E'],
    ['D', 'F'],
    ['E', 'F'],
    ['D', 'G'],
    ['F', 'G'],
    ['E', 'H'],
    ['F', 'H'],
  ],
}

const players = [
  { id: 1, name: 'South', short: 'S', colourClass: 'player-1' },
  { id: 2, name: 'North', short: 'N', colourClass: 'player-2' },
]

function makePlanet(owner, ships, level = 1, mode = 'B') {
  return {
    owner,
    ships,
    level,
    mode,
    progress: 0,
  }
}

function initialPlanetStates() {
  return {
    A: makePlanet(1, 34, 2, 'U'),
    B: makePlanet(1, 34, 2, 'B'),
    C: makePlanet(0, 12, 1, 'B'),
    D: makePlanet(0, 18, 1, 'B'),
    E: makePlanet(0, 18, 1, 'B'),
    F: makePlanet(0, 10, 1, 'B'),
    G: makePlanet(2, 34, 2, 'B'),
    H: makePlanet(2, 34, 2, 'U'),
  }
}

const planetStates = ref(initialPlanetStates())
const fleets = ref([])
const menuOpen = ref(false)
const showHelp = ref(false)

const playerSelections = reactive({
  1: null,
  2: null,
})

const planetIds = mapData.planets.map((p) => p.id)

const lastFrame = ref(0)
let rafId = 0

function areLinked(a, b) {
  return mapData.links.some(([p1, p2]) => {
    return (p1 === a && p2 === b) || (p1 === b && p2 === a)
  })
}

function getLinkedPlanetIds(planetId) {
  return mapData.links
    .filter(([a, b]) => a === planetId || b === planetId)
    .map(([a, b]) => (a === planetId ? b : a))
}

function shipsToSendFrom(planetId) {
  const state = planetStates.value[planetId]
  if (!state) return 0
  return Math.floor(state.ships / 2)
}

function canPlayerSelectAsSource(playerId, planetId) {
  const state = planetStates.value[planetId]
  if (!state) return false
  return state.owner === playerId && shipsToSendFrom(planetId) >= 1
}

function playerStats(playerId) {
  let totalShips = 0
  let totalLevels = 0
  let buildPer10s = 0

  for (const planetId of planetIds) {
    const state = planetStates.value[planetId]
    if (!state || state.owner !== playerId) continue

    totalShips += state.ships
    totalLevels += state.level

    if (state.mode === 'B' && state.ships < MAX_SHIPS) {
      buildPer10s += 10 / buildSecondsForLevel(state.level)
    }
  }

  return {
    totalShips,
    totalLevels,
    buildPer10s: buildPer10s.toFixed(1),
  }
}

function planetButtonsForPlayer(playerId) {
  const selectedSourceId = playerSelections[playerId]
  const validTargets = selectedSourceId ? getLinkedPlanetIds(selectedSourceId) : []

  return planetIds.map((planetId) => {
    const state = planetStates.value[planetId]
    let mode = 'disabled'

    if (!selectedSourceId) {
      if (canPlayerSelectAsSource(playerId, planetId)) {
        mode = 'source'
      }
    } else {
      if (planetId === selectedSourceId) {
        mode = 'cancel'
      } else if (validTargets.includes(planetId)) {
        mode = 'target'
      }
    }

    return {
      id: planetId,
      label: planetId,
      owner: state.owner,
      ships: state.ships,
      mode,
      selected: planetId === selectedSourceId,
    }
  })
}

function handleConsolePlanetPress(playerId, planetId) {
  const selectedSourceId = playerSelections[playerId]

  if (!selectedSourceId) {
    if (canPlayerSelectAsSource(playerId, planetId)) {
      playerSelections[playerId] = planetId
    }
    return
  }

  if (planetId === selectedSourceId) {
    playerSelections[playerId] = null
    return
  }

  if (!areLinked(selectedSourceId, planetId)) {
    return
  }

  sendFleet(playerId, selectedSourceId, planetId)
  playerSelections[playerId] = null
}

function sendFleet(playerId, fromId, toId) {
  const fromState = planetStates.value[fromId]
  if (!fromState) return

  const sendCount = Math.floor(fromState.ships / 2)
  if (sendCount < 1) return

  fromState.ships -= sendCount
  if (fromState.progress > 1) {
    fromState.progress = 1
  }

  fleets.value.push({
    id: crypto.randomUUID(),
    owner: playerId,
    fromId,
    toId,
    ships: sendCount,
    progress: 0,
    duration: 1.3,
  })
}

function resolveFleetArrival(fleet) {
  const destination = planetStates.value[fleet.toId]
  if (!destination) return

  if (destination.owner === 0) {
    if (fleet.ships > destination.ships) {
      destination.owner = fleet.owner
      destination.ships = fleet.ships - destination.ships
      destination.level = 1
      destination.mode = 'B'
      destination.progress = 0
    } else {
      destination.ships -= fleet.ships
    }
    return
  }

  if (destination.owner === fleet.owner) {
    destination.ships = Math.min(MAX_SHIPS, destination.ships + fleet.ships)
    return
  }

  if (fleet.ships > destination.ships) {
    destination.owner = fleet.owner
    destination.ships = fleet.ships - destination.ships
    destination.level = 1
    destination.mode = 'B'
    destination.progress = 0
  } else {
    destination.ships -= fleet.ships
  }
}

function setPlanetMode(playerId, planetId, mode) {
  const state = planetStates.value[planetId]
  if (!state) return
  if (state.owner !== playerId) return
  if (mode !== 'B' && mode !== 'U') return

  state.mode = mode
  if (mode === 'B') {
    state.progress = 0
  }
}

function buildSecondsForLevel(level) {
  return Math.max(0.7, 3.6 - (level - 1) * 0.45)
}

function upgradeSecondsForLevel(level) {
  return 5 + (level - 1) * 1.25
}

function updatePlanetEconomy(dt) {
  for (const planetId of planetIds) {
    const state = planetStates.value[planetId]
    if (!state || state.owner === 0) continue

    if (state.mode === 'B') {
      if (state.ships >= MAX_SHIPS) {
        state.progress = 0
        continue
      }

      state.progress += dt / buildSecondsForLevel(state.level)

      while (state.progress >= 1 && state.ships < MAX_SHIPS) {
        state.progress -= 1
        state.ships += 1
      }

      if (state.ships >= MAX_SHIPS) {
        state.progress = 0
      }
    } else if (state.mode === 'U') {
      if (state.level >= MAX_LEVEL) {
        state.progress = 1
        continue
      }

      state.progress += dt / upgradeSecondsForLevel(state.level)

      if (state.progress >= 1) {
        state.progress = 0
        state.level += 1
        if (state.level >= MAX_LEVEL) {
          state.level = MAX_LEVEL
        }
      }
    }
  }
}

function updateFleets(dt) {
  const survivors = []

  for (const fleet of fleets.value) {
    fleet.progress += dt / fleet.duration

    if (fleet.progress >= 1) {
      resolveFleetArrival(fleet)
    } else {
      survivors.push(fleet)
    }
  }

  fleets.value = survivors
}

function update(dt) {
  updatePlanetEconomy(dt)
  updateFleets(dt)
}

function resetGame() {
  planetStates.value = initialPlanetStates()
  fleets.value = []
  playerSelections[1] = null
  playerSelections[2] = null
  menuOpen.value = false
  showHelp.value = false
}

function frame(now) {
  if (!lastFrame.value) lastFrame.value = now
  const dt = Math.min((now - lastFrame.value) / 1000, 0.05)
  lastFrame.value = now

  update(dt)
  rafId = requestAnimationFrame(frame)
}

onMounted(() => {
  rafId = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
})
</script>