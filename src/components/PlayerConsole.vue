<template>
  <section class="player-console card" :class="[player.colourClass, { mirrored }]">
    <div class="console-header">
      <div class="console-info">
        <div class="console-title">{{ player.name }}</div>
        <div class="console-subtitle">
          <template v-if="selectedSourceId">
            Selected: {{ selectedSourceId }}
          </template>
          <template v-else>
            Choose a planet
          </template>
        </div>
      </div>

      <div class="console-status">
        <div class="status-item">
          <span class="status-label">Ships</span>
          <span class="status-value">
            {{ Math.floor(stats.totalShips ?? 0) }}
            <span
              class="status-delta"
              :class="deltaClass(stats.shipsDelta ?? 0)"
            >
              {{ formatDelta(stats.shipsDelta ?? 0) }}
            </span>
          </span>
        </div>

        <div class="status-item">
          <span class="status-label">Build</span>
          <span class="status-value">
            {{ Number(stats.buildPer10s ?? 0).toFixed(1) }}
            <span
              class="status-delta"
              :class="deltaClass(stats.buildDelta ?? 0)"
            >
              {{ formatDelta(stats.buildDelta ?? 0, 1) }}
            </span>
          </span>
        </div>

        <div class="status-item">
          <span class="status-label">Lvl</span>
          <span class="status-value">
            {{ stats.totalLevels }}
            <span
              class="status-delta"
              :class="deltaClass(stats.levelsDelta ?? 0)"
            >
              {{ formatDelta(stats.levelsDelta ?? 0) }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <div class="console-controls">
      <div
        class="planet-grid"
        :style="{
          gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
        }"
      >
        <button
          v-for="planet in planetButtons"
          :key="planet.id"
          class="console-btn planet-btn"
          :class="[
            `action-${planet.actionMode}`,
            `perspective-${planet.perspective}`,
            {
              selected: planet.selected,
              mine: planet.owner === player.id,
              'has-battle': planet.hasBattle,
            },
          ]"
          :disabled="planet.actionMode === 'disabled'"
          @pointerdown="handlePointerDown(planet.id)"
          @pointerup="handlePointerUp(planet.id)"
          @pointerleave="cancelLongPress"
          @pointercancel="cancelLongPress"
          @click="handleClick(planet.id)"
          @contextmenu.prevent
        >
          <span class="planet-btn-label">{{ planet.label }}</span>
          <span class="planet-btn-count">{{ planet.ships }}</span>
        </button>
      </div>

      <div class="console-mode-stack">
        <button
          class="mode-btn"
          :class="{
            active: selectedSourceId && getPlanetState(selectedSourceId)?.mode === 'B',
            inactive: !selectedSourceId
          }"
          :disabled="!selectedSourceId"
          @click="$emit('set-mode', { planetId: selectedSourceId, mode: 'B' })"
        >
          B
        </button>

        <button
          class="mode-btn"
          :class="{
            active: selectedSourceId && getPlanetState(selectedSourceId)?.mode === 'U',
            inactive: !selectedSourceId
          }"
          :disabled="!selectedSourceId"
          @click="$emit('set-mode', { planetId: selectedSourceId, mode: 'U' })"
        >
          U
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const LONG_PRESS_MS = 350

const props = defineProps({
  player: { type: Object, required: true },
  planetButtons: { type: Array, required: true },
  selectedSourceId: { type: String, default: null },
  mirrored: { type: Boolean, default: false },
  planetStates: { type: Object, required: true },
  stats: { type: Object, required: true },
})

const emit = defineEmits(['planet-press', 'planet-long-press', 'set-mode'])

function getPlanetState(id) {
  return props.planetStates?.[id] ?? null
}

const gridColumns = computed(() => {
  const count = props.planetButtons.length || 1
  return Math.ceil(count / 2)
})

const longPressTimer = ref(null)
const pressedPlanetId = ref(null)
const longPressTriggeredFor = ref(null)

function cancelLongPress() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }

  pressedPlanetId.value = null
}

function handlePointerDown(planetId) {
  cancelLongPress()

  pressedPlanetId.value = planetId
  longPressTriggeredFor.value = null

  longPressTimer.value = setTimeout(() => {
    if (pressedPlanetId.value !== planetId) return

    longPressTriggeredFor.value = planetId
    emit('planet-long-press', planetId)
    longPressTimer.value = null
  }, LONG_PRESS_MS)
}

function handlePointerUp(planetId) {
  if (pressedPlanetId.value !== planetId) {
    cancelLongPress()
    return
  }

  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }

  pressedPlanetId.value = null
}

function handleClick(planetId) {
  if (longPressTriggeredFor.value === planetId) {
    longPressTriggeredFor.value = null
    return
  }

  emit('planet-press', planetId)
}

function deltaClass(value) {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

function formatDelta(value, decimals = 0) {
  const safeValue = Number(value ?? 0)

  if (Math.abs(safeValue) < 0.0001) return '(±0)'

  const absValue = decimals > 0
    ? Math.abs(safeValue).toFixed(decimals)
    : Math.abs(Math.round(safeValue))

  return safeValue > 0 ? `(↑${absValue})` : `(↓${absValue})`
}

onBeforeUnmount(() => {
  cancelLongPress()
})
</script>