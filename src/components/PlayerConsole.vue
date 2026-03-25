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
          <span class="status-value">{{ stats.totalShips }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Build</span>
          <span class="status-value">{{ stats.buildPer10s }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Lvl</span>
          <span class="status-value">{{ stats.totalLevels }}</span>
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
          @click="$emit('planet-press', planet.id)"
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
import { computed } from 'vue'

const props = defineProps({
  player: { type: Object, required: true },
  planetButtons: { type: Array, required: true },
  selectedSourceId: { type: String, default: null },
  mirrored: { type: Boolean, default: false },
  planetStates: { type: Object, required: true },
  stats: { type: Object, required: true },
})

defineEmits(['planet-press', 'set-mode'])

function getPlanetState(id) {
  return props.planetStates?.[id] ?? null
}

const gridColumns = computed(() => {
  const count = props.planetButtons.length
  if (count <= 4) return count || 1
  if (count <= 6) return 3
  if (count <= 8) return 4
  if (count <= 10) return 5
  return 6
})
</script>