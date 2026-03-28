<template>
  <section class="new-game-screen card">
    <div class="new-game-topbar">
      <div class="new-game-title">New Game</div>

      <button class="new-game-top-btn" @click="emitStart">
        Start
      </button>

      <button
        class="new-game-close-btn"
        :disabled="!canClose"
        @click="$emit('close')"
        aria-label="Close"
        title="Close"
      >
        <span class="close-icon" aria-hidden="true"></span>
      </button>
    </div>

    <div class="new-game-main">
      <section class="new-game-map-panel">
        <div class="new-game-section-header">
          <div class="new-game-section-label">Map</div>
          <button class="new-game-revert-btn" type="button" @click="revertToMapDefaults">
            Revert
          </button>
        </div>

        <div class="new-game-map-area">
          <div class="new-game-map-list-wrap">
            <div class="new-game-map-list">
              <button
                v-for="mapItem in maps"
                :key="mapItem.id"
                :ref="(el) => setMapButtonRef(mapItem.id, el)"
                class="new-game-map-btn"
                :class="{ selected: mapItem.id === selectedMapId }"
                @click="selectedMapId = mapItem.id"
              >
                {{ mapItem.name }}
              </button>
            </div>

            <div class="new-game-map-scroll">
              <button
                class="map-scroll-btn"
                type="button"
                @click="moveSelection(-1)"
                aria-label="Previous map"
                title="Previous map"
              >
                ▲
              </button>

              <button
                class="map-scroll-btn"
                type="button"
                @click="moveSelection(1)"
                aria-label="Next map"
                title="Next map"
              >
                ▼
              </button>
            </div>
          </div>

          <div class="new-game-preview-frame">
            <div class="new-game-preview">
              <svg
                v-if="selectedMap"
                class="new-game-preview-svg"
                :viewBox="`0 0 ${selectedMap.dimensions.width} ${selectedMap.dimensions.height}`"
                preserveAspectRatio="xMidYMid meet"
              >
                <g>
                  <line
                    v-for="edge in selectedMap.edges"
                    :key="`${edge.from}-${edge.to}`"
                    :x1="planetLookup[edge.from].x"
                    :y1="planetLookup[edge.from].y"
                    :x2="planetLookup[edge.to].x"
                    :y2="planetLookup[edge.to].y"
                    class="preview-edge"
                  />
                </g>

                <g
                  v-for="planet in selectedMap.planets"
                  :key="planet.id"
                  :transform="`translate(${planet.x} ${planet.y})`"
                  class="preview-planet"
                  :class="previewPlanetClass(planet)"
                >
                  <rect
                    x="-4.5"
                    y="-8"
                    width="9"
                    height="16"
                    rx="0.45"
                    class="preview-planet-card"
                  />

                  <text x="0" y="0.8" class="preview-planet-label">
                    {{ planet.label }}
                  </text>

                  <text
                    v-if="planet.specialType === 'capital'"
                    x="0"
                    y="-10.5"
                    class="preview-capital"
                  >
                    ▲
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section class="new-game-settings-grid">
        <div class="new-game-setting-block">
          <div class="new-game-section-label">Win</div>
          <div class="new-game-setting-row">
            <button
            class="stepper-btn"
            type="button"
            :disabled="!canStepOption('winType', -1)"
            @click="stepOption('winType', -1)"
            >
            ◀
            </button>            <div class="stepper-value">{{ labelForWin(setup.winType) }}</div>
            <button
            class="stepper-btn"
            type="button"
            :disabled="!canStepOption('winType', 1)"
            @click="stepOption('winType', 1)"
            >
            ▶
            </button>          </div>
        </div>

        <div class="new-game-setting-block">
          <div class="new-game-section-label">Capital bonus</div>
          <div class="new-game-setting-row">
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('capitalBonus', -1)"
  @click="stepOption('capitalBonus', -1)"
>
  ◀
</button>            <div class="stepper-value">{{ formatMultiplier(setup.capitalBonus) }}</div>
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('capitalBonus', 1)"
  @click="stepOption('capitalBonus', 1)"
>
  ▶
</button>          </div>
        </div>

        <div class="new-game-setting-block">
          <div class="new-game-section-label">Building Time</div>
          <div class="new-game-setting-row">
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('shipTimeFactor', -1)"
  @click="stepOption('shipTimeFactor', -1)"
>
  ◀
</button>            <div class="stepper-value">{{ formatMultiplier(setup.shipTimeFactor) }}</div>
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('shipTimeFactor', 1)"
  @click="stepOption('shipTimeFactor', 1)"
>
  ▶
</button>          </div>
        </div>

        <div class="new-game-setting-block">
          <div class="new-game-section-label">Upgrade Time</div>
          <div class="new-game-setting-row">
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('upgradeTimeFactor', -1)"
  @click="stepOption('upgradeTimeFactor', -1)"
>
  ◀
</button>
            <div class="stepper-value">{{ formatMultiplier(setup.upgradeTimeFactor) }}</div>
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('upgradeTimeFactor', 1)"
  @click="stepOption('upgradeTimeFactor', 1)"
>
  ▶
</button>          </div>
        </div>

        <div class="new-game-setting-block">
          <div class="new-game-section-label">Max ships</div>
          <div class="new-game-setting-row">
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('maxShips', -1)"
  @click="stepOption('maxShips', -1)"
>
  ◀
</button>
            <div class="stepper-value">{{ setup.maxShips }}</div>
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('maxShips', 1)"
  @click="stepOption('maxShips', 1)"
>
  ▶
</button>          </div>
        </div>

        <div class="new-game-setting-block">
          <div class="new-game-section-label">Max upgrades</div>
          <div class="new-game-setting-row">
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('maxLevel', -1)"
  @click="stepOption('maxLevel', -1)"
>
  ◀
</button>
            <div class="stepper-value">{{ setup.maxLevel }}</div>
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('maxLevel', 1)"
  @click="stepOption('maxLevel', 1)"
>
  ▶
</button>          </div>
        </div>

        <div class="new-game-setting-block">
        <div class="new-game-section-label">Flight Time</div>
        <div class="new-game-setting-row">
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('flightTimeFactor', -1)"
  @click="stepOption('flightTimeFactor', -1)"
>
  ◀
</button>            <div class="stepper-value">{{ formatMultiplier(setup.flightTimeFactor) }}</div>
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('flightTimeFactor', 1)"
  @click="stepOption('flightTimeFactor', 1)"
>
  ▶
</button>        </div>
        </div>
        <div class="new-game-setting-block">
        <div class="new-game-section-label">Battle Rate</div>
        <div class="new-game-setting-row">
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('battleRate', -1)"
  @click="stepOption('battleRate', -1)"
>
  ◀
</button>            <div class="stepper-value">{{ setup.battleRate.toFixed(1) }}</div>
<button
  class="stepper-btn"
  type="button"
  :disabled="!canStepOption('battleRate', 1)"
  @click="stepOption('battleRate', 1)"
>
  ▶
</button>        </div>
        </div>        
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'

const props = defineProps({
  maps: {
    type: Array,
    required: true,
  },
  initialMapId: {
    type: String,
    default: '',
  },
  canClose: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['start', 'close'])

const WIN_TYPES = ['elimination', 'capital-loss']
const MULTIPLIER_OPTIONS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
const MAX_SHIPS_OPTIONS = [5, 10, 20, 30, 40, 50, 60, 75, 100, 125, 150, 200]
const MAX_LEVEL_OPTIONS = [3, 4, 5, 6, 7, 8, 10, 12]
const BATTLE_RATE_OPTIONS = [1.0, 2.0, 3.0, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0]

const selectedMapId = ref(props.initialMapId || props.maps[0]?.id || '')
const mapButtonRefs = ref({})

const setup = reactive({
  winType: 'elimination',
  capitalBonus: 1.5,
  shipTimeFactor: 1.0,
  upgradeTimeFactor: 1.0,
  flightTimeFactor: 1.0,
  battleRate: 2.0,
  maxShips: 50,
  maxLevel: 5,
})

watch(
  () => props.initialMapId,
  (value) => {
    if (value) selectedMapId.value = value
  }
)

watch(selectedMapId, async () => {
  applyMapDefaults()
  await nextTick()
  scrollSelectedMapIntoView()
})

const selectedMap = computed(() => {
  return props.maps.find((mapItem) => mapItem.id === selectedMapId.value) ?? null
})

const planetLookup = computed(() => {
  const mapItem = selectedMap.value
  if (!mapItem) return {}

  return Object.fromEntries(
    mapItem.planets.map((planet) => [planet.id, planet])
  )
})

function getDefaultsForMap(mapItem) {
  return {
    winType: mapItem?.winCondition?.type ?? 'elimination',
    capitalBonus: mapItem?.rules?.capitalBonus ?? 1.5,
    shipTimeFactor: mapItem?.rules?.shipTimeFactor ?? 1.0,
    upgradeTimeFactor: mapItem?.rules?.upgradeTimeFactor ?? 1.0,
    flightTimeFactor: mapItem?.rules?.flightTimeFactor ?? 1.0,
    battleRate: mapItem?.rules?.battleRate ?? 2.0,
    maxShips: mapItem?.rules?.maxShips ?? 50,
    maxLevel: mapItem?.rules?.maxLevel ?? 5,
  }
}

function applyMapDefaults() {
  const defaults = getDefaultsForMap(selectedMap.value)
  Object.assign(setup, defaults)
}

function revertToMapDefaults() {
  applyMapDefaults()
}

function emitStart() {
  emit('start', {
    mapId: selectedMapId.value,
    settings: { ...setup },
  })
}

function moveSelection(direction) {
  if (!props.maps.length) return

  const currentIndex = props.maps.findIndex(
    (mapItem) => mapItem.id === selectedMapId.value
  )
  const safeIndex = currentIndex >= 0 ? currentIndex : 0
  const nextIndex =
    (safeIndex + direction + props.maps.length) % props.maps.length

  selectedMapId.value = props.maps[nextIndex].id
}

function previewPlanetClass(planet) {
  if (planet.initialOwner === 1) return 'owner-1'
  if (planet.initialOwner === 2) return 'owner-2'
  return 'owner-0'
}

function setMapButtonRef(mapId, el) {
  if (el) {
    mapButtonRefs.value[mapId] = el
  } else {
    delete mapButtonRefs.value[mapId]
  }
}

function scrollSelectedMapIntoView() {
  const selectedButton = mapButtonRefs.value[selectedMapId.value]
  if (!selectedButton) return

  selectedButton.scrollIntoView({
    block: 'nearest',
    inline: 'nearest',
    behavior: 'smooth',
  })
}

function cycleOption(currentValue, options, direction) {
  const currentIndex = options.findIndex((value) => value === currentValue)
  const safeIndex = currentIndex >= 0 ? currentIndex : 0

  const nextIndex = Math.max(
    0,
    Math.min(options.length - 1, safeIndex + direction)
  )

  return options[nextIndex]
}

function getOptionsForKey(key) {
  if (key === 'winType') return WIN_TYPES
  if (key === 'capitalBonus') return MULTIPLIER_OPTIONS
  if (key === 'shipTimeFactor') return MULTIPLIER_OPTIONS
  if (key === 'upgradeTimeFactor') return MULTIPLIER_OPTIONS
  if (key === 'flightTimeFactor') return MULTIPLIER_OPTIONS
  if (key === 'maxShips') return MAX_SHIPS_OPTIONS
  if (key === 'maxLevel') return MAX_LEVEL_OPTIONS
  if (key === 'battleRate') return BATTLE_RATE_OPTIONS
  return []
}

function canStepOption(key, direction) {
  const options = getOptionsForKey(key)
  if (!options.length) return false

  const currentValue = setup[key]
  const currentIndex = options.findIndex((value) => value === currentValue)
  const safeIndex = currentIndex >= 0 ? currentIndex : 0

  if (direction < 0) {
    return safeIndex > 0
  }

  if (direction > 0) {
    return safeIndex < options.length - 1
  }

  return false
}

function stepOption(key, direction) {
  if (key === 'winType') {
    setup.winType = cycleOption(setup.winType, WIN_TYPES, direction)
    return
  }

  if (key === 'capitalBonus') {
    setup.capitalBonus = cycleOption(setup.capitalBonus, MULTIPLIER_OPTIONS, direction)
    return
  }

  if (key === 'shipTimeFactor') {
    setup.shipTimeFactor = cycleOption(setup.shipTimeFactor, MULTIPLIER_OPTIONS, direction)
    return
  }

  if (key === 'upgradeTimeFactor') {
    setup.upgradeTimeFactor = cycleOption(setup.upgradeTimeFactor, MULTIPLIER_OPTIONS, direction)
    return
  }

  if (key === 'flightTimeFactor') {
    setup.flightTimeFactor = cycleOption(setup.flightTimeFactor, MULTIPLIER_OPTIONS, direction)
    return
  }

  if (key === 'maxShips') {
    setup.maxShips = cycleOption(setup.maxShips, MAX_SHIPS_OPTIONS, direction)
    return
  }

  if (key === 'maxLevel') {
    setup.maxLevel = cycleOption(setup.maxLevel, MAX_LEVEL_OPTIONS, direction)
    return
  }

  if (key === 'battleRate') {
    setup.battleRate = cycleOption(setup.battleRate, BATTLE_RATE_OPTIONS, direction)
    return
  }
}

function labelForWin(value) {
  return value === 'capital-loss' ? 'Capital loss' : 'Eliminate'
}

function formatMultiplier(value) {
  return `× ${Number(value).toFixed(2).replace(/\.00$/, '.0').replace(/(\.\d)0$/, '$1')}`
}

applyMapDefaults()
</script>