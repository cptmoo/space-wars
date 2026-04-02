<template>
  <section class="stats-screen">
    <div class="stats-topbar">
      <div class="stats-title card">
        <div class="stats-title-main">{{ winnerName }} wins</div>
        <div class="stats-title-sub">
          {{ mapName }} · {{ winTypeLabel }} · {{ formatDuration(durationSeconds) }}
        </div>
      </div>

      <button class="stats-top-btn" type="button" @click="$emit('new-game')">
        New game
      </button>
    </div>

    <div class="stats-summary-grid">
      <section class="stats-player-card card player-2">
        <div class="stats-player-name">{{ topPlayer.name }}</div>

        <div class="stats-player-grid">
          <div class="stats-kpi">
            <div class="stats-kpi-label">Ships</div>
            <div class="stats-kpi-value">{{ roundStat(topPlayer.stats.ships) }}</div>
          </div>

          <div class="stats-kpi">
            <div class="stats-kpi-label">Planets</div>
            <div class="stats-kpi-value">{{ roundStat(topPlayer.stats.planets) }}</div>
          </div>

          <div class="stats-kpi">
            <div class="stats-kpi-label">Levels</div>
            <div class="stats-kpi-value">{{ roundStat(topPlayer.stats.levels) }}</div>
          </div>

          <div class="stats-kpi">
            <div class="stats-kpi-label">Build/10s</div>
            <div class="stats-kpi-value">{{ fixed1(topPlayer.stats.buildPer10s) }}</div>
          </div>
        </div>
      </section>

      <section class="stats-player-card card player-1">
        <div class="stats-player-name">{{ bottomPlayer.name }}</div>

        <div class="stats-player-grid">
          <div class="stats-kpi">
            <div class="stats-kpi-label">Ships</div>
            <div class="stats-kpi-value">{{ roundStat(bottomPlayer.stats.ships) }}</div>
          </div>

          <div class="stats-kpi">
            <div class="stats-kpi-label">Planets</div>
            <div class="stats-kpi-value">{{ roundStat(bottomPlayer.stats.planets) }}</div>
          </div>

          <div class="stats-kpi">
            <div class="stats-kpi-label">Levels</div>
            <div class="stats-kpi-value">{{ roundStat(bottomPlayer.stats.levels) }}</div>
          </div>

          <div class="stats-kpi">
            <div class="stats-kpi-label">Build/10s</div>
            <div class="stats-kpi-value">{{ fixed1(bottomPlayer.stats.buildPer10s) }}</div>
          </div>
        </div>
      </section>
    </div>

    <section class="stats-chart-panel card">
      <div class="stats-chart-meta">
        Match history
      </div>

      <div class="stats-multi-chart">
        <div
          v-for="metric in metricCharts"
          :key="metric.key"
          class="stats-mini-chart"
        >
        <div class="stats-mini-chart-label">
        <span class="stats-mini-chart-label-text">
            {{ metric.label }}
        </span>
        </div>

          <svg
            class="stats-chart-svg"
            viewBox="0 0 100 36"
            preserveAspectRatio="none"
            :aria-label="`${metric.label} history chart`"
          >
            <rect x="0" y="0" width="100" height="36" class="stats-chart-bg" />

            <line
              v-for="tick in metric.yTicks"
              :key="`${metric.key}-${tick.value}`"
              x1="10"
              :y1="tick.y"
              x2="98"
              :y2="tick.y"
              class="stats-grid-line"
            />

            <line x1="10" y1="3" x2="10" y2="30" class="stats-axis-line" />
            <line x1="10" y1="30" x2="98" y2="30" class="stats-axis-line" />

            <polyline
              v-if="metric.p2Points"
              :points="metric.p2Points"
              class="stats-line stats-line-p2"
            />

            <polyline
              v-if="metric.p1Points"
              :points="metric.p1Points"
              class="stats-line stats-line-p1"
            />

            <text
              v-for="tick in metric.yTicks"
              :key="`${metric.key}-label-${tick.value}`"
              x="8.5"
              :y="tick.y + 0.9"
              class="stats-axis-label stats-axis-label-y"
            >
              {{ tick.label }}
            </text>

            <template v-if="metric.showTimeAxis">
              <text x="10" y="34.2" class="stats-axis-label">0</text>
              <text x="54" y="34.2" class="stats-axis-label stats-axis-label-centre">
                {{ midTimeLabel }}
              </text>
              <text x="98" y="34.2" class="stats-axis-label stats-axis-label-right">
                {{ endTimeLabel }}
              </text>
            </template>
          </svg>
        </div>
      </div>

      <div class="stats-legend">
        <div class="stats-legend-item player-2">
          <span class="stats-legend-dot stats-legend-dot-p2"></span>
          {{ topPlayer.name }}
        </div>

        <div class="stats-legend-item player-1">
          <span class="stats-legend-dot stats-legend-dot-p1"></span>
          {{ bottomPlayer.name }}
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  players: { type: Array, required: true },
  winnerId: { type: Number, default: 0 },
  mapName: { type: String, default: '' },
  winType: { type: String, default: 'elimination' },
  matchHistory: {
    type: Object,
    required: true,
  },
  player1FinalStats: {
    type: Object,
    required: true,
  },
  player2FinalStats: {
    type: Object,
    required: true,
  },
})

defineEmits(['new-game'])

const snapshots = computed(() => props.matchHistory?.snapshots ?? [])

const durationSeconds = computed(() => {
  return Number(props.matchHistory?.elapsedSeconds ?? 0)
})

const winnerName = computed(() => {
  const winner = props.players.find((player) => player.id === props.winnerId)
  return winner?.name ?? 'Game'
})

const winTypeLabel = computed(() => {
  return props.winType === 'capital-loss' ? 'Capital loss' : 'Elimination'
})

const topPlayer = computed(() => ({
  ...props.players[1],
  stats: props.player2FinalStats,
}))

const bottomPlayer = computed(() => ({
  ...props.players[0],
  stats: props.player1FinalStats,
}))

function roundStat(value) {
  return Math.round(Number(value ?? 0))
}

function fixed1(value) {
  return Number(value ?? 0).toFixed(1)
}

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}


function metricValue(snapshot, playerId, metricKey) {
  return Number(snapshot?.players?.[playerId]?.[metricKey] ?? 0)
}

function getMetricConfig(metricKey) {
  if (metricKey === 'levels' || metricKey === 'planets') {
    return {
      integerOnly: true,
      maxIntervals: 10,
      fallbackIntervals: 6,
    }
  }

  if (metricKey === 'buildPer10s') {
    return {
      integerOnly: false,
      targetIntervals: 4,
    }
  }

  return {
    integerOnly: false,
    targetIntervals: 4,
  }
}

function getNiceStep(rawStep) {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 1

  const power = Math.floor(Math.log10(rawStep))
  const base = 10 ** power
  const fraction = rawStep / base

  let niceFraction
  if (fraction <= 1) {
    niceFraction = 1
  } else if (fraction <= 2) {
    niceFraction = 2
  } else if (fraction <= 2.5) {
    niceFraction = 2.5
  } else if (fraction <= 5) {
    niceFraction = 5
  } else {
    niceFraction = 10
  }

  return niceFraction * base
}

function getIntegerStep(maxValue, maxIntervals, fallbackIntervals) {
  const preferred = Math.max(1, Math.ceil(maxValue / maxIntervals))
  if (preferred === 1) return 1

  const fallback = Math.max(1, Math.ceil(maxValue / fallbackIntervals))

  const niceSteps = [
    1, 2, 3, 4, 5, 6, 8, 10,
    12, 15, 20, 25, 30, 40, 50,
  ]

  const preferredNice = niceSteps.find((step) => step >= preferred)
  if (preferredNice) return preferredNice

  return fallback
}

function getTickSpec(metricKey, maxValue) {
  const config = getMetricConfig(metricKey)

  if (config.integerOnly) {
    const step = getIntegerStep(
      maxValue,
      config.maxIntervals,
      config.fallbackIntervals
    )

    const axisMax = Math.max(step, Math.ceil(maxValue / step) * step)
    const values = []

    for (let value = 0; value <= axisMax; value += step) {
      values.push(value)
    }

    return {
      axisMax,
      values,
    }
  }

  const step = getNiceStep(maxValue / config.targetIntervals)
  const axisMax = Math.max(step, Math.ceil(maxValue / step) * step)
  const values = []

  for (let value = 0; value <= axisMax + step * 0.001; value += step) {
    values.push(Number(value.toFixed(10)))
  }

  return {
    axisMax,
    values,
  }
}

function formatTickLabel(metricKey, value) {
  if (metricKey === 'levels' || metricKey === 'planets') {
    return String(Math.round(value))
  }

  if (metricKey === 'buildPer10s') {
    if (value >= 10 || Number.isInteger(value)) {
      return String(Number(value.toFixed(0)))
    }

    return String(Number(value.toFixed(1)))
  }

  if (value >= 10) {
    return String(Number(value.toFixed(0)))
  }

  if (value >= 1) {
    return String(Number(value.toFixed(1)))
  }

  return String(Number(value.toFixed(2)))
}

function buildMetricChart(metricKey, label, showTimeAxis = false) {
  const points = snapshots.value
  const maxT = Math.max(1, Number(points[points.length - 1]?.t ?? 0))

  const allValues = points.flatMap((snapshot) => [
    metricValue(snapshot, 1, metricKey),
    metricValue(snapshot, 2, metricKey),
  ])

  const dataMax = Math.max(0, ...allValues)
  const tickSpec = getTickSpec(metricKey, dataMax > 0 ? dataMax : 1)
  const axisMax = tickSpec.axisMax

  const makePointString = (playerId) => {
    if (!points.length) return ''

    return points
      .map((snapshot) => {
        const t = Number(snapshot?.t ?? 0)
        const value = metricValue(snapshot, playerId, metricKey)

        const x = 10 + (t / maxT) * 88
        const y = 30 - (value / axisMax) * 27

        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  }

  const yTicks = tickSpec.values.map((value) => {
    const y = 30 - (value / axisMax) * 27

    return {
      value,
      y,
      label: formatTickLabel(metricKey, value),
    }
  })

  return {
    key: metricKey,
    label,
    showTimeAxis,
    p1Points: makePointString(1),
    p2Points: makePointString(2),
    yTicks,
  }
}


const metricCharts = computed(() => [
  buildMetricChart('ships', 'Ships'),
  buildMetricChart('planets', 'Planets'),
  buildMetricChart('levels', 'Levels'),
  buildMetricChart('buildPer10s', 'Build / 10s', true),
])

const midTimeLabel = computed(() => formatDuration(durationSeconds.value / 2))
const endTimeLabel = computed(() => formatDuration(durationSeconds.value))
</script>