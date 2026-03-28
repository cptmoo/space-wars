<template>
  <div class="game-board card">
    <svg
      :viewBox="`0 0 ${mapData.dimensions.width} ${mapData.dimensions.height}`"
      class="board-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <g class="edges">
        <line
          v-for="edge in mapData.edges"
          :key="`${edge.from}-${edge.to}`"
          :x1="planetLookup[edge.from].x"
          :y1="planetLookup[edge.from].y"
          :x2="planetLookup[edge.to].x"
          :y2="planetLookup[edge.to].y"
          class="edge"
        />
      </g>

      <g class="fleets">
        <g
          v-for="fleet in fleetPositions"
          :key="fleet.id"
          class="fleet"
          :class="fleet.owner === 1 ? 'fleet-player-1' : 'fleet-player-2'"
          :transform="`translate(${fleet.x} ${fleet.y})`"
        >
          <circle r="1.8" class="fleet-dot" />
          <text y="0.45" class="fleet-text">{{ fleet.ships }}</text>
        </g>
      </g>

      <g class="planets">
        <g
          v-for="planet in mapData.planets"
          :key="planet.id"
          class="planet"
          :class="planetOwnerClass(planet.id)"
          :transform="`translate(${planet.x} ${planet.y})`"
        >
          <template v-if="planetStates[planet.id].owner === 0">
            <rect x="-4.5" y="-8" width="9" height="16" rx="0.35" class="planet-card" />

            <text x="0" y="-4.3" class="planet-letter">{{ planet.label ?? planet.id }}</text>
            <text
              x="0"
              y="4.3"
              class="planet-letter"
              transform="rotate(180 0 4.3)"
            >
              {{ planet.label ?? planet.id }}
            </text>

            <text x="0" y="0.2" class="planet-ships">
              {{ roundedShips(planetStates[planet.id].ships) }}
            </text>
          </template>

          <template v-else>
            <g :transform="planetStates[planet.id].owner === 2 ? 'rotate(180)' : ''">
              <g v-if="planetStates[planet.id].mode === 'U'" class="upgrade-bar-group">
                <rect
                  x="-9.0"
                  y="-8"
                  width="2.2"
                  height="16"
                  rx="0.2"
                  class="planet-upgrade-track"
                />
                <rect
                  x="-9.0"
                  :y="8 - (16 * progressClamped(planetStates[planet.id].progress))"
                  width="2.2"
                  :height="16 * progressClamped(planetStates[planet.id].progress)"
                  rx="0.2"
                  class="planet-upgrade-fill"
                />
              </g>
              <template v-if="isCapital(planet.id)">
                <text
                  x="0"
                  y="-9.5"
                  class="planet-crown"
                >
                  ▲
                </text>
              </template>
              <rect x="-4.5" y="-8" width="9" height="16" rx="0.35" class="planet-card" />

              <text x="0" y="-4.3" class="planet-letter">{{ planet.label ?? planet.id }}</text>
              <text
                x="0"
                y="4.3"
                class="planet-letter"
                transform="rotate(180 0 4.3)"
              >
                {{ planet.label ?? planet.id }}
              </text>

              <text x="0" y="0.2" class="planet-ships">
                {{ roundedShips(planetStates[planet.id].ships) }}
              </text>

              <g class="planet-level-group">
                <rect
                  v-for="index in visibleLevelCount(planetStates[planet.id].level)"
                  :key="index"
                  x="6.0"
                  :y="diamondY(index)"
                  width="1.45"
                  height="1.45"
                  class="planet-diamond"
                  :transform="`rotate(45 6.725 ${diamondY(index) + 0.725})`"
                />
              </g>
            </g>
          </template>
          <template v-if="planetStates[planet.id]?.battle">
            <g
              class="battle-marker"
              :class="battleOwnerClass(planet.id)"
              :transform="battleMarkerTransform(planet.id)"
            >
              <circle r="2.6" class="battle-marker-dot" />
              <text
                y="0.45"
                class="battle-marker-text"
                :transform="battleMarkerTextTransform(planet.id)"
              >
                {{ roundedShips(planetStates[planet.id].battle.attackers) }}
              </text>
            </g>
          </template>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mapData: { type: Object, required: true },
  planetStates: { type: Object, required: true },
  fleets: { type: Array, required: true },
})

const planetLookup = computed(() => {
  return Object.fromEntries(props.mapData.planets.map((planet) => [planet.id, planet]))
})

const fleetPositions = computed(() => {
  return props.fleets.map((fleet, index) => {
    const from = planetLookup.value[fleet.from]
    const to = planetLookup.value[fleet.to]

    const progress = fleet.duration > 0
      ? Math.max(0, Math.min(1, fleet.progress / fleet.duration))
      : 1

    const x = from.x + (to.x - from.x) * progress
    const y = from.y + (to.y - from.y) * progress

    return {
      id: `${fleet.owner}-${fleet.from}-${fleet.to}-${index}`,
      owner: fleet.owner,
      ships: roundedShips(fleet.ships),
      x,
      y,
    }
  })
})

function isCapital(planetId) {
  const def = props.mapData.planets.find(p => p.id === planetId)
  return def?.specialType === 'capital'
}

function battleOwnerClass(planetId) {
  const attackerOwner = props.planetStates[planetId]?.battle?.attackerOwner ?? 0
  return {
    'battle-player-1': attackerOwner === 1,
    'battle-player-2': attackerOwner === 2,
  }
}

function battleMarkerTransform(planetId) {
  const attackerOwner = props.planetStates[planetId]?.battle?.attackerOwner ?? 0

  if (attackerOwner === 2) {
    return 'translate(-6.8 6.8)'
  }

  return 'translate(6.8 -6.8)'
}

function battleMarkerTextTransform(planetId) {
  const attackerOwner = props.planetStates[planetId]?.battle?.attackerOwner ?? 0

  if (attackerOwner === 2) {
    return 'rotate(180)'
  }

  return ''
}

function planetOwnerClass(planetId) {
  const owner = props.planetStates[planetId]?.owner ?? 0
  return {
    neutral: owner === 0,
    'owned-player-1': owner === 1,
    'owned-player-2': owner === 2,
  }
}

function progressClamped(progress) {
  return Math.max(0, Math.min(progress ?? 0, 1))
}

function visibleLevelCount(level) {
  return Math.max(0, Math.min(level ?? 0, 12))
}

function diamondY(index) {
  return 5.3 - (index - 1) * 2.15
}

function roundedShips(value) {
  return Math.round(value ?? 0)
}
</script>