<template>
  <div class="game-board card">
    <svg viewBox="0 0 100 100" class="board-svg" preserveAspectRatio="xMidYMid meet">
      <g class="edges">
        <line
          v-for="link in mapData.links"
          :key="`${link[0]}-${link[1]}`"
          :x1="planetLookup[link[0]].x"
          :y1="planetLookup[link[0]].y"
          :x2="planetLookup[link[1]].x"
          :y2="planetLookup[link[1]].y"
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
          <!-- Neutral planets -->
          <template v-if="planetStates[planet.id].owner === 0">
            <rect x="-4.5" y="-8" width="9" height="16" rx="0.35" class="planet-card" />

            <text x="0" y="-4.3" class="planet-letter">{{ planet.id }}</text>
            <text
              x="0"
              y="4.3"
              class="planet-letter"
              transform="rotate(180 0 4.3)"
            >
              {{ planet.id }}
            </text>

            <text x="0" y="0.2" class="planet-ships">{{ planetStates[planet.id].ships }}</text>
          </template>

          <!-- Owned planets -->
          <template v-else>
            <g :transform="planetStates[planet.id].owner === 2 ? 'rotate(180)' : ''">
              <!-- upgrade bar outside left -->
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

              <!-- main card -->
              <rect x="-4.5" y="-8" width="9" height="16" rx="0.35" class="planet-card" />

              <text x="0" y="-4.3" class="planet-letter">{{ planet.id }}</text>
              <text
                x="0"
                y="4.3"
                class="planet-letter"
                transform="rotate(180 0 4.3)"
              >
                {{ planet.id }}
              </text>

              <text x="0" y="0.2" class="planet-ships">{{ planetStates[planet.id].ships }}</text>

              <!-- level diamonds outside right, growing upward from bottom-right -->
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
  return props.fleets.map((fleet) => {
    const from = planetLookup.value[fleet.fromId]
    const to = planetLookup.value[fleet.toId]
    const x = from.x + (to.x - from.x) * fleet.progress
    const y = from.y + (to.y - from.y) * fleet.progress
    return { ...fleet, x, y }
  })
})

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
  return Math.max(0, Math.min(level ?? 0, 5))
}

function diamondY(index) {
  return 5.3 - (index - 1) * 2.15
}
</script>